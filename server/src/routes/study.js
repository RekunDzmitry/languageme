import { Router } from 'express';
import { pool } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sm2 } from '../services/sm2.js';

const router = Router();

// Derive target_lang from a vocab_id. System cards (fr_/pl_) are decided
// by the prefix; user cards (usr_) need a user_vocab lookup because the
// prefix is identical across languages. Returns null if the id is
// malformed OR if the usr_ row doesn't belong to userId (caller decides
// how to handle — review() raises 400). The ownership filter is load-
// bearing: without it, anyone who learns another user's usr_<uuid> can
// create srs_card + review rows on that user's behalf, breaking the
// private-card ownership model.
async function resolveTargetLang(client, vocabId, userId) {
  if (typeof vocabId !== 'string' || !vocabId) return null;
  if (vocabId.startsWith('fr_')) return 'fr';
  if (vocabId.startsWith('pl_')) return 'pl';
  if (vocabId.startsWith('usr_')) {
    if (!userId) return null;
    const { rows: [row] } = await client.query(
      'SELECT target_lang FROM user_vocab WHERE id = $1 AND user_id = $2',
      [vocabId, userId]
    );
    return row?.target_lang || null;
  }
  return null;
}

// All user's SRS cards (optionally filtered by target language)
router.get('/cards', authenticate, async (req, res, next) => {
  try {
    const target = req.query.target || 'fr';
    if (target !== 'fr' && target !== 'pl') {
      return res.status(400).json({ error: 'target must be "fr" or "pl"' });
    }
    // Filter on target_lang (NOT NULL since migration 025) rather than
    // parsing the vocab_id prefix. User cards and seed cards are now
    // both selected uniformly.
    const userId = req.user.sub;
    const { rows } = await pool.query(
      'SELECT vocab_id, ease, interval_days, reps, due, last_reviewed FROM srs_card WHERE user_id = $1 AND target_lang = $2',
      [userId, target]
    );
    console.log('[study] srs_db_fetch', {
      userId,
      target,
      count: rows.length,
      rows: rows.map((r) => ({
        vocab_id: r.vocab_id,
        reps: r.reps,
        last_reviewed: r.last_reviewed,
        due: r.due,
      })),
    });
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
       WHERE v.source = 'seed'
         AND v.id NOT IN (SELECT vocab_id FROM srs_card WHERE user_id = $1)
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
    queue: {}, // optional: the remaining queue after this click, for analytics
  }),
  async (req, res, next) => {
    const client = await pool.connect();
    try {
    const { vocabId, quality, queue } = req.body;
    const userId = req.user.sub;

      await client.query('BEGIN');

      // Get or create card
      let { rows: [card] } = await client.query(
        'SELECT * FROM srs_card WHERE user_id = $1 AND vocab_id = $2',
        [userId, vocabId]
      );

      if (!card) {
        // First review of a new card. target_lang is NOT NULL on srs_card
        // (set up in migration 025); derive it from the vocab_id prefix
        // for system cards or look it up in user_vocab for user cards.
        const targetLang = await resolveTargetLang(client, vocabId, userId);
        if (!targetLang) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'Unknown vocabId' });
        }
        const { rows: [newCard] } = await client.query(
          'INSERT INTO srs_card (user_id, vocab_id, target_lang) VALUES ($1, $2, $3) RETURNING *',
          [userId, vocabId, targetLang]
        );
        card = newCard;
      }

      // SM-2 update
      const updated = sm2(card, quality);

      await client.query(
        'UPDATE srs_card SET ease = $1, interval_days = $2, reps = $3, due = $4, last_reviewed = $5 WHERE user_id = $6 AND vocab_id = $7',
        [updated.ease, updated.interval_days, updated.reps, updated.due, updated.last_reviewed, userId, vocabId]
      );

      // Insert review record (also needs target_lang)
      const reviewLang = card.target_lang || await resolveTargetLang(client, vocabId, userId);
      if (reviewLang) {
        await client.query(
          'INSERT INTO review (user_id, vocab_id, target_lang, quality) VALUES ($1, $2, $3, $4)',
          [userId, vocabId, reviewLang, quality]
        );
      } else {
        await client.query(
          'INSERT INTO review (user_id, vocab_id, quality) VALUES ($1, $2, $3)',
          [userId, vocabId, quality]
        );
      }

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

      console.log('[study] rate', {
        userId,
        vocabId,
        quality,
        queue: Array.isArray(queue) ? queue : null,
      });

      res.json({ ...card, ...updated });
    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
  }
);

// Log a study session start with the initial queue. The queue is
// built client-side (StudySession lazy useState init) so the server
// has no other visibility into it. Fire-and-forget: this is an
// analytics endpoint, not a study primitive — failures must not
// break the session.
router.post('/session-start', authenticate, async (req, res, next) => {
  try {
    const { route, themeId, targetLang, queue, due, newC, poolSize, userVocabCount, poolUsrCount, cardsCount } = req.body || {};
    if (route !== 'learn' && route !== 'study') {
      return res.status(400).json({ error: 'route must be "learn" or "study"' });
    }
    console.log('[study] session_start', {
      userId: req.user.sub,
      route,
      themeId: themeId || null,
      targetLang: targetLang || null,
      queue: Array.isArray(queue) ? queue : [],
      // The client splits getStudyableCards() into its two halves so
      // the server can see exactly what the reordering produced:
      //   due  = cards where cards[w.id]?.due <= now (sorted by due asc,
      //          user-first tiebreaker)
      //   newC = cards where reps===0 && !lastReviewed (sorted by
      //          user-first), excluding anything already in `due`
      // The final `queue` is due+newC sliced to BATCH_SIZE. When
      // the user card is missing from `queue` but present in
      // `newC`/`due`, the pool didn't include it — that's the
      // userVocab-empty symptom we want to surface.
      due: Array.isArray(due) ? due : null,
      newC: Array.isArray(newC) ? newC : null,
      poolSize: typeof poolSize === 'number' ? poolSize : null,
      // Diagnostic counters that pinpoint where the user card is
      // being dropped: userVocabCount = user cards in the React
      // context after fetchProgress; poolUsrCount = how many of
      // those made it past the scope filter into themeVocab;
      // cardsCount = srs_card rows the client has.
      //   userVocabCount > 0 && poolUsrCount === 0
      //     → scope filter dropped the card (themeId mismatch)
      //   poolUsrCount > 0 && user card missing from queue
      //     → BATCH_SIZE slice dropped it (position >= 10)
      //   userVocabCount === 0
      //     → fetchProgress didn't load it (race with createUserCard)
      userVocabCount: typeof userVocabCount === 'number' ? userVocabCount : null,
      poolUsrCount: typeof poolUsrCount === 'number' ? poolUsrCount : null,
      cardsCount: typeof cardsCount === 'number' ? cardsCount : null,
    });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// User-authored write_answer drills (created from email corrections)
router.get('/write-exercises', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, theme_id, prompt, answer, hint, created_at
       FROM user_write_exercise
       WHERE user_id = $1
       ORDER BY theme_id, created_at`,
      [req.user.sub]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// === Exercise Cards (Polish Spelling) ===

// Get all exercise cards for user
router.get('/exercises', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT exercise_key, theme_id, ease, interval_days, reps, due, last_reviewed 
       FROM exercise_card WHERE user_id = $1`,
      [req.user.sub]
    );
    // Map to frontend key format
    const cards = {};
    rows.forEach(row => {
      cards[row.exercise_key] = {
        themeId: row.theme_id,
        ease: row.ease,
        interval: row.interval_days,
        reps: row.reps,
        due: new Date(row.due).getTime(),
        lastReviewed: row.last_reviewed ? new Date(row.last_reviewed).getTime() : null,
      };
    });
    res.json(cards);
  } catch (err) { next(err); }
});

// Review an exercise card
router.post('/exercises/review', authenticate,
  validate({
    exerciseKey: { required: true },
    themeId: { required: true },
    quality: { required: true, type: 'number', min: 0, max: 3 },
  }),
  async (req, res, next) => {
    const client = await pool.connect();
    try {
      const { exerciseKey, themeId, quality } = req.body;
      const userId = req.user.sub;

      await client.query('BEGIN');

      // Get or create card
      let { rows: [card] } = await client.query(
        'SELECT * FROM exercise_card WHERE user_id = $1 AND exercise_key = $2',
        [userId, exerciseKey]
      );

      if (!card) {
        const { rows: [newCard] } = await client.query(
          'INSERT INTO exercise_card (user_id, exercise_key, theme_id) VALUES ($1, $2, $3) RETURNING *',
          [userId, exerciseKey, themeId]
        );
        card = newCard;
      }

      // SM-2 update
      const updated = sm2(card, quality);

      await client.query(
        `UPDATE exercise_card 
         SET ease = $1, interval_days = $2, reps = $3, due = $4, last_reviewed = $5
         WHERE user_id = $6 AND exercise_key = $7`,
        [updated.ease, updated.interval_days, updated.reps, updated.due, updated.last_reviewed, userId, exerciseKey]
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

// === Conjugation Cards ===

// Get all conjugation cards for user
router.get('/conjugation', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT card_key, ease, interval_days, reps, due, last_reviewed 
       FROM conjugation_card WHERE user_id = $1`,
      [req.user.sub]
    );
    // Map to frontend key format
    const cards = {};
    rows.forEach(row => {
      cards[row.card_key] = {
        ease: row.ease,
        interval: row.interval_days,
        reps: row.reps,
        due: new Date(row.due).getTime(),
        lastReviewed: row.last_reviewed ? new Date(row.last_reviewed).getTime() : null,
      };
    });
    res.json(cards);
  } catch (err) { next(err); }
});

// Review a conjugation card
router.post('/conjugation/review', authenticate,
  validate({
    cardKey: { required: true },
    quality: { required: true, type: 'number', min: 0, max: 3 },
  }),
  async (req, res, next) => {
    const client = await pool.connect();
    try {
      const { cardKey, quality } = req.body;
      const userId = req.user.sub;

      await client.query('BEGIN');

      // Get or create card
      let { rows: [card] } = await client.query(
        'SELECT * FROM conjugation_card WHERE user_id = $1 AND card_key = $2',
        [userId, cardKey]
      );

      if (!card) {
        const { rows: [newCard] } = await client.query(
          'INSERT INTO conjugation_card (user_id, card_key) VALUES ($1, $2) RETURNING *',
          [userId, cardKey]
        );
        card = newCard;
      }

      // SM-2 update
      const updated = sm2(card, quality);

      await client.query(
        `UPDATE conjugation_card 
         SET ease = $1, interval_days = $2, reps = $3, due = $4, last_reviewed = $5, updated_at = NOW()
         WHERE user_id = $6 AND card_key = $7`,
        [updated.ease, updated.interval_days, updated.reps, updated.due, updated.last_reviewed, userId, cardKey]
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
