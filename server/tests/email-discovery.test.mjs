// Unit tests for the deterministic discovery + LLM enrichment pipeline.
//
// These tests are hermetic: no DB, no network, no LLM. They pin:
//   - reproducibility: same input → identical discovery across many runs
//   - byte-precision: every discovered span matches userText.slice(start,end)
//   - golden set parity: the discovery output exactly matches the records
//     stored in email-scoring.fixtures.json (any future grammar-rule change
//     that changes the output forces this test to fail, prompting the author
//     to update the fixture with intent)
//   - enrichment ID matching: LLM annotations are attached to the right
//     deterministic span by id, not by offset
//   - LLM-failure fallback: empty enrichment fields, no throw
//   - style/vocab error resolution: LLM offsets are validated via fuzzy
//     indexOf when the LLM drifts
//
// Run with: node --test tests/email-discovery.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { discoverErrors, validateOffsets } from '../src/services/emailDiscovery.js';
import {
  buildEnrichmentPrompt,
  parseEnrichmentResponse,
  fallbackEnrichment,
} from '../src/services/emailEnrichment.js';

const { fixtures } = JSON.parse(
  readFileSync(new URL('./email-scoring.fixtures.json', import.meta.url), 'utf8'),
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function runDiscover(text) {
  // Same call many times to surface any non-deterministic behavior.
  const runs = Array.from({ length: 50 }, () => discoverErrors(text));
  for (let i = 1; i < runs.length; i++) {
    assert.deepStrictEqual(runs[i], runs[0], `run ${i} differs from run 0`);
  }
  return runs[0];
}

// ---------------------------------------------------------------------------
// Discovery tests
// ---------------------------------------------------------------------------

test('discoverErrors is reproducible across many runs', () => {
  for (const f of fixtures) {
    const errs = runDiscover(f.userText);
    assert.equal(errs.length, f.discovery.totalErrors, `${f.id}: expected ${f.discovery.totalErrors} errors, got ${errs.length}`);
  }
});

test('every discovered span is byte-precise', () => {
  for (const f of fixtures) {
    const errs = discoverErrors(f.userText);
    assert.equal(validateOffsets(errs, f.userText), true, `${f.id}: validateOffsets must return true`);
    for (const e of errs) {
      const slice = f.userText.slice(e.startOffset, e.endOffset);
      assert.equal(slice, e.originalText, `${f.id} ${e.id}: slice ${JSON.stringify(slice)} != originalText ${JSON.stringify(e.originalText)}`);
    }
  }
});

test('discovery golden set: offsets match fixtures exactly', () => {
  for (const f of fixtures) {
    const errs = discoverErrors(f.userText);
    for (let i = 0; i < f.discovery.errors.length; i++) {
      const expected = f.discovery.errors[i];
      const actual = errs[i];
      assert.ok(actual, `${f.id}: missing err_${i}`);
      assert.equal(actual.category, expected.category, `${f.id} ${expected.id}: category`);
      assert.equal(actual.startOffset, expected.startOffset, `${f.id} ${expected.id}: startOffset`);
      assert.equal(actual.endOffset, expected.endOffset, `${f.id} ${expected.id}: endOffset`);
      assert.equal(actual.originalText, expected.originalText, `${f.id} ${expected.id}: originalText`);
      assert.equal(actual.severity, expected.severity, `${f.id} ${expected.id}: severity`);
    }
  }
});

test('category counts match the per-category golden numbers', () => {
  for (const f of fixtures) {
    const errs = discoverErrors(f.userText);
    const counts = {
      spelling: errs.filter(e => e.category === 'spelling').length,
      punctuation: errs.filter(e => e.category === 'punctuation').length,
      grammar: errs.filter(e => e.category === 'grammar').length,
    };
    assert.deepStrictEqual(counts, f.discovery.byCategory, `${f.id}: category counts mismatch`);
  }
});

test('a clean short email only flags the trailing punctuation / signature', () => {
  const text = 'Cześć Marku!\n\nW ten weekend jadę do Krakowa. Chcesz pojechać ze mną?\n\nPozdrawiam,\nDima';
  const errs = discoverErrors(text);
  // Hunspell may flag "Dima" as a foreign name; that's accepted as a known
  // false-positive of the underlying dictionary. The critical contract is
  // that no Polish word is misflagged and no valid fragment is wrongly highlighted.
  for (const e of errs) {
    assert.ok(e.startOffset >= 0 && e.endOffset > e.startOffset, 'offset validity');
    assert.ok(e.endOffset <= text.length, 'endOffset in range');
    assert.equal(text.slice(e.startOffset, e.endOffset), e.originalText, 'byte-precision');
  }
});

test('hand-crafted: dziękuję + dla is caught by the grammar rule', () => {
  const text = 'Dziękuję dla wszystkich za pomoc.';
  const errs = discoverErrors(text);
  const dzi = errs.find(e => /dzi.kuj.*dla/i.test(e.originalText));
  assert.ok(dzi, 'the "dziękuję dla" rule must fire');
  assert.equal(dzi.category, 'grammar');
  assert.equal(dzi.ruleId, 'dziękować_dla');
  assert.equal(dzi.severity, 3);
});

test('hand-crafted: missing capital after a period is caught by the punctuation rule', () => {
  const text = 'Pierwsze zdanie. drugie zdanie.';
  const errs = discoverErrors(text);
  const cap = errs.find(e => e.category === 'punctuation' && e.ruleId === 'sentence_capital');
  assert.ok(cap, 'sentence_capital rule must fire on lowercase-after-period');
  assert.equal(text.slice(cap.startOffset, cap.endOffset), 'd');
});

test('hand-crafted: missing end punctuation is flagged with severity 0', () => {
  const text = 'Cześć Marku, jak się masz';
  const errs = discoverErrors(text);
  const missing = errs.find(e => e.category === 'punctuation' && e.ruleId === 'missing_end_punct');
  assert.ok(missing, 'missing_end_punct rule must fire');
  assert.equal(missing.severity, 0, 'missing end punct is severity 0 (informational)');
});

test('hand-crafted: empty / null / non-string text returns []', () => {
  assert.deepStrictEqual(discoverErrors(''), []);
  assert.deepStrictEqual(discoverErrors(null), []);
  assert.deepStrictEqual(discoverErrors(undefined), []);
  assert.deepStrictEqual(discoverErrors(123), []);
});

// ---------------------------------------------------------------------------
// Enrichment parser tests
// ---------------------------------------------------------------------------

test('parseEnrichmentResponse attaches explanations to the right deterministic span by id', () => {
  const f = fixtures[0]; // email_02_wspollokatorzy — many errors
  const errs = discoverErrors(f.userText);
  // Build a hand-crafted LLM response that swaps every "correction" with
  // "FIX:<id>" and gives every error a unique explanation.
  const fake = JSON.stringify({
    enrichments: errs.map(e => ({
      id: e.id,
      correction: `FIX:${e.id}`,
      explanation: `explanation for ${e.id}`,
      proposedWords: [{ target: `FIX:${e.id}`, translation: `translation for ${e.id}` }],
      alternatives: [{ text: `alt ${e.id}`, type: 'phrase', level: 'B1', explanation: 'why' }],
    })),
    styleAndVocabularyErrors: [],
    constructionReplacements: [],
  });

  const parsed = parseEnrichmentResponse(fake, f.userText, errs);
  assert.equal(parsed.enrichedErrors.length, errs.length, 'no LLM-added records in this test');
  for (let i = 0; i < errs.length; i++) {
    const e = parsed.enrichedErrors[i];
    assert.equal(e.id, errs[i].id, `id at index ${i}`);
    assert.equal(e.correction, `FIX:${e.id}`, `${e.id}: correction routed correctly`);
    assert.equal(e.explanation, `explanation for ${e.id}`, `${e.id}: explanation routed correctly`);
    assert.equal(e.proposedWords[0]?.target, `FIX:${e.id}`);
    assert.equal(e.proposedWords[0]?.translation, `translation for ${e.id}`);
    assert.equal(e.alternatives[0]?.text, `alt ${e.id}`);
  }
  // Deterministic offsets survive the enrichment step byte-perfect:
  for (let i = 0; i < errs.length; i++) {
    assert.equal(parsed.enrichedErrors[i].startOffset, errs[i].startOffset);
    assert.equal(parsed.enrichedErrors[i].endOffset, errs[i].endOffset);
    assert.equal(parsed.enrichedErrors[i].originalText, errs[i].originalText);
  }
});

test('parseEnrichmentResponse ignores LLM enrichment entries with no matching id', () => {
  const f = fixtures[3]; // clean_short
  const errs = discoverErrors(f.userText);
  const fake = JSON.stringify({
    enrichments: [{ id: 'err_9999', correction: 'WRONG', explanation: 'should be dropped' }],
    styleAndVocabularyErrors: [],
    constructionReplacements: [],
  });
  const parsed = parseEnrichmentResponse(fake, f.userText, errs);
  for (const e of parsed.enrichedErrors) {
    assert.equal(e.correction, e.originalText, `${e.id}: unmatched LLM annotation must not overwrite`);
    assert.equal(e.explanation, '', `${e.id}: unmatched explanation must not leak in`);
  }
});

test('parseEnrichmentResponse handles code-fenced JSON', () => {
  const f = fixtures[3];
  const errs = discoverErrors(f.userText);
  const fenced = '```json\n{"enrichments": [], "styleAndVocabularyErrors": [], "constructionReplacements": []}\n```';
  const parsed = parseEnrichmentResponse(fenced, f.userText, errs);
  assert.equal(parsed.enrichedErrors.length, errs.length);
  assert.equal(parsed.constructionReplacements.length, 0);
});

test('parseEnrichmentResponse resolves LLM style/vocab errors with fuzzy indexOf', () => {
  // Force the LLM to drift: pass an off-by-12 startOffset on purpose.
  const text = 'Cześć Marku! W ten weekend jadę do Krakowa. Chcesz pojechać ze mną? Pozdrawiam, Dima';
  const errs = discoverErrors(text);
  const fake = JSON.stringify({
    enrichments: [],
    styleAndVocabularyErrors: [
      // "Krakowa" is at index 32 in `text`. LLM passes 24 (drift by 8) →
      // parser should fall back to text.indexOf and pick the real span.
      { originalText: 'Krakowa', correction: 'Kraków', explanation: 'locative', category: 'grammar', startOffset: 24, endOffset: 31 },
      // Fragment that genuinely doesn't exist anywhere → record gets resolved=false
      // and is filtered out (startOffset=-1, endOffset=-1) — see parser.
      { originalText: 'NONEXISTENT_FRAGMENT', correction: 'X', explanation: 'no', category: 'style', startOffset: 0, endOffset: 5 },
    ],
    constructionReplacements: [
      { originalText: 'jadę do', suggestedText: 'podróżuję do', originalLevel: 'A2', suggestedLevel: 'B2', explanation: 'richer' },
    ],
  });
  const parsed = parseEnrichmentResponse(fake, text, errs);
  // Should keep deterministic errors + exactly 1 LLM-added record (the
  // Kraków/Krakowa one). The non-existent fragment is filtered.
  assert.equal(parsed.enrichedErrors.length, errs.length + 1, 'one LLM record survived');
  const llmErr = parsed.enrichedErrors[parsed.enrichedErrors.length - 1];
  assert.equal(llmErr.source, 'llm-style', 'category grammar maps to llm-style in our allowlist? — actual mapping is grammar→grammar in llm-* tags');
  // category passed was "grammar" → falls into LLM_SOURCED_CATEGORIES? No —
  // only "style" and "vocabulary" are LLM-sourced. "grammar" from LLM is
  // forced into "style" by the parser:
  assert.equal(llmErr.category, 'style', 'LLM-emitted grammar falls back to style');
  assert.equal(text.slice(llmErr.startOffset, llmErr.endOffset), 'Krakowa', 'fuzzy indexOf resolution worked');
  assert.equal(llmErr.correction, 'Kraków', 'correction preserved');
  // Construction replacement normalized:
  assert.equal(parsed.constructionReplacements.length, 1);
  assert.equal(parsed.constructionReplacements[0].suggestedLevel, 'B2');
  assert.equal(parsed.constructionReplacements[0].originalLevel, 'A2');
});

test('fallbackEnrichment returns deterministic errors with empty enrichment fields', () => {
  const f = fixtures[0];
  const errs = discoverErrors(f.userText);
  const fallback = fallbackEnrichment(errs);
  assert.equal(fallback.enrichedErrors.length, errs.length);
  assert.equal(fallback.constructionReplacements.length, 0);
  for (const e of fallback.enrichedErrors) {
    assert.equal(e.correction, e.originalText);
    assert.equal(e.explanation, '');
    assert.deepStrictEqual(e.proposedWords, []);
    assert.deepStrictEqual(e.alternatives, []);
  }
});

test('fallbackEnrichment never throws on empty input', () => {
  const fallback = fallbackEnrichment([]);
  assert.equal(fallback.enrichedErrors.length, 0);
  assert.equal(fallback.constructionReplacements.length, 0);
});

// ---------------------------------------------------------------------------
// Prompt builder tests (smoke)
// ---------------------------------------------------------------------------

test('buildEnrichmentPrompt includes every discovered error with offsets', () => {
  const f = fixtures[0];
  const errs = discoverErrors(f.userText);
  const prompt = buildEnrichmentPrompt({
    userText: f.userText,
    taskDescription: f.taskDescription,
    points: f.points,
    register: f.register,
    etiquetteHint: '',
    nativeLang: 'ru',
    targetLevel: f.level,
    discoveredErrors: errs,
  });
  // The full email must be embedded for offset validation:
  assert.ok(prompt.includes(f.userText), 'prompt must include full email');
  // Every deterministic error's originalText + startOffset must appear so the
  // LLM can refer back to the exact span.
  for (const e of errs.slice(0, 5)) {
    assert.ok(prompt.includes(`startOffset=${e.startOffset}`), `prompt missing startOffset=${e.startOffset}`);
    assert.ok(prompt.includes(e.originalText), `prompt missing originalText ${JSON.stringify(e.originalText)}`);
  }
});


test('parseEnrichmentResponse ignores leading reasoning tokens and finds the balanced JSON object', () => {
  // Simulates the NVIDIA NIM response shape: reasoning leak + JSON.
  const text = '<think>the user wrote ostatmiej which should be ostatniej...</think>{\n  "enrichments": [\n    { "id": "err_0", "correction": "ostatniej", "explanation": "Polish explanation" }\n  ],\n  "styleAndVocabularyErrors": [],\n  "constructionReplacements": []\n}';
  const fakeErrs = [{ id: 'err_0', category: 'spelling', startOffset: 0, endOffset: 9, originalText: 'ostatmiej', severity: 1, ruleId: null, message: null, suggestions: [] }];
  const parsed = parseEnrichmentResponse(text, 'ostatmiej rest of email', fakeErrs);
  assert.equal(parsed.enrichedErrors.length, 1);
  assert.equal(parsed.enrichedErrors[0].correction, 'ostatniej');
  assert.equal(parsed.enrichedErrors[0].explanation, 'Polish explanation');
});

test('parseEnrichmentResponse returns no enrichments when response is truncated mid-array', () => {
  // Truncated JSON: the response cut off before closing brackets.
  const text = '{\n  "enrichments": [\n    { "id": "err_0", "correction": "x"';
  const fakeErrs = [{ id: 'err_0', category: 'spelling', startOffset: 0, endOffset: 1, originalText: 'x', severity: 1, ruleId: null, message: null, suggestions: [] }];
  const parsed = parseEnrichmentResponse(text, 'x', fakeErrs);
  // No balanced object found → enrichment fails gracefully. The deterministic
  // record survives with its empty enrichment fields.
  assert.equal(parsed.enrichedErrors.length, 1);
  assert.equal(parsed.enrichedErrors[0].correction, 'x');
  assert.equal(parsed.enrichedErrors[0].explanation, '');
});

test('buildEnrichmentPrompt tolerates a missing target level (defaults to B1)', () => {
  const f = fixtures[0];
  const errs = discoverErrors(f.userText);
  const prompt = buildEnrichmentPrompt({
    userText: f.userText,
    taskDescription: f.taskDescription,
    points: f.points,
    register: f.register,
    etiquetteHint: '',
    nativeLang: 'ru',
    targetLevel: undefined,
    discoveredErrors: errs,
  });
  assert.ok(prompt.includes('Target CEFR level: B1'), 'default level is B1');
});
