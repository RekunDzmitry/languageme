-- Migration 030: Seed pl_theme19 (Pisanie maila - jak piszemy mail)
--
-- Rationale: the front-end theme file theme19-email-writing.js
-- shipped but no DB seed migration was ever written for it. The
-- /api/themes?lang=pl endpoint only returns rows from the theme
-- table, so pl_theme19 was missing from the response.
--
-- pack_id and order are set to NULL here; 032 re-assigns them
-- (final state: pl-telc, order 19).
--
-- Idempotent: ON CONFLICT (id) DO NOTHING. Constraint additions
-- guarded with IF NOT EXISTS. Small table, single-row insert.

BEGIN;

ALTER TABLE theme DROP CONSTRAINT IF EXISTS theme_lang_order_key;
ALTER TABLE theme ADD COLUMN IF NOT EXISTS pack_id VARCHAR(50);

INSERT INTO theme (id, lang, pack_id, "order", title, title_ru, description, description_ru)
VALUES ('pl_theme19', 'pl', NULL, NULL,
        'Pisanie maila - jak piszemy mail',
        'Письмо на польском - как писать e-mail',
        'Ćwiczymy pisanie e-maili w formacie egzaminu TELC (B1/B2). Każde zadanie ma 3 obowiązkowe punkty do rozwinięcia.',
        'Тренируем написание e-mail в формате экзамена TELC (B1/B2). В каждом задании 3 обязательных пункта.')
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
