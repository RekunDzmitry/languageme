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
-- Scope (this migration ONLY renames data; it does not introduce new schema):
--   1. Rename rows in `theme` where lang='fr' and id matches ^theme[0-9]+$:
--        themeNN -> fr_themeNN
--   2. Update every column that references theme ids by string value, both
--      standalone (theme_id columns) and embedded inside other strings
--      (exercise_key = "themeId:idx", the lookup key for exercise_card and
--      exercise_note).
--
-- Foreign-key handling — read carefully:
--   Migration 015 already set `lang` on theme rows. The actual FK constraints
--   that existed before this migration are:
--     theme.unlock_theme_id        -> theme(id)               (no cascade)
--     theme_vocab.theme_id         -> theme(id) ON DELETE CASCADE  (001)
--     theme_section.theme_id       -> theme(id) ON DELETE CASCADE  (001)
--     theme_verb.theme_id          -> theme(id) ON DELETE CASCADE  (001)
--     theme_progress.theme_id      -> theme(id) ON DELETE CASCADE  (001)
--     user_write_exercise.theme_id -> theme(id) ON DELETE CASCADE  (018)
--   exercise_card.theme_id and exercise_note.theme_id are intentionally
--   *unconstrained* — those tables (006/009) declared theme_id as a bare
--   VARCHAR(N) NOT NULL with no REFERENCES. This migration does NOT add FKs
--   to them. Adding referential integrity to those tables is a separate,
--   deliberate change (it requires first cleaning orphan rows that the
--   unconstrained history may have accumulated) and is out of scope for a
--   data-rename migration.
--
--   Because we ARE updating theme.id (the primary key), the four ON DELETE
--   CASCADE FKs above need to be dropped before the UPDATE and re-added
--   after — otherwise PG rejects the PK update. The two unconstrained
--   columns need no drop/add cycle; they are updated directly.

-- 1. Drop the FKs that reference theme(id) — only the ones that actually
--    exist (see header).
ALTER TABLE theme               DROP CONSTRAINT IF EXISTS theme_unlock_theme_id_fkey;
ALTER TABLE theme_vocab         DROP CONSTRAINT IF EXISTS theme_vocab_theme_id_fkey;
ALTER TABLE theme_section       DROP CONSTRAINT IF EXISTS theme_section_theme_id_fkey;
ALTER TABLE theme_verb          DROP CONSTRAINT IF EXISTS theme_verb_theme_id_fkey;
ALTER TABLE theme_progress      DROP CONSTRAINT IF EXISTS theme_progress_theme_id_fkey;
ALTER TABLE user_write_exercise DROP CONSTRAINT IF EXISTS user_write_exercise_theme_id_fkey;
-- exercise_card and exercise_note are deliberately NOT dropped — see header.

-- 2. Update theme.id for French rows. The lang check is a safety belt: any
--    row that's already pl_* or fr_* is left alone, and any non-FR row
--    that somehow ended up with a bare themeNN id is also left alone.
UPDATE theme
   SET id = 'fr_' || id
 WHERE lang = 'fr'
   AND id ~ '^theme[0-9]+$';

-- 3. Update every standalone foreign-key column that may carry a bare
--    themeNN value. The regex matches the bare form only; pl_themeNN and
--    the just-renamed fr_themeNN are unaffected.
UPDATE theme               SET unlock_theme_id   = 'fr_' || unlock_theme_id   WHERE unlock_theme_id   ~ '^theme[0-9]+$';
UPDATE theme_vocab         SET theme_id          = 'fr_' || theme_id          WHERE theme_id          ~ '^theme[0-9]+$';
UPDATE theme_section       SET theme_id          = 'fr_' || theme_id          WHERE theme_id          ~ '^theme[0-9]+$';
UPDATE theme_verb          SET theme_id          = 'fr_' || theme_id          WHERE theme_id          ~ '^theme[0-9]+$';
UPDATE theme_progress      SET theme_id          = 'fr_' || theme_id          WHERE theme_id          ~ '^theme[0-9]+$';
UPDATE exercise_card       SET theme_id          = 'fr_' || theme_id          WHERE theme_id          ~ '^theme[0-9]+$';
UPDATE exercise_note       SET theme_id          = 'fr_' || theme_id          WHERE theme_id          ~ '^theme[0-9]+$';
UPDATE user_write_exercise SET theme_id          = 'fr_' || theme_id          WHERE theme_id          ~ '^theme[0-9]+$';

-- 4. Update exercise_key strings in exercise_card and exercise_note. The
--    format is "themeId:exerciseIndex" (e.g. "theme01:0") and it is the
--    primary lookup key in the API (UNIQUE(user_id, exercise_key); all
--    /api/study/exercises and /api/exercise-notes routes query by it).
--    Renaming only the theme_id column above would leave the lookup key
--    pointing at the old id and silently orphan the existing FR exercise
--    progress and notes — the dashboard would look clean but every
--    previously-studied French exercise would be unreachable.
--    The regex anchors on the leading "themeNN:" so we don't accidentally
--    touch a key like "pl_theme01:0" or "fr_theme01:0".
UPDATE exercise_card SET exercise_key = 'fr_' || exercise_key
 WHERE exercise_key ~ '^theme[0-9]+:';
UPDATE exercise_note SET exercise_key = 'fr_' || exercise_key
 WHERE exercise_key ~ '^theme[0-9]+:';

-- 5. Re-add the FKs that we dropped in step 1. Same definitions as the
--    originals (no cascade on theme.unlock_theme_id, cascade on the rest).
--    exercise_card and exercise_note are deliberately NOT re-constrained.
ALTER TABLE theme               ADD CONSTRAINT theme_unlock_theme_id_fkey         FOREIGN KEY (unlock_theme_id)   REFERENCES theme(id);
ALTER TABLE theme_vocab         ADD CONSTRAINT theme_vocab_theme_id_fkey           FOREIGN KEY (theme_id)          REFERENCES theme(id) ON DELETE CASCADE;
ALTER TABLE theme_section       ADD CONSTRAINT theme_section_theme_id_fkey         FOREIGN KEY (theme_id)          REFERENCES theme(id) ON DELETE CASCADE;
ALTER TABLE theme_verb          ADD CONSTRAINT theme_verb_theme_id_fkey            FOREIGN KEY (theme_id)          REFERENCES theme(id) ON DELETE CASCADE;
ALTER TABLE theme_progress      ADD CONSTRAINT theme_progress_theme_id_fkey        FOREIGN KEY (theme_id)          REFERENCES theme(id) ON DELETE CASCADE;
ALTER TABLE user_write_exercise ADD CONSTRAINT user_write_exercise_theme_id_fkey  FOREIGN KEY (theme_id)          REFERENCES theme(id) ON DELETE CASCADE;
