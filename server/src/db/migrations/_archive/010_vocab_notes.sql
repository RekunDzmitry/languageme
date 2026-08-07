-- User-authored notes attached to individual vocabulary words

CREATE TABLE IF NOT EXISTS vocab_note (
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  vocab_id VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, vocab_id)
);

CREATE INDEX IF NOT EXISTS idx_vocab_note_user ON vocab_note(user_id);
CREATE INDEX IF NOT EXISTS idx_vocab_note_vocab ON vocab_note(vocab_id);

COMMENT ON TABLE vocab_note IS 'User-authored notes attached to individual vocabulary words';

CREATE OR REPLACE FUNCTION update_vocab_note_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vocab_note_updated_at ON vocab_note;
CREATE TRIGGER vocab_note_updated_at
  BEFORE UPDATE ON vocab_note
  FOR EACH ROW
  EXECUTE FUNCTION update_vocab_note_timestamp();