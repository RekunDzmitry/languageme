import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config.js';
import { pool } from '../db/pool.js';

const SALT_ROUNDS = 10;

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, isAdmin: user.is_admin },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

export function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function storeRefreshToken(userId, token) {
  const hash = hashToken(token);
  const expiresAt = new Date(Date.now() + config.refreshExpiresInDays * 86400000);
  await pool.query(
    'INSERT INTO refresh_token (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, hash, expiresAt]
  );
}

export async function validateRefreshToken(token) {
  const hash = hashToken(token);
  const { rows } = await pool.query(
    'SELECT rt.*, u.id as uid, u.email, u.is_admin FROM refresh_token rt JOIN "user" u ON u.id = rt.user_id WHERE rt.token_hash = $1 AND rt.revoked = false AND rt.expires_at > NOW()',
    [hash]
  );
  return rows[0] || null;
}

export async function revokeRefreshToken(token) {
  const hash = hashToken(token);
  await pool.query('UPDATE refresh_token SET revoked = true WHERE token_hash = $1', [hash]);
}
