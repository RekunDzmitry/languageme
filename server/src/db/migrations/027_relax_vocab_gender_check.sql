-- Migration 027: allow neuter gender on vocab.
--
-- 001_initial.sql originally declared `gender VARCHAR(1) CHECK (gender IN
-- ('m','f'))`, but 012_seed_polish_vocab.sql seeds Polish neuter nouns
-- (e.g. pl_029 'dziecko') with gender='n'. Building a database from
-- scratch therefore died with:
--
--   new row for relation "vocab" violates check constraint
--   "vocab_gender_check"
--
-- 001 has been corrected for new databases. Databases created before
-- that correction still carry the old two-value constraint (or a
-- hand-patched variant), so restate it here idempotently. Existing rows
-- are unaffected — this only widens what is accepted.
ALTER TABLE vocab DROP CONSTRAINT IF EXISTS vocab_gender_check;
ALTER TABLE vocab ADD CONSTRAINT vocab_gender_check
  CHECK (gender IN ('m', 'f', 'n'));

-- Drop the stray bookkeeping row that 004_conjugation_cards.sql used to
-- insert for itself under an extension-less name. It matches no file on
-- disk, so it only confuses anyone reading _migrations. The real row,
-- '004_conjugation_cards.sql', is written by the runner and stays.
DELETE FROM _migrations WHERE name = '004_conjugation_cards';
