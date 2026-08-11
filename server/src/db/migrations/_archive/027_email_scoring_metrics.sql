-- Migration 027: Deterministic email scoring metrics
-- Persists the per-criterion scoring signals and the metric version that
-- produced the stored score, so any attempt's score can be re-derived
-- and audited against the exact formula that was in effect at grade time.

ALTER TABLE email_attempt
  ADD COLUMN IF NOT EXISTS deterministic_signals JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS metric_version TEXT NOT NULL DEFAULT 'legacy-llm';

COMMENT ON COLUMN email_attempt.deterministic_signals IS
  'Per-criterion signals from the deterministic scorer (composition / accuracy / vocabulary / content). Populated by the new pipeline; empty for legacy rows.';

COMMENT ON COLUMN email_attempt.metric_version IS
  'Version stamp of the metric that produced the stored score. Bumped on threshold/weight changes; legacy-llm for rows graded before this migration.';

CREATE INDEX IF NOT EXISTS idx_email_attempt_metric_version
  ON email_attempt(metric_version);
