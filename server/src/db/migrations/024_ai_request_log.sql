-- Admin observability: capture every AI call (user-facing + sandbox) for review.
-- Stores the full outbound messages array so admins can see exactly what hit the model.
-- Rows are append-only; a retention job can prune older entries if needed.

CREATE TABLE IF NOT EXISTS ai_request_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES "user"(id) ON DELETE SET NULL,
  is_sandbox BOOLEAN NOT NULL DEFAULT false,
  source VARCHAR(40) NOT NULL,                  -- 'chat' | 'sandbox'
  exercise_key VARCHAR(100),                    -- null for sandbox
  exercise_type VARCHAR(50),
  model VARCHAR(80) NOT NULL,
  provider VARCHAR(40) NOT NULL,
  system_prompt TEXT NOT NULL,
  messages JSONB NOT NULL,                      -- full [{role, content}] sent to model
  assistant_message TEXT,
  input_tokens INT,
  output_tokens INT,
  duration_ms INT,
  http_status INT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_request_log_created  ON ai_request_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_request_log_user     ON ai_request_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_request_log_sandbox  ON ai_request_log (is_sandbox, created_at DESC);

-- Bootstrap initial admin. Idempotent: only flips rows that are not already admin.
UPDATE "user"
   SET is_admin = true
 WHERE email = 'rekundzmitry@gmail.com'
   AND is_admin = false;
