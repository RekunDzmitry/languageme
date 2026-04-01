import { Router } from 'express';
import { pool } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/auth.js';

const router = Router();

// List all users
router.get('/users', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, display_name, native_lang, target_lang, created_at FROM "user" ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// User progress overview
router.get('/users/:userId/progress', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { userId } = req.params;

    const { rows: cards } = await pool.query(
      'SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE reps >= 3)::int AS mastered FROM srs_card WHERE user_id = $1',
      [userId]
    );
    const { rows: themes } = await pool.query(
      'SELECT * FROM theme_progress WHERE user_id = $1 ORDER BY theme_id',
      [userId]
    );
    const { rows: [reviewStats] } = await pool.query(
      'SELECT COUNT(*)::int AS total_reviews FROM review WHERE user_id = $1',
      [userId]
    );

    res.json({
      cards: cards[0],
      themes,
      totalReviews: reviewStats.total_reviews,
    });
  } catch (err) { next(err); }
});

// Hardest words analytics
router.get('/analytics/hardest-words', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT v.id, v.target, AVG(r.quality)::real AS avg_quality, COUNT(r.id)::int AS review_count
       FROM review r JOIN vocab v ON v.id = r.vocab_id
       GROUP BY v.id HAVING COUNT(r.id) >= 5
       ORDER BY AVG(r.quality) ASC LIMIT 20`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

export default router;
