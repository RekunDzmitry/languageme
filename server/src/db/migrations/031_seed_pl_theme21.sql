-- Migration 031: Seed pl_theme21 (Czasowniki II koniugacji i rzeczowniki męskie)
--
-- Rationale: the front-end theme file theme21-verbs-2nd-conj.js
-- shipped but no DB seed migration was ever written for it. The
-- /api/themes?lang=pl endpoint only returns rows from the theme
-- table, so pl_theme21 was missing from the response.
--
-- pack_id is NULL here; 032 re-assigns it (final: pl-a1-a2). order
-- is set to a placeholder (999) since theme.order is NOT NULL; 032
-- overwrites it with the final per-pack order (2).
--
-- Idempotent: ON CONFLICT (id) DO NOTHING. Constraint additions
-- guarded with IF NOT EXISTS. Small table, single-row insert.

BEGIN;

ALTER TABLE theme DROP CONSTRAINT IF EXISTS theme_lang_order_key;
ALTER TABLE theme ADD COLUMN IF NOT EXISTS pack_id VARCHAR(50);

INSERT INTO theme (id, lang, pack_id, "order", title, title_ru, description, description_ru)
VALUES ('pl_theme21', 'pl', 'pl-a1-a2', 998,
        'Czasowniki II koniugacji i rzeczowniki męskie',
        'Глаголы 2-го спряжения и существительные мужского рода',
        'Спряжение глаголов на -isz/-ysz, склонение существительных мужского рода, liczba mnoga',
        'Спряжение глаголов на -isz/-ysz, склонение существительных мужского рода, liczba mnoga')
ON CONFLICT (id) DO NOTHING;

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
