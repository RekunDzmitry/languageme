-- Drop tables that backed the now-removed user-facing AI chat helper
-- (`AIChatButton` + `/api/ai/*`). The LLM service itself stays — admin
-- sandbox and Polish email evaluation still use it — so `ai_request_log`
-- (admin observability) and the `update_updated_at()` trigger function
-- are preserved.
--
-- Order matters: child tables before their parent. The FK on ai_message
-- references ai_conversation, and ai_note has no FK back to ai_conversation,
-- so dropping ai_message + ai_note first lets ai_conversation go last.
--
-- Idempotent: every DROP is guarded so re-runs are safe.

DROP TABLE IF EXISTS ai_message CASCADE;
DROP TABLE IF EXISTS ai_note CASCADE;
DROP TABLE IF EXISTS ai_conversation CASCADE;

DROP TRIGGER IF EXISTS ai_conversation_updated_at ON ai_conversation;
DROP TRIGGER IF EXISTS ai_note_updated_at ON ai_note;
