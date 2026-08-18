// server/src/routes/conjugationMnemonics.js
//
// CRUD for per-user conjugation mnemonic overrides (memory hook per
// exercise cell). A theme that drills pronoun × verb (e.g. fr_theme01)
// needs a distinct mnemonic per cell — "je parle" and "tu parles"
// deserve separate memory hooks, not one shared across the whole verb.
//
// Composite key shape on the wire (matches the DB primary key):
//   { themeId, infinitive, pronounIdx, lang }
//
// This route is the API surface that drives the UI's inline mnemonic
// editor in ConjugationExercise. The bundle path (applyConjugation
// MnemonicOverrides in courses.js) joins the user's rows into
// conjugationMnemonicsByTheme[theme_id][infinitive][pronoun_idx]
// before the bundle is sent, so the UI doesn't need a second
// round-trip to resolve a per-cell mnemonic.
//
// Resolution chain when the UI asks "what hint goes here?":
//   1. user_conjugation_mnemonic[theme,verb,pronoun,lang]  (this table)
//   2. user_mnemonic[vocab_id]                            (verb-wide user override)
//   3. vocab_hint[vocab_id, lang]                         (seed)
//   4. ''                                                 (none)

import { Router } from 'express'
import { pool } from '../db/pool.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

const SUPPORTED_LANGS = ['en', 'ru', 'pl', 'de', 'fr']

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT theme_id, infinitive, pronoun_idx, lang, text, created_at, updated_at
         FROM user_conjugation_mnemonic
        WHERE user_id = $1
        ORDER BY theme_id, infinitive, pronoun_idx, lang`,
      [req.user.sub]
    )
    res.json(rows)
  } catch (err) { next(err) }
})

router.put('/:themeId/:infinitive/:pronounIdx', authenticate, async (req, res, next) => {
  try {
    const { themeId, infinitive, pronounIdx } = req.params
    const lang = String(req.query.lang || req.body.lang || '').trim() || 'ru'
    const text = String(req.body.text || '').trim()

    if (!text) return res.status(400).json({ error: 'text is required' })
    if (!SUPPORTED_LANGS.includes(lang)) return res.status(400).json({ error: 'unsupported lang' })
    const idx = Number(pronounIdx)
    if (!Number.isInteger(idx) || idx < 0 || idx > 5) {
      return res.status(400).json({ error: 'pronounIdx must be 0-5' })
    }

    const { rows: [result] } = await pool.query(
      `INSERT INTO user_conjugation_mnemonic
         (user_id, theme_id, infinitive, pronoun_idx, lang, text)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, theme_id, infinitive, pronoun_idx, lang)
       DO UPDATE SET text = EXCLUDED.text, updated_at = NOW()
       RETURNING theme_id, infinitive, pronoun_idx, lang, text, created_at, updated_at`,
      [req.user.sub, themeId, infinitive, idx, lang, text]
    )
    res.json(result)
  } catch (err) { next(err) }
})

router.delete('/:themeId/:infinitive/:pronounIdx', authenticate, async (req, res, next) => {
  try {
    const { themeId, infinitive, pronounIdx } = req.params
    const lang = String(req.query.lang || 'ru')
    const idx = Number(pronounIdx)
    if (!Number.isInteger(idx) || idx < 0 || idx > 5) {
      return res.status(400).json({ error: 'pronounIdx must be 0-5' })
    }
    await pool.query(
      `DELETE FROM user_conjugation_mnemonic
        WHERE user_id = $1 AND theme_id = $2 AND infinitive = $3
          AND pronoun_idx = $4 AND lang = $5`,
      [req.user.sub, themeId, infinitive, idx, lang]
    )
    res.json({ ok: true })
  } catch (err) { next(err) }
})

export default router
