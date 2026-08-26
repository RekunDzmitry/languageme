-- Migration 036: unlock all French themes
--
-- Why: mirrors the polish-themes unlock pattern (pl_themeXX rows are seeded
-- fr_theme02..31 with NULL too, and migrate.js:131-152 re-runs
-- 000_bootstrap.sql on every migrate (it DROP+recreates the theme table), so
-- a normal `npm run migrate` on an already-bootstrapped DB reaches the
-- unblocked state via the bootstrap alone. This 036 migration is kept as an
-- explicit, idempotent backfill record so the unlock intent is visible in the
-- migration history, and as a safety net for any future code path that runs
-- additive migrations without refreshing the bootstrap (e.g. partial-rerun
-- tooling). The API gate at server/src/routes/progress.js:42
-- (GET /themes/:themeId/unlock) returns unlocked:true for every authenticated
-- user once unlock_theme_id is NULL, regardless of prior progress.
--
-- Scope: fr_theme02..31 only. fr_theme01 already has NULL and is excluded
-- defensively to avoid a needless row rewrite. theme_progress rows are
-- untouched — users keep their earned completions and best_score history.
-- unlock_min_score is intentionally retained (still 60) so the column stays
-- consistent with pl_themeXX and the route can keep reading it.
--
-- Idempotent: UPDATE ... SET unlock_theme_id = NULL is a no-op once the
-- column is already NULL. Re-running this migration via `npm run migrate`
-- is safe; the runner's _migrations PK prevents re-execution of the file.
-- Transaction note: do NOT add BEGIN/COMMIT here. server/src/db/migrate.js:170-176

UPDATE theme
   SET unlock_theme_id = NULL
 WHERE id LIKE 'fr_theme%'
   AND id <> 'fr_theme01';
