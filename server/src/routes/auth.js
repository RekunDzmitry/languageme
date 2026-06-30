import { Router } from 'express';
import { pool } from '../db/pool.js';
import { config } from '../config.js';
import { validate } from '../middleware/validate.js';
import {
  hashPassword, verifyPassword, generateAccessToken,
  generateRefreshToken, storeRefreshToken, validateRefreshToken, revokeRefreshToken
} from '../services/auth.js';
import passport, { oAuthSuccess } from '../services/passport.js';

const router = Router();

router.post('/register',
  validate({
    email: { required: true, type: 'email' },
    password: { required: true, minLength: 6 },
  }),
  async (req, res, next) => {
    try {
      const { email, password, displayName } = req.body;

      const existing = await pool.query('SELECT id, google_id FROM "user" WHERE email = $1', [email]);
      if (existing.rows.length) {
        if (existing.rows[0].google_id) {
          return res.status(409).json({ error: 'Email already registered via Google. Please sign in with Google.' });
        }
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
        'SELECT id, email, password_hash, is_admin FROM "user" WHERE email = $1 AND password_hash IS NOT NULL',
        [email]
      );
      if (!user || !(await verifyPassword(password, user.password_hash))) {
        // Check if this email exists but is Google-only (no password)
        const { rows: [oauthUser] } = await pool.query(
          'SELECT id FROM "user" WHERE email = $1 AND google_id IS NOT NULL AND password_hash IS NULL',
          [email]
        );
        if (oauthUser) {
          return res.status(401).json({ error: 'This email uses Google sign-in. Please use the Google button.' });
        }
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

// ── Google OAuth ────────────────────────────────────────────────
router.get('/google', (req, res, next) => {
  // Pass optional redirect param so the frontend can specify return path
  const state = req.query.redirect || '/';
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state,
  })(req, res, next);
});

router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${config.publicUrl}/auth`,
  }),
  async (req, res, next) => {
    try {
      const state = req.query.state || '/';
      await oAuthSuccess(res, req.user, state);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
