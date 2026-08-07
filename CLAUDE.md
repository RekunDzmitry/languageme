# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Full stack (Docker) — preferred
docker-compose up -d          # Start all: PostgreSQL + API + Vite frontend
docker-compose up --build -d  # Rebuild and start all
docker-compose down           # Stop all containers
docker-compose restart frontend  # Restart Vite after config changes

# Frontend at http://localhost:5173, API at http://localhost:3000

# Frontend (local, without Docker)
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run lint         # ESLint

# Backend (local dev, requires running PostgreSQL)
cd server && npm run dev      # Start API with --watch
cd server && npm run migrate  # Run database migrations
```

Playwright is wired up for end-to-end tests (config in `playwright.config.js`, specs in `tests/`). Run with `npx playwright test`. No unit test framework.

## Architecture

Multi-target language learning app. Originally French for Russian speakers; now also Polish for Russian speakers. Vite 7 + React 19 + React Router 7 + Tailwind CSS 4 (via `@tailwindcss/vite` plugin). Pure JSX, no TypeScript. Dark theme, mobile-first.

### Backend Service

Docker-based Node.js + Express + PostgreSQL backend at `server/`. Two containers via `docker-compose.yml`:
- **postgres** — PostgreSQL 16 Alpine, persisted volume, healthcheck
- **api** — Node.js 20 Alpine, Express 5, port 3000

API base: `http://localhost:3000/api/`. Auth via JWT (15min access + 30-day refresh token rotation). Public endpoints for vocab/themes, authenticated endpoints for study/progress/stats.

Key backend files:
- `server/src/index.js` — Express app entry, route mounting
- `server/src/db/pool.js` — pg Pool singleton
- `server/src/db/migrate.js` — migration runner (tracks in `_migrations` table)
- `server/src/db/migrations/` — SQL migrations (001=schema, 002=vocab seed, 003=themes seed)
- `server/src/services/sm2.js` — server-side port of SM-2 algorithm
- `server/src/services/auth.js` — bcrypt + JWT + refresh token logic
- `server/src/services/streak.js` — streak calculation from `user_daily_stat`
- `server/src/middleware/auth.js` — JWT verify middleware, admin check
- `server/src/routes/` — auth, user, vocab, themes, study, progress, mnemonics, stats, migrate, admin

### Database Schema

**Reference data:** `vocab`, `vocab_translation` (PK: vocab_id+lang), `vocab_hint` (PK: vocab_id+lang), `theme`, `theme_vocab` (many-to-many), `theme_section` (JSONB content), `theme_verb`

**User data:** `user` (UUID PK, email+bcrypt auth), `refresh_token`, `srs_card` (PK: user_id+vocab_id), `theme_progress` (PK: user_id+theme_id), `user_mnemonic`, `review` (BIGSERIAL, every review), `user_daily_stat` (PK: user_id+study_date)

### API Endpoints

```
POST /api/auth/register|login|refresh|logout   Auth (JWT)
GET|PATCH /api/me                              User profile/settings
GET /api/vocab[/:id]                           Vocab (public, paginated)
GET /api/themes[/:id]                          Themes (public, full sections)
GET /api/study/due|new                         Due/unseen SRS cards (auth)
POST /api/study/review                         Review card + SM-2 update (auth)
GET /api/study/conjugation                     Fetch all conjugation cards (auth)
POST /api/study/conjugation/review             Review conjugation card + SM-2 (auth)
GET|POST /api/progress/themes[/:themeId]       Theme progress (auth)
GET /api/progress/themes/:themeId/unlock       Unlock check (auth)
GET|PUT|DELETE /api/mnemonics[/:vocabId]       User mnemonics (auth)
GET /api/stats[/history]                       Streak, counts, daily chart (auth)
POST /api/migrate/import                       One-time localStorage import (auth)
GET /api/admin/users|analytics                 Admin endpoints (admin)
```

### Three Language Dimensions

The app separates three distinct language concerns:
1. **UI language** — `src/i18n/locales/{ru,pl,fr}.json` with `useT()` hook for buttons/headings
2. **Target language** — the language being taught: French (`fr`) or Polish (`pl`), selected via `settings.targetLang`
3. **Native language** — the learner's L1, used for translations/hints, selected via `settings.nativeLang`

**Course Structure:**
```
src/data/courses/
├── index.js         # Course registry keyed by targetLang; getThemes(targetLang) etc.
├── fr/              # French for Russian speakers (default)
│   ├── index.js     # Exports COURSE, VOCAB, THEMES, getHints(nativeLang)
│   ├── vocab.js     # Vocabulary with ru translations
│   ├── themes/      # 31 themes (theme01 has everything; one file, exports themes array)
│   ├── conjugations/# Conjugation tables in Russian
│   └── hints/       # Mnemonics in Russian
├── fr-pl/           # French for Polish speakers
│   ├── vocab.js     # Vocabulary with pl translations
│   ├── themes/      # Theme content in Polish
│   ├── conjugations/# Conjugation tables in Polish
│   └── hints/       # Mnemonics in Polish
└── pl/              # Polish for Russian speakers
    ├── index.js     # Imports each theme file, exports COURSE + THEMES array
    ├── vocab.js     # Polish vocabulary with ru translations
    └── themes/      # One file per theme (theme01-ortografia-uo.js through theme09-wielka-litera.js)
```

Polish course themes cover orthography rules from the reference PDF: ó/u, digraphs, softness, ż/rz, ch/h, j/i, gie/ge, ę-ą vs en-om, capitalization. All Polish themes currently have `unlockCondition: null` (all unlocked) and contain only `write_answer` exercises (no verb conjugation).

**Content selection:**
- `src/data/courses/index.js` exports `getCourse(targetLang)`, `getThemes(targetLang)`, `getVocab(targetLang)`, `getThemeTitle(theme, targetLang)` — these are the entry points consumed by pages
- Components read `settings.targetLang` to pick the course, then `settings.nativeLang` to pick translations inside vocab entries
- `word.translations?.[nativeLang]` for vocabulary translations
- `theme.titleRu` is preferred over `theme.title` when rendering for Russian UI (see `getThemeTitle`)

### State Management

**PostgreSQL is the source of truth.** All user progress (SRS cards, theme progress, stats) lives in PostgreSQL, not localStorage. The API endpoints under `/api/progress/` and `/api/study/` handle all progress data.

Two React Contexts wrap the app (provider order in `main.jsx`):
- **`I18nProvider`** — UI language selection, `t(key, params)` translation function
- **`SettingsContext`** — `nativeLang`, `targetLang`, `uiLang`
- **`UserProgressContext`** — Fetches and caches progress from API when authenticated. Falls back to local `isThemeUnlocked()` when not authenticated.

Hooks: `useT()` for i18n, `useProgress()` for progress/SRS.

### SM-2 Spaced Repetition

`src/utils/sm2.js` — Maps 4-button ratings (Again=0, Hard=1, Good=2, Easy=3) to SM-2 quality scale. Card fields: `{ease, interval, reps, due, lastReviewed}`. A word is considered "mastered" when `reps >= 3`.

### Conjugation Card Keys

Conjugation cards are keyed by `(verb infinitive, tense, formType, pronounIndex)`:
```
conj:parler:pr:aff:0    # affirmative: "je" + "parle"
conj:parler:pr:neg:0    # negative: "je" + "ne parle pas"
```

Conjugation progress stored in `conjugation_card` table (PostgreSQL), not `srs_card`.

**Negative form themes:** `theme02` (negative forms with ne...pas). Set `formType='neg'` when calculating mastery or rendering the verb grid for these themes.

**Important:** The same verb in different themes is conceptually different. "Parler" in theme 1 (affirmative) and "parler" in theme 2 (negative forms) have separate progress tracking because they teach different grammatical concepts.

### Theme System

**French course:** All 31 themes defined in `src/data/courses/fr/themes/theme01-pronouns-present.js` (single file, exports `themes` array). Themes 1-7 have full content (grammar, exercises, vocab); 8-31 are stubs generated by `stubTheme()`.

**Polish course:** 9 themes, one file per theme under `src/data/courses/pl/themes/`. `pl/index.js` imports each file and exports the combined `THEMES` array.

Each theme has sections: grammar (notes + tables), vocabulary, exercises, flashcards. Themes also carry `verbList` for conjugation practice (empty for Polish orthography themes).

Theme unlock: sequential, requiring previous theme completed with `bestScore >= 60%` (logic in `src/utils/progress.js:isThemeUnlocked`). Themes with `unlockCondition: null` bypass this and are always unlocked.

Exercise types registered in `src/components/themes/ExerciseSection.jsx:EXERCISE_COMPONENTS`:
- `fill_blank` — FillBlank
- `multiple_choice` — MultipleChoice
- `conjugation` — Conjugation
- `translation` — Translation
- `matching` — Matching
- `write_answer` — WriteAnswer (free-text input with `answer` string or `answers` array; supports `hint`, `placeholder`, `format`). State-reset `useEffect` is keyed to the `exercise` prop; result is reported to parent only when the user clicks **Continue**, so the parent advances exactly once.

### Training page unlock rules

`src/pages/TrainingPage.jsx` treats a theme as trainable if it has verbs OR has any `exercises` section with exercises. Verb-less exercise-only themes (like the Polish orthography ones) navigate directly to `/themes/:id` on click instead of expanding a verb grid.

### Vocabulary Data

`src/data/courses/fr/vocab.js` — 305 entries (also seeded into PostgreSQL `vocab` table) with format:
```js
{ id: "fr_001", target: "bonjour", ipa: "/bɔ̃.ʒuʁ/", gender: null,
  freq: 1, theme: "greetings", themeIds: ["theme01"],
  translations: { ru: "привет", en: "hello" } }
```

### Routing

```
/                    DashboardPage
/themes              ThemesListPage (themes for current targetLang, with lock states)
/themes/:id          ThemePage (tabbed: grammar | vocab | exercises | flashcards)
/training            TrainingPage (verb drill grid + entry to exercise-only themes)
/study               StudyPage (global SRS)
/study/:themeId      StudyPage (theme-scoped SRS)
/vocab               VocabPage
/mnemonics           MnemonicPage
/auth                AuthPage (login/register)
```

### Styling

Tailwind v4 with custom theme tokens in `src/index.css` under `@theme` (colors: bg, surface, accent). Card flip uses custom CSS classes (`.perspective`, `.preserve-3d`, `.backface-hidden`, `.rotate-y-180`).

### Key Conventions

- Vocab IDs follow pattern `{targetLang}_XXX` (zero-padded 3 digits) — e.g. `fr_001`, `pl_001`
- Theme IDs: `theme01` through `theme31` (French) / `theme09` (Polish, currently)
- localStorage keys prefixed with `lm_` (e.g. `lm_settings`)
- Russian is the default/fallback UI language
- `program.md` in project root contains the 30-step French curriculum plan (in Russian)
- `french_learning_app.jsx` is the original prototype (preserved for reference)
- Backend env vars: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `PORT` (see `server/.env.example`)
