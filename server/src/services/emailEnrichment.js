// Single-call LLM enrichment for email evaluation.
//
// The deterministic discovery step (`emailDiscovery.js`) gives us byte-precise
// spans for spelling, punctuation, and grammar errors. This module asks the
// LLM to do ONLY the things no regex can:
//
//   1. EXPLAIN each pre-detected error in the learner's native language
//      (Polish feedback, native translation for proposedWords).
//   2. PROPOSE a corrected Polish fragment + 1–3 native translations so the
//      corrected phrase can become a flashcard.
//   3. SUGGEST 1–3 B1/B2-level alternatives that would also be acceptable.
//   4. EMIT up to 4 constructionReplacements — grammatically correct phrases
//      that are stylistically mismatched to the learner's target level.
//   5. ADD any style or vocabulary errors the deterministic stack can't see
//      (register mismatch, wrong preposition, lexical choice, register-
//      inappropriate slang). The LLM is the only signal here.
//
// The whole thing is ONE LLM call with the full email and the full error
// list. The LLM sees the surrounding sentences, knows the learner's target
// level and register, and can produce coherent explanations instead of
// guessing from a single-fragment prompt.
//
// On LLM failure (network/timeout/empty), `enrichErrors` returns the input
// deterministic errors with empty enrichment fields — same fallback posture
// `autoAddCorrectionExercises` already uses. The pipeline NEVER throws on
// LLM failure; a flaky gateway never costs the learner their attempt.

import { resolveErrorSpan } from './emailSpanHelpers.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EMAIL_TARGET_LEVELS = ['B1', 'B2'];
const ERROR_CATEGORIES = ['spelling', 'grammar', 'style', 'vocabulary', 'punctuation'];
const LLM_SOURCED_CATEGORIES = new Set(['style', 'vocabulary']);

// LLM-emitted construction replacement levels we accept.
const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// Default max tokens for the enrichment call. The response carries one entry
// per deterministic error + up to ~10 LLM-discovered style/vocab errors +
// up to 4 construction replacements. 4000 tokens is plenty in practice for
// a B1/B2-length email (<300 words). Bumped to 6000 to leave headroom.
const ENRICHMENT_MAX_TOKENS = 6000;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build the enrichment prompt for one LLM call.
 *
 * @param {Object} ctx
 * @param {string} ctx.userText         Full learner email.
 * @param {string} ctx.taskDescription  Task prompt (e.g. "Write to your
 *                                      friend about your new flat").
 * @param {string[]} ctx.points         Mandatory points (numbered in the prompt).
 * @param {string} ctx.register         Expected register: 'nieformalny' |
 *                                      'półformalny' | 'formalny'.
 * @param {string} ctx.etiquetteHint    Optional register-specific hint.
 * @param {string} ctx.nativeLang       Learner's native language code.
 * @param {string} ctx.targetLevel      'B1' | 'B2'.
 * @param {Array<{id: string, category: string, startOffset: number, endOffset: number, originalText: string, severity: number, ruleId: string|null, message: string|null, suggestions: string[]}>} ctx.discoveredErrors  Deterministic errors.
 * @returns {string} The full prompt body for the LLM user message.
 */
export function buildEnrichmentPrompt(ctx) {
  const {
    userText, taskDescription, points, register,
    etiquetteHint, nativeLang, targetLevel, discoveredErrors,
  } = ctx;

  const nativeLabel = LANG_LABELS[nativeLang] || 'Russian';
  const level = EMAIL_TARGET_LEVELS.includes(targetLevel) ? targetLevel : 'B1';

  const pointsList = points && points.length > 0
    ? points.map((p, i) => `  ${i + 1}. ${p}`).join('\n')
    : '  (no specific points required)';

  const registerInfo = register
    ? `Expected register: ${register} (${register === 'nieformalny' ? 'informal' : register === 'półformalny' ? 'semi-formal' : 'formal'}).`
    : '';

  const etiquetteInfo = etiquetteHint ? `\n${etiquetteHint}` : '';

  // Numbered list of pre-detected errors. The LLM's job is to annotate each
  // one with explanation + correction + proposedWords + alternatives, not to
  // re-discover them. The LLM never invents offsets for these — they're
  // already in `startOffset` / `endOffset`.
  const errorList = discoveredErrors.map((err, idx) => {
    const cat = err.category;
    const ctx_extra = err.ruleId
      ? ` rule=${err.ruleId}`
      : err.message
        ? ` rule_message=${JSON.stringify(err.message)}`
        : '';
    const sug = err.suggestions && err.suggestions.length > 0
      ? ` hunspell_suggestions=${JSON.stringify(err.suggestions.slice(0, 3))}`
      : '';
    return `  ${idx}. [${cat}] startOffset=${err.startOffset} endOffset=${err.endOffset} text=${JSON.stringify(err.originalText)}${ctx_extra}${sug}`;
  }).join('\n');

  const errorAltInstructions = level === 'B2'
    ? 'For B2: alternatives should be richer, more natural, or more precise than the learner\'s version.'
    : 'For B1: alternatives should be simple, clear, and exam-safe. Prefer basic phrasing.';

  const constructionInstructions = level === 'B2'
    ? 'Find correct but too-simple A2/B1 constructions in the email and suggest richer B2 alternatives.'
    : 'Find correct but over-complex B2/C1 attempts and suggest simpler natural B1 alternatives.';

  return `You are evaluating a Polish email written by a learner.
Learner's native language: ${nativeLabel}.
All explanations, comments, and translations must use Polish for explanations and ${nativeLabel} for translations.
Target CEFR level: ${level}.

TASK:
"${taskDescription}"

MANDATORY POINTS the learner must address:
${pointsList}

${registerInfo}${etiquetteInfo}

FULL EMAIL (offsets are character positions in this exact string — keep them in sync when you quote fragments):
---BEGIN EMAIL---
${userText}
---END EMAIL---

PRE-DETECTED ERRORS (spelling, punctuation, grammar — byte-precise, do NOT re-discover):
${errorList || '  (none detected)'}

YOUR JOB:
1. For EACH pre-detected error above, emit one enrichment entry with the matching id.
   - "correction": the corrected Polish fragment for startOffset..endOffset.
   - "explanation": a short Polish explanation (1–2 sentences) of what is wrong and why.
   - "proposedWords": ONE entry {target, translation} — the corrected Polish word/phrase the learner should learn, translated to ${nativeLabel}. Optionally up to 2 more entries if the error reveals a related vocabulary gap.
   - "alternatives": 1–3 entries {text, type, level, explanation}. ${errorAltInstructions}
2. Emit up to 4 constructionReplacements — grammatically correct but stylistically mismatched to the learner's level. ${constructionInstructions} Do NOT include fragments already covered by the pre-detected errors.
3. Emit up to 6 ADDITIONAL style/vocabulary errors the deterministic stack cannot catch (wrong preposition, register mismatch, lexical choice that doesn't fit ${register || 'the task'}, register-inappropriate slang). For each:
   - pick a real fragment from the email,
   - give a short Polish snippet with corrected wording,
   - give a 1-sentence Polish explanation.
   These get startOffset/endOffset — choose them by counting characters in the email string above; the resolver will fuzzy-match if they drift.

RETURN JSON ONLY (no markdown, no commentary, no reasoning):
{
  "enrichments": [
    {
      "id": "err_0",
      "correction": "<corrected Polish fragment>",
      "explanation": "<short Polish explanation>",
      "proposedWords": [{"target": "<word/phrase>", "translation": "<${nativeLabel} translation>"}],
      "alternatives": [
        {"text": "<alternative>", "type": "word|phrase|construction", "level": "${level}", "explanation": "<short Polish explanation>"}
      ]
    }
  ],
  "styleAndVocabularyErrors": [
    {
      "originalText": "<exact fragment from the email>",
      "correction": "<corrected fragment>",
      "explanation": "<short Polish explanation>",
      "category": "style|vocabulary",
      "startOffset": <integer character index in email string>,
      "endOffset": <integer character index, exclusive>
    }
  ],
  "constructionReplacements": [
    {
      "originalText": "<original phrase>",
      "suggestedText": "<suggested replacement at ${level}>",
      "originalLevel": "<A1|A2|B1|B2|C1|C2>",
      "suggestedLevel": "${level}",
      "explanation": "<short Polish explanation>"
    }
  ]
}

RULES:
- Do NOT invent corrections for fragments you can't see in the email.
- If a pre-detected error looks like a foreign name (e.g. "Dima", "Dzmitry") that isn't a Polish word, still emit an enrichment but with explanation noting it's a name, not a typo.
- "alternatives" type: "word" for single-word swaps, "phrase" for short multi-word swaps, "construction" for sentence-pattern rewrites.
- "constructionReplacements" must NOT overlap with pre-detected errors.
- If there are no additional style/vocabulary errors, return an empty array.
- Keep explanations under 25 words each so the whole response stays under the token cap.`;
}

const LANG_LABELS = { ru: 'Russian', en: 'English', pl: 'Polish', fr: 'French' };

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

/**
 * Parse the LLM enrichment response and merge it back onto the deterministic
 * discovered errors. Style/vocabulary errors discovered by the LLM are
 * appended with fresh sequential ids. Construction replacements are returned
 * as a separate array.
 *
 * @param {string} rawText              Raw LLM response text (may be JSON or
 *                                      JSON wrapped in code fences).
 * @param {string} userText             The original email text (used to
 *                                      resolve LLM-supplied offsets).
 * @param {Array<{id: string, category: string, startOffset: number, endOffset: number, originalText: string, severity: number, ruleId: string|null, message: string|null, suggestions: string[]}>} discoveredErrors
 *                                      The deterministic errors that were
 *                                      passed to the prompt, in id order.
 * @returns {{
 *   enrichedErrors: Array<Object>,   // Same shape as discoveredErrors, enriched.
 *   constructionReplacements: Array<Object>,
 *   raw: string                      // The parsed JSON (for logging).
 * }}
 */
export function parseEnrichmentResponse(rawText, userText, discoveredErrors) {
  const obj = extractJson(rawText);
  const enrichments = Array.isArray(obj?.enrichments) ? obj.enrichments : [];
  const styleVocab = Array.isArray(obj?.styleAndVocabularyErrors) ? obj.styleAndVocabularyErrors : [];
  const constructions = Array.isArray(obj?.constructionReplacements) ? obj.constructionReplacements : [];

  const byId = new Map();
  for (const e of enrichments) {
    if (e && typeof e.id === 'string') byId.set(e.id, e);
  }

  const enrichedErrors = discoveredErrors.map(err => {
    const ann = byId.get(err.id);
    if (!ann) return { ...err, correction: err.originalText, explanation: '', proposedWords: [], alternatives: [] };
    return {
      ...err,
      correction: typeof ann.correction === 'string' && ann.correction
        ? ann.correction
        : err.originalText,
      explanation: typeof ann.explanation === 'string' ? ann.explanation : '',
      proposedWords: normalizeProposedWords(ann.proposedWords),
      alternatives: normalizeAlternatives(ann.alternatives),
    };
  });

  // LLM-discovered style / vocab errors. Append fresh sequential ids starting
  // after the deterministic set.
  const baseIdx = discoveredErrors.length;
  const llmErrors = styleVocab.slice(0, 6).map((raw, idx) => {
    const fragment = typeof raw?.originalText === 'string' ? raw.originalText.trim() : '';
    const category = LLM_SOURCED_CATEGORIES.has(raw?.category) ? raw.category : 'style';
    const span = resolveErrorSpan(
      userText,
      fragment,
      enrichedErrors.map(e => ({ startOffset: e.startOffset, endOffset: e.endOffset })),
    );
    return {
      id: `err_${baseIdx + idx}`,
      source: category === 'style' ? 'llm-style' : 'llm-vocab',
      category,
      startOffset: span.startOffset,
      endOffset: span.endOffset,
      originalText: span.resolved ? span.originalText : fragment,
      severity: 1,
      ruleId: null,
      message: typeof raw?.explanation === 'string' ? raw.explanation : '',
      suggestions: [],
      correction: typeof raw?.correction === 'string' && raw.correction
        ? raw.correction
        : fragment,
      explanation: typeof raw?.explanation === 'string' ? raw.explanation : '',
      proposedWords: [],
      alternatives: [],
    };
  }).filter(e => e.startOffset >= 0 && e.endOffset > e.startOffset);

  return {
    enrichedErrors: [...enrichedErrors, ...llmErrors],
    constructionReplacements: normalizeConstructions(constructions),
    raw: rawText,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractJson(text) {
  if (!text) return null;
  // Tolerate ```json ... ``` fences.
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1].trim() : text.trim();
  // Take the first balanced { ... } block.
  const match = candidate.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function normalizeProposedWords(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(item => item && typeof item.target === 'string' && item.target && typeof item.translation === 'string' && item.translation)
    .slice(0, 3)
    .map(item => ({ target: item.target.trim(), translation: item.translation.trim() }));
}

function normalizeAlternatives(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(item => item && typeof item.text === 'string' && item.text)
    .slice(0, 3)
    .map(item => ({
      text: item.text,
      type: ['word', 'phrase', 'construction'].includes(item.type) ? item.type : 'phrase',
      level: EMAIL_TARGET_LEVELS.includes(item.level) ? item.level : 'B1',
      explanation: typeof item.explanation === 'string' ? item.explanation : '',
    }));
}

function normalizeConstructions(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(item => item && typeof item.originalText === 'string' && item.originalText && typeof item.suggestedText === 'string' && item.suggestedText)
    .slice(0, 4)
    .map(item => ({
      originalText: item.originalText,
      suggestedText: item.suggestedText,
      originalLevel: CEFR_LEVELS.includes(item.originalLevel) ? item.originalLevel : 'B1',
      suggestedLevel: CEFR_LEVELS.includes(item.suggestedLevel) ? item.suggestedLevel : 'B1',
      explanation: typeof item.explanation === 'string' ? item.explanation : '',
    }));
}

// ---------------------------------------------------------------------------
// High-level entry point used by the route layer
// ---------------------------------------------------------------------------

/**
 * Build the request body for one enrichment call. Kept separate from the
 * prompt string so the route layer can control maxTokens / response_format
 * / temperature exactly as the rest of the email pipeline does.
 *
 * @param {Object} ctx                 Same as `buildEnrichmentPrompt`.
 * @param {string} model               Model name to put in the body.
 * @param {Object} [opts]
 * @param {number} [opts.maxTokens=6000]
 * @param {boolean} [opts.json=true]   Set false to skip response_format
 *                                     (NVIDIA NIM rejects json_object).
 * @returns {Object} The chat completions request body.
 */
export function buildEnrichmentRequestBody(ctx, model, opts = {}) {
  const { maxTokens = ENRICHMENT_MAX_TOKENS, json = true } = opts;
  return {
    model,
    messages: [
      {
        role: 'system',
        content: 'You are a Polish language tutor. Return ONLY one valid JSON object. Do not include reasoning, markdown, labels, or explanatory text outside the JSON.',
      },
      { role: 'user', content: buildEnrichmentPrompt(ctx) },
    ],
    temperature: 0.2,
    top_p: 0.9,
    max_tokens: maxTokens,
    ...(json ? { response_format: { type: 'json_object' } } : {}),
  };
}

/**
 * Default no-LLM fallback: copy the deterministic errors through unchanged
 * (empty enrichment fields) and return no constructions / no LLM-discovered
 * errors. Used when the LLM call throws so the pipeline can still complete.
 */
export function fallbackEnrichment(discoveredErrors) {
  return {
    enrichedErrors: discoveredErrors.map(err => ({
      ...err,
      correction: err.originalText,
      explanation: '',
      proposedWords: [],
      alternatives: [],
    })),
    constructionReplacements: [],
    llmError: null,
  };
}

// Re-export the canonical target levels / categories so the route layer
// doesn't have to import them from elsewhere.
export { EMAIL_TARGET_LEVELS, ERROR_CATEGORIES, ENRICHMENT_MAX_TOKENS };
