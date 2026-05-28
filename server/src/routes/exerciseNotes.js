import { Router } from 'express';
import { pool } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/exercise-notes?themeId=pl_theme01
// Returns all notes for the user, optionally filtered by theme.
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { themeId } = req.query;
    let query = 'SELECT exercise_key, theme_id, content, created_at, updated_at FROM exercise_note WHERE user_id = $1';
    const params = [req.user.sub];

    if (themeId) {
      query += ' AND theme_id = $2';
      params.push(themeId);
    }

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// PUT /api/exercise-notes/:exerciseKey
// Upsert a note for the given exercise key.
router.put('/:exerciseKey', authenticate, async (req, res, next) => {
  try {
    const { themeId, content } = req.body;
    if (!themeId) return res.status(400).json({ error: 'themeId is required' });
    if (!content || !content.trim()) return res.status(400).json({ error: 'content is required' });

    const { rows: [result] } = await pool.query(
      `INSERT INTO exercise_note (user_id, exercise_key, theme_id, content)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, exercise_key)
       DO UPDATE SET content = $4, updated_at = NOW()
       RETURNING exercise_key, theme_id, content, created_at, updated_at`,
      [req.user.sub, req.params.exerciseKey, themeId, content.trim()]
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/exercise-notes/:exerciseKey
router.delete('/:exerciseKey', authenticate, async (req, res, next) => {
  try {
    await pool.query(
      'DELETE FROM exercise_note WHERE user_id = $1 AND exercise_key = $2',
      [req.user.sub, req.params.exerciseKey]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
