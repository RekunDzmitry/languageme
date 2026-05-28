-- Scope theme.order uniqueness to (lang, order) instead of global unique.
-- This allows each language course to have its own 1..N sequence.

-- 1. Add lang column (default 'fr' since all existing themes were French-first)
ALTER TABLE theme ADD COLUMN lang VARCHAR(5) NOT NULL DEFAULT 'fr';

-- 2. Derive lang from id prefix
UPDATE theme SET lang = 'pl' WHERE id LIKE 'pl_%';

-- 3. Replace global UNIQUE on "order" with per-lang composite unique
ALTER TABLE theme DROP CONSTRAINT IF EXISTS theme_order_key;
ALTER TABLE theme ADD CONSTRAINT theme_lang_order_key UNIQUE(lang, "order");

-- 4. Fix Polish theme order values to their canonical 1-based sequence
UPDATE theme SET "order" = 1   WHERE id = 'pl_theme01';
UPDATE theme SET "order" = 2   WHERE id = 'pl_theme02';
UPDATE theme SET "order" = 3   WHERE id = 'pl_theme03';
UPDATE theme SET "order" = 4   WHERE id = 'pl_theme04';
UPDATE theme SET "order" = 5   WHERE id = 'pl_theme05';
UPDATE theme SET "order" = 6   WHERE id = 'pl_theme06';
UPDATE theme SET "order" = 7   WHERE id = 'pl_theme07';
UPDATE theme SET "order" = 8   WHERE id = 'pl_theme08';
UPDATE theme SET "order" = 9   WHERE id = 'pl_theme09';
UPDATE theme SET "order" = 10  WHERE id = 'pl_theme10';
UPDATE theme SET "order" = 11  WHERE id = 'pl_theme11';
UPDATE theme SET "order" = 12  WHERE id = 'pl_theme12';
UPDATE theme SET "order" = 13  WHERE id = 'pl_theme13';
UPDATE theme SET "order" = 14  WHERE id = 'pl_theme14';
UPDATE theme SET "order" = 15  WHERE id = 'pl_theme15';
UPDATE theme SET "order" = 16  WHERE id = 'pl_theme16';
UPDATE theme SET "order" = 17  WHERE id = 'pl_theme17';
UPDATE theme SET "order" = 18  WHERE id = 'pl_theme18';
