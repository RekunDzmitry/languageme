-- Migration 026: Pack-scoped catch-all themes
-- Migration 025 introduced per-language catch-all themes (fr_other,
-- pl_other) for user-authored cards. The user reported that filing a
-- card under "Мои карточки" while studying a specific pack (e.g.
-- Польский A1/A2) didn't tie the card to that pack — it landed in
-- the language-wide catch-all, so the same row would surface in every
-- pack's "Мои карточки" section and mix with cards from other packs.
--
-- This migration adds one catch-all theme per pack so the modal can
-- file user cards under the active pack's catch-all. The per-language
-- catch-alls (fr_other, pl_other) stay for backward compat with rows
-- created before this migration.

-- 1. Widen theme and referencing columns to fit longer pack-scoped ids
--    (e.g. "pl-a1-a2_other" is 15 chars, exceeds the original
--    VARCHAR(10)). theme_vocab, theme_section, theme_verb,
--    theme_progress, and theme.unlock_theme_id all reference theme.id
--    and need to match the new width.
ALTER TABLE theme            ALTER COLUMN id               TYPE VARCHAR(50);
ALTER TABLE theme            ALTER COLUMN unlock_theme_id   TYPE VARCHAR(50);
ALTER TABLE theme_vocab      ALTER COLUMN theme_id         TYPE VARCHAR(50);
ALTER TABLE theme_section    ALTER COLUMN theme_id         TYPE VARCHAR(50);
ALTER TABLE theme_verb       ALTER COLUMN theme_id         TYPE VARCHAR(50);
ALTER TABLE theme_progress   ALTER COLUMN theme_id         TYPE VARCHAR(50);

-- 2. Add pack-scoped catch-all themes. order values 990-992 stay below
--    the existing 999 per-language catch-alls and don't collide with
--    any seed theme (the seed range is 1..31 / 1..22).
INSERT INTO theme (id, lang, "order", title, title_ru, description, description_ru) VALUES
  ('fr-foundations_other', 'fr', 990, 'Mes cartes (Fondations)', 'Мои карточки (Основы)',
   'Mots et expressions ajoutés par l''utilisateur — pack Fondations',
   'Слова и выражения, добавленные пользователем — пакет Основы'),
  ('pl-a1-a2_other', 'pl', 991, 'Moje fiszki (A1/A2)', 'Мои карточки (A1/A2)',
   'Słowa i zwroty dodane przez użytkownika — pakiet A1/A2',
   'Карточки, добавленные пользователем — пакет A1/A2'),
  ('pl-telc_other', 'pl', 992, 'Moje fiszki (TELC)', 'Мои карточки (TELC)',
   'Słowa i zwroty dodane przez użytkownika — pakiet TELC',
   'Карточки, добавленные пользователем — пакет TELC')
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE theme IS 'Themes; user-authored cards use pack-scoped catch-alls (e.g. pl-a1-a2_other) or the legacy per-language catch-alls (pl_other, fr_other)';
