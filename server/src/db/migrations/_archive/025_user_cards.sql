-- Migration 025: User-authored flashcards
-- Allows authenticated users to author their own flashcards with a target
-- word/phrase, native translation, and optional hint, filed under either a
-- real theme or a per-language catch-all theme. User cards participate in
-- the existing SRS loop exactly like seed cards.
--
-- IDENTITY SAFETY: user_vocab.id is ALWAYS prefixed with 'usr_' so it can
-- never collide with system vocab IDs (fr_xxx, pl_xxx). srs_card and review
-- are widened to VARCHAR(50) and gain a CHECK that vocab_id starts with one
-- of the three legal prefixes, plus a target_lang column that mirrors the
-- static-vocab prefix so /api/study/cards can filter by target language
-- without parsing the string.

-- 0. Pre-flight cleanup. srs_card and review both had an FK to vocab(id) on
--    vocab_id, but a few orphan rows slipped in (e.g. vocab_id='e3') before
--    the FK existed. Now that the FK is about to be dropped, scrub the
--    orphans here so the rest of the migration can rely on every row
--    having a legal fr_/pl_/usr_ prefix. These rows were broken already —
--    deleting them has no functional impact.
DELETE FROM srs_card
WHERE vocab_id !~ '^(fr_|pl_|usr_)' OR vocab_id IS NULL OR vocab_id = '';
DELETE FROM review
WHERE vocab_id !~ '^(fr_|pl_|usr_)' OR vocab_id IS NULL OR vocab_id = '';

-- 1. Widen srs_card.vocab_id and review.vocab_id to VARCHAR(50) and drop
--    their FKs to vocab(id). (The FK was on the column unconditionally; once
--    user-card IDs (usr_…) are allowed in the same column, a single FK
--    can't cover both populations, so the application layer is now the
--    referential source of truth — matches the "no FK to user_vocab" call
--    in the plan.)
ALTER TABLE srs_card DROP CONSTRAINT IF EXISTS srs_card_vocab_id_fkey;
ALTER TABLE srs_card ALTER COLUMN vocab_id TYPE VARCHAR(50);

ALTER TABLE review DROP CONSTRAINT IF EXISTS review_vocab_id_fkey;
ALTER TABLE review ALTER COLUMN vocab_id TYPE VARCHAR(50);

-- 2. Add target_lang columns. Nullable for now, backfilled, then NOT NULL.
ALTER TABLE srs_card ADD COLUMN IF NOT EXISTS target_lang VARCHAR(5);
ALTER TABLE review   ADD COLUMN IF NOT EXISTS target_lang VARCHAR(5);

CREATE INDEX IF NOT EXISTS idx_srs_card_user_target_due
  ON srs_card (user_id, target_lang, due);

-- 3. Catch-all French theme (mirrors pl_other from migration 018).
INSERT INTO theme (id, lang, "order", title, title_ru, description, description_ru)
VALUES ('fr_other', 'fr', 999, 'Mes cartes', 'Мои карточки',
        'Mots et expressions ajoutés par l''utilisateur',
        'Слова и выражения, добавленные пользователем')
ON CONFLICT (id) DO NOTHING;

-- 4. user_vocab. id format is 'usr_' + 32 hex chars (no hyphens) = 36 chars,
--    safely under the VARCHAR(50) ceiling. The CHECK constraint is the
--    load-bearing piece of the identity-safety guarantee: a future bug in
--    the application layer that tries to insert a non-usr_ id will fail
--    here, not silently collide with a system id downstream.
CREATE TABLE IF NOT EXISTS user_vocab (
  id          VARCHAR(50) PRIMARY KEY
                DEFAULT ('usr_' || replace(gen_random_uuid()::text, '-', ''))
                CHECK (id LIKE 'usr\_%' ESCAPE '\'),
  user_id     UUID        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  target_lang VARCHAR(5)  NOT NULL,
  target      TEXT        NOT NULL,
  translation TEXT        NOT NULL,
  hint        TEXT,
  theme_id    VARCHAR(50) NOT NULL REFERENCES theme(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (target_lang IN ('fr', 'pl'))
);

CREATE INDEX IF NOT EXISTS idx_user_vocab_user_lang
  ON user_vocab (user_id, target_lang);
CREATE INDEX IF NOT EXISTS idx_user_vocab_theme
  ON user_vocab (user_id, theme_id);
CREATE INDEX IF NOT EXISTS idx_user_vocab_updated
  ON user_vocab (user_id, updated_at DESC);

-- 5. updated_at trigger (same shape as vocab_note_updated_at in 010).
CREATE OR REPLACE FUNCTION update_user_vocab_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_vocab_updated_at ON user_vocab;
CREATE TRIGGER user_vocab_updated_at
  BEFORE UPDATE ON user_vocab
  FOR EACH ROW
  EXECUTE FUNCTION update_user_vocab_timestamp();

-- 6. Backfill srs_card.target_lang. System cards derive from the fr_/pl_
--    prefix; user cards join against user_vocab. Order matters: the
--    user_vocab join only works after step 4 created that table.
UPDATE srs_card
SET target_lang = SUBSTRING(vocab_id FROM 1 FOR 2)
WHERE target_lang IS NULL
  AND (vocab_id LIKE 'fr\_%' ESCAPE '\' OR vocab_id LIKE 'pl\_%' ESCAPE '\');

UPDATE srs_card sc
SET target_lang = uv.target_lang
FROM user_vocab uv
WHERE sc.vocab_id = uv.id AND sc.target_lang IS NULL;

ALTER TABLE srs_card ALTER COLUMN target_lang SET NOT NULL;

-- 7. Backfill review.target_lang the same way. review rows are historical
--    so the backfill is best-effort; we don't force NOT NULL because old
--    rows for vocab_ids that have been deleted will stay NULL.
UPDATE review
SET target_lang = SUBSTRING(vocab_id FROM 1 FOR 2)
WHERE target_lang IS NULL
  AND (vocab_id LIKE 'fr\_%' ESCAPE '\' OR vocab_id LIKE 'pl\_%' ESCAPE '\');

UPDATE review r
SET target_lang = uv.target_lang
FROM user_vocab uv
WHERE r.vocab_id = uv.id AND r.target_lang IS NULL;

-- 8. Prefix CHECK on srs_card and review. Belt and suspenders alongside the
--    user_vocab.id CHECK: even if a future migration accidentally inserts
--    a stray row, the prefix check fails the row out at COMMIT time.
ALTER TABLE srs_card
  ADD CONSTRAINT srs_card_vocab_id_prefix_check CHECK (
    vocab_id LIKE 'fr\_%'  ESCAPE '\'
    OR vocab_id LIKE 'pl\_%'  ESCAPE '\'
    OR vocab_id LIKE 'usr\_%' ESCAPE '\'
  );

ALTER TABLE review
  ADD CONSTRAINT review_vocab_id_prefix_check CHECK (
    vocab_id LIKE 'fr\_%'  ESCAPE '\'
    OR vocab_id LIKE 'pl\_%'  ESCAPE '\'
    OR vocab_id LIKE 'usr\_%' ESCAPE '\'
  );

COMMENT ON TABLE user_vocab IS 'User-authored flashcards; id always starts with usr_ so it cannot collide with seed vocab (fr_/pl_)';
