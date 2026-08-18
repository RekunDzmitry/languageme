// server/src/routes/courses.js
//
// GET /api/courses/:lang?native_lang=ru
// GET /api/courses/all?native_lang=ru
//
// Returns the full course bundle for the requested target language(s)
// as a single JSON document.
//
// Single-lang shape:
//   { lang, nativeLang, vocab, themes, hintsByVocab, examplesByVocab,
//     lexiconByVocab, conjugationsByTheme }
//
// All-langs shape:
//   { fr: <single-lang>, pl: <single-lang> }

import { Router } from 'express'
import { pool } from '../db/pool.js'

const router = Router()

/**
 * Apply a (vocab_id -> { lang -> text }) override map on top of the
 * vocab rows the bundle already carries. The mutations are in place
 * because vocab was just built one row ago.
 */
function applyTranslationOverrides(vocab, overrides) {
  if (!overrides || overrides.size === 0) return
  for (const v of vocab) {
    const ovr = overrides.get(v.id)
    if (!ovr) continue
    const arr = Array.isArray(v.translations) ? v.translations : []
    const langSet = new Set(arr.map(t => t.lang))
    for (const [lang, text] of ovr) {
      const existing = arr.find(t => t.lang === lang)
      if (existing) existing.text = text
      else { arr.push({ lang, text }); langSet.add(lang) }
    }
    v.translations = arr
  }
}

/**
 * Apply a (exercise_key -> answers[]) override map on top of every
 * exercises section in the themes the bundle carries. The seed shape
 * is `exercises[i].answer` (string) or `exercises[i].answers` (array);
 * we keep the shape that the seed used and just replace the value.
 */
function applyExerciseAnswerOverrides(themes, overrides) {
  if (!overrides || overrides.size === 0) return
  for (const theme of themes) {
    const sections = theme.sections || []
    for (const section of sections) {
      if (section.type !== 'exercises') continue
      // After the section.flatten() pass in bundleFor(), section.exercises
      // is the top-level array; section.content is gone.
      const exercises = section.exercises || []
      for (let i = 0; i < exercises.length; i++) {
        const key = `${theme.id}:${i}`
        const override = overrides.get(key)
        if (!override) continue
        const ex = exercises[i] || {}
        if (Array.isArray(ex.answers)) {
          ex.answers = [...override]
        } else if ('answer' in ex) {
          ex.answer = override[0] || ''
        } else {
          // No existing key — pick the array shape
          ex.answers = [...override]
        }
        exercises[i] = ex
      }
      section.exercises = exercises
    }
  }
}

/**
 * Apply a (theme_id -> infinitive -> pronoun_idx -> text) override map
 * on top of the conjugationsByTheme table the bundle just built. The
 * override is a single string for one (theme, verb, pronoun) cell —
 * the seed value at that position in the TEXT[] gets replaced. Cells
 * outside the seed (e.g. a user override on a verb that was removed
 * from the seed) are dropped silently; a missing entry just means
 * "no override for this cell, fall back to the seed".
 */
function applyConjugationPromptOverrides(conjugationsByTheme, overrides) {
  if (!overrides || overrides.size === 0) return
  for (const [themeId, byVerb] of overrides) {
    const themeTable = conjugationsByTheme[themeId]
    if (!themeTable) continue
    for (const [infinitive, byPronoun] of byVerb) {
      const forms = themeTable[infinitive]
      if (!Array.isArray(forms)) continue
      for (const [pronounIdx, text] of byPronoun) {
        if (pronounIdx < 0 || pronounIdx >= forms.length) continue
        forms[pronounIdx] = text
      }
    }
  }
}

/**
 * Apply a (theme_id -> infinitive -> pronoun_idx -> text) mnemonic
 * override map. Mirrors applyConjugationPromptOverrides but writes
 * into a separate bundle key (conjugationMnemonicsByTheme) instead of
 * mutating conjugationsByTheme. The mnemonic is a hint, not a prompt,
 * so the two surfaces stay independent — a cell can carry a custom
 * prompt WITHOUT a custom mnemonic (verb-wide hint still applies), or
 * vice versa. ConjugationExercise consults this map first and falls
 * back to the verb-wide user_mnemonic / vocab_hint when no per-cell
 * row exists.
 */
function applyConjugationMnemonicOverrides(conjugationMnemonicsByTheme, overrides) {
  if (!overrides || overrides.size === 0) return
  for (const [themeId, byVerb] of overrides) {
    if (!conjugationMnemonicsByTheme[themeId]) conjugationMnemonicsByTheme[themeId] = {}
    const themeTable = conjugationMnemonicsByTheme[themeId]
    for (const [infinitive, byPronoun] of byVerb) {
      if (!themeTable[infinitive]) themeTable[infinitive] = {}
      const cell = themeTable[infinitive]
      for (const [pronounIdx, text] of byPronoun) {
        if (pronounIdx < 0 || pronounIdx > 5) continue
        cell[pronounIdx] = text
      }
    }
  }
}

/**
 * Load a user's translation + exercise-answer + conjugation-prompt
 * overrides in one round-trip per table. Returns Maps keyed by
 * vocab_id / exercise_key / composite (themeId, infinitive, pronounIdx).
 *
 * `nativeLang` scopes the conjugation-prompt fetch: the override
 * table is keyed by (user, theme, verb, pronoun, lang) and the UI
 * saves under settings.nativeLang, so a user with overrides in
 * multiple native languages would otherwise see a wrong-language
 * row overwrite the right one when the loop builds the in-memory
 * map. Translation overrides already self-key on native_lang
 * inside the loop and don't need the same filter at the SQL
 * level — keep the translation query unfiltered and let the map
 * carry every lang, since other call sites may want them.
 */
async function loadUserOverrides(userId, nativeLang) {
  if (!userId) return {
    translations: new Map(),
    answers: new Map(),
    conjugationPrompts: new Map(),
    conjugationMnemonics: new Map(),
  }
  const [tRes, aRes, cRes, mRes] = await Promise.all([
    pool.query(
      `SELECT vocab_id, native_lang, text
         FROM user_translation_override
        WHERE user_id = $1`,
      [userId]
    ),
    pool.query(
      `SELECT exercise_key, answers
         FROM user_exercise_answer_override
        WHERE user_id = $1`,
      [userId]
    ),
    // Pronoun_idx is SMALLINT in the schema but node-postgres returns
    // it as a number. We index by composite keys built from the row.
    // The lang filter is the bug fix from the PR-37 review: without
    // it, a user with overrides in multiple native languages could
    // see the wrong-language cell land on top of the right one when
    // the loop builds the Map (the latter write wins).
    pool.query(
      `SELECT theme_id, infinitive, pronoun_idx, text
         FROM user_conjugation_prompt_override
        WHERE user_id = $1 AND lang = $2`,
      [userId, nativeLang]
    ),
    // Same lang scoping as the prompt override above: a user with
    // mnemonic rows in two native langs would otherwise see the wrong-
    // language cell overwrite the right one in the in-memory map.
    pool.query(
      `SELECT theme_id, infinitive, pronoun_idx, text
         FROM user_conjugation_mnemonic
        WHERE user_id = $1 AND lang = $2`,
      [userId, nativeLang]
    ),
  ])
  const translations = new Map()
  for (const r of tRes.rows) {
    if (!translations.has(r.vocab_id)) translations.set(r.vocab_id, new Map())
    translations.get(r.vocab_id).set(r.native_lang, r.text)
  }
  const answers = new Map()
  for (const r of aRes.rows) answers.set(r.exercise_key, r.answers)
  // Two-level Map<themeId, Map<infinitive, Map<pronounIdx, text>>>
  // mirrors the shape the UI receives from conjugationsByTheme so
  // applyConjugationPromptOverrides can walk it without
  // re-flattening the data. The lang scoping is enforced by the
  // WHERE lang = $2 clause in the SELECT above; we don't SELECT
  // lang here, so a second-pass guard in this loop would be
  // checking against an undefined column. If the WHERE ever
  // relaxes, add `lang` back to the SELECT AND keep this guard.
  const conjugationPrompts = new Map()
  for (const r of cRes.rows) {
    if (!conjugationPrompts.has(r.theme_id)) conjugationPrompts.set(r.theme_id, new Map())
    const byVerb = conjugationPrompts.get(r.theme_id)
    if (!byVerb.has(r.infinitive)) byVerb.set(r.infinitive, new Map())
    byVerb.get(r.infinitive).set(r.pronoun_idx, r.text)
  }
  // Same shape as conjugationPrompts — a two-level Map<themeId,
  // Map<infinitive, Map<pronounIdx, text>>> so applyConjugation
  // MnemonicOverrides can walk it the same way. Kept in a separate
  // Map so the prompt and mnemonic override layers never collide
  // (one cell can have a custom prompt without a custom mnemonic
  // and vice versa).
  const conjugationMnemonics = new Map()
  for (const r of mRes.rows) {
    if (!conjugationMnemonics.has(r.theme_id)) conjugationMnemonics.set(r.theme_id, new Map())
    const byVerb = conjugationMnemonics.get(r.theme_id)
    if (!byVerb.has(r.infinitive)) byVerb.set(r.infinitive, new Map())
    byVerb.get(r.infinitive).set(r.pronoun_idx, r.text)
  }
  return { translations, answers, conjugationPrompts, conjugationMnemonics }
}

async function bundleFor(lang, nativeLang, userId = null) {
  const { rows: vocabRows } = await pool.query(
    `SELECT v.id, v.target, v.ipa, v.gender, v.freq, v.theme,
            COALESCE(
              json_agg(DISTINCT jsonb_build_object('lang', vt.lang, 'text', vt.text))
                FILTER (WHERE vt.lang IS NOT NULL),
              '[]'::json
            ) AS translations,
            (SELECT text FROM vocab_hint WHERE vocab_id = v.id AND lang = $2 LIMIT 1) AS hint
     FROM vocab v
     LEFT JOIN vocab_translation vt ON vt.vocab_id = v.id
     WHERE v.id LIKE $1 || '\\_%' ESCAPE '\\'
     GROUP BY v.id
     ORDER BY v.freq`,
    [lang, nativeLang]
  )

  const { rows: themeVocabRows } = await pool.query(
    `SELECT vocab_id, theme_id FROM theme_vocab WHERE theme_id LIKE $1 || '\\_%' ESCAPE '\\'`,
    [lang]
  )
  const themeIdsByVocab = new Map()
  for (const r of themeVocabRows) {
    if (!themeIdsByVocab.has(r.vocab_id)) themeIdsByVocab.set(r.vocab_id, [])
    themeIdsByVocab.get(r.vocab_id).push(r.theme_id)
  }

  const vocab = vocabRows.map(v => ({
    ...v,
    themeIds: themeIdsByVocab.get(v.id) || [],
    translations: typeof v.translations === 'string' ? JSON.parse(v.translations) : v.translations,
  }))

  const { rows: themeRows } = await pool.query(
    `SELECT id, lang, pack_id, "order", title, title_ru, description, description_ru,
            unlock_theme_id, unlock_min_score
     FROM theme
     WHERE lang = $1
     ORDER BY pack_id NULLS FIRST, "order"`,
    [lang]
  )

  const { rows: sectionRows } = await pool.query(
    `SELECT theme_id, type, sort_order, content
     FROM theme_section
     WHERE theme_id LIKE $1 || '\\_%' ESCAPE '\\' OR theme_id LIKE $1 || '-%'
     ORDER BY theme_id, sort_order`,
    [lang]
  )
  const sectionsByTheme = new Map()
  for (const s of sectionRows) {
    if (!sectionsByTheme.has(s.theme_id)) sectionsByTheme.set(s.theme_id, [])
    // Flatten theme_section.content (JSONB) into the section object so
    // the React components can read section.exercises / section.notes /
    // section.tables / section.vocabIds directly, the same shape the
    // old src/data/courses/ JS bundles used to expose.
    const content = typeof s.content === 'string' ? JSON.parse(s.content) : (s.content || {})
    sectionsByTheme.get(s.theme_id).push({
      type: s.type,
      sort_order: s.sort_order,
      ...content,
    })
  }

  const { rows: verbRows } = await pool.query(
    `SELECT theme_id, infinitive, ru, participe_passe, auxiliaire, verb_group
     FROM theme_verb
     WHERE theme_id LIKE $1 || '\\_%' ESCAPE '\\'
     ORDER BY theme_id`,
    [lang]
  )
  const verbsByTheme = new Map()
  for (const v of verbRows) {
    if (!verbsByTheme.has(v.theme_id)) verbsByTheme.set(v.theme_id, [])
    verbsByTheme.get(v.theme_id).push(v)
  }

  const themes = themeRows.map(t => ({
    ...t,
    sections: sectionsByTheme.get(t.id) || [],
    verbList: verbsByTheme.get(t.id) || [],
    vocabIds: (themeIdsByVocab.size === 0
      ? []
      : Array.from(themeIdsByVocab.entries())
          .filter(([, ids]) => ids.includes(t.id))
          .map(([vid]) => vid)),
  }))

  const { rows: conjRows } = await pool.query(
    `SELECT theme_id, infinitive, lang, forms
     FROM theme_conjugation
     WHERE theme_id LIKE $1 || '\\_%' ESCAPE '\\' AND lang = $2`,
    [lang, nativeLang]
  )
  const conjugationsByTheme = {}
  for (const r of conjRows) {
    if (!conjugationsByTheme[r.theme_id]) conjugationsByTheme[r.theme_id] = {}
    conjugationsByTheme[r.theme_id][r.infinitive] = r.forms
  }

  // Per-cell mnemonic overrides joined in below. Seed is empty —
  // there are no built-in per-cell mnemonics, so the bundle only
  // carries rows the user wrote. ConjugationExercise falls back to
  // the verb-wide user_mnemonic / vocab_hint when no per-cell row
  // is present, so a missing entry is the expected default.
  const conjugationMnemonicsByTheme = {}

  const { rows: exampleRows } = await pool.query(
    `SELECT v.id AS vocab_id, ve.sort_order, ve.source_text, ve.target_text
     FROM vocab_example ve
     JOIN vocab v ON v.id = ve.vocab_id
     WHERE v.id LIKE $1 || '\\_%' ESCAPE '\\'
     ORDER BY v.id, ve.sort_order`,
    [lang]
  )
  const examplesByVocab = {}
  for (const r of exampleRows) {
    if (!examplesByVocab[r.vocab_id]) examplesByVocab[r.vocab_id] = []
    examplesByVocab[r.vocab_id].push({ fr: r.source_text, ru: r.target_text })
  }

  const { rows: lexRows } = await pool.query(
    `SELECT v.id AS vocab_id, vl.synonyms, vl.usage, vl.semantics
     FROM vocab_lexicon vl
     JOIN vocab v ON v.id = vl.vocab_id
     WHERE v.id LIKE $1 || '\\_%' ESCAPE '\\'`,
    [lang]
  )
  const lexiconByVocab = {}
  for (const r of lexRows) lexiconByVocab[r.vocab_id] = r

  const hintsByVocab = {}
  for (const v of vocab) if (v.hint) hintsByVocab[v.id] = v.hint

  if (userId) {
    const overrides = await loadUserOverrides(userId, nativeLang)
    applyTranslationOverrides(vocab, overrides.translations)
    applyExerciseAnswerOverrides(themes, overrides.answers)
    applyConjugationPromptOverrides(conjugationsByTheme, overrides.conjugationPrompts)
    applyConjugationMnemonicOverrides(conjugationMnemonicsByTheme, overrides.conjugationMnemonics)
  }

  return {
    lang,
    nativeLang,
    vocab,
    themes,
    hintsByVocab,
    examplesByVocab,
    lexiconByVocab,
    conjugationsByTheme,
    conjugationMnemonicsByTheme,
  }
}
import { optionallyAuthenticate as optionalAuth } from '../middleware/auth.js'

router.get('/all', optionalAuth, async (req, res, next) => {
  try {
    const nativeLang = req.query.native_lang || 'ru'
    const userId = req.user?.sub || null
    const out = {}
    for (const lang of ['fr', 'pl']) {
      out[lang] = await bundleFor(lang, nativeLang, userId)
    }
    res.json(out)
  } catch (err) { next(err); }
})

router.get('/:lang', optionalAuth, async (req, res, next) => {
  try {
    const lang = req.params.lang
    if (lang !== 'fr' && lang !== 'pl') {
      return res.status(400).json({ error: 'lang must be "fr" or "pl"' })
    }
    const nativeLang = req.query.native_lang || 'ru'
    const userId = req.user?.sub || null
    res.json(await bundleFor(lang, nativeLang, userId))
  } catch (err) { next(err); }
})

export default router
