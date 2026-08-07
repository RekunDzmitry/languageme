// server/src/routes/courses.js
//
// GET /api/courses/:lang?native_lang=ru
//
// Returns the full course bundle for the requested target language as a
// single JSON document. Shape:
//
//   {
//     lang: 'fr' | 'pl',
//     nativeLang: 'ru' | 'pl',
//     vocab: [{ id, target, ipa, gender, freq, theme, themeIds, translations, hint }],
//     themes: [{ ...theme..., sections: [{ type, sort_order, content }], verbs, vocab }],
//     hintsByVocab: { 'fr_001': '...', ... },
//     examplesByVocab: { 'fr_001': [{ fr, ru }], ... },
//     lexiconByVocab: { 'fr_088': { synonyms, usage, semantics }, ... },
//     conjugationsByTheme: { 'fr_theme01': { parler: [...], ... }, ... }
//   }
//
// One endpoint, one round-trip. The client uses src/lib/courseData.jsx
// to consume this and expose it as synchronous React context.

import { Router } from 'express'
import { pool } from '../db/pool.js'

const router = Router()

router.get('/:lang', async (req, res, next) => {
  try {
    const lang = req.params.lang
    if (lang !== 'fr' && lang !== 'pl') {
      return res.status(400).json({ error: 'lang must be "fr" or "pl"' })
    }
    const nativeLang = req.query.native_lang || 'ru'

    // Vocab + per-native-lang hint
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

    // themeIds per vocab (join via theme_vocab)
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
      // pg returns jsonb as already-parsed objects in modern node-pg
      translations: typeof v.translations === 'string' ? JSON.parse(v.translations) : v.translations,
    }))

    // Themes (with sections, verbs, vocab links)
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
      sectionsByTheme.get(s.theme_id).push({
        type: s.type,
        sort_order: s.sort_order,
        content: typeof s.content === 'string' ? JSON.parse(s.content) : s.content,
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
      verbs: verbsByTheme.get(t.id) || [],
      vocabIds: (themeIdsByVocab.size === 0
        ? []
        : Array.from(themeIdsByVocab.entries())
            .filter(([_, ids]) => ids.includes(t.id))
            .map(([vid]) => vid)),
    }))

    // Conjugations (per native_lang)
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

    // Examples (vocab -> [{ fr, ru, sort_order }])
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

    // Lexicon
    const { rows: lexRows } = await pool.query(
      `SELECT v.id AS vocab_id, vl.synonyms, vl.usage, vl.semantics
       FROM vocab_lexicon vl
       JOIN vocab v ON v.id = vl.vocab_id
       WHERE v.id LIKE $1 || '\\_%' ESCAPE '\\'`,
      [lang]
    )
    const lexiconByVocab = {}
    for (const r of lexRows) lexiconByVocab[r.vocab_id] = r

    // Hints map (vocabId -> hint text, for the requested native_lang)
    const hintsByVocab = {}
    for (const v of vocab) if (v.hint) hintsByVocab[v.id] = v.hint

    res.json({
      lang,
      nativeLang,
      vocab,
      themes,
      hintsByVocab,
      examplesByVocab,
      lexiconByVocab,
      conjugationsByTheme,
    })
  } catch (err) { next(err); }
})

export default router
