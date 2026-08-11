import { Router } from 'express';
import { pool } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Per-user vocab translation overrides. The UI (VocabCard, Flashcard)
// writes here when the user clicks 'Edit translation', and the read path
// (courses.js /api/courses/all) joins the override rows over the seed
// vocab_translation rows so the rest of the app stays unaware of
// overrides.
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT vocab_id, native_lang, text, created_at, updated_at
         FROM user_translation_override
        WHERE user_id = $1`,
      [req.user.sub]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.put('/:vocabId', authenticate, async (req, res, next) => {
  try {
    const { text } = req.body;
    const nativeLang = String(req.query.native_lang || req.body.native_lang || '').trim() || 'ru';
    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: 'text is required' });
    }
    if (!/^(en|ru|pl|de|fr)$/.test(nativeLang)) {
      return res.status(400).json({ error: 'unsupported native_lang' });
    }
    const { rows: [result] } = await pool.query(
      `INSERT INTO user_translation_override (user_id, vocab_id, native_lang, text)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, vocab_id, native_lang)
       DO UPDATE SET text = EXCLUDED.text, updated_at = NOW()
       RETURNING vocab_id, native_lang, text, created_at, updated_at`,
      [req.user.sub, req.params.vocabId, nativeLang, String(text).trim()]
    );
    res.json(result);
  } catch (err) { next(err); }
});

router.delete('/:vocabId', authenticate, async (req, res, next) => {
  try {
    const nativeLang = String(req.query.native_lang || 'ru');
    await pool.query(
      `DELETE FROM user_translation_override
        WHERE user_id = $1 AND vocab_id = $2 AND native_lang = $3`,
      [req.user.sub, req.params.vocabId, nativeLang]
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
