# Migration refactor: DB as single source of truth, drop-and-recreate reference data, preserve user data

Branch: `refactor/migration-drop-recreate`
Worktree: `.worktrees/migration-refactor`

## Source-of-truth decision (revised)

**DB is the only source of truth for course content.** All JS files under
`src/data/courses/` (vocab, hints, themes, lexicon, examples, conjugation
tables) are deleted. All vocab/theme/verb data lives in `000_bootstrap.sql`
as `INSERT` statements, and the client reads it from the API.

The JS files were a historical artifact of an early build process; they
have drifted out of sync with the DB multiple times (`004_seed_stem_changing_verbs.sql`,
`004_conjugation_cards.sql`, `023_rename_fr_themes_to_fr_prefix.sql`,
`028_swap_pl_pack_ranges.sql` are all "the JS data is wrong, fix the DB"
patches). Two sources of truth guarantee drift; we collapse to one.

## Problem statement (unchanged)

The migration set under `server/src/db/migrations/` is 33 files long and
grows with every content change. Examples of the churn:

- `004_seed_stem_changing_verbs.sql` — adds a single row to `theme_verb`
- `007_seed_polish_themes.sql`, `011_seed_polish_vocab.sql`,
  `012_seed_polish_themes_10_11.sql`, `013_seed_polish_themes_12_14.sql`,
  `014_seed_polish_themes_15_18.sql`, `019_seed_polish_theme20.sql`,
  `022_seed_pl_theme22.sql`, `026_pack_other_themes.sql`,
  `030_seed_pl_theme19.sql`, `031_seed_pl_theme21.sql` — one-off data seeds
- `015_theme_lang_scope_order.sql`, `023_rename_fr_themes_to_fr_prefix.sql`,
  `027_per_pack_theme_order.sql`, `028_swap_pl_pack_ranges.sql`,
  `029_demote_pl_theme20_21_to_vocab.sql`, `032_pl_pack_reorg.sql` —
  rename/repack/reorder cascades
- `033_drop_ai_helper_tables.sql` — schema deletions because the previous
  AI helper was already removed from the app

Result: every content edit generates a migration; every content refactor
generates a follow-up migration that "fixes" the previous one; every old
schema that falls out of use needs an explicit DROP migration. New
contributors are forced to understand 33 files of history to touch a
single row.

Goal: keep authoring as easy as editing one SQL file (or letting it be
rebuilt from the JS data via a single one-shot generator kept around for
ergonomics, but never used at runtime). Make schema changes cheap.
Preserve all user-facing state across any reference-data refresh.

## Goals (acceptance criteria)

1. There is exactly one place to edit reference data: `000_bootstrap.sql`
   (the canonical seed). For ergonomics, a generator script reads the
   legacy JS sources and writes the bootstrap, but the runtime never
   imports the JS.
2. Editing reference data does not require writing a new SQL migration.
   The bootstrap is re-runnable and replaces the reference tables in
   place.
3. Editing reference schema (new column, new constraint) requires at most
   one new SQL migration file (additive only).
4. The following user data is preserved across any reference-data
   refresh, in all environments (dev, test, prod), without an explicit
   export/import step:
   - `user` (account, password, settings)
   - `refresh_token` (active sessions)
   - `srs_card` (per-user spaced-repetition state for vocab)
   - `review` (review history)
   - `theme_progress` (per-user completion/score per theme)
   - `user_daily_stat` (per-user daily review counters)
   - `user_mnemonic` (per-user mnemonic override for a vocab id)
   - `vocab_note` (per-user free-form note for a vocab id)
   - `exercise_note` (per-user free-form note for an exercise key)
   - `exercise_card` (per-user SRS state for an exercise key)
   - `user_vocab` (user-authored vocab cards)
   - `email_attempt`, `email_added_vocab` (per-user email-writing history)
   - `user_write_exercise` (per-user-authored write-answer exercises)
   - `conjugation_card` (per-user conjugation SRS state)
   - `ai_request_log` (admin observability)
5. Mnemonics and notes the user authored for a vocab id survive a full
   reference-data rebuild — even when the underlying `vocab` row gets
   deleted, the user override is kept (and surfaced in the UI with a
   "stale" indicator if the vocab is gone).
6. The migration runner remains idempotent and re-entrant (re-running it
   against a freshly-rebuilt DB is a no-op).
7. The frontend no longer imports `src/data/courses/*`; it fetches all
   reference data via the existing API surface (extended as needed).

## Non-goals

- No change to the SRS algorithm or to the auth flow.
- No new endpoints beyond what's needed to surface the rich content that
  the JS files used to provide (examples, lexicon, conjugation tables).
- No change to the export/import JSON shape; backup files still work end
  to end.

## What gets deleted

These files and directories are removed in the refactor. They are
duplicated state with the DB seed.

```
src/data/courses/                          (whole tree)
src/data/courses/index.js                  (re-exports above)
src/data/lessonPacks.js                    (replaced by API-backed pack data)
src/utils/progress.js                      (uses VOCAB from JS; rewritten to use API state)
```

What stays: the JS files are kept for **one release** under
`server/scripts/_legacy-courses/` as a generator input. The seed script
`server/scripts/generate-bootstrap.mjs` reads them and writes
`000_bootstrap.sql`. After that one release, the JS files are deleted.
(The generator stays as a developer convenience, but the runtime never
imports from it.)

Actually simpler: the bootstrap SQL is **hand-curated** by the author
when they edit content. The JS files are deleted in this refactor. The
generator script is provided as a one-shot helper that ingests the
existing JS files into the bootstrap for the migration cutover, then is
deleted too.

## Current schema inventory

Reference data (droppable, recreatable from `000_bootstrap.sql`):

| Table            | Source of truth (after refactor)                |
|------------------|-------------------------------------------------|
| `vocab`          | `000_bootstrap.sql` (was `002` + `011`)         |
| `vocab_translation` | same bootstrap                                |
| `vocab_hint`     | same bootstrap                                  |
| `theme`          | same bootstrap (was `003` + `007` + `011-014` + `019` + `022` + `026` + `030` + `031`) |
| `theme_vocab`    | derived from `vocab.themeIds`; in bootstrap     |
| `theme_section`  | theme content JSONB; in bootstrap               |
| `theme_verb`     | in bootstrap (was `003` + `004_seed_stem_changing_verbs.sql`) |

User data (preserved across refresh):

| Table                  | Why preserved                                       |
|------------------------|-----------------------------------------------------|
| `user`                 | account                                             |
| `refresh_token`        | sessions — drop = force re-login                   |
| `srs_card`             | per-user SRS state                                  |
| `review`               | review history                                      |
| `theme_progress`       | per-user theme completion/score                     |
| `user_daily_stat`      | streaks                                             |
| `user_mnemonic`        | user's mnemonic override                            |
| `vocab_note`           | user's free-form note                               |
| `exercise_note`        | user's free-form note on a write-answer exercise    |
| `exercise_card`        | SRS state for write-answer exercises                |
| `user_vocab`           | user-authored cards                                 |
| `email_attempt`        | email-writing attempts                              |
| `email_added_vocab`    | vocab harvested from email attempts                 |
| `user_write_exercise`  | user-authored write-answer exercises                |
| `conjugation_card`     | per-user conjugation SRS state                      |
| `ai_request_log`       | admin observability                                 |

FK cross-check (from the analysis in the prior plan): `srs_card.vocab_id`
and `review.vocab_id` FKs were already dropped in `025`. `theme_progress.theme_id`
still has an FK to `theme(id)` — the bootstrap drops this as part of the
DDL. User progress becomes a dangling-string reference; the lookup logic
in `routes/progress.js` already does a `SELECT ... FROM theme WHERE id = $1`
and returns 404 if missing, which is the desired behavior.

## New migration structure

```
server/src/db/
  migrate.js                  # entry point
  schema.sql                  # frozen DDL for ALL tables
  migrations/
    000_bootstrap.sql         # DDL + reference-data seed
    001_*.sql … 099_*.sql     # additive schema-only migrations
```

`migrate.js` flow:

```
function migrate():
  1. CREATE TABLE IF NOT EXISTS _migrations (
       name VARCHAR(255) PRIMARY KEY,
       applied_at TIMESTAMPTZ DEFAULT NOW()
     )
  2. SELECT 1 FROM _migrations WHERE name = '000_bootstrap.sql'
     - if present:
       - run additive migrations (001..N) that aren't yet applied
       - exit
  3. (legacy DB) detect any of the historical files in _migrations
     - print squash warning
     - INSERT INTO _migrations (name) VALUES ('000_bootstrap.sql')
       ON CONFLICT DO NOTHING
     - (no SQL re-run; schema already exists)
     - rebuild reference tables by running DROP + INSERT from bootstrap
     - exit
  4. (empty DB) run 000_bootstrap.sql verbatim
     - records itself in _migrations
     - exit
```

The "rebuild reference tables" step is a separate function that:
- Drops `theme_verb`, `theme_section`, `theme_vocab`, `theme`,
  `vocab_hint`, `vocab_translation`, `vocab` CASCADE
- Re-runs the CREATE TABLE statements from `000_bootstrap.sql`
  (which are pure DDL, no INSERTs)
- Runs the INSERT statements from `000_bootstrap.sql`
- Marks `srs_card.archived_at = NOW()` for rows whose `vocab_id` no
  longer exists in the rebuilt `vocab` table

For the legacy-DB case, we **don't re-run the INSERTs from bootstrap** —
the bootstrap is canonical going forward. The legacy DB already has the
right rows from the cumulative effect of the 33 old migrations. The
detection step is essentially "skip bootstrap; optionally rebuild
reference data from bootstrap for hygiene". We rebuild once and then
never touch reference data again except via a new bootstrap.

For the empty-DB case, we run the whole `000_bootstrap.sql`.

For a running prod DB upgraded mid-flight: detection of `_migrations`
rows matching the legacy filenames triggers the squash warning, the
bootstrap row gets marked, and the reference tables are rebuilt from
the bootstrap contents. User tables are untouched.

### Why CASCADE DROP is safe

1. No FK points from a user table into a reference table (verified
   above; `srs_card.vocab_id`, `review.vocab_id` already have no FK,
   `theme_progress.theme_id` FK is dropped as part of bootstrap DDL).
2. Reference-only FKs (`theme_vocab.vocab_id` → `vocab(id)`,
   `theme_section.theme_id` → `theme(id)`, etc.) get rebuilt inside
   the same transaction.

## Bootstrap structure

`000_bootstrap.sql` is a single SQL file with two logical sections
separated by `-- ===== REFERENCE SCHEMA =====` and
`-- ===== REFERENCE DATA =====` comments so the rebuild script can split
it cleanly:

```sql
-- 000_bootstrap.sql
-- This file is the canonical seed for all reference data in the app.
-- Re-running it is safe: schema.sql + reference-data.sql together form
-- the canonical state. User tables are NOT touched by this file.

BEGIN;

-- ===== REFERENCE SCHEMA =====
DROP TABLE IF EXISTS theme_verb CASCADE;
DROP TABLE IF EXISTS theme_section CASCADE;
DROP TABLE IF EXISTS theme_vocab CASCADE;
DROP TABLE IF EXISTS theme CASCADE;
DROP TABLE IF EXISTS vocab_hint CASCADE;
DROP TABLE IF EXISTS vocab_translation CASCADE;
DROP TABLE IF EXISTS vocab CASCADE;

CREATE TABLE vocab (
  id            VARCHAR(10) PRIMARY KEY,
  target        VARCHAR(100) NOT NULL,
  ipa           VARCHAR(100),
  gender        VARCHAR(1) CHECK (gender IN ('m', 'f', 'n')),
  freq          INT,
  theme         VARCHAR(50),
  source        VARCHAR(10) NOT NULL DEFAULT 'seed',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vocab_translation (...);
CREATE TABLE vocab_hint (...);
CREATE TABLE theme (...);            -- includes lang, pack_id, "order"
CREATE TABLE theme_vocab (...);
CREATE TABLE theme_section (...);    -- content JSONB
CREATE TABLE theme_verb (...);

-- ===== USER SCHEMA (DDL only; created on first run, never dropped) =====
-- CREATE TABLE "user" (...);
-- ... (everything that lives across reference rebuilds)

COMMIT;

-- ===== REFERENCE DATA =====
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES
  ('fr_001', 'bonjour', '/bɔ̃.ʒuʁ/', NULL, 1, 'greetings'),
  ('fr_002', 'merci',   '/mɛʁ.si/',  NULL, 2, 'greetings'),
  ...
;

INSERT INTO vocab_translation ...
INSERT INTO vocab_hint ...
INSERT INTO theme ...
INSERT INTO theme_vocab ...
INSERT INTO theme_section (theme_id, type, sort_order, content) VALUES
  ('fr_theme01', 'grammar', 0, '{"notes": [...]}'::jsonb),
  ...
;
INSERT INTO theme_verb ...

-- ===== ARCHIVE ORPHANED SRS CARDS =====
UPDATE srs_card SET archived_at = NOW()
WHERE archived_at IS NULL
  AND vocab_id NOT IN (SELECT id FROM vocab);
```

The bootstrap is ~9k lines (matches the size of the legacy JS files).
Single file, single source, fully self-contained. Reviewable in PR form.
Deletable without migration churn. Re-runnable idempotently.

## Migration runner behaviour in detail

```js
// migrate.js
import { pool } from './pool.js'
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const migrationsDir = join(__dirname, 'migrations')

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)

  const { rows: applied } = await pool.query(
    'SELECT name FROM _migrations ORDER BY name'
  )
  const appliedSet = new Set(applied.map(r => r.name))

  // 1. Bootstrap path (empty DB or first-time run after the refactor).
  if (!appliedSet.has('000_bootstrap.sql')) {
    if (applied.length > 0) {
      // Legacy DB upgrading in place.
      console.log(
        '[migrate] legacy DB detected; squashing historical migrations into 000_bootstrap.sql'
      )
      await pool.query(
        `INSERT INTO _migrations (name) VALUES ('000_bootstrap.sql')
         ON CONFLICT DO NOTHING`
      )
    } else {
      // Empty DB; run the whole bootstrap.
      console.log('  apply: 000_bootstrap.sql')
      const sql = readFileSync(join(migrationsDir, '000_bootstrap.sql'), 'utf8')
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        await client.query(sql)
        await client.query(
          `INSERT INTO _migrations (name) VALUES ('000_bootstrap.sql')
           ON CONFLICT DO NOTHING`
        )
        await client.query('COMMIT')
      } catch (err) {
        await client.query('ROLLBACK')
        throw err
      } finally {
        client.release()
      }
    }
  }

  // 2. Additive migrations (001..N), skipping anything already applied.
  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .filter(f => f !== '000_bootstrap.sql')  // bootstrap handled above
    .sort()

  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`  skip: ${file}`)
      continue
    }
    console.log(`  apply: ${file}`)
    const sql = readFileSync(join(migrationsDir, file), 'utf8')
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query(
        `INSERT INTO _migrations (name) VALUES ($1)
         ON CONFLICT DO NOTHING`,
        [file]
      )
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      console.error(`Migration ${file} failed:`, err.message)
      process.exit(1)
    } finally {
      client.release()
    }
  }

  console.log('Migrations complete.')
}
```

The 33 historical migration files are moved to
`server/src/db/migrations/_archive/` (kept in git for traceability of
past decisions; the runner filters them out via the `_` prefix). After
one release, the archive can be deleted.

## Dynamic user-override rendering

The existing fallback chain (used in `Flashcard.jsx`, `VocabCard.jsx`,
`ConjugationExercise.jsx`, `CardsPage.jsx`) already does what we need:

```js
const hint = userMnemonic || word.hint || hints[word.id] || ''
```

This falls back through: user override → per-vocab DB hint → bundled
language-hint map → empty. After the refactor the bundled language-hint
map is gone (it lived in `src/data/courses/{fr,pl}/hints/{ru,pl}.js`),
so the chain becomes:

```js
const hint = userMnemonic || word.hint || ''
```

Where `word.hint` comes from the API in the language that matches the
user's native_lang. We resolve the hint server-side in `/api/themes/:id`
(returns the per-vocab hint for the user's `native_lang`) and in the
vocab listing endpoints (`/api/study/cards`, `/api/study/due`,
`/api/study/new`, `/api/vocab`, etc.).

### Centralised resolver

```js
// src/lib/displayHint.js (new)
export function resolveHint({ userMnemonic, builtinHint }) {
  return userMnemonic || builtinHint || ''
}
```

Used by the three component sites. Trivially small; the win is one
place to change the policy if we ever want to add a third tier (e.g.
a shared mnemonics pool).

### Stale-vocab indicator

When the reference rebuild removes a vocab id the user has memorized,
the current flow silently hides the card from the study queue (existing
logic in `study.js`). To prevent silent data loss:

1. Add `srs_card.archived_at TIMESTAMPTZ` (nullable, indexed). The
   bootstrap archive step marks every existing `srs_card` whose
   `vocab_id` no longer appears in `vocab` with `archived_at = NOW()`.
2. The study queue filters out archived rows by default; the cards page
   shows them in a separate section (out of scope for this refactor).
3. `user_mnemonic` and `vocab_note` rows for missing vocab ids are
   preserved unchanged. They surface in the UI under the user's
   vocabulary list (out of scope; flagged for follow-up).

The minimal change here is the `archived_at` column and the bootstrap
archive step. Surfacing archived cards in the UI is follow-up.

## API surface changes

The existing routes already return most of what we need; we extend
them to include everything the JS files used to provide.

### Existing routes (extend, don't replace)

- `GET /api/themes` — already returns theme rows.
- `GET /api/themes/:id` — already returns sections, verbs, vocab. Extend
  to return `sections[].content` as parsed JSON (currently returns the
  raw JSONB string).
- `GET /api/vocab` — already returns vocab with translations. Add
  `examples` and `lexicon` (joined from `vocab_example` and
  `vocab_lexicon` tables — see schema additions below).
- `GET /api/vocab/:id` — already returns vocab + translations + hints.
- `GET /api/study/cards` — already returns SRS cards with vocab joined.
- `GET /api/study/due`, `/api/study/new` — same shape.

### New routes (only what the JS files used to provide)

- `GET /api/themes/:id/conjugations` — returns the per-verb conjugation
  array for a theme and a target language. Backed by a new
  `theme_conjugation` table (added to `000_bootstrap.sql` schema).

### New tables added to the bootstrap DDL

To match the JS data shape exactly:

```sql
CREATE TABLE vocab_example (
  vocab_id VARCHAR(10) REFERENCES vocab(id) ON DELETE CASCADE,
  sort_order INT NOT NULL,
  lang VARCHAR(5) NOT NULL,     -- 'fr', 'pl', etc. (the SOURCE lang of the sentence)
  source_text TEXT NOT NULL,    -- the source sentence (fr or pl)
  target_text TEXT NOT NULL,    -- the native translation (ru)
  PRIMARY KEY (vocab_id, sort_order)
);

CREATE TABLE vocab_lexicon (
  vocab_id VARCHAR(10) PRIMARY KEY REFERENCES vocab(id) ON DELETE CASCADE,
  synonyms TEXT[],              -- array of related words
  usage TEXT,                   -- when/how to use (native lang)
  semantics TEXT                -- meaning nuances vs. synonyms (native lang)
);

CREATE TABLE theme_conjugation (
  theme_id VARCHAR(10) REFERENCES theme(id) ON DELETE CASCADE,
  infinitive VARCHAR(50) NOT NULL,
  lang VARCHAR(5) NOT NULL,     -- native lang of the conjugated forms (ru, pl)
  forms TEXT[] NOT NULL,        -- ['говорю', 'говоришь', ...]
  PRIMARY KEY (theme_id, infinitive, lang)
);
```

`theme_section.content` already holds the rich JSON (notes, tables,
matching exercises, write-answer exercises); no schema change there.

### Frontend fetch changes

The client-side fetches replace the JS imports. Roughly:

| Current (JS import)                        | After (API fetch)                                |
|--------------------------------------------|--------------------------------------------------|
| `import { VOCAB } from '.../fr/vocab'`     | fetch `/api/vocab?targetLang=fr` (already in `getVocab`) |
| `import { getHintsByLang } from '...'`     | vocab rows already include `hint` field per native_lang |
| `import { VOCAB }` for `themeIds` mapping  | `/api/themes/:id` already returns `vocabIds`     |
| `import { THEME01_RU_CONJUGATIONS }`      | `/api/themes/:id/conjugations?lang=ru`           |
| `import { EXAMPLES } from '.../fr/examples'` | `/api/vocab/:id` extended to include examples  |
| `import { LEXICON } from '.../fr/lexicon'` | `/api/vocab/:id` extended to include lexicon    |
| `import { themes } from '.../theme01...'`  | `/api/themes/fr_theme01`                        |
| `import { getThemes } from '.../courses'`  | `/api/themes` (already exists)                  |

`src/utils/progress.js` currently imports `VOCAB` to look up vocab by id
and filter by themeIds. After the refactor, it operates on the in-memory
state already fetched by the user progress context (which is fed by
`/api/study/cards`, `/api/study/due`, etc.). The standalone `VOCAB`
import is removed.

### `lessonPacks.js` deletion

`src/data/lessonPacks.js` defines packs as static JS data. Two options:

(a) **Keep `lessonPacks.js` as a client-side config.** It describes UI
    metadata (title, shortTitle, subtitle, badge, level, primaryRoute)
    that's not in the DB. Move it to `src/data/lessonPacks.js` as-is
    (no source-of-truth conflict: the DB doesn't have these fields
    yet, and adding them would be a UI config concern, not course
    content).

(b) **Move pack metadata into the DB** as a `lesson_pack` table. More
    work, less JS, but the existing migration history shows pack
    reorgs are real and frequent (migrations 026, 028, 029, 032).

We pick (a) for this refactor. Pack metadata stays in JS; theme-to-pack
mapping stays in JS. The DB holds the themes themselves. This is a
deliberate carve-out because the JS file is configuration (no content),
not data.

## Concrete file-level changes

### New files

- `server/src/db/schema.sql` — frozen DDL for user + reference tables
  (the schema part of `000_bootstrap.sql`).
- `server/src/lib/displayHint.js` — central hint resolver.
- `server/src/db/migrations/000_bootstrap.sql` — schema + reference data
  (single canonical seed).

### Modified files

- `server/src/db/migrate.js` — new bootstrap flow; legacy detection.
- `server/src/db/pool.js` — unchanged.
- `server/src/routes/themes.js` — parse `theme_section.content` as JSON;
  optionally include examples.
- `server/src/routes/vocab.js` — include `examples` and `lexicon`.
- `server/src/routes/study.js` — pass native_lang so hint is included
  per-card; reject archived rows in `/due` and `/new`.
- `src/components/study/Flashcard.jsx` — switch to `resolveHint`.
- `src/components/vocab/VocabCard.jsx` — switch to `resolveHint`.
- `src/components/study/ConjugationExercise.jsx` — switch to
  `resolveHint`; replace VOCAB import with vocab from props.
- `src/components/study/ConjugationSession.jsx` — fetch theme
  conjugations via API instead of importing `themes` from JS.
- `src/components/themes/VocabSection.jsx` — replace VOCAB import with
  props.
- `src/components/cards/UserCardModal.jsx` — no change needed (uses
  `getThemeTitle` from API-backed `getThemes`).
- `src/pages/CardsPage.jsx` — switch to `resolveHint`.
- `src/pages/DashboardPage.jsx`, `LearnPage.jsx`, `StudyPage.jsx`,
  `ThemePage.jsx`, `ThemesListPage.jsx`, `TrainingPage.jsx`,
  `EmailPage.jsx` — `getThemes`/`getVocab` now go through API.
- `src/main.jsx` — `getThemes()` call for invariant check now async.
- `src/utils/progress.js` — remove `VOCAB` import; operate on in-memory
  state.
- `src/api/client.js` — add new methods for the new endpoints
  (`themeApi.getConjugations(themeId, lang)`, etc.).

### Removed files

- `server/src/db/migrations/001_initial.sql` through
  `server/src/db/migrations/033_drop_ai_helper_tables.sql` — moved to
  `server/src/db/migrations/_archive/`.
- `src/data/courses/` — entire directory.
- `src/data/courses/index.js` — entire file.
- (NOT removed: `src/data/lessonPacks.js` — UI config.)

## Migration of existing JS data into the bootstrap

A one-shot generator reads the existing JS files and produces the
INSERTs that go into `000_bootstrap.sql`. We commit both the generator
and its output; the generator is then deleted from the repo once the
bootstrap is verified to be correct.

```js
// scripts/_legacy/generate-bootstrap.mjs (deleted after one release)
import { writeFileSync } from 'fs'
import { VOCAB as FR_VOCAB } from '../../src/data/courses/fr/vocab.js'
import { VOCAB as PL_VOCAB } from '../../src/data/courses/pl/vocab.js'
import { hints as RU_HINTS } from '../../src/data/courses/fr/hints/ru.js'
import { hints as PL_HINTS } from '../../src/data/courses/fr/hints/pl.js'
import { LEXICON as FR_LEXICON } from '../../src/data/courses/fr/lexicon.js'
import { EXAMPLES as FR_EXAMPLES } from '../../src/data/courses/fr/examples.js'
import { THEMES as FR_THEMES } from '../../src/data/courses/fr/index.js'
import { THEMES as PL_THEMES } from '../../src/data/courses/pl/index.js'
import { THEME01_RU_CONJUGATIONS } from '../../src/data/courses/fr/themes/theme01-conjugations-ru.js'
import { THEME02_RU_CONJUGATIONS } from '../../src/data/courses/fr/themes/theme02-conjugations-ru.js'
import { THEME01_PL_CONJUGATIONS } from '../../src/data/courses/fr-pl/conjugations/theme01-conjugations-pl.js'

// Build INSERTs for vocab, vocab_translation, vocab_hint,
// vocab_example, vocab_lexicon, theme, theme_vocab,
// theme_section, theme_verb, theme_conjugation.
// Write to migrations/000_bootstrap.sql
```

The generator is used **once** to produce the bootstrap. After that,
the bootstrap is the source of truth and the generator is deleted.

## Verification plan

1. **Unit: schema DDL is byte-identical** to the post-033 cumulative
   schema. Generate both and `diff`. Captured in
   `server/tests/schema-shape.test.mjs`.
2. **Integration: migrate against an empty DB.** Boots clean, bootstrap
   populates `vocab` with the same row count as the legacy
   `002 + 011` combined (FR: 392 rows; PL: ~210 rows; counts asserted).
3. **Integration: migrate against a legacy DB.** Loads a fixture DB
   with all 33 migrations applied + 100 fake users with SRS state.
   Runner detects legacy state, marks baseline, rebuilds reference
   tables from bootstrap. Asserts: every user's `srs_card` count
   unchanged, every `user_mnemonic` row unchanged, every
   `theme_progress` row unchanged.
4. **Regression: a content edit rebuilds cleanly.** Edit
   `000_bootstrap.sql` (e.g. change a translation). Re-run the runner
   in "rebuild reference" mode. Assert: the rebuilt `vocab_translation`
   row reflects the edit; an existing user's `srs_card` for that vocab
   id is unchanged; `archived_at` stays NULL for that vocab.
5. **Regression: removed vocab gets archived.** Delete a vocab INSERT
   from `000_bootstrap.sql`. Re-run. Assert: user's SRS card for that
   vocab gets `archived_at = NOW()`; `user_mnemonic` and `vocab_note`
   rows are preserved.
6. **Smoke: the study UI renders the right hint.** Manual smoke test:
   - Set a user_mnemonic for `fr_001`. Visit the cards page. Hint
     shows user value.
   - Delete user_mnemonic. Hint shows the DB hint (from
     `vocab_hint` for native_lang=ru).
   - Delete the `vocab_hint` row. Hint is empty.
7. **Frontend fetches work end to end.** Manual smoke test: open the
   cards page, dashboard, study session, theme view, vocabulary page.
   All reference data renders identically to the JS-backed version.
8. **Backup/restore round-trip.** Export a fixture user before the
   migration; import after; assert identical state.

Steps 1-5 are mandatory for the refactor to land. Step 6-7 are manual
smoke; one minimal unit test wires `resolveHint`. Step 8 is regression
coverage for the export/import pipeline.

## Risks and mitigations

- **Risk: bootstrap INSERTs drift from runtime expectations.** Mitigated
  by `000_bootstrap.sql` being committed to git and reviewed as one file.
- **Risk: schema.sql diverges from a real DB after a content
  refactor.** Mitigated by the schema-shape test asserting the DDL
  matches the post-033 state.
- **Risk: prod DB upgrade path.** Documented in `migrate.js` itself via
  the legacy-detection warning. For prod, the deployer runs the new
  migration; the runner detects the legacy state, marks baseline, and
  rebuilds reference tables from bootstrap. No data loss because user
  tables are untouched.
- **Risk: removing the JS files breaks the test suite.** Mitigated by
  `grep -r data/courses src/` as a pre-merge gate. Any remaining
  reference is a build failure.
- **Risk: archived cards pile up.** Mitigated by archiving with a
  nullable `archived_at`; the row stays. A future follow-up can add a
  cleanup migration.

## Out of scope (explicitly deferred)

- Surfacing archived vocab in the UI (separate UX task).
- A "merge two vocab ids" admin tool (separate UX task).
- Moving pack metadata from `lessonPacks.js` to a DB table. Kept in JS
  for this refactor; can be moved later if pack churn justifies it.

## Open questions for the user before implementation

None. The plan is ready to execute.
