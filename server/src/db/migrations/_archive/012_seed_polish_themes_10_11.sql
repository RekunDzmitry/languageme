-- Seed Polish themes 10 (Praca) and 11 (Edukacja), plus their
-- theme_vocab mappings. The vocab rows themselves are seeded in 011
-- (which runs first so the FKs are satisfied).
--
-- These themes only have vocabIds (audio flashcards), no write_answer exercises.

-- Insert themes 10 and 11 (unlocked unconditionally like themes 1-9)
INSERT INTO theme (id, "order", title, title_ru, description, description_ru, unlock_theme_id, unlock_min_score) VALUES
  ('pl_theme10', 110, 'Praca i kariera', 'Работа и карьера', 'Work and career vocabulary', 'Лексика для обсуждения работы, карьеры и поиска работы', NULL, 60),
  ('pl_theme11', 111, 'Edukacja i nauka', 'Образование и обучение', 'Education and learning vocabulary', 'Лексика для обсуждения образования, школы и обучения', NULL, 60)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert theme_vocab mappings for pl_theme10 (Praca)
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_065') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_096') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_097') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_098') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_099') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_100') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_101') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_102') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_103') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_104') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_105') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_106') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_107') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_108') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_109') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_110') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_111') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_112') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_113') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_114') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_115') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_116') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_117') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_118') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_119') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_120') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_121') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_122') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_123') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_124') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_125') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_126') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_127') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_128') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_129') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_130') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_131') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_132') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_133') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_134') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_135') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_136') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_137') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_138') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_139') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_140') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_141') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_142') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_143') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_144') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_145') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_146') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_147') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_148') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_149') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme10', 'pl_150') ON CONFLICT DO NOTHING;

-- 4. Insert theme_vocab mappings for pl_theme11 (Edukacja)
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_064') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_075') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_151') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_152') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_153') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_154') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_155') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_156') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_157') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_158') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_159') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_160') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_161') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_162') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_163') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_164') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_165') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_166') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_167') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_168') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_169') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_170') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_171') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_172') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_173') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_174') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_175') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_176') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_177') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_178') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_179') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_180') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_181') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_182') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_183') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_184') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_185') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_186') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_187') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_188') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_189') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_190') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_191') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_192') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_193') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_194') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_195') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_196') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_197') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_198') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_199') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_200') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_201') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_202') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_203') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_204') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_205') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_206') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_207') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_208') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_209') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme11', 'pl_210') ON CONFLICT DO NOTHING;
-- Mark migration as applied
INSERT INTO _migrations (name) VALUES ('012_seed_polish_themes_10_11.sql') ON CONFLICT DO NOTHING;
