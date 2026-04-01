import { Router } from 'express';
import { pool } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT vocab_id, text, created_at, updated_at FROM user_mnemonic WHERE user_id = $1',
      [req.user.sub]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.put('/:vocabId', authenticate, async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });

    const { rows: [result] } = await pool.query(
      `INSERT INTO user_mnemonic (user_id, vocab_id, text)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, vocab_id)
       DO UPDATE SET text = $3, updated_at = NOW()
       RETURNING *`,
      [req.user.sub, req.params.vocabId, text]
    );
    res.json(result);
  } catch (err) { next(err); }
});

router.delete('/:vocabId', authenticate, async (req, res, next) => {
  try {
    await pool.query(
      'DELETE FROM user_mnemonic WHERE user_id = $1 AND vocab_id = $2',
      [req.user.sub, req.params.vocabId]
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
