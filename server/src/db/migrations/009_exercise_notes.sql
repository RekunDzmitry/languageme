-- User-authored notes for individual exercises (e.g. Polish orthography WriteAnswer)
CREATE TABLE IF NOT EXISTS exercise_note (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  exercise_key VARCHAR(255) NOT NULL,  -- Same format as SRS: "themeId:exerciseIndex"
  theme_id VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, exercise_key)
);

CREATE INDEX IF NOT EXISTS idx_exercise_note_user ON exercise_note(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_note_theme ON exercise_note(user_id, theme_id);

COMMENT ON TABLE exercise_note IS 'User-authored notes attached to individual exercises';

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS exercise_note_updated_at ON exercise_note;
CREATE TRIGGER exercise_note_updated_at
  BEFORE UPDATE ON exercise_note
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
