import { Router } from 'express';
import { pool } from '../db/pool.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, "order", title, title_ru, description, description_ru, unlock_theme_id, unlock_min_score FROM theme ORDER BY "order"'
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { rows: [theme] } = await pool.query('SELECT * FROM theme WHERE id = $1', [req.params.id]);
    if (!theme) return res.status(404).json({ error: 'Theme not found' });

    const { rows: sections } = await pool.query(
      'SELECT type, sort_order, content FROM theme_section WHERE theme_id = $1 ORDER BY sort_order',
      [req.params.id]
    );
    const { rows: verbs } = await pool.query(
      'SELECT infinitive, ru, participe_passe, auxiliaire, verb_group FROM theme_verb WHERE theme_id = $1',
      [req.params.id]
    );
    const { rows: vocabRows } = await pool.query(
      `SELECT v.*, json_agg(json_build_object('lang', vt.lang, 'text', vt.text)) AS translations
       FROM theme_vocab tv
       JOIN vocab v ON v.id = tv.vocab_id
       LEFT JOIN vocab_translation vt ON vt.vocab_id = v.id
       WHERE tv.theme_id = $1
       GROUP BY v.id ORDER BY v.freq`,
      [req.params.id]
    );

    res.json({ ...theme, sections, verbs, vocab: vocabRows });
  } catch (err) { next(err); }
});

export default router;
