-- Drop tables that backed the now-removed user-facing AI chat helper
-- (`AIChatButton` + `/api/ai/*`). The LLM service itself stays — admin
-- sandbox and Polish email evaluation still use it — so `ai_request_log`
-- (admin observability) and the `update_updated_at()` trigger function
-- are preserved.
--
-- Order matters: triggers must be dropped BEFORE their tables. PG raises
-- "relation does not exist" on `DROP TRIGGER ... ON <missing>` even with
-- IF EXISTS, so we drop triggers first, then the tables (child → parent).
--
-- Idempotent: every DROP is guarded so re-runs are safe.

DROP TRIGGER IF EXISTS ai_conversation_updated_at ON ai_conversation;
DROP TRIGGER IF EXISTS ai_note_updated_at ON ai_note;

DROP TABLE IF EXISTS ai_message CASCADE;
DROP TABLE IF EXISTS ai_note CASCADE;
DROP TABLE IF EXISTS ai_conversation CASCADE;
