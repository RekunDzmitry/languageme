-- Reference data tables

CREATE TABLE vocab (
  id VARCHAR(10) PRIMARY KEY,
  target VARCHAR(100) NOT NULL,
  ipa VARCHAR(100),
  gender VARCHAR(1) CHECK (gender IN ('m', 'f')),
  freq INT,
  theme VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vocab_translation (
  vocab_id VARCHAR(10) REFERENCES vocab(id) ON DELETE CASCADE,
  lang VARCHAR(5) NOT NULL,
  text TEXT NOT NULL,
  PRIMARY KEY (vocab_id, lang)
);

CREATE TABLE vocab_hint (
  vocab_id VARCHAR(10) REFERENCES vocab(id) ON DELETE CASCADE,
  lang VARCHAR(5) NOT NULL,
  text TEXT NOT NULL,
  PRIMARY KEY (vocab_id, lang)
);

CREATE TABLE theme (
  id VARCHAR(10) PRIMARY KEY,
  "order" INT UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  title_ru VARCHAR(200),
  description TEXT,
  description_ru TEXT,
  unlock_theme_id VARCHAR(10) REFERENCES theme(id),
  unlock_min_score INT DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE theme_vocab (
  theme_id VARCHAR(10) REFERENCES theme(id) ON DELETE CASCADE,
  vocab_id VARCHAR(10) REFERENCES vocab(id) ON DELETE CASCADE,
  PRIMARY KEY (theme_id, vocab_id)
);

CREATE TABLE theme_section (
  id SERIAL PRIMARY KEY,
  theme_id VARCHAR(10) REFERENCES theme(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('grammar', 'exercises', 'vocabulary', 'flashcards')),
  sort_order INT DEFAULT 0,
  content JSONB NOT NULL
);

CREATE TABLE theme_verb (
  id SERIAL PRIMARY KEY,
  theme_id VARCHAR(10) REFERENCES theme(id) ON DELETE CASCADE,
  infinitive VARCHAR(50) NOT NULL,
  ru VARCHAR(100),
  participe_passe VARCHAR(50),
  auxiliaire VARCHAR(10),
  verb_group VARCHAR(50)
);

-- User tables

CREATE TABLE "user" (
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

CREATE TABLE refresh_token (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES "user"(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN DEFAULT false
);

CREATE TABLE srs_card (
  user_id UUID REFERENCES "user"(id) ON DELETE CASCADE,
  vocab_id VARCHAR(10) REFERENCES vocab(id) ON DELETE CASCADE,
  ease REAL DEFAULT 2.5,
  interval_days INT DEFAULT 1,
  reps INT DEFAULT 0,
  due TIMESTAMPTZ DEFAULT NOW(),
  last_reviewed TIMESTAMPTZ,
  PRIMARY KEY (user_id, vocab_id)
);

CREATE INDEX idx_srs_card_due ON srs_card (user_id, due);
CREATE INDEX idx_srs_card_vocab_reps ON srs_card (vocab_id, reps);

CREATE TABLE theme_progress (
  user_id UUID REFERENCES "user"(id) ON DELETE CASCADE,
  theme_id VARCHAR(10) REFERENCES theme(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  best_score INT CHECK (best_score >= 0 AND best_score <= 100),
  attempts INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, theme_id)
);

CREATE TABLE user_mnemonic (
  user_id UUID REFERENCES "user"(id) ON DELETE CASCADE,
  vocab_id VARCHAR(10) REFERENCES vocab(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, vocab_id)
);

CREATE TABLE review (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES "user"(id) ON DELETE CASCADE,
  vocab_id VARCHAR(10) REFERENCES vocab(id) ON DELETE CASCADE,
  quality SMALLINT NOT NULL CHECK (quality >= 0 AND quality <= 3),
  reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_review_user_date ON review (user_id, reviewed_at DESC);
CREATE INDEX idx_review_vocab_quality ON review (vocab_id, quality);

CREATE TABLE user_daily_stat (
  user_id UUID REFERENCES "user"(id) ON DELETE CASCADE,
  study_date DATE NOT NULL,
  reviews_count INT DEFAULT 0,
  correct_count INT DEFAULT 0,
  PRIMARY KEY (user_id, study_date)
);
