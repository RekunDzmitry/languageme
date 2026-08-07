// scripts/_legacy/generate-bootstrap.mjs
//
// One-shot generator that reads the legacy JS course data and emits
// server/src/db/migrations/000_bootstrap.sql plus split _schema_only.sql /
// _data_only.sql files used by the migration runner for legacy cutover.
// Run once during the cutover; after the bootstrap is verified correct,
// the script is deleted.
//
// Usage: node scripts/_legacy/generate-bootstrap.mjs
import { writeFileSync } from 'fs'
import { VOCAB as FR_VOCAB } from '../../src/data/courses/fr/vocab.js'
import { VOCAB as PL_VOCAB } from '../../src/data/courses/pl/vocab.js'
import { hints as RU_HINTS } from '../../src/data/courses/fr/hints/ru.js'
import { hints as PL_HINTS } from '../../src/data/courses/fr/hints/pl.js'
import { LEXICON } from '../../src/data/courses/fr/lexicon.js'
import { EXAMPLES } from '../../src/data/courses/fr/examples.js'
import { THEMES as FR_THEMES } from '../../src/data/courses/fr/index.js'
import { THEMES as PL_THEMES } from '../../src/data/courses/pl/index.js'
import { THEME01_RU_CONJUGATIONS } from '../../src/data/courses/fr/themes/theme01-conjugations-ru.js'
import { THEME02_RU_CONJUGATIONS } from '../../src/data/courses/fr/themes/theme02-conjugations-ru.js'

function sqlString(s) {
  if (s === null || s === undefined) return 'NULL'
  return `'${String(s).replace(/'/g, "''")}'`
}

function sqlIntOrNull(n) {
  if (n === null || n === undefined) return 'NULL'
  return String(n)
}

function sqlTextArray(arr) {
  if (!arr || arr.length === 0) return "'{}'"
  const escaped = arr.map(s => `"${String(s).replace(/"/g, '\\"')}"`).join(',')
  return `'{${escaped}}'`
}

function sqlJson(obj) {
  return `${sqlString(JSON.stringify(obj))}::jsonb`
}

const allVocab = [...FR_VOCAB, ...PL_VOCAB]

const PACK_DEFS = {
  'fr-foundations': { lang: 'fr', themes: [
    'fr_theme01','fr_theme02','fr_theme03','fr_theme04','fr_theme05','fr_theme06',
    'fr_theme07','fr_theme08','fr_theme09','fr_theme10','fr_theme11','fr_theme12',
    'fr_theme13','fr_theme14','fr_theme15','fr_theme16','fr_theme17','fr_theme18',
    'fr_theme19','fr_theme20','fr_theme21','fr_theme22','fr_theme23','fr_theme24',
    'fr_theme25','fr_theme26','fr_theme27','fr_theme28','fr_theme29','fr_theme30','fr_theme31'
  ]},
  'pl-telc': { lang: 'pl', themes: [
    'pl_theme01','pl_theme02','pl_theme03','pl_theme04','pl_theme05','pl_theme06',
    'pl_theme07','pl_theme08','pl_theme09','pl_theme10','pl_theme11','pl_theme12',
    'pl_theme13','pl_theme14','pl_theme15','pl_theme16','pl_theme17','pl_theme18',
    'pl_theme19','pl_theme22'
  ]},
  'pl-a1-a2': { lang: 'pl', themes: ['pl_theme20','pl_theme21']},
}

const themePackOrder = new Map()
for (const [packId, def] of Object.entries(PACK_DEFS)) {
  def.themes.forEach((tid, idx) => {
    themePackOrder.set(tid, { packId, lang: def.lang, order: idx + 1 })
  })
}

const LEGACY_THEME_ROWS = [
  { id: 'fr_other',          lang: 'fr', packId: null,        order: 999, title: 'Mes cartes',                  titleRu: 'Мои карточки',
    description: "Mots et expressions ajoutés par l'utilisateur",        descriptionRu: 'Слова и выражения, добавленные пользователем' },
  { id: 'pl_other',          lang: 'pl', packId: null,        order: 999, title: 'Moje fiszki',                 titleRu: 'Мои карточки',
    description: 'Słowa i zwroty dodane przez użytkownika',              descriptionRu: 'Слова и выражения, добавленные пользователем' },
  { id: 'fr-foundations_other', lang: 'fr', packId: 'fr-foundations', order: 990, title: 'Mes cartes (Fondations)', titleRu: 'Мои карточки (Основы)',
    description: "Mots et expressions ajoutés par l'utilisateur — pack Fondations", descriptionRu: 'Слова и выражения, добавленные пользователем — пакет Основы' },
  { id: 'pl-a1-a2_other',    lang: 'pl', packId: 'pl-a1-a2',  order: 991, title: 'Moje fiszki (A1/A2)',         titleRu: 'Мои карточки (A1/A2)',
    description: 'Słowa i zwroty dodane przez użytkownika — pakiet A1/A2', descriptionRu: 'Карточки, добавленные пользователем — пакет A1/A2' },
  { id: 'pl-telc_other',     lang: 'pl', packId: 'pl-telc',   order: 992, title: 'Moje fiszki (TELC)',          titleRu: 'Мои карточки (TELC)',
    description: 'Słowa i zwroty dodane przez użytkownika — pakiet TELC', descriptionRu: 'Карточки, добавленные пользователем — пакет TELC' },
]

const schemaLines = []
const dataLines = []
const sw = (s) => schemaLines.push(s)
const dw = (s) => dataLines.push(s)

// ===========================================================================
// SCHEMA SECTION
// ===========================================================================
sw(`BEGIN;`)
sw(``)
sw(`-- ===== REFERENCE SCHEMA (dropped + recreated every apply) =====`)
sw(``)

sw(`-- Drop legacy FKs from user tables into reference tables. On fresh DBs the`)
sw(`-- user tables don't exist yet, so the DO block no-ops. On legacy DBs the`)
sw(`-- constraint is dropped before the CASCADE on the reference table nukes`)
sw(`-- user data.`)
sw(`DO $$ BEGIN`)
sw(`  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_mnemonic') THEN`)
sw(`    ALTER TABLE user_mnemonic DROP CONSTRAINT IF EXISTS user_mnemonic_vocab_id_fkey;`)
sw(`  END IF;`)
sw(`  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'theme_progress') THEN`)
sw(`    ALTER TABLE theme_progress DROP CONSTRAINT IF EXISTS theme_progress_theme_id_fkey;`)
sw(`  END IF;`)
sw(`  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_vocab') THEN`)
sw(`    ALTER TABLE user_vocab DROP CONSTRAINT IF EXISTS user_vocab_theme_id_fkey;`)
sw(`  END IF;`)
sw(`  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_write_exercise') THEN`)
sw(`    ALTER TABLE user_write_exercise DROP CONSTRAINT IF EXISTS user_write_exercise_theme_id_fkey;`)
sw(`  END IF;`)
sw(`END $$;`)
sw(``)

sw(`DROP TABLE IF EXISTS theme_conjugation CASCADE;`)
sw(`DROP TABLE IF EXISTS theme_verb CASCADE;`)
sw(`DROP TABLE IF EXISTS theme_section CASCADE;`)
sw(`DROP TABLE IF EXISTS theme_vocab CASCADE;`)
sw(`DROP TABLE IF EXISTS theme CASCADE;`)
sw(`DROP TABLE IF EXISTS vocab_lexicon CASCADE;`)
sw(`DROP TABLE IF EXISTS vocab_example CASCADE;`)
sw(`DROP TABLE IF EXISTS vocab_hint CASCADE;`)
sw(`DROP TABLE IF EXISTS vocab_translation CASCADE;`)
sw(`DROP TABLE IF EXISTS vocab CASCADE;`)
sw(``)

sw(`CREATE TABLE vocab (`)
sw(`  id VARCHAR(10) PRIMARY KEY,`)
sw(`  target VARCHAR(200) NOT NULL,`)
sw(`  ipa VARCHAR(200),`)
sw(`  gender VARCHAR(1) CHECK (gender IN ('m', 'f', 'n')),`)
sw(`  freq INT,`)
sw(`  theme VARCHAR(50),`)
sw(`  source VARCHAR(10) NOT NULL DEFAULT 'seed',`)
sw(`  created_at TIMESTAMPTZ DEFAULT NOW(),`)
sw(`  updated_at TIMESTAMPTZ DEFAULT NOW()`)
sw(`);`)
sw(``)

sw(`CREATE TABLE vocab_translation (`)
sw(`  vocab_id VARCHAR(10) NOT NULL REFERENCES vocab(id) ON DELETE CASCADE,`)
sw(`  lang VARCHAR(5) NOT NULL,`)
sw(`  text TEXT NOT NULL,`)
sw(`  PRIMARY KEY (vocab_id, lang)`)
sw(`);`)
sw(``)

sw(`CREATE TABLE vocab_hint (`)
sw(`  vocab_id VARCHAR(10) NOT NULL REFERENCES vocab(id) ON DELETE CASCADE,`)
sw(`  lang VARCHAR(5) NOT NULL,`)
sw(`  text TEXT NOT NULL,`)
sw(`  PRIMARY KEY (vocab_id, lang)`)
sw(`);`)
sw(``)

sw(`CREATE TABLE vocab_example (`)
sw(`  vocab_id VARCHAR(10) NOT NULL REFERENCES vocab(id) ON DELETE CASCADE,`)
sw(`  sort_order INT NOT NULL,`)
sw(`  lang VARCHAR(5) NOT NULL,`)
sw(`  source_text TEXT NOT NULL,`)
sw(`  target_text TEXT NOT NULL,`)
sw(`  PRIMARY KEY (vocab_id, sort_order)`)
sw(`);`)
sw(``)

sw(`CREATE TABLE vocab_lexicon (`)
sw(`  vocab_id VARCHAR(10) PRIMARY KEY REFERENCES vocab(id) ON DELETE CASCADE,`)
sw(`  synonyms TEXT[],`)
sw(`  usage TEXT,`)
sw(`  semantics TEXT`)
sw(`);`)
sw(``)

sw(`CREATE TABLE theme (`)
sw(`  id VARCHAR(50) PRIMARY KEY,`)
sw(`  lang VARCHAR(5) NOT NULL DEFAULT 'fr',`)
sw(`  pack_id VARCHAR(50),`)
sw(`  "order" INT NOT NULL,`)
sw(`  title VARCHAR(200) NOT NULL,`)
sw(`  title_ru VARCHAR(200),`)
sw(`  description TEXT,`)
sw(`  description_ru TEXT,`)
sw(`  unlock_theme_id VARCHAR(50),`)
sw(`  unlock_min_score INT DEFAULT 60,`)
sw(`  created_at TIMESTAMPTZ DEFAULT NOW(),`)
sw(`  updated_at TIMESTAMPTZ DEFAULT NOW(),`)
sw(`  CONSTRAINT theme_lang_pack_order_key UNIQUE (lang, pack_id, "order")`)
sw(`);`)
sw(``)

sw(`CREATE TABLE theme_vocab (`)
sw(`  theme_id VARCHAR(50) NOT NULL REFERENCES theme(id) ON DELETE CASCADE,`)
sw(`  vocab_id VARCHAR(10) NOT NULL REFERENCES vocab(id) ON DELETE CASCADE,`)
sw(`  PRIMARY KEY (theme_id, vocab_id)`)
sw(`);`)
sw(``)

sw(`CREATE TABLE theme_section (`)
sw(`  id BIGSERIAL PRIMARY KEY,`)
sw(`  theme_id VARCHAR(50) NOT NULL REFERENCES theme(id) ON DELETE CASCADE,`)
sw(`  type VARCHAR(40) NOT NULL,`)
sw(`  sort_order INT DEFAULT 0,`)
sw(`  content JSONB NOT NULL`)
sw(`);`)
sw(``)

sw(`CREATE TABLE theme_verb (`)
sw(`  id BIGSERIAL PRIMARY KEY,`)
sw(`  theme_id VARCHAR(50) NOT NULL REFERENCES theme(id) ON DELETE CASCADE,`)
sw(`  infinitive VARCHAR(50) NOT NULL,`)
sw(`  ru VARCHAR(100),`)
sw(`  participe_passe VARCHAR(50),`)
sw(`  auxiliaire VARCHAR(10),`)
sw(`  verb_group VARCHAR(50)`)
sw(`);`)
sw(``)

sw(`CREATE TABLE theme_conjugation (`)
sw(`  theme_id VARCHAR(50) NOT NULL REFERENCES theme(id) ON DELETE CASCADE,`)
sw(`  infinitive VARCHAR(50) NOT NULL,`)
sw(`  lang VARCHAR(5) NOT NULL,`)
sw(`  forms TEXT[] NOT NULL,`)
sw(`  PRIMARY KEY (theme_id, infinitive, lang)`)
sw(`);`)
sw(``)

sw(``)
sw(`-- ===== USER SCHEMA (DDL only — created once, never dropped) =====`)
sw(``)
sw(`CREATE TABLE IF NOT EXISTS "user" (`)
sw(`  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),`)
sw(`  email VARCHAR(255) UNIQUE NOT NULL,`)
sw(`  password_hash VARCHAR(255) NOT NULL,`)
sw(`  display_name VARCHAR(100),`)
sw(`  native_lang VARCHAR(5) DEFAULT 'ru',`)
sw(`  target_lang VARCHAR(5) DEFAULT 'fr',`)
sw(`  ui_lang VARCHAR(5) DEFAULT 'ru',`)
sw(`  auto_play_audio BOOLEAN DEFAULT true,`)
sw(`  is_admin BOOLEAN DEFAULT false,`)
sw(`  migrated_at TIMESTAMPTZ,`)
sw(`  created_at TIMESTAMPTZ DEFAULT NOW(),`)
sw(`  updated_at TIMESTAMPTZ DEFAULT NOW()`)
sw(`);`)
sw(``)

sw(`CREATE TABLE IF NOT EXISTS refresh_token (`)
sw(`  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),`)
sw(`  user_id UUID REFERENCES "user"(id) ON DELETE CASCADE,`)
sw(`  token_hash VARCHAR(255) UNIQUE NOT NULL,`)
sw(`  expires_at TIMESTAMPTZ NOT NULL,`)
sw(`  revoked BOOLEAN DEFAULT false`)
sw(`);`)
sw(``)

sw(`CREATE TABLE IF NOT EXISTS srs_card (`)
sw(`  user_id UUID REFERENCES "user"(id) ON DELETE CASCADE,`)
sw(`  vocab_id VARCHAR(50) NOT NULL,`)
sw(`  target_lang VARCHAR(5),`)
sw(`  ease REAL DEFAULT 2.5,`)
sw(`  interval_days INT DEFAULT 1,`)
sw(`  reps INT DEFAULT 0,`)
sw(`  due TIMESTAMPTZ DEFAULT NOW(),`)
sw(`  last_reviewed TIMESTAMPTZ,`)
sw(`  archived_at TIMESTAMPTZ,`)
sw(`  PRIMARY KEY (user_id, vocab_id),`)
sw(`  CONSTRAINT srs_card_vocab_id_prefix_check CHECK (`)
sw(`    vocab_id LIKE 'fr\\_%'  ESCAPE '\\'`)
sw(`    OR vocab_id LIKE 'pl\\_%'  ESCAPE '\\'`)
sw(`    OR vocab_id LIKE 'usr\\_%' ESCAPE '\\'`)
sw(`  )`)
sw(`);`)
sw(`CREATE INDEX IF NOT EXISTS idx_srs_card_due ON srs_card (user_id, due);`)
sw(`CREATE INDEX IF NOT EXISTS idx_srs_card_user_target_due ON srs_card (user_id, target_lang, due);`)
sw(``)

sw(`CREATE TABLE IF NOT EXISTS theme_progress (`)
sw(`  user_id UUID REFERENCES "user"(id) ON DELETE CASCADE,`)
sw(`  theme_id VARCHAR(50) NOT NULL,`)
sw(`  completed BOOLEAN DEFAULT false,`)
sw(`  best_score INT CHECK (best_score >= 0 AND best_score <= 100),`)
sw(`  attempts INT DEFAULT 0,`)
sw(`  updated_at TIMESTAMPTZ DEFAULT NOW(),`)
sw(`  PRIMARY KEY (user_id, theme_id)`)
sw(`);`)
sw(``)

sw(`CREATE TABLE IF NOT EXISTS user_mnemonic (`)
sw(`  user_id UUID REFERENCES "user"(id) ON DELETE CASCADE,`)
sw(`  vocab_id VARCHAR(50) NOT NULL,`)
sw(`  text TEXT NOT NULL,`)
sw(`  created_at TIMESTAMPTZ DEFAULT NOW(),`)
sw(`  updated_at TIMESTAMPTZ DEFAULT NOW(),`)
sw(`  PRIMARY KEY (user_id, vocab_id)`)
sw(`);`)
sw(``)

sw(`CREATE TABLE IF NOT EXISTS review (`)
sw(`  id BIGSERIAL PRIMARY KEY,`)
sw(`  user_id UUID REFERENCES "user"(id) ON DELETE CASCADE,`)
sw(`  vocab_id VARCHAR(50) NOT NULL,`)
sw(`  target_lang VARCHAR(5),`)
sw(`  quality SMALLINT NOT NULL CHECK (quality >= 0 AND quality <= 3),`)
sw(`  reviewed_at TIMESTAMPTZ DEFAULT NOW(),`)
sw(`  CONSTRAINT review_vocab_id_prefix_check CHECK (`)
sw(`    vocab_id LIKE 'fr\\_%'  ESCAPE '\\'`)
sw(`    OR vocab_id LIKE 'pl\\_%'  ESCAPE '\\'`)
sw(`    OR vocab_id LIKE 'usr\\_%' ESCAPE '\\'`)
sw(`  )`)
sw(`);`)
sw(`CREATE INDEX IF NOT EXISTS idx_review_user_date ON review (user_id, reviewed_at DESC);`)
sw(``)

sw(`CREATE TABLE IF NOT EXISTS user_daily_stat (`)
sw(`  user_id UUID REFERENCES "user"(id) ON DELETE CASCADE,`)
sw(`  study_date DATE NOT NULL,`)
sw(`  reviews_count INT DEFAULT 0,`)
sw(`  correct_count INT DEFAULT 0,`)
sw(`  PRIMARY KEY (user_id, study_date)`)
sw(`);`)
sw(``)

sw(`CREATE TABLE IF NOT EXISTS conjugation_card (`)
sw(`  id BIGSERIAL PRIMARY KEY,`)
sw(`  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,`)
sw(`  card_key VARCHAR(64) NOT NULL,`)
sw(`  ease REAL DEFAULT 2.5,`)
sw(`  interval_days INT DEFAULT 1,`)
sw(`  last_reviewed TIMESTAMPTZ,`)
sw(`  UNIQUE (user_id, card_key)`)
sw(`);`)
sw(``)

sw(`CREATE TABLE IF NOT EXISTS exercise_card (`)
sw(`  id BIGSERIAL PRIMARY KEY,`)
sw(`  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,`)
sw(`  exercise_key VARCHAR(255) NOT NULL,`)
sw(`  ease REAL DEFAULT 2.5,`)
sw(`  interval_days INT DEFAULT 1,`)
sw(`  reps INT DEFAULT 0,`)
sw(`  due TIMESTAMPTZ DEFAULT NOW(),`)
sw(`  last_reviewed TIMESTAMPTZ,`)
sw(`  UNIQUE (user_id, exercise_key)`)
sw(`);`)
sw(``)

sw(`CREATE TABLE IF NOT EXISTS exercise_note (`)
sw(`  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),`)
sw(`  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,`)
sw(`  exercise_key VARCHAR(255) NOT NULL,`)
sw(`  theme_id VARCHAR(50),`)
sw(`  content TEXT NOT NULL,`)
sw(`  created_at TIMESTAMPTZ DEFAULT NOW(),`)
sw(`  updated_at TIMESTAMPTZ DEFAULT NOW(),`)
sw(`  UNIQUE (user_id, exercise_key)`)
sw(`);`)
sw(``)

sw(`CREATE TABLE IF NOT EXISTS vocab_note (`)
sw(`  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,`)
sw(`  vocab_id VARCHAR(50) NOT NULL,`)
sw(`  content TEXT NOT NULL,`)
sw(`  created_at TIMESTAMPTZ DEFAULT NOW(),`)
sw(`  updated_at TIMESTAMPTZ DEFAULT NOW(),`)
sw(`  PRIMARY KEY (user_id, vocab_id)`)
sw(`);`)
sw(``)

sw(`CREATE TABLE IF NOT EXISTS user_vocab (`)
sw(`  id VARCHAR(50) PRIMARY KEY DEFAULT ('usr_' || replace(gen_random_uuid()::text, '-', ''))`)
sw(`    CHECK (id LIKE 'usr\\_%' ESCAPE '\\'),`)
sw(`  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,`)
sw(`  target_lang VARCHAR(5) NOT NULL,`)
sw(`  target TEXT NOT NULL,`)
sw(`  translation TEXT NOT NULL,`)
sw(`  hint TEXT,`)
sw(`  theme_id VARCHAR(50) NOT NULL REFERENCES theme(id) ON DELETE CASCADE,`)
sw(`  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),`)
sw(`  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),`)
sw(`  CHECK (target_lang IN ('fr', 'pl'))`)
sw(`);`)
sw(`CREATE INDEX IF NOT EXISTS idx_user_vocab_user_lang ON user_vocab (user_id, target_lang);`)
sw(`CREATE INDEX IF NOT EXISTS idx_user_vocab_theme ON user_vocab (user_id, theme_id);`)
sw(`CREATE INDEX IF NOT EXISTS idx_user_vocab_updated ON user_vocab (user_id, updated_at DESC);`)
sw(``)

sw(`CREATE OR REPLACE FUNCTION update_user_vocab_timestamp()`)
sw(`RETURNS TRIGGER AS $$`)
sw(`BEGIN`)
sw(`  NEW.updated_at = NOW();`)
sw(`  RETURN NEW;`)
sw(`END;`)
sw(`$$ LANGUAGE plpgsql;`)
sw(``)

sw(`DROP TRIGGER IF EXISTS user_vocab_updated_at ON user_vocab;`)
sw(`CREATE TRIGGER user_vocab_updated_at`)
sw(`BEFORE UPDATE ON user_vocab`)
sw(`FOR EACH ROW EXECUTE FUNCTION update_user_vocab_timestamp();`)
sw(``)

sw(`CREATE TABLE IF NOT EXISTS email_attempt (`)
sw(`  id BIGSERIAL PRIMARY KEY,`)
sw(`  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,`)
sw(`  theme_id VARCHAR(50) NOT NULL,`)
sw(`  exercise_idx INT NOT NULL,`)
sw(`  user_text TEXT NOT NULL,`)
sw(`  score INT,`)
sw(`  ai_evaluation JSONB,`)
sw(`  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`)
sw(`);`)
sw(``)

sw(`CREATE TABLE IF NOT EXISTS email_added_vocab (`)
sw(`  id BIGSERIAL PRIMARY KEY,`)
sw(`  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,`)
sw(`  attempt_id BIGINT REFERENCES email_attempt(id) ON DELETE SET NULL,`)
sw(`  target_word TEXT NOT NULL,`)
sw(`  translation TEXT,`)
sw(`  hint TEXT,`)
sw(`  theme_id VARCHAR(50),`)
sw(`  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`)
sw(`);`)
sw(``)

sw(`CREATE TABLE IF NOT EXISTS user_write_exercise (`)
sw(`  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),`)
sw(`  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,`)
sw(`  theme_id VARCHAR(50) NOT NULL REFERENCES theme(id) ON DELETE CASCADE,`)
sw(`  prompt TEXT NOT NULL,`)
sw(`  answer TEXT NOT NULL,`)
sw(`  hint TEXT,`)
sw(`  category VARCHAR(100),`)
sw(`  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`)
sw(`);`)
sw(``)

sw(`CREATE TABLE IF NOT EXISTS ai_request_log (`)
sw(`  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),`)
sw(`  user_id UUID REFERENCES "user"(id) ON DELETE SET NULL,`)
sw(`  is_sandbox BOOLEAN NOT NULL DEFAULT false,`)
sw(`  endpoint VARCHAR(100) NOT NULL,`)
sw(`  prompt_tokens INT,`)
sw(`  completion_tokens INT,`)
sw(`  latency_ms INT,`)
sw(`  error TEXT,`)
sw(`  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`)
sw(`);`)
sw(``)

sw(`CREATE TABLE IF NOT EXISTS email_scoring_metric (`)
sw(`  id BIGSERIAL PRIMARY KEY,`)
sw(`  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,`)
sw(`  attempt_id BIGINT REFERENCES email_attempt(id) ON DELETE CASCADE,`)
sw(`  metric_name VARCHAR(100) NOT NULL,`)
sw(`  metric_value REAL NOT NULL,`)
sw(`  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`)
sw(`);`)
sw(``)

sw(``)
sw(`-- ===== LEGACY UP-MIGRATIONS =====`)
sw(``)
sw(`ALTER TABLE srs_card ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;`)
sw(`CREATE INDEX IF NOT EXISTS idx_srs_card_archived ON srs_card (archived_at);`)
sw(`ALTER TABLE srs_card ALTER COLUMN target_lang SET NOT NULL;`)
sw(`ALTER TABLE srs_card DROP CONSTRAINT IF EXISTS srs_card_vocab_id_prefix_check;`)
sw(`ALTER TABLE srs_card ADD CONSTRAINT srs_card_vocab_id_prefix_check CHECK (`)
sw(`  vocab_id LIKE 'fr\\_%'  ESCAPE '\\'`)
sw(`  OR vocab_id LIKE 'pl\\_%'  ESCAPE '\\'`)
sw(`  OR vocab_id LIKE 'usr\\_%' ESCAPE '\\'`)
sw(`);`)
sw(`ALTER TABLE review ADD COLUMN IF NOT EXISTS target_lang VARCHAR(5);`)
sw(`ALTER TABLE review DROP CONSTRAINT IF EXISTS review_vocab_id_prefix_check;`)
sw(`ALTER TABLE review ADD CONSTRAINT review_vocab_id_prefix_check CHECK (`)
sw(`  vocab_id LIKE 'fr\\_%'  ESCAPE '\\'`)
sw(`  OR vocab_id LIKE 'pl\\_%'  ESCAPE '\\'`)
sw(`  OR vocab_id LIKE 'usr\\_%' ESCAPE '\\'`)
sw(`);`)
sw(`ALTER TABLE vocab DROP CONSTRAINT IF EXISTS vocab_gender_check;`)
sw(`ALTER TABLE vocab ADD CONSTRAINT vocab_gender_check CHECK (gender IS NULL OR gender IN ('m', 'f', 'n'));`)
sw(`ALTER TABLE vocab ADD COLUMN IF NOT EXISTS source VARCHAR(10) NOT NULL DEFAULT 'seed';`)
sw(`ALTER TABLE theme DROP CONSTRAINT IF EXISTS theme_order_key;`)
sw(`ALTER TABLE theme DROP CONSTRAINT IF EXISTS theme_lang_order_key;`)
sw(`ALTER TABLE theme DROP CONSTRAINT IF EXISTS theme_lang_pack_order_key;`)
sw(`ALTER TABLE theme ADD CONSTRAINT theme_lang_pack_order_key UNIQUE (lang, pack_id, "order");`)

sw(`COMMIT;`)

// ===========================================================================
// DATA SECTION
// ===========================================================================
dw(``)
dw(`-- ===== REFERENCE DATA =====`)
dw(``)
dw(`BEGIN;`)
dw(``)

dw(`-- vocab`)
for (const v of allVocab) {
  dw(`INSERT INTO vocab (id, target, ipa, gender, freq, theme, source) VALUES (${sqlString(v.id)}, ${sqlString(v.target)}, ${sqlString(v.ipa)}, ${sqlString(v.gender)}, ${sqlIntOrNull(v.freq)}, ${sqlString(v.theme)}, 'seed');`)
}
dw(``)

dw(`-- vocab_translation`)
for (const v of allVocab) {
  for (const [lang, text] of Object.entries(v.translations || {})) {
    dw(`INSERT INTO vocab_translation (vocab_id, lang, text) VALUES (${sqlString(v.id)}, ${sqlString(lang)}, ${sqlString(text)});`)
  }
}
dw(``)

dw(`-- vocab_hint (Russian + Polish hints from the JS map; only fr_* rows have hints)`)
for (const [vid, hint] of Object.entries(RU_HINTS)) {
  if (hint && !hint.startsWith('TODO')) {
    dw(`INSERT INTO vocab_hint (vocab_id, lang, text) VALUES (${sqlString(vid)}, 'ru', ${sqlString(hint)});`)
  }
}
for (const [vid, hint] of Object.entries(PL_HINTS)) {
  if (hint && !hint.startsWith('TODO')) {
    dw(`INSERT INTO vocab_hint (vocab_id, lang, text) VALUES (${sqlString(vid)}, 'pl', ${sqlString(hint)});`)
  }
}
dw(``)

dw(`-- vocab_example (FR examples only; keyed by vocab id, sort_order)`)
for (const [vid, examples] of Object.entries(EXAMPLES)) {
  examples.forEach((ex, idx) => {
    dw(`INSERT INTO vocab_example (vocab_id, sort_order, lang, source_text, target_text) VALUES (${sqlString(vid)}, ${idx + 1}, 'fr', ${sqlString(ex.fr)}, ${sqlString(ex.ru)});`)
  })
}
dw(``)

dw(`-- vocab_lexicon (FR only; keyed by vocab id)`)
for (const [vid, lex] of Object.entries(LEXICON)) {
  dw(`INSERT INTO vocab_lexicon (vocab_id, synonyms, usage, semantics) VALUES (${sqlString(vid)}, ${sqlTextArray(lex.synonyms)}, ${sqlString(lex.usage)}, ${sqlString(lex.semantics)});`)
}
dw(``)

dw(`-- theme`)
const allThemes = [...FR_THEMES, ...PL_THEMES]
const seenThemeIds = new Set()
for (const t of allThemes) {
  if (seenThemeIds.has(t.id)) continue
  seenThemeIds.add(t.id)
  const meta = themePackOrder.get(t.id) || { packId: null, lang: (t.id.startsWith('pl_') ? 'pl' : 'fr'), order: t.order }
  const unlock = t.unlockCondition && t.unlockCondition.type === 'theme_complete' ? t.unlockCondition : null
  dw(`INSERT INTO theme (id, lang, pack_id, "order", title, title_ru, description, description_ru, unlock_theme_id, unlock_min_score) VALUES (${sqlString(t.id)}, ${sqlString(meta.lang)}, ${sqlString(meta.packId)}, ${meta.order}, ${sqlString(t.title)}, ${sqlString(t.titleRu)}, ${sqlString(t.description)}, ${sqlString(t.descriptionRu)}, ${sqlString(unlock?.themeId || null)}, 60);`)
}
for (const row of LEGACY_THEME_ROWS) {
  dw(`INSERT INTO theme (id, lang, pack_id, "order", title, title_ru, description, description_ru, unlock_theme_id, unlock_min_score) VALUES (${sqlString(row.id)}, ${sqlString(row.lang)}, ${sqlString(row.packId)}, ${row.order}, ${sqlString(row.title)}, ${sqlString(row.titleRu)}, ${sqlString(row.description)}, ${sqlString(row.descriptionRu)}, NULL, 60);`)
}
dw(``)

dw(`-- theme_vocab (derived from each theme's vocabIds)`)
const seenThemeVocab = new Set()
for (const t of allThemes) {
  for (const vid of t.vocabIds || []) {
    const key = `${t.id}:${vid}`
    if (seenThemeVocab.has(key)) continue
    seenThemeVocab.add(key)
    dw(`INSERT INTO theme_vocab (theme_id, vocab_id) VALUES (${sqlString(t.id)}, ${sqlString(vid)});`)
  }
}
dw(``)

dw(`-- theme_section (content JSONB per theme section)`)
for (const t of allThemes) {
  const sections = t.sections || []
  sections.forEach((s, idx) => {
    const content = {
      notes: s.notes || [],
      tables: s.tables || [],
      exercises: s.exercises || [],
    }
    dw(`INSERT INTO theme_section (theme_id, type, sort_order, content) VALUES (${sqlString(t.id)}, ${sqlString(s.type)}, ${idx}, ${sqlJson(content)});`)
  })
}
dw(``)

dw(`-- theme_verb`)
for (const t of allThemes) {
  for (const v of t.verbList || []) {
    const participePasse = v.participePasse ?? v.participe_passe ?? null
    const auxiliaire = v.auxiliaire ?? null
    const verbGroup = v.group ?? v.verb_group ?? null
    dw(`INSERT INTO theme_verb (theme_id, infinitive, ru, participe_passe, auxiliaire, verb_group) VALUES (${sqlString(t.id)}, ${sqlString(v.infinitive)}, ${sqlString(v.ru)}, ${sqlString(participePasse)}, ${sqlString(auxiliaire)}, ${sqlString(verbGroup)});`)
  }
}
dw(``)

dw(`-- theme_conjugation (per-theme per-verb per-native-lang conjugation forms)`)
for (const [themeId, lang, table] of [
  ['fr_theme01', 'ru', THEME01_RU_CONJUGATIONS],
  ['fr_theme02', 'ru', THEME02_RU_CONJUGATIONS],
]) {
  for (const [verb, forms] of Object.entries(table)) {
    dw(`INSERT INTO theme_conjugation (theme_id, infinitive, lang, forms) VALUES (${sqlString(themeId)}, ${sqlString(verb)}, ${sqlString(lang)}, ${sqlTextArray(forms)});`)
  }
}
dw(``)

dw(`COMMIT;`)
dw(``)

dw(`-- Mark srs_card rows whose vocab_id no longer exists in the rebuilt vocab.`)
dw(`UPDATE srs_card SET archived_at = NOW()`)
dw(`WHERE archived_at IS NULL`)
dw(`  AND vocab_id NOT IN (SELECT id FROM vocab);`)

// ===========================================================================
// Write outputs
// ===========================================================================

const header = `-- 000_bootstrap.sql
-- Canonical seed for all reference data in the app.
-- Generated from the legacy JS sources via scripts/_legacy/generate-bootstrap.mjs.
-- After the cutover, edit this file directly. The generator script is deleted in the same release.
--
-- This file is split into two logical sections:
--   1. SCHEMA  — DDL for reference + user tables + legacy up-migrations.
--   2. DATA    — INSERT statements for reference data only.
--
-- User tables are created once and never dropped. Reference tables are
-- dropped + recreated at the top of every apply. This is the canonical
-- model: edits to course content land in the DATA section.
`

const schemaText = schemaLines.join('\n')
const dataText = dataLines.join('\n')
const full = header + '\n' + schemaText + '\n' + dataText

writeFileSync('server/src/db/migrations/000_bootstrap.sql', full)
writeFileSync('server/src/db/migrations/_schema_only.sql', schemaText)
writeFileSync('server/src/db/migrations/_data_only.sql', dataText)
console.log(`wrote bootstrap     (${full.split('\n').length} lines)`)
console.log(`wrote schema-only   (${schemaText.split('\n').length} lines)`)
console.log(`wrote data-only     (${dataText.split('\n').length} lines)`)
