-- Migration 035: add exercise_card.theme_id
--
-- Why: the bootstrap schema for exercise_card (000_bootstrap.sql:281)
-- never declared a theme_id column, but two study routes already
-- reference it as if it does:
--
--   - GET  /api/study/exercises    (study.js:265)  SELECT theme_id
--   - POST /api/study/exercises/review (study.js:308)  INSERT theme_id
--
-- The review route also validates `themeId` in the request body
-- (study.js:289), so the client always sends one. The column is
-- nullable because older rows predate this migration; new rows are
-- populated at INSERT time and can be backfilled from exercise_key
-- (which is `themeId:idx` per migration 006) if a query ever needs
-- them denormalised.
--
-- Archived migration 023 (rename_fr_themes_to_fr_prefix) also
-- updates exercise_card.theme_id, confirming the column was
-- intended to exist. exercise_note in the same family already
-- carries theme_id, so this brings exercise_card in line.
--
-- Idempotent: ADD COLUMN IF NOT EXISTS is a no-op on re-apply.

BEGIN;

ALTER TABLE exercise_card
  ADD COLUMN IF NOT EXISTS theme_id VARCHAR(50);

COMMIT;
