import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from '../config.js';
import { pool } from '../db/pool.js';
import { generateAccessToken, generateRefreshToken, storeRefreshToken } from './auth.js';

/**
 * Find or create a user by Google OAuth profile.
 * Returns { user, isNew } — isNew is true for first-time OAuth login.
 * Throws if email is missing (Google OAuth must return a verified email).
 */
async function findOrCreateOAuthUser(profile) {
  const email = profile.emails?.[0]?.value || null;
  const displayName = profile.displayName || profile.username || null;
  const avatarUrl = profile.photos?.[0]?.value || null;
  const googleId = profile.id;

  if (!email) {
    throw new Error('Google account did not return an email address');
  }

  // 1. Look up by Google ID
  const byProvider = await pool.query(
    'SELECT id, email, is_admin FROM "user" WHERE google_id = $1',
    [googleId]
  );
  if (byProvider.rows.length) {
    return { user: byProvider.rows[0], isNew: false };
  }

  // 2. Look up by email and link accounts (Google verified the email)
  const byEmail = await pool.query(
    'SELECT id, email, is_admin FROM "user" WHERE email = $1',
    [email]
  );
  if (byEmail.rows.length) {
    // Link Google account to existing email account.
    // Strip password_hash so any pre-existing password is invalidated —
    // Google verified the email, so this is the legitimate owner.
    await pool.query(
      'UPDATE "user" SET google_id = $1, avatar_url = COALESCE($2, avatar_url), email_verified = true, password_hash = NULL WHERE id = $3',
      [googleId, avatarUrl, byEmail.rows[0].id]
    );
    return { user: byEmail.rows[0], isNew: false };
  }

  // 3. Create new user
  const { rows: [user] } = await pool.query(
    'INSERT INTO "user" (email, display_name, google_id, avatar_url, email_verified)
     VALUES ($1, $2, $3, $4, true)
     RETURNING id, email, is_admin',
    [email, displayName, googleId, avatarUrl]
  );
  return { user, isNew: true };
}

/**
 * Generate JWT tokens and redirect to the frontend.
 * Tokens go in the URL fragment so they never reach the server.
 *
 * @param {object}   res   Express response
 * @param {object}   user  User row { id, email, is_admin }
 * @param {string}   state Frontend route to land on after login (e.g. "/study/theme-01")
 */
async function oAuthSuccess(res, user, state) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  await storeRefreshToken(user.id, refreshToken);

  // Only accept same-site paths: single leading slash, not // or /\
  // Prevents open-redirect attacks like ?redirect=@evil.com or ?redirect=//evil.com
  const safePath = (typeof state === 'string' && /^\/(?![/\\])/.test(state)) ? state : '';
  res.redirect(
    `${config.publicUrl}${safePath}#access_token=${accessToken}&refresh_token=${refreshToken}`
  );
}

// ── Google Strategy ──────────────────────────────────────────────
if (config.googleClientId && config.googleClientSecret) {
  passport.use(new GoogleStrategy(
    {
      clientID: config.googleClientId,
      clientSecret: config.googleClientSecret,
      callbackURL: `${config.publicUrl}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { user } = await findOrCreateOAuthUser(profile);
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  ));
}

export { oAuthSuccess };
export default passport;
