-- Migration 018: user-authored write_answer exercises
-- Created from email corrections ("Dodaj do nauki"). Each row is a personal
-- write_answer drill the user practises inside a theme on the Training page.

-- A catch-all theme for corrections the user didn't attach to a real theme.
-- A real row is required because theme_progress / exercise practice reference
-- theme(id) via FK; order 999 keeps it out of the normal sequence.
INSERT INTO theme (id, lang, "order", title, title_ru, description, description_ru)
VALUES ('pl_other', 'pl', 999, 'Moje ćwiczenia', 'Мои упражнения',
        'Słowa i zwroty dodane z ćwiczeń pisania', 'Слова и выражения, добавленные из письменных упражнений')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS user_write_exercise (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  theme_id VARCHAR(50) NOT NULL REFERENCES theme(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,          -- shown question (native-language translation)
  answer TEXT NOT NULL,          -- expected answer (corrected target-language phrase)
  hint TEXT,                     -- optional explanation shown after a wrong attempt
  source VARCHAR(20) NOT NULL DEFAULT 'email',
  attempt_id BIGINT REFERENCES email_attempt(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_write_exercise_user ON user_write_exercise (user_id);
CREATE INDEX IF NOT EXISTS idx_user_write_exercise_theme ON user_write_exercise (user_id, theme_id);

COMMENT ON TABLE user_write_exercise IS 'User-authored write_answer drills created from email corrections';
