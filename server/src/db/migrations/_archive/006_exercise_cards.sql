-- Exercise cards for Polish spelling practice (SRS tracking)
CREATE TABLE IF NOT EXISTS exercise_card (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    exercise_key VARCHAR(255) NOT NULL,  -- Format: themeId:exerciseIndex (e.g., "theme01:0")
    theme_id VARCHAR(50) NOT NULL,
    ease DECIMAL(4,2) DEFAULT 2.5,
    interval_days INTEGER DEFAULT 0,
    reps INTEGER DEFAULT 0,
    due TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_reviewed TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, exercise_key)
);

CREATE INDEX IF NOT EXISTS idx_exercise_card_user ON exercise_card(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_card_due ON exercise_card(user_id, due);

COMMENT ON TABLE exercise_card IS 'SRS tracking for Polish spelling exercises';
