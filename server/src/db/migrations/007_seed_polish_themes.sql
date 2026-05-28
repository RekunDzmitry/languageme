-- Seed Polish orthography themes.
-- Polish themes use IDs prefixed with "pl_" to avoid collision with the French theme ID space
-- (both courses previously reused theme01..themeNN which conflicted on the shared theme.id PK).
-- All Polish themes are unlocked unconditionally (unlock_theme_id = NULL).

INSERT INTO theme (id, "order", title, title_ru, description, description_ru, unlock_theme_id, unlock_min_score) VALUES
  ('pl_theme01', 101, 'Ortografia: ó i u', 'Правописание: ó и u', 'Polish orthography: ó vs u', 'Учим разницу между буквами ó и u в польском языке', NULL, 60),
  ('pl_theme02', 102, 'Ortografia: dwuznaki', 'Правописание: диграфы (cz, dz, dź, dż, ch, rz, sz)', 'Polish digraphs', 'В польском языке 7 диграфов — буквосочетаний, обозначающих один звук', NULL, 60),
  ('pl_theme03', 103, 'Ortografia: miękkość spółgłosek', 'Правописание: мягкость согласных (kreska vs i)', 'Soft consonants in Polish', 'Два способа обозначить мягкость: надстрочная чёрточка (kreska) и буква i', NULL, 60),
  ('pl_theme04', 104, 'Ortografia: ż i rz', 'Правописание: ż и rz', 'Polish ż vs rz', 'Буква ż и диграф rz обозначают один звук', NULL, 60),
  ('pl_theme05', 105, 'Ortografia: ch i h', 'Правописание: ch и h', 'Polish ch vs h', 'Когда пишем ch и когда h', NULL, 60),
  ('pl_theme06', 106, 'Ortografia: j i i', 'Правописание: j и i', 'Polish j vs i', 'Правила написания j и i в начале слова и перед гласными', NULL, 60),
  ('pl_theme07', 107, 'Ortografia: gie i ge', 'Правописание: gie и ge', 'Polish gie vs ge', 'Правило написания gie / ge и kie / ke', NULL, 60),
  ('pl_theme08', 108, 'Ortografia: nosówki ą, ę', 'Правописание: ę-ą и en-om', 'Polish nasal vowels', 'Носовые гласные ą, ę и их замена на en/om/on/em', NULL, 60),
  ('pl_theme09', 109, 'Ortografia: wielka litera', 'Правописание: большая буква', 'Polish capitalization', 'Правила употребления прописной буквы', NULL, 60);
