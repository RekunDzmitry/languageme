import { Router } from 'express';
import { pool } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Per-user override of the expected answers for a write-answer exercise.
// exercise_key matches the one the WriteAnswer component builds:
//   `${themeId}:${exerciseIdx}`
// e.g. "fr_theme01:0", "pl_theme22:3"
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT exercise_key, answers, created_at, updated_at
         FROM user_exercise_answer_override
        WHERE user_id = $1
        ORDER BY exercise_key`,
      [req.user.sub]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.put('/:exerciseKey', authenticate, async (req, res, next) => {
  try {
    const { answers } = req.body;
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'answers must be a non-empty array' });
    }
    const cleaned = answers
      .map(a => String(a || '').trim())
      .filter(Boolean);
    if (cleaned.length === 0) {
      return res.status(400).json({ error: 'answers cannot be all blank' });
    }
    const { rows: [result] } = await pool.query(
      `INSERT INTO user_exercise_answer_override (user_id, exercise_key, answers)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, exercise_key)
       DO UPDATE SET answers = EXCLUDED.answers, updated_at = NOW()
       RETURNING exercise_key, answers, created_at, updated_at`,
      [req.user.sub, req.params.exerciseKey, cleaned]
    );
    res.json(result);
  } catch (err) { next(err); }
});

router.delete('/:exerciseKey', authenticate, async (req, res, next) => {
  try {
    await pool.query(
      `DELETE FROM user_exercise_answer_override
        WHERE user_id = $1 AND exercise_key = $2`,
      [req.user.sub, req.params.exerciseKey]
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
