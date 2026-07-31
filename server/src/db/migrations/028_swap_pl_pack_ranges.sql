-- Migration 028: Mirror the PL pack reorg in theme.pack_id
--
-- Rationale: the polish-themes reorg reassigns each pl_themeNN to a
-- pack based on the kind of exercises it carries. Migration 028 is
-- the initial range swap (the building block 032 refines):
--   - themes 01-09 (orthography) -> pl-telc
--   - themes 10-22 (rest)       -> pl-a1-a2
-- 032 then moves 10-18, 19, 22 from pl-a1-a2 to pl-telc so the final
-- state is:
--   PL_TELC:  themes 01-09, 10-18, 19, 22
--   PL_A1/A2: themes 20, 21
--
-- Idempotency: every UPDATE is guarded by WHERE clauses that match
-- the current pack_id and id, so a re-run is a no-op. Constraint
-- DROPs/ADDs are IF [NOT] EXISTS guarded.
--
-- Safety: atomic, idempotent, additive, reversible.

BEGIN;

ALTER TABLE theme ADD COLUMN IF NOT EXISTS pack_id VARCHAR(50);
ALTER TABLE theme DROP CONSTRAINT IF EXISTS theme_lang_order_key;

UPDATE theme SET pack_id = 'pl-telc'
WHERE id ~ '^pl_theme0[1-9]$' AND pack_id <> 'pl-telc';

UPDATE theme SET pack_id = 'pl-a1-a2'
WHERE id ~ '^pl_theme(1[0-9]|2[0-2])$' AND pack_id <> 'pl-a1-a2';

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
