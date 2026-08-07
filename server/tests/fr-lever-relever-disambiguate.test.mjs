// Unit test: fr_313 (lever) / fr_314 (relever) / fr_315 (élever)
// disambiguation in the frontend seed data and the SQL seed migration.
//
// The user reported that opening cards for "lever" and "relever" shows
// identical Russian translations ("поднимать" for both), making them
// indistinguishable in study. This test pins the fix: every site that
// produces the user-visible gloss MUST show a distinct PRIMARY word for
// each of the three verbs. A regression that reverts any of the three
// back to the old "поднимать" / "поднимать, отмечать" /
// "воспитывать, поднимать" pairings will fail this test.
//
// Scope: pure file inspection. No DB, no network, no React. Runs as
// `node --test server/tests/fr-lever-relever-disambiguate.test.mjs`.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');

function read(rel) {
  return readFileSync(join(repoRoot, rel), 'utf8');
}

function lineWithId(text, id) {
  return text.split('\n').find((l) => l.includes(`"${id}"`)) || '';
}

// ─── 1. Frontend vocab.js — what the flashcard front+back show ─────────
test('fr/vocab.js disambiguates fr_313/314/315 Russian translations', () => {
  const vocab = read('src/data/courses/fr/vocab.js');
  const lever = lineWithId(vocab, 'fr_313');
  const relever = lineWithId(vocab, 'fr_314');
  const elever = lineWithId(vocab, 'fr_315');

  assert.ok(lever.includes('"поднимать"'), `fr_313 should keep "поднимать" as its primary gloss, got: ${lever}`);
  assert.ok(relever.includes('"отмечать, фиксировать"'), `fr_314 must be "отмечать, фиксировать" (was "поднимать, отмечать"), got: ${relever}`);
  assert.ok(elever.includes('"воспитывать, растить"'), `fr_315 must be "воспитывать, растить" (was "воспитывать, поднимать"), got: ${elever}`);

  // The user's exact bug: identical primary word. Now each starts with
  // a different first word.
  const firstWords = [
    lever.match(/ru:\s*"([^,]+)/)?.[1],
    relever.match(/ru:\s*"([^,]+)/)?.[1],
    elever.match(/ru:\s*"([^,]+)/)?.[1],
  ];
  const unique = new Set(firstWords);
  assert.strictEqual(
    unique.size,
    3,
    `Each of lever/relever/élever must start with a DISTINCT first Russian word so flashcards look different. Got: ${JSON.stringify(firstWords)}`,
  );
});

// ─── 2. Conjugation answers (theme01 = affirmative) ────────────────────
test('fr/theme01-conjugations-ru.js has distinct conjugations for lever/relever/élever', () => {
  const conj = read('src/data/courses/fr/themes/theme01-conjugations-ru.js');
  const leverLine = conj.split('\n').find((l) => l.trim().startsWith('lever:'));
  const releverLine = conj.split('\n').find((l) => l.trim().startsWith('relever:'));
  const eleverLine = conj.split('\n').find((l) => l.trim().startsWith('élever:'));

  assert.ok(leverLine?.includes('поднимаю'), 'lever should conjugate to "поднимаю"');
  assert.ok(releverLine?.includes('отмечаю'), 'relever must conjugate to "отмечаю" (not "поднимаю")');
  assert.ok(eleverLine?.includes('воспитываю'), 'élever should conjugate to "воспитываю"');
});

// ─── 3. Conjugation answers (theme02 = negative) ───────────────────────
test('fr/theme02-conjugations-ru.js has distinct negative conjugations', () => {
  const conj = read('src/data/courses/fr/themes/theme02-conjugations-ru.js');
  const leverLine = conj.split('\n').find((l) => l.trim().startsWith('lever:'));
  const releverLine = conj.split('\n').find((l) => l.trim().startsWith('relever:'));
  const eleverLine = conj.split('\n').find((l) => l.trim().startsWith('élever:'));

  assert.ok(leverLine?.includes('не поднимаю'));
  assert.ok(releverLine?.includes('не отмечаю'), 'relever negative must be "не отмечаю" (not "не поднимаю")');
  assert.ok(eleverLine?.includes('не воспитываю'));
});

// ─── 4. Verb list gloses in theme01 (used by VerbListSection) ──────────
test('fr/theme01-pronouns-present.js verbList disambiguates the three verbs', () => {
  const theme = read('src/data/courses/fr/themes/theme01-pronouns-present.js');
  const leverRow = theme.split('\n').find((l) => l.includes("infinitive: 'lever'"));
  const releverRow = theme.split('\n').find((l) => l.includes("infinitive: 'relever'"));
  const eleverRow = theme.split('\n').find((l) => l.includes("infinitive: 'élever'"));

  assert.ok(leverRow?.includes("'поднимать'"));
  assert.ok(releverRow?.includes("'отмечать, фиксировать'"), 'relever verbList row must say "отмечать, фиксировать"');
  assert.ok(eleverRow?.includes("'воспитывать, растить'"), 'élever verbList row must say "воспитывать, растить"');
});

// ─── 5. Lexicon entries exist with disambiguating semantics ────────────
test('fr/lexicon.js has disambiguating entries for fr_313/314/315', () => {
  const lex = read('src/data/courses/fr/lexicon.js');
  for (const id of ['fr_313', 'fr_314', 'fr_315']) {
    const block = lex.split(`"${id}":`).slice(1, 2)[0] || '';
    assert.ok(block.length > 0, `lexicon must have an entry for ${id}`);
  }
  // And the entries mention the other two verbs to make distinctions clear
  const fr313 = lex.split('"fr_313":').slice(1, 2)[0];
  const fr314 = lex.split('"fr_314":').slice(1, 2)[0];
  const fr315 = lex.split('"fr_315":').slice(1, 2)[0];
  assert.ok(/lever/i.test(fr313), 'fr_313 entry should reference lever (or its capitalized form)');
  assert.ok(/relever/i.test(fr314) && /lever/i.test(fr314), 'fr_314 entry should reference relever and lever');
  assert.ok(/lever/i.test(fr315) && /relever/i.test(fr315), 'fr_315 entry should reference lever and relever');
});

// ─── 6. PL conjugations file: lowercase key + missing verbs added ──────
test('fr-pl/theme01-conjugations-pl.js has lowercase "lever" and the missing stem-changing verbs', () => {
  const pl = read('src/data/courses/fr-pl/conjugations/theme01-conjugations-pl.js');
  assert.ok(!/^Lever:/m.test(pl), 'PL file must not have a capitalized "Lever" key (was a JS lookup bug)');
  // The file uses single-space indent (a project-wide quirk), so accept any indent.
  assert.ok(/^\s*lever:/m.test(pl), 'PL file should have lowercase "lever" key');
  for (const v of ['enlever', 'relever', 'élever', 'mener', 'promener']) {
    assert.ok(new RegExp(`^\\s*${v}:`, 'm').test(pl), `PL file should include a "${v}" conjugation entry (was missing)`);
  }
});

// ─── 7. Migration 034 must exist and be idempotent ────────────────────
test('Migration 034 exists, applies the disambiguation, and is idempotent', () => {
  const m = read('server/src/db/migrations/034_disambiguate_lever_relever_élever.sql');
  assert.ok(m.length > 0, 'migration 034 must exist');
  // Each UPDATE is guarded by the OLD value to be idempotent.
  assert.ok(m.includes("text = 'отмечать, фиксировать'") && m.includes("text = 'поднимать, отмечать'"),
    'migration must update fr_314 RU from old value to new value');
  assert.ok(m.includes("text = 'воспитывать, растить'") && m.includes("text = 'воспитывать, поднимать'"),
    'migration must update fr_315 RU from old value to new value');
  // Wrapped in transaction for atomicity (matches the pattern of 029).
  assert.ok(/^BEGIN/m.test(m) && /^COMMIT/m.test(m), 'migration must be wrapped in BEGIN/COMMIT');
});

// ─── 8. Seed migration 004 must show the new values for fresh installs ─
test('Seed migration 004 carries the disambiguated values', () => {
  const m = read('server/src/db/migrations/004_seed_stem_changing_verbs.sql');
  assert.ok(m.includes("'fr_314', 'ru', 'отмечать, фиксировать'"),
    'seed migration 004 must carry the new fr_314 RU gloss');
  assert.ok(m.includes("'fr_315', 'ru', 'воспитывать, растить'"),
    'seed migration 004 must carry the new fr_315 RU gloss');
  assert.ok(!m.includes("'fr_314', 'ru', 'поднимать, отмечать'"),
    'seed migration 004 must NOT keep the old fr_314 RU gloss');
  assert.ok(!m.includes("'fr_315', 'ru', 'воспитывать, поднимать'"),
    'seed migration 004 must NOT keep the old fr_315 RU gloss');
});

// ─── 9. Russian hint for fr_314 must match the new meaning ───────────
test('fr/hints/ru.js mnemonic for fr_314 matches the new disambiguated meaning', () => {
  const hints = read('src/data/courses/fr/hints/ru.js');
  const line = hints.split('\n').find((l) => l.startsWith('  fr_314:')) || '';
  assert.ok(line.includes('отмечает') || line.includes('фиксирует'),
    `fr_314 hint should mention "отмечает" or "фиксирует" to match the new card, got: ${line}`);
});
