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

No test framework is configured yet.

## Architecture

French language learning app for Russian speakers. Vite 7 + React 19 + React Router 7 + Tailwind CSS 4 (via `@tailwindcss/vite` plugin). Pure JSX, no TypeScript. Dark theme, mobile-first.

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

**User data:** `user` (UUID PK, email+bcrypt auth), `refresh_token`, `srs_card` (PK: user_id+vocab_id), `theme_progress` (PK: user_id+theme_id), `user_mnemonic`, `review` (BIGSERIAL, every review), `user_daily_stat` (PK: user_id+study_date), `ai_conversation`, `ai_message`, `ai_note`

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

# AI Assistant (chat + notes)
POST /api/ai/chat                              Send message to AI (auth)
GET  /api/ai/conversations/:exerciseKey        Get conversation history (auth)
GET  /api/ai/conversations                     Get all recent conversations (auth)
GET  /api/ai/notes                             Get all notes (auth)
POST /api/ai/notes                             Save a structured note (auth)
DELETE /api/ai/notes/:id                       Delete a note (auth)
```

### Three Language Dimensions

The app separates three distinct language concerns:
1. **UI language** — `src/i18n/locales/{ru,fr}.json` with `useT()` hook for buttons/headings
2. **Target language** — `src/data/courses/fr/` (vocabulary, themes, grammar being taught)
3. **Native-language hints** — `src/data/courses/fr/hints/ru.js` (Russian-speaker mnemonics)

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

All 31 themes defined in `src/data/courses/fr/themes/theme01-pronouns-present.js` (single file, exports `themes` array). Themes 1-7 have full content (grammar, exercises, vocab); 8-31 are stubs generated by `stubTheme()`. Each theme has sections: grammar, vocabulary, exercises, flashcards.

Theme unlock: sequential, requiring previous theme completed with `bestScore >= 60%` (logic in `src/utils/progress.js:isThemeUnlocked`).

Exercise types: FillBlank, MultipleChoice, Conjugation, Translation, Matching (in `src/components/themes/exercises/`).

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
/themes              ThemesListPage (30 themes, lock states)
/themes/:id          ThemePage (tabbed: grammar | vocab | exercises | flashcards)
/study               StudyPage (global SRS)
/study/:themeId      StudyPage (theme-scoped SRS)
/vocab               VocabPage
/mnemonics           MnemonicPage
```

### Styling

Tailwind v4 with custom theme tokens in `src/index.css` under `@theme` (colors: bg, surface, accent). Card flip uses custom CSS classes (`.perspective`, `.preserve-3d`, `.backface-hidden`, `.rotate-y-180`).

### Key Conventions

- Vocab IDs follow pattern `fr_XXX` (zero-padded 3 digits)
- Theme IDs: `theme01` through `theme31`
- localStorage keys prefixed with `lm_`
- Russian is the default/fallback UI language
- `program.md` in project root contains the 30-step curriculum plan (in Russian)
- `french_learning_app.jsx` is the original prototype (preserved for reference)
- Backend env vars: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `PORT` (see `server/.env.example`)

### AI Assistant

An AI helper that allows users to chat about vocabulary and conjugation exercises.

**Backend:** `server/src/routes/ai.js` with OpenAI-compatible API
**Frontend:** `src/components/ai/AIChatButton.jsx`, `AIChatModal.jsx`
**Config:** Set `AI_API_KEY` environment variable (requires restart)

**Use case:** User clicks "AI" button on a conjugation exercise, asks questions about the word (meaning, context, examples), and can save the conversation as a structured note.
