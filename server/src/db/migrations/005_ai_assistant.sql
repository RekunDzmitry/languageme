-- AI Assistant: conversations, messages, and structured notes
-- Stores AI chat history and user notes attached to exercises

CREATE TABLE IF NOT EXISTS ai_conversation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  exercise_key VARCHAR(100) NOT NULL,  -- e.g., "conj:parler:pr:aff:0"
  exercise_type VARCHAR(50) NOT NULL,  -- "conjugation", "vocab", etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_conversation_user ON ai_conversation(user_id);
CREATE INDEX idx_ai_conversation_exercise ON ai_conversation(user_id, exercise_key);

CREATE TABLE IF NOT EXISTS ai_message (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversation(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,  -- "user", "assistant", "system"
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_message_conversation ON ai_message(conversation_id);

CREATE TABLE IF NOT EXISTS ai_note (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  exercise_key VARCHAR(100) NOT NULL,
  exercise_type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  content TEXT NOT NULL,  -- JSON: { summary, examples, usage, etc. }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_note_user ON ai_note(user_id);
CREATE INDEX idx_ai_note_exercise ON ai_note(user_id, exercise_key);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_conversation_updated_at
  BEFORE UPDATE ON ai_conversation
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER ai_note_updated_at
  BEFORE UPDATE ON ai_note
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
