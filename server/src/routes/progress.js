import { Router } from 'express';
import { pool } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All theme progress
router.get('/themes', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM theme_progress WHERE user_id = $1',
      [req.user.sub]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// Submit theme score
router.post('/themes/:themeId', authenticate, async (req, res, next) => {
  try {
    const { themeId } = req.params;
    const { score } = req.body;
    if (score === undefined || score < 0 || score > 100) {
      return res.status(400).json({ error: 'score must be 0-100' });
    }

    const { rows: [result] } = await pool.query(
      `INSERT INTO theme_progress (user_id, theme_id, best_score, completed, attempts)
       VALUES ($1, $2, $3, $4, 1)
       ON CONFLICT (user_id, theme_id)
       DO UPDATE SET
         best_score = GREATEST(theme_progress.best_score, $3),
         completed = theme_progress.completed OR $4,
         attempts = theme_progress.attempts + 1,
         updated_at = NOW()
       RETURNING *`,
      [req.user.sub, themeId, score, score >= 60]
    );
    res.json(result);
  } catch (err) { next(err); }
});

// Check unlock status for a single theme
router.get('/themes/:themeId/unlock', authenticate, async (req, res, next) => {
  try {
    const { rows: [theme] } = await pool.query(
      'SELECT unlock_theme_id, unlock_min_score FROM theme WHERE id = $1',
      [req.params.themeId]
    );
    if (!theme) return res.status(404).json({ error: 'Theme not found' });

    if (!theme.unlock_theme_id) {
      return res.json({ unlocked: true });
    }

    const { rows: [prev] } = await pool.query(
      'SELECT best_score, completed FROM theme_progress WHERE user_id = $1 AND theme_id = $2',
      [req.user.sub, theme.unlock_theme_id]
    );

    if (!prev || !prev.completed || prev.best_score < theme.unlock_min_score) {
      return res.json({
        unlocked: false,
        reason: `Complete ${theme.unlock_theme_id} with score >= ${theme.unlock_min_score}%`,
      });
    }

    res.json({ unlocked: true });
  } catch (err) { next(err); }
});

// Get unlock status for all themes at once
router.get('/themes/unlock-status', authenticate, async (req, res, next) => {
  try {
    // Get all themes with their unlock requirements
    const { rows: themes } = await pool.query(
      'SELECT id, unlock_theme_id, unlock_min_score FROM theme ORDER BY "order"'
    );

    // Get user's progress on previous themes
    const { rows: progressRows } = await pool.query(
      'SELECT theme_id, best_score, completed FROM theme_progress WHERE user_id = $1',
      [req.user.sub]
    );

    const progressMap = {};
    progressRows.forEach(r => { progressMap[r.theme_id] = r; });

    // Compute unlock status for each theme
    const result = {};
    for (const theme of themes) {
      if (!theme.unlock_theme_id) {
        result[theme.id] = { unlocked: true };
        continue;
      }
      const prev = progressMap[theme.unlock_theme_id];
      if (prev && prev.completed && prev.best_score >= theme.unlock_min_score) {
        result[theme.id] = { unlocked: true };
      } else {
        result[theme.id] = {
          unlocked: false,
          reason: `Complete ${theme.unlock_theme_id} with score >= ${theme.unlock_min_score}%`,
        };
      }
    }

    res.json(result);
  } catch (err) { next(err); }
});

export default router;
