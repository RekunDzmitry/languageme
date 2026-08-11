-- Migration 021: Progressive email evaluation state
-- Keeps one email_attempt row while the evaluator fills intermediate steps.

ALTER TABLE email_attempt
  ADD COLUMN IF NOT EXISTS evaluation_status TEXT NOT NULL DEFAULT 'complete',
  ADD COLUMN IF NOT EXISTS evaluation_steps JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS evaluation_error TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE email_attempt
SET evaluation_status = CASE
  WHEN ai_evaluation IS NULL THEN 'complete'
  ELSE evaluation_status
END
WHERE evaluation_status IS NULL;

CREATE INDEX IF NOT EXISTS idx_email_attempt_status
  ON email_attempt(user_id, evaluation_status, updated_at DESC);
