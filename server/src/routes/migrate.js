import { Router } from 'express';
import { pool } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/import', authenticate, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const userId = req.user.sub;

    // Check if already migrated
    const { rows: [user] } = await client.query(
      'SELECT migrated_at FROM "user" WHERE id = $1', [userId]
    );
    if (user.migrated_at) {
      return res.status(409).json({ error: 'Data already migrated' });
    }

    const { srsCards, themeProgress, userMnemonics, stats } = req.body;

    await client.query('BEGIN');

    // Import SRS cards
    if (srsCards && typeof srsCards === 'object') {
      for (const [vocabId, card] of Object.entries(srsCards)) {
        const due = card.due ? new Date(card.due) : new Date();
        const lastReviewed = card.lastReviewed ? new Date(card.lastReviewed) : null;
        await client.query(
          `INSERT INTO srs_card (user_id, vocab_id, ease, interval_days, reps, due, last_reviewed)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT DO NOTHING`,
          [userId, vocabId, card.ease || 2.5, card.interval || 1, card.reps || 0, due, lastReviewed]
        );
      }
    }

    // Import theme progress
    if (themeProgress && typeof themeProgress === 'object') {
      for (const [themeId, prog] of Object.entries(themeProgress)) {
        await client.query(
          `INSERT INTO theme_progress (user_id, theme_id, completed, best_score, attempts)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING`,
          [userId, themeId, prog.completed || false, prog.bestScore || 0, prog.attempts || 0]
        );
      }
    }

    // Import user mnemonics
    if (userMnemonics && typeof userMnemonics === 'object') {
      for (const [vocabId, text] of Object.entries(userMnemonics)) {
        await client.query(
          `INSERT INTO user_mnemonic (user_id, vocab_id, text)
           VALUES ($1, $2, $3)
           ON CONFLICT DO NOTHING`,
          [userId, vocabId, text]
        );
      }
    }

    // Import daily stats
    if (stats?.dailyStats && typeof stats.dailyStats === 'object') {
      for (const [date, stat] of Object.entries(stats.dailyStats)) {
        await client.query(
          `INSERT INTO user_daily_stat (user_id, study_date, reviews_count, correct_count)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [userId, date, stat.reviews || 0, stat.correct || 0]
        );
      }
    }

    // Mark as migrated
    await client.query('UPDATE "user" SET migrated_at = NOW() WHERE id = $1', [userId]);

    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

export default router;
