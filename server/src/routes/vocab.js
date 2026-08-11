import { Router } from 'express';
import { pool } from '../db/pool.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const offset = (page - 1) * limit;
    const nativeLang = req.query.native_lang || 'ru';

    const { rows: vocab } = await pool.query(
      `SELECT v.id, v.target, v.ipa, v.gender, v.freq, v.theme,
              COALESCE(
                json_agg(json_build_object('lang', vt.lang, 'text', vt.text))
                  FILTER (WHERE vt.lang IS NOT NULL),
                '[]'::json
              ) AS translations,
              (
                SELECT text FROM vocab_hint
                WHERE vocab_id = v.id AND lang = $3
                LIMIT 1
              ) AS hint
       FROM vocab v
       LEFT JOIN vocab_translation vt ON vt.vocab_id = v.id
       GROUP BY v.id
       ORDER BY v.freq
       LIMIT $1 OFFSET $2`,
      [limit, offset, nativeLang]
    );

    const { rows: [{ count }] } = await pool.query('SELECT COUNT(*)::int AS count FROM vocab');

    res.json({ data: vocab, total: count, page, limit });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const nativeLang = req.query.native_lang || 'ru';
    const { rows: [vocab] } = await pool.query('SELECT * FROM vocab WHERE id = $1', [req.params.id]);
    if (!vocab) return res.status(404).json({ error: 'Vocab not found' });

    const { rows: translations } = await pool.query(
      'SELECT lang, text FROM vocab_translation WHERE vocab_id = $1', [req.params.id]
    );
    const { rows: hints } = await pool.query(
      'SELECT lang, text FROM vocab_hint WHERE vocab_id = $1', [req.params.id]
    );
    const { rows: examples } = await pool.query(
      'SELECT sort_order, lang, source_text, target_text FROM vocab_example WHERE vocab_id = $1 ORDER BY sort_order',
      [req.params.id]
    );
    const { rows: [lexicon] } = await pool.query(
      'SELECT synonyms, usage, semantics FROM vocab_lexicon WHERE vocab_id = $1',
      [req.params.id]
    );

    res.json({
      ...vocab,
      translations,
      hints,
      examples,
      // Per-language hint for the caller; client uses this to render
      // mnemonic without a second round-trip.
      hint: hints.find(h => h.lang === nativeLang)?.text || null,
      lexicon: lexicon || null,
    });
  } catch (err) { next(err); }
});

export default router;
