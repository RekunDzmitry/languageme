import { Router } from 'express';
import { pool } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Per-language catch-all theme id. Mirrors the constant in routes/email.js,
// but generalised so a new target language only needs to add a row to
// `theme` with id `<lang>_other` and order 999. The CHECK on
// user_vocab.target_lang limits us to {'fr', 'pl'} today; the resolver
// stays a constant lookup for those two and a clear 400 for anything else.
const OTHER_THEME_IDS = {
  fr: 'fr_other',
  pl: 'pl_other',
};

// Map a client-supplied themeId to a concrete id. The frontend resolves
// 'other' to '<lang>_other' before sending, so this is mostly defensive
// against direct API consumers. The returned id is also validated to
// exist in `theme` for the target_lang — that prevents a user from
// filing a card under a Polish theme while target_lang is 'fr', or
// against a typo'd id.
async function resolveThemeId(themeId, targetLang) {
  const otherId = OTHER_THEME_IDS[targetLang];
  if (!otherId) return null;

  if (themeId === 'other' || !themeId) return otherId;
  if (themeId === otherId) return otherId;

  // Must be a real theme for this language.
  const { rows } = await pool.query(
    'SELECT id FROM theme WHERE id = $1 AND lang = $2',
    [themeId, targetLang]
  );
  return rows[0]?.id || null;
}

// GET /api/user-cards?target=fr
// Returns the user's authored cards for the given target language,
// newest-updated first.
router.get('/', authenticate, async (req, res, next) => {
  try {
    const target = req.query.target;
    if (!target || (target !== 'fr' && target !== 'pl')) {
      return res.status(400).json({ error: 'target must be "fr" or "pl"' });
    }
    const { rows } = await pool.query(
      `SELECT id, target_lang, target, translation, hint, theme_id,
              created_at, updated_at
         FROM user_vocab
        WHERE user_id = $1 AND target_lang = $2
        ORDER BY updated_at DESC`,
      [req.user.sub, target]
    );
    res.json(rows.map((r) => ({
      id: r.id,
      targetLang: r.target_lang,
      target: r.target,
      translation: r.translation,
      hint: r.hint,
      themeId: r.theme_id,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })));
  } catch (err) {
    next(err);
  }
});

// POST /api/user-cards
// Body: { targetLang, target, translation, themeId, hint? }
// Creates the vocab row and an srs_card row in one transaction so the
// card is immediately studyable. The srs_card row uses default values
// (ease 2.5, interval 1 day, reps 0, due now) — same as a "new" seed card.
router.post('/', authenticate,
  validate({
    targetLang: { required: true },
    target: { required: true, minLength: 1 },
    translation: { required: true, minLength: 1 },
    themeId: { required: true },
    hint: {},
  }),
  async (req, res, next) => {
    const { targetLang, target, translation, themeId, hint } = req.body;
    if (targetLang !== 'fr' && targetLang !== 'pl') {
      return res.status(400).json({ error: 'targetLang must be "fr" or "pl"' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const resolved = await resolveThemeId(themeId, targetLang);
      if (!resolved) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Unknown themeId for this target language' });
      }

      const trimmedTarget = String(target).trim();
      const trimmedTranslation = String(translation).trim();
      const trimmedHint = hint ? String(hint).trim() : null;

      const { rows: [vocab] } = await client.query(
        `INSERT INTO user_vocab (user_id, target_lang, target, translation, hint, theme_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, target_lang, target, translation, hint, theme_id, created_at, updated_at`,
        [req.user.sub, targetLang, trimmedTarget, trimmedTranslation, trimmedHint, resolved]
      );

      // Mirror the srs_card shape used by /api/study/review: a fresh card
      // with default SM-2 values. The user starts seeing it as "due" the
      // moment it lands.
      await client.query(
        `INSERT INTO srs_card (user_id, vocab_id, target_lang, ease, interval_days, reps, due)
         VALUES ($1, $2, $3, 2.5, 1, 0, NOW())
         ON CONFLICT (user_id, vocab_id) DO NOTHING`,
        [req.user.sub, vocab.id, targetLang]
      );

      await client.query('COMMIT');

      res.status(201).json({
        id: vocab.id,
        targetLang: vocab.target_lang,
        target: vocab.target,
        translation: vocab.translation,
        hint: vocab.hint,
        themeId: vocab.theme_id,
        createdAt: vocab.created_at,
        updatedAt: vocab.updated_at,
      });
    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
  }
);

// PATCH /api/user-cards/:id
// Body: { target?, translation?, hint?, themeId? } — all optional.
// 404 if the row doesn't belong to the caller (avoids leaking existence).
router.patch('/:id', authenticate, async (req, res, next) => {
  const { id } = req.params;
  const { target, translation, hint, themeId } = req.body;

  // Server-side prefix check: the URL parameter must look like a user-vocab
  // id (starts with usr_). Without this, a typo or malicious client could
  // accidentally point at a seed vocab (fr_/pl_) and update rows they don't
  // own — the user_id check below still catches cross-user writes, but
  // the prefix check makes the failure mode obvious.
  if (typeof id !== 'string' || !id.startsWith('usr_')) {
    return res.status(404).json({ error: 'Card not found' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: [existing] } = await client.query(
      'SELECT id, user_id, target_lang FROM user_vocab WHERE id = $1 FOR UPDATE',
      [id]
    );
    if (!existing || existing.user_id !== req.user.sub) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Card not found' });
    }

    const sets = [];
    const params = [];
    let p = 1;

    if (target !== undefined) {
      params.push(String(target).trim());
      sets.push(`target = $${p++}`);
    }
    if (translation !== undefined) {
      params.push(String(translation).trim());
      sets.push(`translation = $${p++}`);
    }
    if (hint !== undefined) {
      params.push(hint === null ? null : String(hint).trim());
      sets.push(`hint = $${p++}`);
    }
    if (themeId !== undefined) {
      const resolved = await resolveThemeId(themeId, existing.target_lang);
      if (!resolved) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Unknown themeId for this target language' });
      }
      params.push(resolved);
      sets.push(`theme_id = $${p++}`);
    }

    if (sets.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const { rows: [updated] } = await client.query(
      `UPDATE user_vocab SET ${sets.join(', ')}
        WHERE id = $${p}
        RETURNING id, target_lang, target, translation, hint, theme_id, created_at, updated_at`,
      params
    );

    await client.query('COMMIT');

    res.json({
      id: updated.id,
      targetLang: updated.target_lang,
      target: updated.target,
      translation: updated.translation,
      hint: updated.hint,
      themeId: updated.theme_id,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// DELETE /api/user-cards/:id
// Removes the srs_card row(s) and the user_vocab row atomically. 404 if
// the card doesn't belong to the caller.
router.delete('/:id', authenticate, async (req, res, next) => {
  const { id } = req.params;

  if (typeof id !== 'string' || !id.startsWith('usr_')) {
    return res.status(404).json({ error: 'Card not found' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: [existing] } = await client.query(
      'SELECT id, user_id FROM user_vocab WHERE id = $1 FOR UPDATE',
      [id]
    );
    if (!existing || existing.user_id !== req.user.sub) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Card not found' });
    }

    // Order: srs_card first (no FK, but explicit), then user_vocab. Review
    // rows for this card stay — they're historical and removing them would
    // distort the user's stats.
    await client.query(
      'DELETE FROM srs_card WHERE user_id = $1 AND vocab_id = $2',
      [req.user.sub, id]
    );
    await client.query(
      'DELETE FROM user_vocab WHERE id = $1 AND user_id = $2',
      [id, req.user.sub]
    );

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
