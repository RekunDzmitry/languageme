-- Migration 022: Seed pl_theme22 (E-mail: struktura i zwroty)
-- Email correction drills from AI-evaluated email exercises are auto-filed
-- under this theme instead of general vocabulary/grammar themes.
--
-- Ordering: pl_theme22 lives in the PL_TELC pack, which uses per-pack
-- numbering 1-13 (see 027_per_pack_theme_order.sql for the rationale).
-- This migration inserts the row with the correct pack_id and order
-- so the values are right regardless of whether 022 lands before or
-- after 027.
--
-- Constraint handling: migration 015 created UNIQUE(lang, "order").
-- Inserting pl_theme22 with order = 13 would collide with the
-- existing pl_theme13 (which already holds (pl, 13)) under that
-- constraint. 022 therefore drops the old constraint, inserts,
-- and adds the new per-(lang, pack_id, order) constraint that 027
-- would otherwise introduce. 027's matching operations (DROP old
-- constraint, ADD new constraint) are no-ops in this ordering.
--
-- Merge-order analysis (safe in all combinations):
--   * 022 → 027: 022 drops the old constraint, inserts pl_theme22
--     with order = 13 and pack_id = 'pl-telc', adds the new
--     constraint. 027's backfill is a no-op for pl_theme22, the
--     remap guard "order BETWEEN 10 AND 22" skips it (order is
--     already 13), the DROP CONSTRAINT is a no-op, and the ADD
--     CONSTRAINT is a no-op.
--   * 027 → 022: 027 runs, adds pack_id column, backfills, remaps
--     the other 12 TELC themes, drops the old constraint, adds
--     the new constraint. Then 022 runs: DROP CONSTRAINT is a
--     no-op (already dropped), INSERT lands with pack_id =
--     'pl-telc' and order = 13 (unique under the new constraint),
--     ADD CONSTRAINT is a no-op (already added).
--   * Same deploy: equivalent to 022 → 027.
--
-- The new constraint is added in 022 (not just 027) so the DB is
-- never left without a unique constraint on theme ordering, even
-- if 027 is never deployed or is deployed much later.
--
-- IMPORTANT: this file replaces the version on feature/user-authored-cards
-- (which inserted with order = 22 and no pack_id). When that branch is
-- merged, take THIS version of the file.

BEGIN;

-- Drop the per-lang unique constraint from migration 015 so the
-- INSERT with order = 13 doesn't collide with pl_theme13.
-- 027 also drops this; whichever runs second is a no-op.
ALTER TABLE theme DROP CONSTRAINT IF EXISTS theme_lang_order_key;

-- Ensure pack_id column exists (added by 027; mirrored here so this
-- migration is self-contained regardless of merge order)
ALTER TABLE theme ADD COLUMN IF NOT EXISTS pack_id VARCHAR(50);

-- Insert pl_theme22 with per-pack values
INSERT INTO theme (id, lang, pack_id, "order", title, title_ru, description, description_ru)
VALUES ('pl_theme22', 'pl', 'pl-telc', 13, 'Mail — struktura i zwroty', 'E-mail: структура и фразы',
        'Struktura listu, formuły oficjalne i nieoficjalne: początek, główna treść i zakończenie maila',
        'Структура письма, официальные и неофициальные формулы, начало, основная часть и завершение maila')
ON CONFLICT (id) DO NOTHING;

-- Add the new per-(lang, pack_id, order) unique constraint.
-- 027 also adds this in a DO block; its check finds the constraint
-- already exists and is a no-op. This means even if 027 is never
-- deployed (or is deployed much later), the DB is never left without
-- a unique constraint on theme ordering.
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

COMMIT;
