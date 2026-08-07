-- Migration 034: Disambiguate fr_313 (lever) / fr_314 (relever) / fr_315 (élever)
--
-- Why: the three verbs sound almost identical and the original translations
-- all shared the word "поднимать", so a learner opening a card for any of
-- them saw the same Russian word. Conjugation exercises were worse:
-- "lever" and "relever" both answered "Я поднимаю". This migration
-- promotes the DISTINCTIVE primary meaning to the front of each gloss:
--
--   fr_313 (lever)    "поднимать"                  (unchanged — already distinctive)
--   fr_314 (relever)  "подхватывать, принимать"   (was "поднимать, отмечать", then briefly "отмечать, фиксировать")
--   fr_315 (élever)   "воспитывать, растить"      (was "воспитывать, поднимать")
--
-- Idempotent: each UPDATE is guarded with a WHERE so it only runs when the
-- current value still matches the old text. Safe to re-apply.

BEGIN;

-- 1. Vocab translations (RU) — what the flashcard shows on the back.
UPDATE vocab_translation
   SET text = 'подхватывать, принимать'
 WHERE vocab_id = 'fr_314'
   AND lang = 'ru'
   AND text IN ('поднимать, отмечать', 'отмечать, фиксировать');

UPDATE vocab_translation
   SET text = 'воспитывать, растить'
 WHERE vocab_id = 'fr_315'
   AND lang = 'ru'
   AND text = 'воспитывать, поднимать';

-- 2. Vocab translations (EN) — mirror the same swap for the English UI.
UPDATE vocab_translation
   SET text = 'to take up / to pick up'
 WHERE vocab_id = 'fr_314'
   AND lang = 'en'
   AND text IN ('to raise / to note', 'to note / to record');

UPDATE vocab_translation
   SET text = 'to bring up / to raise (children)'
 WHERE vocab_id = 'fr_315'
   AND lang = 'en'
   AND text = 'to raise / to bring up';

-- 3. Theme-verb glosses (used by the VerbListSection in the theme view and
--    by the conjugation exercise as the verb's display name).
UPDATE theme_verb
   SET ru = 'подхватывать, принимать'
 WHERE theme_id = 'fr_theme01'
   AND infinitive = 'relever'
   AND ru IN ('поднимать, отмечать', 'отмечать, фиксировать');

UPDATE theme_verb
   SET ru = 'воспитывать, растить'
 WHERE theme_id = 'fr_theme01'
   AND infinitive = 'élever'
   AND ru = 'воспитывать, поднимать';

COMMIT;
