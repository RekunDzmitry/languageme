-- Migration 017: vocab.lang + vocab.source
-- Adds the `lang` column the /add-word query already filters on (previously
-- missing, so the query threw) and a `source` flag so words a user adds from
-- their own email corrections stay out of the global "new cards" pool.

ALTER TABLE vocab ADD COLUMN IF NOT EXISTS lang VARCHAR(5);
UPDATE vocab SET lang = split_part(id, '_', 1) WHERE lang IS NULL AND position('_' IN id) > 0;

ALTER TABLE vocab ADD COLUMN IF NOT EXISTS source VARCHAR(20) NOT NULL DEFAULT 'seed';

CREATE INDEX IF NOT EXISTS idx_vocab_lang_source ON vocab (lang, source);
