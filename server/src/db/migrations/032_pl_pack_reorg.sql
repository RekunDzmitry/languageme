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
-- Ordering safety: when we move a theme from pl-a1-a2 to pl-telc,
-- its order value (currently 1-13 in pl-a1-a2 per migration 027's
-- remap) collides with themes 01-09 in pl-telc that already hold
-- orders 1-9. We avoid the duplicate-key violation by bumping
-- the orders of the moving rows into a free range first, then
-- changing pack_id, then setting the final per-pack order.
--
-- Idempotency: every UPDATE is guarded by WHERE clauses.
--
-- Safety: atomic, idempotent, additive.

BEGIN;

-- Step 1: Bump the orders of the rows we're about to move so the
-- pack_id change doesn't violate UNIQUE(lang, pack_id, "order").
UPDATE theme SET "order" = "order" + 100
WHERE pack_id = 'pl-a1-a2'
  AND id IN (
    'pl_theme10', 'pl_theme11', 'pl_theme12', 'pl_theme13', 'pl_theme14',
    'pl_theme15', 'pl_theme16', 'pl_theme17', 'pl_theme18',
    'pl_theme19', 'pl_theme22'
  );

-- Step 2: Move themes 10-18, 19, 22 from pl-a1-a2 to pl-telc.
-- After the bump, the (pl, pl-telc, order) keys for these rows are
-- 101..112, which don't collide with the 1..9 used by themes 01-09.
UPDATE theme SET pack_id = 'pl-telc' WHERE id IN (
  'pl_theme10', 'pl_theme11', 'pl_theme12', 'pl_theme13', 'pl_theme14',
  'pl_theme15', 'pl_theme16', 'pl_theme17', 'pl_theme18'
) AND pack_id = 'pl-a1-a2';

UPDATE theme SET pack_id = 'pl-telc' WHERE id IN (
  'pl_theme19', 'pl_theme22'
) AND pack_id = 'pl-a1-a2';

-- Step 3: Themes 20, 21 stay in pl-a1-a2 (no-op guard, but explicit).
UPDATE theme SET pack_id = 'pl-a1-a2' WHERE id IN (
  'pl_theme20', 'pl_theme21'
) AND pack_id <> 'pl-a1-a2';

-- Step 4: Recompute theme."order" so each pack's display order is
-- contiguous starting at 1, with no gaps even when themes from
-- a different pack (20, 21) sit between members of this pack
-- in the theme-id order sequence.
--
-- pl-telc: 20 themes, orders 1..20. Themes 01-09 keep their natural
-- id-derived orders (1..9). Themes 10-18 get 10..18. Theme 19
-- gets 19. Theme 22 fills the gap left by themes 20, 21 (which
-- live in pl-a1-a2) and gets order 20.
UPDATE theme SET "order" = 1  WHERE pack_id = 'pl-telc' AND id = 'pl_theme01';
UPDATE theme SET "order" = 2  WHERE pack_id = 'pl-telc' AND id = 'pl_theme02';
UPDATE theme SET "order" = 3  WHERE pack_id = 'pl-telc' AND id = 'pl_theme03';
UPDATE theme SET "order" = 4  WHERE pack_id = 'pl-telc' AND id = 'pl_theme04';
UPDATE theme SET "order" = 5  WHERE pack_id = 'pl-telc' AND id = 'pl_theme05';
UPDATE theme SET "order" = 6  WHERE pack_id = 'pl-telc' AND id = 'pl_theme06';
UPDATE theme SET "order" = 7  WHERE pack_id = 'pl-telc' AND id = 'pl_theme07';
UPDATE theme SET "order" = 8  WHERE pack_id = 'pl-telc' AND id = 'pl_theme08';
UPDATE theme SET "order" = 9  WHERE pack_id = 'pl-telc' AND id = 'pl_theme09';
UPDATE theme SET "order" = 10 WHERE pack_id = 'pl-telc' AND id = 'pl_theme10';
UPDATE theme SET "order" = 11 WHERE pack_id = 'pl-telc' AND id = 'pl_theme11';
UPDATE theme SET "order" = 12 WHERE pack_id = 'pl-telc' AND id = 'pl_theme12';
UPDATE theme SET "order" = 13 WHERE pack_id = 'pl-telc' AND id = 'pl_theme13';
UPDATE theme SET "order" = 14 WHERE pack_id = 'pl-telc' AND id = 'pl_theme14';
UPDATE theme SET "order" = 15 WHERE pack_id = 'pl-telc' AND id = 'pl_theme15';
UPDATE theme SET "order" = 16 WHERE pack_id = 'pl-telc' AND id = 'pl_theme16';
UPDATE theme SET "order" = 17 WHERE pack_id = 'pl-telc' AND id = 'pl_theme17';
UPDATE theme SET "order" = 18 WHERE pack_id = 'pl-telc' AND id = 'pl_theme18';
UPDATE theme SET "order" = 19 WHERE pack_id = 'pl-telc' AND id = 'pl_theme19';
UPDATE theme SET "order" = 20 WHERE pack_id = 'pl-telc' AND id = 'pl_theme22';

-- pl-a1-a2: 2 themes (20, 21), orders 1..2.
UPDATE theme SET "order" = 1 WHERE pack_id = 'pl-a1-a2' AND id = 'pl_theme20';
UPDATE theme SET "order" = 2 WHERE pack_id = 'pl-a1-a2' AND id = 'pl_theme21';

COMMIT;
