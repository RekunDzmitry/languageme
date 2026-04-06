import { Router } from 'express';
import { pool } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const MAX_BODY_SIZE = 2 * 1024 * 1024; // 2MB

function validateMeta(meta) {
  if (!meta || meta.app !== 'languageme') {
    return 'Invalid backup file format';
  }
  if (meta.version !== 1) {
    return 'Unsupported backup version';
  }
  return null;
}

function validateNumeric(cards, progress) {
  for (const c of cards) {
    if (typeof c.ease !== 'number' || c.ease <= 0) return `Invalid ease for ${c.vocabId}`;
    if (typeof c.reps !== 'number' || c.reps < 0) return `Invalid reps for ${c.vocabId}`;
    if (typeof c.intervalDays !== 'number' || c.intervalDays < 0) return `Invalid intervalDays for ${c.vocabId}`;
  }
  for (const p of progress) {
    if (typeof p.bestScore !== 'number' || p.bestScore < 0 || p.bestScore > 100) return `Invalid bestScore for ${p.themeId}`;
    if (typeof p.attempts !== 'number' || p.attempts < 0) return `Invalid attempts for ${p.themeId}`;
  }
  return null;
}

router.post('/', authenticate, async (req, res, next) => {
  try {
    // Size check
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > MAX_BODY_SIZE) {
      return res.status(413).json({ error: 'File too large (max 2MB)' });
    }

    const { meta, srsCards = [], themeProgress = [], mnemonics = [] } = req.body;

    // Validate meta
    const metaError = validateMeta(meta);
    if (metaError) return res.status(400).json({ error: metaError });

    // Validate numeric fields
    const numError = validateNumeric(srsCards, themeProgress);
    if (numError) return res.status(400).json({ error: numError });

    // Collect all referenced IDs
    const vocabIds = [...new Set([
      ...srsCards.map(c => c.vocabId),
      ...mnemonics.map(m => m.vocabId),
    ])];
    const themeIds = [...new Set(themeProgress.map(p => p.themeId))];

    // Pre-validate FK references
    if (vocabIds.length > 0) {
      const { rows } = await pool.query(
        'SELECT id FROM vocab WHERE id = ANY($1)', [vocabIds]
      );
      const existing = new Set(rows.map(r => r.id));
      const unknown = vocabIds.filter(id => !existing.has(id));
      if (unknown.length > 0) {
        return res.status(400).json({ error: `Unknown vocabIds: ${unknown.join(', ')}` });
      }
    }

    if (themeIds.length > 0) {
      const { rows } = await pool.query(
        'SELECT id FROM theme WHERE id = ANY($1)', [themeIds]
      );
      const existing = new Set(rows.map(r => r.id));
      const unknown = themeIds.filter(id => !existing.has(id));
      if (unknown.length > 0) {
        return res.status(400).json({ error: `Unknown themeIds: ${unknown.join(', ')}` });
      }
    }

    // Insert in transaction
    const userId = req.user.sub;
    const client = await pool.connect();
    const imported = { srsCards: 0, themeProgress: 0, mnemonics: 0 };

    try {
      await client.query('BEGIN');

      // SRS cards
      for (const c of srsCards) {
        const { rowCount } = await client.query(
          `INSERT INTO srs_card (user_id, vocab_id, ease, interval_days, reps, due, last_reviewed)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT DO NOTHING`,
          [userId, c.vocabId, c.ease, c.intervalDays, c.reps,
           c.due ? new Date(c.due) : new Date(),
           c.lastReviewed ? new Date(c.lastReviewed) : null]
        );
        imported.srsCards += rowCount;
      }

      // Theme progress
      for (const p of themeProgress) {
        const { rowCount } = await client.query(
          `INSERT INTO theme_progress (user_id, theme_id, completed, best_score, attempts)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING`,
          [userId, p.themeId, p.completed || false, p.bestScore, p.attempts]
        );
        imported.themeProgress += rowCount;
      }

      // Mnemonics
      for (const m of mnemonics) {
        const { rowCount } = await client.query(
          `INSERT INTO user_mnemonic (user_id, vocab_id, text)
           VALUES ($1, $2, $3)
           ON CONFLICT DO NOTHING`,
          [userId, m.vocabId, m.text]
        );
        imported.mnemonics += rowCount;
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    const skipped = {
      srsCards: srsCards.length - imported.srsCards,
      themeProgress: themeProgress.length - imported.themeProgress,
      mnemonics: mnemonics.length - imported.mnemonics,
    };

    res.json({ imported, skipped });
  } catch (err) {
    next(err);
  }
});

export default router;
