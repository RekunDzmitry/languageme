// Unit test: fr_313 (lever) / fr_314 (relever) / fr_315 (élever)
// disambiguation in the canonical seed (000_bootstrap.sql) and the
// data-only legacy cutover file (_data_only.sql).
//
// The user reported that opening cards for "lever" and "relever" shows
// identical Russian translations ("поднимать" for both), making them
// indistinguishable in study. This test pins the fix at the only
// authoritative source of content on this branch: the canonical seed
// that ships with the migration refactor. A regression that reverts
// any of the three back to the old "поднимать" / "поднимать, отмечать"
// / "воспитывать, поднимать" pairings will fail this test.
//
// Scope: pure file inspection. No DB, no network, no React. Runs as
// `node --test server/tests/fr-lever-relever-disambiguate.test.mjs`.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')

function read(rel) {
  return readFileSync(join(repoRoot, rel), 'utf8')
}

// Each helper finds the start of the matching INSERT statement and
// returns the full statement up to (and including) the terminating
// semicolon. We do this by anchoring on the unique (id, lang) tuple
// and walking back to the start of the statement, instead of using a
// regex (greedy [^;]* would walk to the end of the file).
function lineForVocabId(text, id, lang) {
  const idx = text.indexOf(`'${id}', '${lang}', `)
  if (idx === -1) return ''
  // Walk backwards to the start of the INSERT
  const start = text.lastIndexOf('INSERT INTO vocab_translation', idx)
  if (start === -1) return ''
  const end = text.indexOf(';', idx) + 1
  return text.slice(start, end)
}

function lineForConjugation(text, themeId, infinitive, lang) {
  const idx = text.indexOf(`'${themeId}', '${infinitive}', '${lang}', `)
  if (idx === -1) return ''
  const start = text.lastIndexOf('INSERT INTO theme_conjugation', idx)
  if (start === -1) return ''
  const end = text.indexOf(';', idx) + 1
  return text.slice(start, end)
}

function lineForThemeVerb(text, themeId, infinitive) {
  const idx = text.indexOf(`'${themeId}', '${infinitive}', '`)
  if (idx === -1) return ''
  const start = text.lastIndexOf('INSERT INTO theme_verb', idx)
  if (start === -1) return ''
  const end = text.indexOf(');', idx) + 2
  return text.slice(start, end)
}

function lineForVocabHint(text, vocabId) {
  const needle = `INSERT INTO vocab_hint (vocab_id, lang, text) VALUES ('${vocabId}', 'ru', '`
  const start = text.indexOf(needle)
  if (start === -1) return ''
  const end = text.indexOf(';', start) + 1
  return text.slice(start, end)
}

const CANONICAL_FILES = [
  'server/src/db/migrations/000_bootstrap.sql',
  'server/src/db/migrations/_data_only.sql',
]

// ─── 1. Vocab translations — what the flashcard shows on the back ─────
test('canonical seed disambiguates fr_313/314/315 Russian translations', () => {
  for (const file of CANONICAL_FILES) {
    const text = read(file)
    const lever = lineForVocabId(text, 'fr_313', 'ru')
    const relever = lineForVocabId(text, 'fr_314', 'ru')
    const elever = lineForVocabId(text, 'fr_315', 'ru')

    assert.ok(lever, `${file}: fr_313 RU row must exist`)
    assert.ok(relever, `${file}: fr_314 RU row must exist`)
    assert.ok(elever, `${file}: fr_315 RU row must exist`)

    assert.ok(lever.includes("'поднимать'"), `${file}: fr_313 must keep "поднимать", got: ${lever}`)
    assert.ok(relever.includes("'подхватывать, принимать'"), `${file}: fr_314 must be "подхватывать, принимать", got: ${relever}`)
    assert.ok(elever.includes("'воспитывать, растить'"), `${file}: fr_315 must be "воспитывать, растить", got: ${elever}`)

    // The user's exact bug: identical primary word. Now each starts with
    // a different first word.
    const firstWords = [
      lever.match(/'поднимать'/)?.[0],
      relever.match(/'подхватывать, принимать'/)?.[0],
      elever.match(/'воспитывать, растить'/)?.[0],
    ]
    const unique = new Set(firstWords)
    assert.strictEqual(
      unique.size,
      3,
      `${file}: each of lever/relever/élever must start with a DISTINCT first Russian word. Got: ${JSON.stringify(firstWords)}`,
    )
  }
})

// ─── 2. English translations mirror the disambiguation ──────────────
test('canonical seed disambiguates fr_313/314/315 English translations', () => {
  for (const file of CANONICAL_FILES) {
    const text = read(file)
    const lever = lineForVocabId(text, 'fr_313', 'en')
    const relever = lineForVocabId(text, 'fr_314', 'en')
    const elever = lineForVocabId(text, 'fr_315', 'en')

    assert.ok(lever, `${file}: fr_313 EN row must exist`)
    assert.ok(relever, `${file}: fr_314 EN row must exist`)
    assert.ok(elever, `${file}: fr_315 EN row must exist`)

    assert.ok(lever.includes("'to raise'"), `${file}: fr_313 EN must keep "to raise", got: ${lever}`)
    assert.ok(relever.includes("'to take up / to pick up'"), `${file}: fr_314 EN must be "to take up / to pick up", got: ${relever}`)
    assert.ok(elever.includes("'to bring up / to raise (children)'"), `${file}: fr_315 EN must be "to bring up / to raise (children)", got: ${elever}`)
  }
})

// ─── 3. Theme-verb rows (used by VerbListSection in the theme view) ───
test('canonical seed disambiguates theme_verb rows for fr_theme01', () => {
  for (const file of CANONICAL_FILES) {
    const text = read(file)
    const leverRow = lineForThemeVerb(text, 'fr_theme01', 'lever')
    const releverRow = lineForThemeVerb(text, 'fr_theme01', 'relever')
    const eleverRow = lineForThemeVerb(text, 'fr_theme01', 'élever')

    assert.ok(leverRow.includes("'поднимать'"), `${file}: lever verbList row must say "поднимать"`)
    assert.ok(releverRow.includes("'подхватывать, принимать'"), `${file}: relever verbList row must say "подхватывать, принимать", got: ${releverRow}`)
    assert.ok(eleverRow.includes("'воспитывать, растить'"), `${file}: élever verbList row must say "воспитывать, растить", got: ${eleverRow}`)
  }
})

// ─── 4. Conjugation answers (theme01 = affirmative) ────────────────────
test('canonical seed has distinct affirmative conjugations for fr_theme01', () => {
  for (const file of CANONICAL_FILES) {
    const text = read(file)
    const relever = lineForConjugation(text, 'fr_theme01', 'relever', 'ru')
    const elever = lineForConjugation(text, 'fr_theme01', 'élever', 'ru')

    assert.ok(relever.includes('подхватываю'), `${file}: fr_theme01 relever conjugation must start with подхватываю, got: ${relever}`)
    assert.ok(elever.includes('воспитываю'), `${file}: fr_theme01 élever conjugation must start with воспитываю, got: ${elever}`)
    // Negative: fr_theme02 relever must not start with поднимаю anymore
    const releverNeg = lineForConjugation(text, 'fr_theme02', 'relever', 'ru')
    assert.ok(releverNeg.includes('не подхватываю'), `${file}: fr_theme02 relever negative must start with не подхватываю, got: ${releverNeg}`)
  }
})

// ─── 5. Russian hint for fr_314 must not use the disambiguated-broken form
test('fr_314 hint mnemonics no longer use the "поднимает" disambiguation-broken form', () => {
  for (const file of CANONICAL_FILES) {
    const text = read(file)
    const hint = lineForVocabHint(text, 'fr_314')
    // The original hint said "реле поднимает ток". It was the same
    // disambiguation problem in hint form (mentions "поднимает").
    // After the fix, the hint either stays the same (relevé vs lever)
    // or is updated. Pin only that the hint does NOT mention
    // "поднимает" / "поднимать" as the primary verb.
    assert.ok(
      !/подним/i.test(hint),
      `${file}: fr_314 hint should no longer use the disambiguated-broken "поднимает" form, got: ${hint}`,
    )
  }
})

// ─── 6. The OLD broken values must be absent from the canonical seed ──
test('canonical seed does NOT carry the old colliding values', () => {
  for (const file of CANONICAL_FILES) {
    const text = read(file)
    assert.ok(!text.includes("'fr_314', 'ru', 'поднимать, отмечать'"),
      `${file}: must not carry the old fr_314 RU gloss "поднимать, отмечать"`)
    assert.ok(!text.includes("'fr_314', 'ru', 'отмечать, фиксировать'"),
      `${file}: must not carry the intermediate fr_314 RU gloss "отмечать, фиксировать"`)
    assert.ok(!text.includes("'fr_315', 'ru', 'воспитывать, поднимать'"),
      `${file}: must not carry the old fr_315 RU gloss "воспитывать, поднимать"`)
    assert.ok(!text.includes("'fr_314', 'en', 'to raise / to note'"),
      `${file}: must not carry the old fr_314 EN gloss "to raise / to note"`)
    assert.ok(!text.includes("'fr_315', 'en', 'to raise / to bring up'"),
      `${file}: must not carry the old fr_315 EN gloss "to raise / to bring up"`)
  }
})
