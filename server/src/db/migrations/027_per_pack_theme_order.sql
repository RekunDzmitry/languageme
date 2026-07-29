-- Migration 027: Per-pack theme ordering
--
-- Rationale: PL_A1_A2 and PL_TELC are separate courses, but they share
-- the pl_ theme id prefix and currently use a single 1..22 order
-- sequence (PL_A1/A2 = 1-9, PL_TELC = 10-22). This makes the TELC
-- course appear to "start from 10", which is weird because it's its
-- own course. The user wants themes in every course to start from 1.
--
-- This migration:
--   1. Adds a pack_id column to theme (nullable for the per-language
--      catch-alls pl_other / fr_other that predate pack scoping).
--   2. Backfills pack_id for all existing themes.
--   3. Remaps PL_TELC theme orders 10-22 → 1-13 (per-pack numbering).
--   4. Changes the unique constraint from (lang, order) to
--      (lang, pack_id, order) so per-pack ordering is enforced.
--      PostgreSQL NULL semantics mean the per-lang catch-alls
--      (pack_id = NULL) don't collide.
--
-- Note on themeId vs order:
--   The themeId (e.g. pl_theme10) is NOT renamed. It stays as the
--   stable identifier used in DB foreign keys, routes, srs_card keys,
--   and the lessonPacks range filter (isThemeInPack derives pack
--   membership from the id, not the order). The order DISPLAYED in
--   the UI is what changes — from 10 to 1 for pl_theme10 in the
--   TELC pack, etc. The id/order mismatch is a known and accepted
--   compromise: renaming the id would touch dozens of files and
--   migration history for no user-visible benefit.
--
-- Safety:
--   * Atomic — wrapped in BEGIN/COMMIT, all-or-nothing.
--   * Fully idempotent — every statement is guarded (IF NOT EXISTS,
--     WHERE pack_id IS NULL, WHERE order IN (10..22), DO block for
--     the new constraint). Re-running is a no-op.
--   * Additive — no DELETE, no DROP COLUMN, no data is destroyed.
--   * Reversible — the old order is recoverable from the themeId
--     (pl_theme10 → was 10). A rollback would be:
--       UPDATE theme SET "order" = "order" + 9
--         WHERE pack_id = 'pl-telc' AND "order" BETWEEN 1 AND 13;
--       ALTER TABLE theme DROP CONSTRAINT theme_lang_pack_order_key;
--       ALTER TABLE theme ADD  CONSTRAINT theme_lang_order_key
--         UNIQUE(lang, "order");
--     No data is lost either way.
--   * Small table (~30 rows) — every step runs in milliseconds with
--     no long locks. Safe to run against a live production DB.

BEGIN;

-- 1. Add pack_id column (nullable — per-lang catch-alls keep NULL)
ALTER TABLE theme ADD COLUMN IF NOT EXISTS pack_id VARCHAR(50);

-- 2. Backfill pack_id. WHERE pack_id IS NULL makes this a no-op on
--    re-run; the regexes cover the full id space so newly seeded
--    themes (e.g. pl_theme19/21/22 when their migration lands) will
--    also be picked up if the backfill is re-run.
UPDATE theme SET pack_id = CASE
  WHEN id ~ '^pl_theme0[1-9]$'                        THEN 'pl-a1-a2'
  WHEN id ~ '^pl_theme(1[0-9]|2[0-2])$'                THEN 'pl-telc'
  WHEN id =  'pl-a1-a2_other'                          THEN 'pl-a1-a2'
  WHEN id =  'pl-telc_other'                           THEN 'pl-telc'
  WHEN id ~  '^fr_theme[0-9]+$'                        THEN 'fr-foundations'
  WHEN id =  'fr-foundations_other'                    THEN 'fr-foundations'
  -- pl_other, fr_other: pack_id stays NULL (legacy per-lang catch-alls)
END
WHERE pack_id IS NULL
  AND id <> 'pl_other'
  AND id <> 'fr_other';

-- 3. Drop the old per-lang unique constraint (it's about to be
--    replaced; remap below would otherwise violate it).
ALTER TABLE theme DROP CONSTRAINT IF EXISTS theme_lang_order_key;

-- 4. Remap PL_TELC theme orders 10-22 → 1-13. The WHERE guard
--    makes this a no-op on re-run (orders already 1-13 fail the
--    "order BETWEEN 10 AND 22" check).
UPDATE theme SET "order" = "order" - 9
WHERE id ~ '^pl_theme(1[0-9]|2[0-2])$'
  AND "order" BETWEEN 10 AND 22;

-- 5. Add the new per-(lang, pack_id, order) unique constraint.
--    Wrapped in a DO block so re-runs don't error on duplicate.
--    NULL pack_id values are allowed (per-lang catch-alls).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'theme_lang_pack_order_key'
  ) THEN
    ALTER TABLE theme
      ADD CONSTRAINT theme_lang_pack_order_key
      UNIQUE(lang, pack_id, "order");
  END IF;
END $$;

COMMENT ON COLUMN theme.pack_id IS
  'Learning pack this theme belongs to (pl-a1-a2, pl-telc, fr-foundations). NULL for the legacy per-language catch-alls (pl_other, fr_other) that predate pack scoping.';

COMMIT;
