# LanguageMe Data Model

## Table of Contents

- [Database Schema](#database-schema)
- [Frontend Data Structures](#frontend-data-structures)
- [Entity Relationships](#entity-relationships)
- [Common Data Flows](#common-data-flows)
- [API Endpoints Summary](#api-endpoints-summary)
- [Storage & Persistence](#storage--persistence)

---

## Database Schema

### Reference Data

#### `vocab`
| Column | Type | Constraints |
|--------|------|-------------|
| id | VARCHAR(10) | PK (`fr_001`–`fr_305`) |
| target | VARCHAR(100) | NOT NULL — French word |
| ipa | VARCHAR(100) | IPA pronunciation |
| gender | VARCHAR(1) | CHECK (m\|f) |
| freq | INT | Frequency ranking |
| theme | VARCHAR(50) | Legacy category name |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

#### `vocab_translation`
| Column | Type | Constraints |
|--------|------|-------------|
| vocab_id | VARCHAR(10) | PK, FK → vocab(id) CASCADE |
| lang | VARCHAR(5) | PK (ru, en) |
| text | TEXT | Translation text |

#### `vocab_hint`
| Column | Type | Constraints |
|--------|------|-------------|
| vocab_id | VARCHAR(10) | PK, FK → vocab(id) CASCADE |
| lang | VARCHAR(5) | PK |
| text | TEXT | Mnemonic hint |

#### `theme`
| Column | Type | Constraints |
|--------|------|-------------|
| id | VARCHAR(10) | PK (`theme01`–`theme31`) |
| order | INT | UNIQUE NOT NULL |
| title | VARCHAR(200) | English title |
| title_ru | VARCHAR(200) | Russian title |
| description | TEXT | English description |
| description_ru | TEXT | Russian description |
| unlock_theme_id | VARCHAR(10) | FK → theme(id) — prerequisite |
| unlock_min_score | INT | DEFAULT 60 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

#### `theme_vocab`
| Column | Type | Constraints |
|--------|------|-------------|
| theme_id | VARCHAR(10) | PK, FK → theme(id) CASCADE |
| vocab_id | VARCHAR(10) | PK, FK → vocab(id) CASCADE |

#### `theme_section`
| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PK |
| theme_id | VARCHAR(10) | FK → theme(id) CASCADE |
| type | VARCHAR(20) | CHECK (grammar\|exercises\|vocabulary\|flashcards) |
| sort_order | INT | DEFAULT 0 |
| content | JSONB | Structured lesson content |

#### `theme_verb`
| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PK |
| theme_id | VARCHAR(10) | FK → theme(id) CASCADE |
| infinitive | VARCHAR(50) | French infinitive |
| ru | VARCHAR(100) | Russian translation |
| participe_passe | VARCHAR(50) | Past participle |
| auxiliaire | VARCHAR(10) | avoir\|être |
| verb_group | VARCHAR(50) | Conjugation group |

### User Data

#### `user`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| email | VARCHAR(255) | UNIQUE NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL (bcrypt, 10 rounds) |
| display_name | VARCHAR(100) | |
| native_lang | VARCHAR(5) | DEFAULT 'ru' |
| target_lang | VARCHAR(5) | DEFAULT 'fr' |
| ui_lang | VARCHAR(5) | DEFAULT 'ru' |
| auto_play_audio | BOOLEAN | DEFAULT true |
| is_admin | BOOLEAN | DEFAULT false |
| migrated_at | TIMESTAMPTZ | Set on localStorage import |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

#### `refresh_token`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| user_id | UUID | FK → user(id) CASCADE |
| token_hash | VARCHAR(255) | UNIQUE NOT NULL (SHA256) |
| expires_at | TIMESTAMPTZ | 30 days from creation |
| revoked | BOOLEAN | DEFAULT false |

#### `srs_card`
| Column | Type | Constraints |
|--------|------|-------------|
| user_id | UUID | PK, FK → user(id) CASCADE |
| vocab_id | VARCHAR(10) | PK, FK → vocab(id) CASCADE |
| ease | REAL | DEFAULT 2.5 |
| interval_days | INT | DEFAULT 1 |
| reps | INT | DEFAULT 0 (mastered at ≥ 3) |
| due | TIMESTAMPTZ | DEFAULT NOW() |
| last_reviewed | TIMESTAMPTZ | |

Indexes: `idx_srs_card_due (user_id, due)`, `idx_srs_card_vocab_reps (vocab_id, reps)`

#### `theme_progress`
| Column | Type | Constraints |
|--------|------|-------------|
| user_id | UUID | PK, FK → user(id) CASCADE |
| theme_id | VARCHAR(10) | PK, FK → theme(id) CASCADE |
| completed | BOOLEAN | DEFAULT false |
| best_score | INT | CHECK (0–100) |
| attempts | INT | DEFAULT 0 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

#### `user_mnemonic`
| Column | Type | Constraints |
|--------|------|-------------|
| user_id | UUID | PK, FK → user(id) CASCADE |
| vocab_id | VARCHAR(10) | PK, FK → vocab(id) CASCADE |
| text | TEXT | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

#### `review`
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PK |
| user_id | UUID | FK → user(id) CASCADE |
| vocab_id | VARCHAR(10) | FK → vocab(id) CASCADE |
| quality | SMALLINT | CHECK (0–3) |
| reviewed_at | TIMESTAMPTZ | DEFAULT NOW() |

Indexes: `idx_review_user_date (user_id, reviewed_at DESC)`, `idx_review_vocab_quality (vocab_id, quality)`

#### `user_daily_stat`
| Column | Type | Constraints |
|--------|------|-------------|
| user_id | UUID | PK, FK → user(id) CASCADE |
| study_date | DATE | PK |
| reviews_count | INT | DEFAULT 0 |
| correct_count | INT | DEFAULT 0 (quality ≥ 2) |

#### `_migrations`
| Column | Type | Constraints |
|--------|------|-------------|
| name | VARCHAR(255) | PK |
| applied_at | TIMESTAMPTZ | DEFAULT NOW() |

---

## Frontend Data Structures

### Vocab Entry (static data, `src/data/courses/fr/vocab.js`)

```js
{
  id: "fr_001",                    // fr_001 – fr_305
  target: "bonjour",              // French word
  ipa: "/bɔ̃.ʒuʁ/",
  gender: null,                   // "m" | "f" | null
  freq: 1,                        // Lower = more common
  theme: "greetings",             // Category label
  themeIds: ["theme01"],          // Which themes reference this word
  translations: { ru: "привет", en: "hello" }
}
```

### SRS Card (per-user, per-word)

```js
{
  ease: 2.5,            // Ease factor, min 1.3
  interval: 1,          // Days until next review
  reps: 0,              // Successful reps (mastered at ≥ 3)
  due: 1710000000000,   // Timestamp when next review is due
  lastReviewed: null     // Timestamp of last review
}
```

### Theme (static data, `src/data/courses/fr/themes/`)

```js
{
  id: "theme01",
  order: 1,
  title: "Pronouns & 1st Group Verbs",
  titleRu: "Местоимения и глаголы 1-й группы",
  description: "...",
  descriptionRu: "...",
  unlockCondition: { type: "theme_complete", themeId: "theme00", minScore: 60 } | null,
  vocabIds: ["fr_008", "fr_016", ...],
  sections: [
    {
      type: "grammar",       // grammar | exercises | vocabulary | flashcards
      notes: [{ title, text, examples: [{ fr, ru }] }],
      tables: [{ verb, translation, rows: [{ pronoun, form, ipa }] }]
    }
  ],
  verbList: [{ infinitive, ru, group, participePasse, auxiliaire }]
}
```

### UserProgress State (React Context)

```js
{
  srsCards: { [vocabId]: Card },
  themeProgress: { [themeId]: { completed, bestScore, attempts } },
  userMnemonics: { [vocabId]: "custom mnemonic text" },
  stats: {
    streak: 5,
    totalReviewed: 120,
    lastStudyDate: "2026-03-14",
    reviewHistory: [{ wordId, quality, time }]  // Last 100 entries
  }
}
```

### Settings State (React Context)

```js
{
  nativeLang: "ru",
  targetLang: "fr",
  uiLang: "ru",
  autoPlayAudio: true
}
```

---

## Entity Relationships

```
user ─────────────┬── 1:N ── refresh_token
                  ├── 1:N ── srs_card ──────── N:1 ── vocab
                  ├── 1:N ── theme_progress ── N:1 ── theme
                  ├── 1:N ── user_mnemonic ─── N:1 ── vocab
                  ├── 1:N ── review ────────── N:1 ── vocab
                  └── 1:N ── user_daily_stat

theme ────────────┬── 1:N ── theme_section (JSONB content)
                  ├── 1:N ── theme_verb
                  ├── M:N ── vocab (via theme_vocab)
                  └── 0:1 ── theme (self-ref: unlock_theme_id)

vocab ────────────┬── 1:N ── vocab_translation
                  ├── 1:N ── vocab_hint
                  └── M:N ── theme (via theme_vocab)
```

---

## Common Data Flows

### 1. User Registration & Login

```
Client                          API                           DB
  │                              │                             │
  ├─ POST /auth/register ──────►│                             │
  │   { email, password }        ├─ bcrypt(password, 10) ────►│
  │                              ├─ INSERT user ──────────────►│
  │                              ├─ generateAccessToken(JWT) ─►│ (15min expiry)
  │                              ├─ generateRefreshToken() ───►│
  │                              ├─ SHA256(token) ────────────►│ INSERT refresh_token
  │◄─ { accessToken,            │                             │
  │     refreshToken } ─────────┤                             │
```

### 2. Token Refresh (rotation)

```
Client                          API                           DB
  │                              │                             │
  ├─ POST /auth/refresh ───────►│                             │
  │   { refreshToken }           ├─ SHA256(token) ────────────►│ SELECT valid token
  │                              ├─ revoke old token ─────────►│ UPDATE revoked=true
  │                              ├─ generate new pair ────────►│ INSERT new refresh_token
  │◄─ { accessToken,            │                             │
  │     refreshToken } ─────────┤                             │
```

### 3. SRS Study Session (review a card)

```
Client                          API                           DB
  │                              │                             │
  ├─ GET /study/due ───────────►│                             │
  │   ?themeId=theme01           ├─ SELECT srs_card ──────────►│ WHERE due <= NOW()
  │                              │   JOIN vocab, translations  │   LIMIT 50
  │◄─ [{ vocab + card data }] ──┤                             │
  │                              │                             │
  │  (user rates card)           │                             │
  │                              │                             │
  ├─ POST /study/review ───────►│                             │
  │   { vocabId, quality: 0-3 }  ├─ BEGIN transaction ────────►│
  │                              ├─ sm2(card, quality) ───────►│ UPSERT srs_card
  │                              ├─ INSERT review ────────────►│ (audit trail)
  │                              ├─ UPSERT user_daily_stat ──►│ reviews_count++
  │                              │   (correct_count++ if q≥2)  │   correct_count++
  │                              ├─ COMMIT ───────────────────►│
  │◄─ { updated card } ─────────┤                             │
```

**SM-2 Algorithm (both frontend `src/utils/sm2.js` and backend `server/src/services/sm2.js`):**

```
Input: card { ease, interval, reps }, quality (0-3)
Map quality → SM-2 scale: [0→0, 1→2, 2→4, 3→5]

If q < 3:  reset reps=0, interval=1
If q ≥ 3:  reps=0→interval=1, reps=1→interval=6, reps>1→interval=round(interval×ease), reps++

ease = max(1.3, ease + 0.1 - (5-q) × (0.08 + (5-q) × 0.02))
due  = now + interval × 86400000ms
```

### 4. Theme Progression

```
Client                          API                           DB
  │                              │                             │
  ├─ GET /progress/themes/      │                             │
  │     theme02/unlock ─────────►├─ Find theme02.unlock_theme_id ──►│
  │                              │   = "theme01"               │
  │                              ├─ Check theme_progress ─────►│ WHERE theme_id='theme01'
  │                              │   best_score >= 60?         │
  │◄─ { unlocked: true } ───────┤                             │
  │                              │                             │
  │  (user completes exercises)  │                             │
  │                              │                             │
  ├─ POST /progress/themes/     │                             │
  │     theme02 ────────────────►│                             │
  │   { score: 85 }              ├─ UPSERT theme_progress ───►│ best_score=MAX(old,85)
  │                              │                             │   completed=(85≥60)
  │                              │                             │   attempts++
  │◄─ { updated progress } ─────┤                             │
```

**Unlock chain:** theme01 (always open) → theme02 (needs theme01 ≥ 60%) → theme03 (needs theme02 ≥ 60%) → ...

### 5. Stats & Streak Calculation

```
Client                          API                           DB
  │                              │                             │
  ├─ GET /stats ────────────────►│                             │
  │                              ├─ SUM(reviews_count) ──────►│ FROM user_daily_stat
  │                              ├─ today's reviews ─────────►│ WHERE study_date=TODAY
  │                              ├─ mastered count ──────────►│ srs_card WHERE reps≥3
  │                              ├─ streak: walk backwards ──►│ Consecutive days with
  │                              │   from today               │   reviews_count > 0
  │◄─ { streak, totalReviewed,  │                             │
  │     todayReviewed,           │                             │
  │     masteredCount } ─────────┤                             │
```

### 6. localStorage → Database Migration (one-time)

```
Client                          API                           DB
  │                              │                             │
  ├─ POST /migrate/import ─────►│                             │
  │   { srsCards: {...},          ├─ Check migrated_at ───────►│ 409 if already done
  │     themeProgress: {...},     ├─ BEGIN transaction ────────►│
  │     userMnemonics: {...},     ├─ INSERT srs_card (bulk) ──►│ ON CONFLICT DO NOTHING
  │     stats: {...} }            ├─ INSERT theme_progress ───►│ ON CONFLICT DO NOTHING
  │                              ├─ INSERT user_mnemonic ────►│ ON CONFLICT DO NOTHING
  │                              ├─ INSERT user_daily_stat ──►│ ON CONFLICT DO NOTHING
  │                              ├─ UPDATE user SET           │
  │                              │   migrated_at=NOW() ──────►│
  │                              ├─ COMMIT ───────────────────►│
  │◄─ { ok: true } ─────────────┤                             │
```

### 7. Frontend-Only Flow (current state, no API)

```
App Load
  │
  ├─ I18nProvider: load lang from localStorage (lm_uiLang)
  ├─ SettingsProvider: load from localStorage (lm_settings)
  └─ UserProgressProvider: load from localStorage (lm_progress)
       ├─ If first visit: create cards for all 305 vocab entries
       └─ If returning: auto-migrate v1→v2→v3 if needed

Study Session (all in-browser)
  │
  ├─ getDueCards(cards): filter where due <= now(), sort by due
  ├─ getNewCards(cards, 5): filter where reps === 0, sort by freq
  ├─ User rates card → sm2(card, quality) → update state
  └─ Debounced save to localStorage every 500ms
```

---

## API Endpoints Summary

| Method | Path | Auth | Input | Output |
|--------|------|------|-------|--------|
| POST | /api/auth/register | - | email, password, displayName? | accessToken, refreshToken |
| POST | /api/auth/login | - | email, password | accessToken, refreshToken |
| POST | /api/auth/refresh | - | refreshToken | accessToken, refreshToken |
| POST | /api/auth/logout | - | refreshToken | { ok } |
| GET | /api/me | JWT | - | user profile |
| PATCH | /api/me | JWT | settings fields | updated user |
| GET | /api/vocab | - | ?page, ?limit (max 100) | { data, total, page, limit } |
| GET | /api/vocab/:id | - | - | vocab + translations + hints |
| GET | /api/themes | - | - | all 31 themes |
| GET | /api/themes/:id | - | - | theme + sections + verbs + vocab |
| GET | /api/study/due | JWT | ?themeId | due cards (max 50) |
| GET | /api/study/new | JWT | ?limit (max 20) | unseen vocab |
| POST | /api/study/review | JWT | vocabId, quality (0-3) | updated card |
| GET | /api/progress/themes | JWT | - | all theme progress |
| POST | /api/progress/themes/:id | JWT | score (0-100) | updated progress |
| GET | /api/progress/themes/:id/unlock | JWT | - | { unlocked, reason? } |
| GET | /api/mnemonics | JWT | - | user mnemonics |
| PUT | /api/mnemonics/:vocabId | JWT | text | upserted mnemonic |
| DELETE | /api/mnemonics/:vocabId | JWT | - | { ok } |
| GET | /api/stats | JWT | - | streak, totals, mastered |
| GET | /api/stats/history | JWT | ?days (max 365) | daily stat rows |
| POST | /api/migrate/import | JWT | srsCards, themeProgress, userMnemonics, stats | { ok } |
| GET | /api/admin/users | admin | - | user list |
| GET | /api/admin/users/:id/progress | admin | - | user's learning data |
| GET | /api/admin/analytics/hardest-words | admin | - | words with lowest avg quality |
| GET | /api/health | - | - | { status } |

---

## Storage & Persistence

### localStorage Keys (frontend, prefix `lm_`)

| Key | Content | Format Version |
|-----|---------|----------------|
| `lm_progress` | srsCards, themeProgress, userMnemonics, stats | v3 |
| `lm_settings` | nativeLang, targetLang, uiLang, autoPlayAudio | - |
| `lm_uiLang` | Current UI language code | - |

**Auto-migration:** v1→v2 adds `reviewHistory[]`, v2→v3 renames `lessonProgress` → `themeProgress`

**Save strategy:** Debounced writes every 500ms via `storage.saveProgress()`

### PostgreSQL (backend, Docker)

14 tables across 3 SQL migrations:
- `001_initial.sql` — Full schema creation
- `002_seed_vocab.sql` — 305 vocab entries with translations
- `003_seed_themes.sql` — 31 themes with unlock chain and vocab associations

Migration runner: reads `*.sql` files alphabetically, tracks applied in `_migrations` table, each wrapped in a transaction.
