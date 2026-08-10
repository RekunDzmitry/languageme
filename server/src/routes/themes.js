import { Router } from 'express';
import { pool } from '../db/pool.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, lang, pack_id, "order", title, title_ru, description, description_ru, unlock_theme_id, unlock_min_score FROM theme ORDER BY lang, pack_id, "order"'
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
    // PG returns JSONB as parsed JS objects already; pg driver hands them
    // back as objects, so `content` is ready for the client. Older versions
    // returned strings — guard against that case so the client never has to
    // JSON.parse.
    //
    // The component layer (ExerciseSection, GrammarSection, VocabSection)
    // reads section.exercises / section.notes / section.tables /
    // section.vocabIds at the section's top level, the same shape the old
    // src/data/courses/ JS bundles used. Flatten content so we keep one
    // canonical shape across the API.
    const sectionsOut = sections.map(s => {
      const content = typeof s.content === 'string' ? JSON.parse(s.content) : (s.content || {})
      return {
        type: s.type,
        sort_order: s.sort_order,
        ...content,
      }
    })

    const { rows: verbs } = await pool.query(
      'SELECT infinitive, ru, participe_passe, auxiliaire, verb_group FROM theme_verb WHERE theme_id = $1',
      [req.params.id]
    );
    const { rows: vocabRows } = await pool.query(
      `SELECT v.id, v.target, v.ipa, v.gender, v.freq, v.theme,
              COALESCE(
                json_agg(json_build_object('lang', vt.lang, 'text', vt.text))
                  FILTER (WHERE vt.lang IS NOT NULL),
                '[]'::json
              ) AS translations,
              (
                SELECT text FROM vocab_hint
                WHERE vocab_id = v.id
                  AND lang = $2
                LIMIT 1
              ) AS hint
       FROM theme_vocab tv
       JOIN vocab v ON v.id = tv.vocab_id
       LEFT JOIN vocab_translation vt ON vt.vocab_id = v.id
       WHERE tv.theme_id = $1
       GROUP BY v.id
       ORDER BY v.freq`,
      [req.params.id, req.query.native_lang || 'ru']
    );

    res.json({ ...theme, sections: sectionsOut, verbs, vocab: vocabRows });
  } catch (err) { next(err); }
});

// GET /api/themes/:id/conjugations?lang=ru
// Returns the conjugation table for a theme and a native language.
// Backed by theme_conjugation. Returns { themeId, lang, conjugations: { verb: [forms] } }
router.get('/:id/conjugations', async (req, res, next) => {
  try {
    const lang = req.query.lang || 'ru'
    const { rows: themeRows } = await pool.query('SELECT id FROM theme WHERE id = $1', [req.params.id])
    if (themeRows.length === 0) return res.status(404).json({ error: 'Theme not found' })

    const { rows } = await pool.query(
      'SELECT infinitive, forms FROM theme_conjugation WHERE theme_id = $1 AND lang = $2',
      [req.params.id, lang]
    )
    const conjugations = {}
    for (const r of rows) {
      conjugations[r.infinitive] = r.forms
    }
    res.json({ themeId: req.params.id, lang, conjugations })
  } catch (err) { next(err); }
});

export default router;
