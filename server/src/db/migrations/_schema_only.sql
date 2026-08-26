BEGIN;

-- ===== REFERENCE SCHEMA (dropped + recreated every apply) =====

-- Drop legacy FKs from user tables into reference tables. On fresh DBs the
-- user tables don't exist yet, so the DO block no-ops. On legacy DBs the
-- constraint is dropped before the CASCADE on the reference table nukes
-- user data.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_mnemonic') THEN
    ALTER TABLE user_mnemonic DROP CONSTRAINT IF EXISTS user_mnemonic_vocab_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'theme_progress') THEN
    ALTER TABLE theme_progress DROP CONSTRAINT IF EXISTS theme_progress_theme_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_vocab') THEN
    ALTER TABLE user_vocab DROP CONSTRAINT IF EXISTS user_vocab_theme_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_write_exercise') THEN
    ALTER TABLE user_write_exercise DROP CONSTRAINT IF EXISTS user_write_exercise_theme_id_fkey;
  END IF;
END $$;

DROP TABLE IF EXISTS theme_conjugation CASCADE;
DROP TABLE IF EXISTS theme_verb CASCADE;
DROP TABLE IF EXISTS theme_section CASCADE;
DROP TABLE IF EXISTS theme_vocab CASCADE;
DROP TABLE IF EXISTS theme CASCADE;
DROP TABLE IF EXISTS vocab_lexicon CASCADE;
DROP TABLE IF EXISTS vocab_example CASCADE;
DROP TABLE IF EXISTS vocab_hint CASCADE;
DROP TABLE IF EXISTS vocab_translation CASCADE;
DROP TABLE IF EXISTS vocab CASCADE;

CREATE TABLE vocab (
  id VARCHAR(10) PRIMARY KEY,
  target VARCHAR(200) NOT NULL,
  ipa VARCHAR(200),
  gender VARCHAR(1) CHECK (gender IN ('m', 'f', 'n')),
  freq INT,
  theme VARCHAR(50),
  source VARCHAR(10) NOT NULL DEFAULT 'seed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vocab_translation (
  vocab_id VARCHAR(10) NOT NULL REFERENCES vocab(id) ON DELETE CASCADE,
  lang VARCHAR(5) NOT NULL,
  text TEXT NOT NULL,
  PRIMARY KEY (vocab_id, lang)
);

CREATE TABLE vocab_hint (
  vocab_id VARCHAR(10) NOT NULL REFERENCES vocab(id) ON DELETE CASCADE,
  lang VARCHAR(5) NOT NULL,
  text TEXT NOT NULL,
  PRIMARY KEY (vocab_id, lang)
);

CREATE TABLE vocab_example (
  vocab_id VARCHAR(10) NOT NULL REFERENCES vocab(id) ON DELETE CASCADE,
  sort_order INT NOT NULL,
  lang VARCHAR(5) NOT NULL,
  source_text TEXT NOT NULL,
  target_text TEXT NOT NULL,
  PRIMARY KEY (vocab_id, sort_order)
);

CREATE TABLE vocab_lexicon (
  vocab_id VARCHAR(10) PRIMARY KEY REFERENCES vocab(id) ON DELETE CASCADE,
  synonyms TEXT[],
  usage TEXT,
  semantics TEXT
);

CREATE TABLE theme (
  id VARCHAR(50) PRIMARY KEY,
  lang VARCHAR(5) NOT NULL DEFAULT 'fr',
  pack_id VARCHAR(50),
  "order" INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  title_ru VARCHAR(200),
  description TEXT,
  description_ru TEXT,
  unlock_theme_id VARCHAR(50),
  unlock_min_score INT DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT theme_lang_pack_order_key UNIQUE (lang, pack_id, "order")
);

CREATE TABLE theme_vocab (
  theme_id VARCHAR(50) NOT NULL REFERENCES theme(id) ON DELETE CASCADE,
  vocab_id VARCHAR(10) NOT NULL REFERENCES vocab(id) ON DELETE CASCADE,
  PRIMARY KEY (theme_id, vocab_id)
);

CREATE TABLE theme_section (
  id BIGSERIAL PRIMARY KEY,
  theme_id VARCHAR(50) NOT NULL REFERENCES theme(id) ON DELETE CASCADE,
  type VARCHAR(40) NOT NULL,
  sort_order INT DEFAULT 0,
  content JSONB NOT NULL
);

CREATE TABLE theme_verb (
  id BIGSERIAL PRIMARY KEY,
  theme_id VARCHAR(50) NOT NULL REFERENCES theme(id) ON DELETE CASCADE,
  infinitive VARCHAR(50) NOT NULL,
  ru VARCHAR(100),
  participe_passe VARCHAR(50),
  auxiliaire VARCHAR(10),
  verb_group VARCHAR(50)
);

CREATE TABLE theme_conjugation (
  theme_id VARCHAR(50) NOT NULL REFERENCES theme(id) ON DELETE CASCADE,
  infinitive VARCHAR(50) NOT NULL,
  lang VARCHAR(5) NOT NULL,
  forms TEXT[] NOT NULL,
  PRIMARY KEY (theme_id, infinitive, lang)
);


-- ===== USER SCHEMA (DDL only — created once, never dropped) =====

CREATE TABLE IF NOT EXISTS "user" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  native_lang VARCHAR(5) DEFAULT 'ru',
  target_lang VARCHAR(5) DEFAULT 'fr',
  ui_lang VARCHAR(5) DEFAULT 'ru',
  auto_play_audio BOOLEAN DEFAULT true,
  is_admin BOOLEAN DEFAULT false,
  migrated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_token (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES "user"(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS srs_card (
  user_id UUID REFERENCES "user"(id) ON DELETE CASCADE,
  vocab_id VARCHAR(50) NOT NULL,
  target_lang VARCHAR(5),
  ease REAL DEFAULT 2.5,
  interval_days INT DEFAULT 1,
  reps INT DEFAULT 0,
  due TIMESTAMPTZ DEFAULT NOW(),
  last_reviewed TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, vocab_id),
  CONSTRAINT srs_card_vocab_id_prefix_check CHECK (
    vocab_id LIKE 'fr\_%'  ESCAPE '\'
    OR vocab_id LIKE 'pl\_%'  ESCAPE '\'
    OR vocab_id LIKE 'usr\_%' ESCAPE '\'
  )
);
CREATE INDEX IF NOT EXISTS idx_srs_card_due ON srs_card (user_id, due);
CREATE INDEX IF NOT EXISTS idx_srs_card_user_target_due ON srs_card (user_id, target_lang, due);

CREATE TABLE IF NOT EXISTS theme_progress (
  user_id UUID REFERENCES "user"(id) ON DELETE CASCADE,
  theme_id VARCHAR(50) NOT NULL,
  completed BOOLEAN DEFAULT false,
  best_score INT CHECK (best_score >= 0 AND best_score <= 100),
  attempts INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, theme_id)
);

CREATE TABLE IF NOT EXISTS user_mnemonic (
  user_id UUID REFERENCES "user"(id) ON DELETE CASCADE,
  vocab_id VARCHAR(50) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, vocab_id)
);

-- Per-user vocab translation override. The application reads this and
-- writes it into the vocab.translations bag that /api/courses/all
-- serves, so the UI never has to know the override came from this
-- table rather than vocab_translation.
CREATE TABLE IF NOT EXISTS user_translation_override (
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  vocab_id VARCHAR(50) NOT NULL,
  native_lang VARCHAR(5) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, vocab_id, native_lang),
  CONSTRAINT user_translation_override_vocab_id_prefix_check CHECK (
    vocab_id LIKE 'fr\_%'  ESCAPE '\'
    OR vocab_id LIKE 'pl\_%'  ESCAPE '\'
    OR vocab_id LIKE 'usr\_%' ESCAPE '\'
  ),
  CONSTRAINT user_translation_override_native_lang_check CHECK (
    native_lang IN ('en', 'ru', 'pl', 'de', 'fr')
  )
);
CREATE INDEX IF NOT EXISTS idx_user_translation_override_user
  ON user_translation_override (user_id);

-- Per-user write-answer expected-answers override. The application
-- reads this and injects the user's answers into the exercises[]
-- the UI renders, so the WriteAnswer component grades against the
-- user override before falling back to the seed.
CREATE TABLE IF NOT EXISTS user_exercise_answer_override (
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  exercise_key VARCHAR(255) NOT NULL,
  answers TEXT[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, exercise_key)
);
CREATE INDEX IF NOT EXISTS idx_user_exercise_answer_override_user
  ON user_exercise_answer_override (user_id);

-- Per-user conjugation prompt override. See 000_bootstrap.sql for the
-- full rationale. Schema mirror kept here so fresh installs from the
-- schema-only file have the table available.
CREATE TABLE IF NOT EXISTS user_conjugation_prompt_override (
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  theme_id VARCHAR(50) NOT NULL,
  infinitive VARCHAR(50) NOT NULL,
  pronoun_idx SMALLINT NOT NULL CHECK (pronoun_idx >= 0 AND pronoun_idx <= 5),
  lang VARCHAR(5) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, theme_id, infinitive, pronoun_idx, lang),
  CONSTRAINT user_conjugation_prompt_override_theme_id_prefix_check CHECK (
    theme_id LIKE 'fr\_%'  ESCAPE '\'
    OR theme_id LIKE 'pl\_%'  ESCAPE '\'
  ),
  CONSTRAINT user_conjugation_prompt_override_lang_check CHECK (
    lang IN ('en', 'ru', 'pl', 'de', 'fr')
  )
);
CREATE INDEX IF NOT EXISTS idx_user_conjugation_prompt_override_user
  ON user_conjugation_prompt_override (user_id);

-- Per-user conjugation mnemonic override (memory hook per exercise cell).
-- Schema mirror kept here so fresh installs from the schema-only file
-- (legacy DB cutover) have the table available. See 000_bootstrap.sql
-- for the full rationale and the resolution chain the application uses.
CREATE TABLE IF NOT EXISTS user_conjugation_mnemonic (
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  theme_id VARCHAR(50) NOT NULL,
  infinitive VARCHAR(50) NOT NULL,
  pronoun_idx SMALLINT NOT NULL CHECK (pronoun_idx >= 0 AND pronoun_idx <= 5),
  lang VARCHAR(5) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, theme_id, infinitive, pronoun_idx, lang),
  CONSTRAINT user_conjugation_mnemonic_theme_id_prefix_check CHECK (
    theme_id LIKE 'fr\_%'  ESCAPE '\'
    OR theme_id LIKE 'pl\_%'  ESCAPE '\'
  ),
  CONSTRAINT user_conjugation_mnemonic_lang_check CHECK (
    lang IN ('en', 'ru', 'pl', 'de', 'fr')
  )
);
CREATE INDEX IF NOT EXISTS idx_user_conjugation_mnemonic_user
  ON user_conjugation_mnemonic (user_id);

CREATE TABLE IF NOT EXISTS review (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES "user"(id) ON DELETE CASCADE,
  vocab_id VARCHAR(50) NOT NULL,
  target_lang VARCHAR(5),
  quality SMALLINT NOT NULL CHECK (quality >= 0 AND quality <= 3),
  reviewed_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT review_vocab_id_prefix_check CHECK (
    vocab_id LIKE 'fr\_%'  ESCAPE '\'
    OR vocab_id LIKE 'pl\_%'  ESCAPE '\'
    OR vocab_id LIKE 'usr\_%' ESCAPE '\'
  )
);
CREATE INDEX IF NOT EXISTS idx_review_user_date ON review (user_id, reviewed_at DESC);

CREATE TABLE IF NOT EXISTS user_daily_stat (
  user_id UUID REFERENCES "user"(id) ON DELETE CASCADE,
  study_date DATE NOT NULL,
  reviews_count INT DEFAULT 0,
  correct_count INT DEFAULT 0,
  PRIMARY KEY (user_id, study_date)
);

CREATE TABLE IF NOT EXISTS conjugation_card (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  card_key VARCHAR(64) NOT NULL,
  ease REAL DEFAULT 2.5,
  interval_days INT DEFAULT 1,
  reps INT DEFAULT 0,
  due TIMESTAMPTZ DEFAULT NOW(),
  last_reviewed TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, card_key)
);

CREATE TABLE IF NOT EXISTS exercise_card (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  exercise_key VARCHAR(255) NOT NULL,
  ease REAL DEFAULT 2.5,
  interval_days INT DEFAULT 1,
  reps INT DEFAULT 0,
  due TIMESTAMPTZ DEFAULT NOW(),
  last_reviewed TIMESTAMPTZ,
  UNIQUE (user_id, exercise_key)
);

CREATE TABLE IF NOT EXISTS exercise_note (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  exercise_key VARCHAR(255) NOT NULL,
  theme_id VARCHAR(50),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, exercise_key)
);

CREATE TABLE IF NOT EXISTS vocab_note (
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  vocab_id VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, vocab_id)
);

CREATE TABLE IF NOT EXISTS user_vocab (
  id VARCHAR(50) PRIMARY KEY DEFAULT ('usr_' || replace(gen_random_uuid()::text, '-', ''))
    CHECK (id LIKE 'usr\_%' ESCAPE '\'),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  target_lang VARCHAR(5) NOT NULL,
  target TEXT NOT NULL,
  translation TEXT NOT NULL,
  hint TEXT,
  theme_id VARCHAR(50) NOT NULL REFERENCES theme(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (target_lang IN ('fr', 'pl'))
);
CREATE INDEX IF NOT EXISTS idx_user_vocab_user_lang ON user_vocab (user_id, target_lang);
CREATE INDEX IF NOT EXISTS idx_user_vocab_theme ON user_vocab (user_id, theme_id);
CREATE INDEX IF NOT EXISTS idx_user_vocab_updated ON user_vocab (user_id, updated_at DESC);

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
FOR EACH ROW EXECUTE FUNCTION update_user_vocab_timestamp();

CREATE TABLE IF NOT EXISTS email_attempt (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  theme_id VARCHAR(50) NOT NULL,
  exercise_idx INT NOT NULL,
  user_text TEXT NOT NULL,
  score INT,
  ai_evaluation JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_added_vocab (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  attempt_id BIGINT REFERENCES email_attempt(id) ON DELETE SET NULL,
  target_word TEXT NOT NULL,
  translation TEXT,
  hint TEXT,
  theme_id VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_write_exercise (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  theme_id VARCHAR(50) NOT NULL REFERENCES theme(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  answer TEXT NOT NULL,
  hint TEXT,
  category VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_request_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES "user"(id) ON DELETE SET NULL,
  is_sandbox BOOLEAN NOT NULL DEFAULT false,
  endpoint VARCHAR(100) NOT NULL,
  prompt_tokens INT,
  completion_tokens INT,
  latency_ms INT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_scoring_metric (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  attempt_id BIGINT REFERENCES email_attempt(id) ON DELETE CASCADE,
  metric_name VARCHAR(100) NOT NULL,
  metric_value REAL NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ===== LEGACY UP-MIGRATIONS =====

ALTER TABLE srs_card ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_srs_card_archived ON srs_card (archived_at);
ALTER TABLE srs_card ALTER COLUMN target_lang SET NOT NULL;
ALTER TABLE srs_card DROP CONSTRAINT IF EXISTS srs_card_vocab_id_prefix_check;
ALTER TABLE srs_card ADD CONSTRAINT srs_card_vocab_id_prefix_check CHECK (
  vocab_id LIKE 'fr\_%'  ESCAPE '\'
  OR vocab_id LIKE 'pl\_%'  ESCAPE '\'
  OR vocab_id LIKE 'usr\_%' ESCAPE '\'
);
ALTER TABLE review ADD COLUMN IF NOT EXISTS target_lang VARCHAR(5);
ALTER TABLE review DROP CONSTRAINT IF EXISTS review_vocab_id_prefix_check;
ALTER TABLE review ADD CONSTRAINT review_vocab_id_prefix_check CHECK (
  vocab_id LIKE 'fr\_%'  ESCAPE '\'
  OR vocab_id LIKE 'pl\_%'  ESCAPE '\'
  OR vocab_id LIKE 'usr\_%' ESCAPE '\'
);
ALTER TABLE vocab DROP CONSTRAINT IF EXISTS vocab_gender_check;
ALTER TABLE vocab ADD CONSTRAINT vocab_gender_check CHECK (gender IS NULL OR gender IN ('m', 'f', 'n'));
ALTER TABLE vocab ADD COLUMN IF NOT EXISTS source VARCHAR(10) NOT NULL DEFAULT 'seed';
ALTER TABLE theme DROP CONSTRAINT IF EXISTS theme_order_key;
ALTER TABLE theme DROP CONSTRAINT IF EXISTS theme_lang_order_key;
ALTER TABLE theme DROP CONSTRAINT IF EXISTS theme_lang_pack_order_key;
ALTER TABLE theme ADD CONSTRAINT theme_lang_pack_order_key UNIQUE (lang, pack_id, "order");
COMMIT;