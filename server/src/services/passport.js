import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from '../config.js';
import { pool } from '../db/pool.js';
import { generateAccessToken, generateRefreshToken, storeRefreshToken } from './auth.js';

/**
 * Find or create a user by Google OAuth profile.
 * Returns { user, isNew } — isNew is true for first-time OAuth login.
 */
async function findOrCreateOAuthUser(profile) {
  const email = profile.emails?.[0]?.value || null;
  const displayName = profile.displayName || profile.username || null;
  const avatarUrl = profile.photos?.[0]?.value || null;
  const googleId = profile.id;

  // 1. Look up by Google ID
  const byProvider = await pool.query(
    'SELECT id, email, is_admin FROM "user" WHERE google_id = $1',
    [googleId]
  );
  if (byProvider.rows.length) {
    return { user: byProvider.rows[0], isNew: false };
  }

  // 2. Look up by email (link accounts)
  if (email) {
    const byEmail = await pool.query(
      'SELECT id, email, is_admin FROM "user" WHERE email = $1',
      [email]
    );
    if (byEmail.rows.length) {
      // Link Google account to existing email account
      await pool.query(
        'UPDATE "user" SET google_id = $1, avatar_url = COALESCE($2, avatar_url), email_verified = true WHERE id = $3',
        [googleId, avatarUrl, byEmail.rows[0].id]
      );
      return { user: byEmail.rows[0], isNew: false };
    }
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
 * Build JWT tokens + redirect URL for successful OAuth login.
 */
function oAuthSuccess(res, user) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  storeRefreshToken(user.id, refreshToken);

  // Redirect to frontend with tokens in URL fragment (never sent to server)
  const frontendUrl = config.publicUrl;
  res.redirect(
    `${frontendUrl}/#access_token=${accessToken}&refresh_token=${refreshToken}`
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
