-- Migration 004: Add conjugation_card table for theme-scoped verb conjugation progress
BEGIN;

CREATE TABLE IF NOT EXISTS conjugation_card (
    id            BIGSERIAL PRIMARY KEY,
    user_id       UUID        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    card_key      VARCHAR(64) NOT NULL,  -- e.g. 'conj:parler:pr:aff:0'
    ease          REAL        NOT NULL DEFAULT 2.5,
    interval_days INTEGER     NOT NULL DEFAULT 1,
    reps          INTEGER     NOT NULL DEFAULT 0,
    due           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_reviewed TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, card_key)
);

CREATE INDEX IF NOT EXISTS idx_conjugation_card_user_due
    ON conjugation_card (user_id, due);
CREATE INDEX IF NOT EXISTS idx_conjugation_card_key
    ON conjugation_card (card_key);

COMMIT;

-- Record migration
INSERT INTO _migrations (name) VALUES ('004_conjugation_cards')
ON CONFLICT DO NOTHING;
