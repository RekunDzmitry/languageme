import { Router } from 'express';
import { pool } from '../db/pool.js';
import { validate } from '../middleware/validate.js';
import {
  hashPassword, verifyPassword, generateAccessToken,
  generateRefreshToken, storeRefreshToken, validateRefreshToken, revokeRefreshToken
} from '../services/auth.js';

const router = Router();

router.post('/register',
  validate({
    email: { required: true, type: 'email' },
    password: { required: true, minLength: 6 },
  }),
  async (req, res, next) => {
    try {
      const { email, password, displayName } = req.body;

      const existing = await pool.query('SELECT id FROM "user" WHERE email = $1', [email]);
      if (existing.rows.length) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const passwordHash = await hashPassword(password);
      const { rows: [user] } = await pool.query(
        'INSERT INTO "user" (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, email, is_admin',
        [email, passwordHash, displayName || null]
      );

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken();
      await storeRefreshToken(user.id, refreshToken);

      res.status(201).json({ accessToken, refreshToken });
    } catch (err) { next(err); }
  }
);

router.post('/login',
  validate({
    email: { required: true, type: 'email' },
    password: { required: true },
  }),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const { rows: [user] } = await pool.query(
        'SELECT id, email, password_hash, is_admin FROM "user" WHERE email = $1',
        [email]
      );
      if (!user || !(await verifyPassword(password, user.password_hash))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken();
      await storeRefreshToken(user.id, refreshToken);

      res.json({ accessToken, refreshToken });
    } catch (err) { next(err); }
  }
);

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });

    const record = await validateRefreshToken(refreshToken);
    if (!record) return res.status(401).json({ error: 'Invalid or expired refresh token' });

    // Rotate: revoke old, issue new
    await revokeRefreshToken(refreshToken);

    const user = { id: record.uid, email: record.email, is_admin: record.is_admin };
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken();
    await storeRefreshToken(user.id, newRefreshToken);

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) { next(err); }
});

router.post('/logout', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await revokeRefreshToken(refreshToken);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
