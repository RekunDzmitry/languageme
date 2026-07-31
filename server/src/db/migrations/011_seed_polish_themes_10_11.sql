-- Seed Polish themes 10 (Praca) and 11 (Edukacja) and their vocab mappings.
-- These themes only have vocabIds (audio flashcards), no write_answer exercises.
--
-- ORDERING NOTE: the pl_* vocab these mappings point at is not seeded
-- until 012_seed_polish_vocab.sql, which sorts AFTER this file. On a
-- database built from scratch the plain VALUES form died on
-- theme_vocab_vocab_id_fkey, so `npm run migrate` could never complete
-- against an empty database.
--
-- The theme_vocab inserts below therefore JOIN against `vocab` and skip
-- rows whose vocab does not exist yet. That is lossless: 012 re-inserts
-- all 118 of these mappings itself (verified to be an exact superset of
-- this file's set), so on a fresh database the rows land during 012, and
-- on an already-migrated database this file is never re-run at all.

-- Insert themes 10 and 11 (unlocked unconditionally like themes 1-9)
INSERT INTO theme (id, "order", title, title_ru, description, description_ru, unlock_theme_id, unlock_min_score) VALUES
  ('pl_theme10', 110, 'Praca i kariera', 'Работа и карьера', 'Work and career vocabulary', 'Лексика для обсуждения работы, карьеры и поиска работы', NULL, 60),
  ('pl_theme11', 111, 'Edukacja i nauka', 'Образование и обучение', 'Education and learning vocabulary', 'Лексика для обсуждения образования, школы и обучения', NULL, 60)
ON CONFLICT (id) DO NOTHING;

-- Seed vocab for theme 10 (Praca / Work) — 86 vocab items
INSERT INTO theme_vocab (theme_id, vocab_id)
SELECT m.theme_id, m.vocab_id FROM (VALUES
  ('pl_theme10', 'pl_065'), ('pl_theme10', 'pl_096'), ('pl_theme10', 'pl_097'), ('pl_theme10', 'pl_098'), ('pl_theme10', 'pl_099'),
  ('pl_theme10', 'pl_100'), ('pl_theme10', 'pl_101'), ('pl_theme10', 'pl_102'), ('pl_theme10', 'pl_103'), ('pl_theme10', 'pl_104'),
  ('pl_theme10', 'pl_105'), ('pl_theme10', 'pl_106'), ('pl_theme10', 'pl_107'), ('pl_theme10', 'pl_108'), ('pl_theme10', 'pl_109'),
  ('pl_theme10', 'pl_110'), ('pl_theme10', 'pl_111'), ('pl_theme10', 'pl_112'), ('pl_theme10', 'pl_113'), ('pl_theme10', 'pl_114'),
  ('pl_theme10', 'pl_115'), ('pl_theme10', 'pl_116'), ('pl_theme10', 'pl_117'), ('pl_theme10', 'pl_118'), ('pl_theme10', 'pl_119'),
  ('pl_theme10', 'pl_120'), ('pl_theme10', 'pl_121'), ('pl_theme10', 'pl_122'), ('pl_theme10', 'pl_123'), ('pl_theme10', 'pl_124'),
  ('pl_theme10', 'pl_125'), ('pl_theme10', 'pl_126'), ('pl_theme10', 'pl_127'), ('pl_theme10', 'pl_128'), ('pl_theme10', 'pl_129'),
  ('pl_theme10', 'pl_130'), ('pl_theme10', 'pl_131'), ('pl_theme10', 'pl_132'), ('pl_theme10', 'pl_133'), ('pl_theme10', 'pl_134'),
  ('pl_theme10', 'pl_135'), ('pl_theme10', 'pl_136'), ('pl_theme10', 'pl_137'), ('pl_theme10', 'pl_138'), ('pl_theme10', 'pl_139'),
  ('pl_theme10', 'pl_140'), ('pl_theme10', 'pl_141'), ('pl_theme10', 'pl_142'), ('pl_theme10', 'pl_143'), ('pl_theme10', 'pl_144'),
  ('pl_theme10', 'pl_145'), ('pl_theme10', 'pl_146'), ('pl_theme10', 'pl_147'), ('pl_theme10', 'pl_148'), ('pl_theme10', 'pl_149'),
  ('pl_theme10', 'pl_150')
) AS m(theme_id, vocab_id)
JOIN vocab v ON v.id = m.vocab_id
ON CONFLICT DO NOTHING;

-- Seed vocab for theme 11 (Edukacja / Education) — 57 vocab items
INSERT INTO theme_vocab (theme_id, vocab_id)
SELECT m.theme_id, m.vocab_id FROM (VALUES
  ('pl_theme11', 'pl_064'), ('pl_theme11', 'pl_075'),
  ('pl_theme11', 'pl_151'), ('pl_theme11', 'pl_152'), ('pl_theme11', 'pl_153'), ('pl_theme11', 'pl_154'), ('pl_theme11', 'pl_155'),
  ('pl_theme11', 'pl_156'), ('pl_theme11', 'pl_157'), ('pl_theme11', 'pl_158'), ('pl_theme11', 'pl_159'), ('pl_theme11', 'pl_160'),
  ('pl_theme11', 'pl_161'), ('pl_theme11', 'pl_162'), ('pl_theme11', 'pl_163'), ('pl_theme11', 'pl_164'), ('pl_theme11', 'pl_165'),
  ('pl_theme11', 'pl_166'), ('pl_theme11', 'pl_167'), ('pl_theme11', 'pl_168'), ('pl_theme11', 'pl_169'), ('pl_theme11', 'pl_170'),
  ('pl_theme11', 'pl_171'), ('pl_theme11', 'pl_172'), ('pl_theme11', 'pl_173'), ('pl_theme11', 'pl_174'), ('pl_theme11', 'pl_175'),
  ('pl_theme11', 'pl_176'), ('pl_theme11', 'pl_177'), ('pl_theme11', 'pl_178'), ('pl_theme11', 'pl_179'), ('pl_theme11', 'pl_180'),
  ('pl_theme11', 'pl_181'), ('pl_theme11', 'pl_182'), ('pl_theme11', 'pl_183'), ('pl_theme11', 'pl_184'), ('pl_theme11', 'pl_185'),
  ('pl_theme11', 'pl_186'), ('pl_theme11', 'pl_187'), ('pl_theme11', 'pl_188'), ('pl_theme11', 'pl_189'), ('pl_theme11', 'pl_190'),
  ('pl_theme11', 'pl_191'), ('pl_theme11', 'pl_192'), ('pl_theme11', 'pl_193'), ('pl_theme11', 'pl_194'), ('pl_theme11', 'pl_195'),
  ('pl_theme11', 'pl_196'), ('pl_theme11', 'pl_197'), ('pl_theme11', 'pl_198'), ('pl_theme11', 'pl_199'), ('pl_theme11', 'pl_200'),
  ('pl_theme11', 'pl_201'), ('pl_theme11', 'pl_202'), ('pl_theme11', 'pl_203'), ('pl_theme11', 'pl_204'), ('pl_theme11', 'pl_205'),
  ('pl_theme11', 'pl_206'), ('pl_theme11', 'pl_207'), ('pl_theme11', 'pl_208'), ('pl_theme11', 'pl_209'), ('pl_theme11', 'pl_210')
) AS m(theme_id, vocab_id)
JOIN vocab v ON v.id = m.vocab_id
ON CONFLICT DO NOTHING;