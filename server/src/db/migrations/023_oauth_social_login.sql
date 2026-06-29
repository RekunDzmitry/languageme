-- Add OAuth / social login columns to user table
ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- OAuth users may not have a password; make password_hash nullable
ALTER TABLE "user"
  ALTER COLUMN password_hash DROP NOT NULL;
