import { Router } from 'express';
import { pool } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.sub;

    const [userRes, cardsRes, progressRes, mnemonicsRes] = await Promise.all([
      pool.query(
        'SELECT email, native_lang, target_lang, ui_lang, auto_play_audio FROM "user" WHERE id = $1',
        [userId]
      ),
      pool.query(
        'SELECT vocab_id, ease, interval_days, reps, due, last_reviewed FROM srs_card WHERE user_id = $1',
        [userId]
      ),
      pool.query(
        'SELECT theme_id, completed, best_score, attempts FROM theme_progress WHERE user_id = $1',
        [userId]
      ),
      pool.query(
        'SELECT vocab_id, text FROM user_mnemonic WHERE user_id = $1',
        [userId]
      ),
    ]);

    const user = userRes.rows[0];
    const today = new Date().toISOString().slice(0, 10);

    const data = {
      meta: {
        version: 1,
        app: 'languageme',
        exportedAt: new Date().toISOString(),
        email: user.email,
      },
      settings: {
        nativeLang: user.native_lang,
        targetLang: user.target_lang,
        uiLang: user.ui_lang,
        autoPlayAudio: user.auto_play_audio,
      },
      srsCards: cardsRes.rows.map(r => ({
        vocabId: r.vocab_id,
        ease: parseFloat(r.ease),
        intervalDays: r.interval_days,
        reps: r.reps,
        due: r.due?.toISOString() ?? null,
        lastReviewed: r.last_reviewed?.toISOString() ?? null,
      })),
      themeProgress: progressRes.rows.map(r => ({
        themeId: r.theme_id,
        completed: r.completed,
        bestScore: r.best_score,
        attempts: r.attempts,
      })),
      mnemonics: mnemonicsRes.rows.map(r => ({
        vocabId: r.vocab_id,
        text: r.text,
      })),
    };

    res.setHeader('Content-Disposition', `attachment; filename="languageme-backup-${today}.json"`);
    res.setHeader('Content-Type', 'application/json');
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
