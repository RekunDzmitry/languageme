-- Migration 032: Polish pack reorg — final pack assignment
--
-- Rationale: the polish-themes reorg reassigns each pl_themeNN to a
-- pack based on the kind of exercises it carries:
--
--   PL_TELC (B1/B2 exam level) holds:
--     - orthography drills:        themes 01-09
--     - vocab / grammar:           themes 10-18
--     - email writing & phrases:   themes 19, 22
--   PL_A1/A2 holds:
--     - intro grammar / vocab:     themes 20, 21
--       (both demoted to vocab-only; no write_answer, no email)
--
-- Migration 028 (the basic range swap) put themes 10-22 in pl-a1-a2
-- and themes 01-09 in pl-telc. This migration refines that: themes
-- 10-18, 19 and 22 move from pl-a1-a2 to pl-telc. Themes 20 and 21
-- stay in pl-a1-a2.
--
-- After this migration, theme."order" is also recomputed so the
-- per-pack display order is contiguous starting at 1 in each pack:
--   pl-telc:  pl_theme01..22 (minus 20, 21) → orders 1-20
--   pl-a1-a2: pl_theme20, pl_theme21        → orders 1-2
--
-- Order-swap dance: the UNIQUE(lang, pack_id, "order") constraint
-- (added by 028) is dropped for the duration of the swap; the
-- moving rows change pack_id directly. The constraint is re-added
-- at the end. The +100 order-bump workaround that 0361e57 added is
-- no longer needed.
--
-- Idempotency: every UPDATE is guarded by WHERE clauses.
--
-- Safety: atomic, idempotent, additive.

BEGIN;

ALTER TABLE theme DROP CONSTRAINT IF EXISTS theme_lang_pack_order_key;

-- Step 1: Move themes 10-18, 19, 22 from pl-a1-a2 to pl-telc.
UPDATE theme SET pack_id = 'pl-telc' WHERE id IN (
  'pl_theme10', 'pl_theme11', 'pl_theme12', 'pl_theme13', 'pl_theme14',
  'pl_theme15', 'pl_theme16', 'pl_theme17', 'pl_theme18',
  'pl_theme19', 'pl_theme22'
) AND pack_id = 'pl-a1-a2';

-- Step 2: Themes 20, 21 stay in pl-a1-a2 (no-op guard, but explicit).
UPDATE theme SET pack_id = 'pl-a1-a2' WHERE id IN (
  'pl_theme20', 'pl_theme21'
) AND pack_id IS DISTINCT FROM 'pl-a1-a2';

-- Step 3: Recompute theme."order" so each pack's display order is
-- contiguous starting at 1.
-- pl-telc: 20 themes, orders 1..20. Themes 01-09 keep their natural
-- id-derived orders (1..9). Themes 10-18 get 10..18. Theme 19
-- gets 19. Theme 22 fills the gap left by themes 20, 21 (which
-- live in pl-a1-a2) and gets order 20.
UPDATE theme SET "order" = 1  WHERE id = 'pl_theme01' AND "order" <> 1;
UPDATE theme SET "order" = 2  WHERE id = 'pl_theme02' AND "order" <> 2;
UPDATE theme SET "order" = 3  WHERE id = 'pl_theme03' AND "order" <> 3;
UPDATE theme SET "order" = 4  WHERE id = 'pl_theme04' AND "order" <> 4;
UPDATE theme SET "order" = 5  WHERE id = 'pl_theme05' AND "order" <> 5;
UPDATE theme SET "order" = 6  WHERE id = 'pl_theme06' AND "order" <> 6;
UPDATE theme SET "order" = 7  WHERE id = 'pl_theme07' AND "order" <> 7;
UPDATE theme SET "order" = 8  WHERE id = 'pl_theme08' AND "order" <> 8;
UPDATE theme SET "order" = 9  WHERE id = 'pl_theme09' AND "order" <> 9;
UPDATE theme SET "order" = 10 WHERE id = 'pl_theme10' AND "order" <> 10;
UPDATE theme SET "order" = 11 WHERE id = 'pl_theme11' AND "order" <> 11;
UPDATE theme SET "order" = 12 WHERE id = 'pl_theme12' AND "order" <> 12;
UPDATE theme SET "order" = 13 WHERE id = 'pl_theme13' AND "order" <> 13;
UPDATE theme SET "order" = 14 WHERE id = 'pl_theme14' AND "order" <> 14;
UPDATE theme SET "order" = 15 WHERE id = 'pl_theme15' AND "order" <> 15;
UPDATE theme SET "order" = 16 WHERE id = 'pl_theme16' AND "order" <> 16;
UPDATE theme SET "order" = 17 WHERE id = 'pl_theme17' AND "order" <> 17;
UPDATE theme SET "order" = 18 WHERE id = 'pl_theme18' AND "order" <> 18;
UPDATE theme SET "order" = 19 WHERE id = 'pl_theme19' AND "order" <> 19;
UPDATE theme SET "order" = 20 WHERE id = 'pl_theme22' AND "order" <> 20;

-- pl-a1-a2: 2 themes (20, 21), orders 1..2.
UPDATE theme SET "order" = 1 WHERE id = 'pl_theme20' AND "order" <> 1;
UPDATE theme SET "order" = 2 WHERE id = 'pl_theme21' AND "order" <> 2;

-- Re-add the per-(lang, pack_id, "order") unique constraint.
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
