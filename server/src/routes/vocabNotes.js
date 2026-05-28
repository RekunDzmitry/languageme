import { Router } from 'express';
import { pool } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/vocab-notes?vocabId=pl_001
// Returns all notes for the user, optionally filtered by vocab.
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { vocabId } = req.query;
    let query = 'SELECT vocab_id, content, created_at, updated_at FROM vocab_note WHERE user_id = $1';
    const params = [req.user.sub];

    if (vocabId) {
      query += ' AND vocab_id = $2';
      params.push(vocabId)
    }

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// PUT /api/vocab-notes/:vocabId
// Upsert a note for the given vocab ID.
router.put('/:vocabId', authenticate, async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: 'content is required' });

    const { rows: [result] } = await pool.query(
      `INSERT INTO vocab_note (user_id, vocab_id, content)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, vocab_id)
       DO UPDATE SET content = $3, updated_at = NOW()
       RETURNING vocab_id, content, created_at, updated_at`,
      [req.user.sub, req.params.vocabId, content.trim()]
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/vocab-notes/:vocabId
router.delete('/:vocabId', authenticate, async (req, res, next) => {
  try {
    await pool.query(
      'DELETE FROM vocab_note WHERE user_id = $1 AND vocab_id = $2',
      [req.user.sub, req.params.vocabId]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;