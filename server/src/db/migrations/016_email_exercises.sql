-- Migration 016: Email writing exercises
-- Tracks email writing attempts and vocabulary proposals

CREATE TABLE IF NOT EXISTS email_attempt (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  theme_id VARCHAR(50) NOT NULL,
  exercise_idx INTEGER NOT NULL,
  user_text TEXT NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  ai_evaluation JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_attempt_user ON email_attempt(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_attempt_theme ON email_attempt(theme_id, exercise_idx);

CREATE TABLE IF NOT EXISTS email_added_vocab (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  attempt_id BIGINT REFERENCES email_attempt(id) ON DELETE SET NULL,
  target_word TEXT NOT NULL,
  translation TEXT NOT NULL,
  target_lang VARCHAR(5) NOT NULL DEFAULT 'pl',
  added_to_srs BOOLEAN DEFAULT FALSE,
  vocab_id VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_added_vocab_user ON email_added_vocab(user_id, created_at DESC);
