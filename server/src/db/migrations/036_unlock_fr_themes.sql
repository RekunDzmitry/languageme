-- Migration 036: unlock all French themes
--
-- Why: mirrors the polish-themes unlock pattern (pl_themeXX rows are seeded
-- with unlock_theme_id = NULL in 000_bootstrap.sql). The bootstrap now seeds
-- fr_theme02..31 with NULL too, but live databases whose _migrations row
-- already contains 000_bootstrap.sql are NOT re-seeded by the runner —
-- server/src/db/migrate.js:131-152 only refreshes the bootstrap on subsequent
-- runs (it does not drop+recreate on already-applied DBs in the additive
-- phase). This migration backfills those rows in place so the API gate at
-- server/src/routes/progress.js:42 (GET /themes/:themeId/unlock) returns
-- unlocked:true for every authenticated user, regardless of prior progress.
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
