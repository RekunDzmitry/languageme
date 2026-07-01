-- Migration 023: Normalize French theme IDs to fr_theme* prefix
--
-- Background:
--   Polish themes already use pl_theme* (since migration 007). French themes
--   were created as bare "themeNN" by migrations 003/004 and stored that way
--   in the DB. To make the lesson-pack resolution generic (lessonPacks.js
--   derives targetLang from the theme ID prefix), FR must use fr_theme* too.
--   Migration 015 already set lang = 'fr' as the default for un-prefixed
--   themes; this migration just brings the IDs into line.
--
-- Scope:
--   1. Rename rows in `theme` where lang='fr' and id matches ^theme[0-9]+$:
--        themeNN -> fr_themeNN
--   2. Update foreign keys in dependent tables to point to the new IDs.
--   3. Re-add the FK constraints (dropped during the rename).

-- 1. Drop FKs that reference theme(id). This is needed because we're about
--    to update theme.id, which would otherwise break the referential check
--    until dependent rows are updated.
ALTER TABLE theme              DROP CONSTRAINT IF EXISTS theme_unlock_theme_id_fkey;
ALTER TABLE theme_vocab        DROP CONSTRAINT IF EXISTS theme_vocab_theme_id_fkey;
ALTER TABLE theme_section      DROP CONSTRAINT IF EXISTS theme_section_theme_id_fkey;
ALTER TABLE theme_verb         DROP CONSTRAINT IF EXISTS theme_verb_theme_id_fkey;
ALTER TABLE theme_progress     DROP CONSTRAINT IF EXISTS theme_progress_theme_id_fkey;
ALTER TABLE exercise_card      DROP CONSTRAINT IF EXISTS exercise_card_theme_id_fkey;
ALTER TABLE exercise_note      DROP CONSTRAINT IF EXISTS exercise_note_theme_id_fkey;
ALTER TABLE user_write_exercise DROP CONSTRAINT IF EXISTS user_write_exercise_theme_id_fkey;

-- 2. Update theme.id for French rows. The lang check is a safety belt: any
--    row that's already pl_* or fr_* is left alone, and any non-FR row
--    that somehow ended up with a bare themeNN id (shouldn't happen) is
--    also left alone so we don't silently rename it.
UPDATE theme
   SET id = 'fr_' || id
 WHERE lang = 'fr'
   AND id ~ '^theme[0-9]+$';

-- 3. Update every foreign key column that may carry a bare themeNN value.
--    The regex matches the bare form only; pl_themeNN and the just-renamed
--    fr_themeNN are unaffected.
UPDATE theme              SET unlock_theme_id  = 'fr_' || unlock_theme_id  WHERE unlock_theme_id  ~ '^theme[0-9]+$';
UPDATE theme_vocab        SET theme_id         = 'fr_' || theme_id         WHERE theme_id         ~ '^theme[0-9]+$';
UPDATE theme_section      SET theme_id         = 'fr_' || theme_id         WHERE theme_id         ~ '^theme[0-9]+$';
UPDATE theme_verb         SET theme_id         = 'fr_' || theme_id         WHERE theme_id         ~ '^theme[0-9]+$';
UPDATE theme_progress     SET theme_id         = 'fr_' || theme_id         WHERE theme_id         ~ '^theme[0-9]+$';
UPDATE exercise_card      SET theme_id         = 'fr_' || theme_id         WHERE theme_id         ~ '^theme[0-9]+$';
UPDATE exercise_note      SET theme_id         = 'fr_' || theme_id         WHERE theme_id         ~ '^theme[0-9]+$';
UPDATE user_write_exercise SET theme_id        = 'fr_' || theme_id         WHERE theme_id         ~ '^theme[0-9]+$';

-- 4. Re-add the FK constraints (same definitions as in 001/006/009/018).
ALTER TABLE theme              ADD CONSTRAINT theme_unlock_theme_id_fkey        FOREIGN KEY (unlock_theme_id)  REFERENCES theme(id);
ALTER TABLE theme_vocab        ADD CONSTRAINT theme_vocab_theme_id_fkey          FOREIGN KEY (theme_id)         REFERENCES theme(id) ON DELETE CASCADE;
ALTER TABLE theme_section      ADD CONSTRAINT theme_section_theme_id_fkey        FOREIGN KEY (theme_id)         REFERENCES theme(id) ON DELETE CASCADE;
ALTER TABLE theme_verb         ADD CONSTRAINT theme_verb_theme_id_fkey           FOREIGN KEY (theme_id)         REFERENCES theme(id) ON DELETE CASCADE;
ALTER TABLE theme_progress     ADD CONSTRAINT theme_progress_theme_id_fkey       FOREIGN KEY (theme_id)         REFERENCES theme(id) ON DELETE CASCADE;
ALTER TABLE exercise_card      ADD CONSTRAINT exercise_card_theme_id_fkey        FOREIGN KEY (theme_id)         REFERENCES theme(id);
ALTER TABLE exercise_note      ADD CONSTRAINT exercise_note_theme_id_fkey        FOREIGN KEY (theme_id)         REFERENCES theme(id);
ALTER TABLE user_write_exercise ADD CONSTRAINT user_write_exercise_theme_id_fkey FOREIGN KEY (theme_id)         REFERENCES theme(id) ON DELETE CASCADE;
