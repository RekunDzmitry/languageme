// server/src/routes/conjugationPromptOverrides.js
//
// CRUD for per-user conjugation prompt overrides. The seed lives in
// theme_conjugation.forms[pronoun_idx]; this route lets a user replace
// one cell of that array (for a specific verb×pronoun in a specific
// theme) when the seed gloss is wrong for their audience.
//
// Composite key shape on the wire (matches the DB primary key):
//   { themeId, infinitive, pronounIdx, lang }
//
// On read, GET / returns the user's full override set as an array of
// rows so the UI can build a local index (the bundle already joins
// these in via applyConjugationPromptOverrides in courses.js, so the
// UI usually doesn't need to fetch this list — but a manual override
// is the canonical place to ask "what does this user have?").
//
// On write, PUT /:themeId/:infinitive/:pronounIdx?lang=ru upserts.

import { Router } from 'express'
import { pool } from '../db/pool.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

const SUPPORTED_LANGS = ['en', 'ru', 'pl', 'de', 'fr']

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT theme_id, infinitive, pronoun_idx, lang, text, created_at, updated_at
         FROM user_conjugation_prompt_override
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
      `INSERT INTO user_conjugation_prompt_override
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
      `DELETE FROM user_conjugation_prompt_override
        WHERE user_id = $1 AND theme_id = $2 AND infinitive = $3
          AND pronoun_idx = $4 AND lang = $5`,
      [req.user.sub, themeId, infinitive, idx, lang]
    )
    res.json({ ok: true })
  } catch (err) { next(err) }
})

export default router
