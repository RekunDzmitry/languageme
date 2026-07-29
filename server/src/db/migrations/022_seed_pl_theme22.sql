-- Migration 022: Seed pl_theme22 (E-mail: struktura i zwroty)
-- Email correction drills from AI-evaluated email exercises are auto-filed
-- under this theme instead of general vocabulary/grammar themes.
--
-- Ordering: pl_theme22 lives in the PL_TELC pack, which uses per-pack
-- numbering 1-13 (see 027_per_pack_theme_order.sql for the rationale).
-- This migration inserts the row with the correct pack_id and order
-- so the values are right regardless of whether 022 lands before or
-- after 027:
--   * If 022 runs first, the pack_id column doesn't exist yet — we
--     add it here (idempotently) and insert with the right value.
--     027's backfill will be a no-op for this row, and the remap
--     guard ("order BETWEEN 10 AND 22") will skip it because we
--     already inserted with order = 13.
--   * If 027 runs first, the pack_id column already exists, the
--     ALTER TABLE is a no-op (IF NOT EXISTS), and the INSERT lands
--     with the right values.
--
-- IMPORTANT: this file replaces the version on feature/user-authored-cards
-- (which inserted with order = 22 and no pack_id). When that branch is
-- merged, take THIS version of the file.

-- Ensure pack_id column exists (added by 027; mirrored here so this
-- migration is self-contained regardless of merge order)
ALTER TABLE theme ADD COLUMN IF NOT EXISTS pack_id VARCHAR(50);

INSERT INTO theme (id, lang, pack_id, "order", title, title_ru, description, description_ru)
VALUES ('pl_theme22', 'pl', 'pl-telc', 13, 'Mail — struktura i zwroty', 'E-mail: структура и фразы',
        'Struktura listu, formuły oficjalne i nieoficjalne: początek, główna treść i zakończenie maila',
        'Структура письма, официальные и неофициальные формулы, начало, основная часть и завершение maila')
ON CONFLICT (id) DO NOTHING;
