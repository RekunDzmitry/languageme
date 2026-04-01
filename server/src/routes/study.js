import { Router } from 'express';
import { pool } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sm2 } from '../services/sm2.js';

const router = Router();

// All user's SRS cards
router.get('/cards', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT vocab_id, ease, interval_days, reps, due, last_reviewed FROM srs_card WHERE user_id = $1',
      [req.user.sub]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// Due cards
router.get('/due', authenticate, async (req, res, next) => {
  try {
    let query = `
      SELECT sc.*, v.target, v.ipa, v.gender, v.theme,
        json_agg(json_build_object('lang', vt.lang, 'text', vt.text)) AS translations
      FROM srs_card sc
      JOIN vocab v ON v.id = sc.vocab_id
      LEFT JOIN vocab_translation vt ON vt.vocab_id = sc.vocab_id
      WHERE sc.user_id = $1 AND sc.due <= NOW()
    `;
    const params = [req.user.sub];

    if (req.query.themeId) {
      query += ' AND sc.vocab_id IN (SELECT vocab_id FROM theme_vocab WHERE theme_id = $2)';
      params.push(req.query.themeId);
    }

    query += ' GROUP BY sc.user_id, sc.vocab_id, v.id ORDER BY sc.due LIMIT 50';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) { next(err); }
});

// New/unseen cards
router.get('/new', authenticate, async (req, res, next) => {
  try {
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 5));
    const { rows } = await pool.query(
      `SELECT v.*, json_agg(json_build_object('lang', vt.lang, 'text', vt.text)) AS translations
       FROM vocab v
       LEFT JOIN vocab_translation vt ON vt.vocab_id = v.id
       WHERE v.id NOT IN (SELECT vocab_id FROM srs_card WHERE user_id = $1)
       GROUP BY v.id ORDER BY v.freq LIMIT $2`,
      [req.user.sub, limit]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// Review a card
router.post('/review', authenticate,
  validate({
    vocabId: { required: true },
    quality: { required: true, type: 'number', min: 0, max: 3 },
  }),
  async (req, res, next) => {
    const client = await pool.connect();
    try {
      const { vocabId, quality } = req.body;
      const userId = req.user.sub;

      await client.query('BEGIN');

      // Get or create card
      let { rows: [card] } = await client.query(
        'SELECT * FROM srs_card WHERE user_id = $1 AND vocab_id = $2',
        [userId, vocabId]
      );

      if (!card) {
        const { rows: [newCard] } = await client.query(
          'INSERT INTO srs_card (user_id, vocab_id) VALUES ($1, $2) RETURNING *',
          [userId, vocabId]
        );
        card = newCard;
      }

      // SM-2 update
      const updated = sm2(card, quality);

      await client.query(
        'UPDATE srs_card SET ease = $1, interval_days = $2, reps = $3, due = $4, last_reviewed = $5 WHERE user_id = $6 AND vocab_id = $7',
        [updated.ease, updated.interval_days, updated.reps, updated.due, updated.last_reviewed, userId, vocabId]
      );

      // Insert review record
      await client.query(
        'INSERT INTO review (user_id, vocab_id, quality) VALUES ($1, $2, $3)',
        [userId, vocabId, quality]
      );

      // Upsert daily stat
      const isCorrect = quality >= 2 ? 1 : 0;
      await client.query(
        `INSERT INTO user_daily_stat (user_id, study_date, reviews_count, correct_count)
         VALUES ($1, CURRENT_DATE, 1, $2)
         ON CONFLICT (user_id, study_date)
         DO UPDATE SET reviews_count = user_daily_stat.reviews_count + 1, correct_count = user_daily_stat.correct_count + $2`,
        [userId, isCorrect]
      );

      await client.query('COMMIT');

      res.json({ ...card, ...updated });
    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
  }
);

export default router;
