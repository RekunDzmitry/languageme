-- Seed Polish vocabulary for themes 12-14 (pl_211 through pl_351)
-- Theme 12: Ochrona środowiska i efekt cieplarniany (pl_211–pl_249)
-- Theme 13: Katastrofy naturalne (pl_250–pl_320)
-- Theme 14: Śmieci, odpady i oszczędzanie zasobów (pl_321–pl_351)

-- ============================================================
-- 1. Insert vocab entries
-- ============================================================

-- ── Theme 12: Ochrona środowiska ──
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_211', 'środowisko naturalne', '/ɕrɔdɔˈvʲiskɔ naturalnɛ/', 'n', 230, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_212', 'zanieczyszczać', '/zaɲɛˈt͡ʂɨʂt͡ʂat͡ɕ/', NULL, 231, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_213', 'zanieczyścić', '/zaɲɛˈt͡ʂɨɕt͡ɕit͡ɕ/', NULL, 232, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_214', 'dewastować', '/dɛvasˈtɔvat͡ɕ/', NULL, 233, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_215', 'zdewastować', '/zdɛvasˈtɔvat͡ɕ/', NULL, 234, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_216', 'niszczyć', '/ˈɲiʂt͡ʂɨt͡ɕ/', NULL, 235, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_217', 'zniszczyć', '/ˈzɲiʂt͡ʂɨt͡ɕ/', NULL, 236, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_218', 'troszczyć się', '/ˈtrɔʂt͡ʂɨt͡ɕ ɕɛ/', NULL, 237, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_219', 'zatroszczyć się', '/zaˈtrɔʂt͡ʂɨt͡ɕ ɕɛ/', NULL, 238, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_220', 'dbać', '/dbaɲt͡ɕ/', NULL, 239, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_221', 'zadbać', '/ˈzdbaɲt͡ɕ/', NULL, 240, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_222', 'chronić', '/ˈxrɔɲit͡ɕ/', NULL, 241, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_223', 'ochronić', '/ɔˈxrɔɲit͡ɕ/', NULL, 242, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_224', 'ochrona', '/ɔˈxrɔna/', 'f', 243, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_225', 'zapobiegać', '/zapɔˈbʲɛɡat͡ɕ/', NULL, 244, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_226', 'zapobiec', '/zaˈpɔbʲɛt͡ɕ/', NULL, 245, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_227', 'zatruwać', '/zaˈtruvat͡ɕ/', NULL, 246, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_228', 'zatruć', '/ˈzatrut͡ɕ/', NULL, 247, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_229', 'zatrucie', '/zaˈtrut͡ɕɛ/', 'n', 248, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_230', 'trucizna', '/truˈt͡ɕizna/', 'f', 249, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_231', 'trujący', '/ˈtrujɔnt͡sɨ/', NULL, 250, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_232', 'zagłada', '/zaˈɡwada/', 'f', 251, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_233', 'wymierać', '/vɨˈmʲɛrat͡ɕ/', NULL, 252, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_234', 'wymrzeć', '/ˈvɨmʐɛt͡ɕ/', NULL, 253, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_235', 'wymierający gatunek', '/vɨmʲɛˈrajɔnt͡sɨ ˈɡatunɛk/', 'm', 254, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_236', 'ginący gatunek', '/ˈɡinɔnt͡sɨ ˈɡatunɛk/', 'm', 255, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_237', 'wymarły gatunek', '/vɨˈmarwɨ ˈɡatunɛk/', 'm', 256, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_238', 'już nieistniejący gatunek', '/juʐ ɲɛistˈɲɛjɔnt͡sɨ ˈɡatunɛk/', 'm', 257, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_239', 'efekt cieplarniany', '/ˈɛfɛkt t͡ɕɛˈplarnjaɲɨ/', 'm', 258, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_240', 'efekt szklarniowy', '/ˈɛfɛkt ʂklarˈɲɔvɨ/', 'm', 259, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_241', 'ocieplenie klimatu Ziemi', '/ɔt͡ɕɛˈplɛɲɛ kliˈmatu ˈʑɛmʲi/', 'n', 260, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_242', 'atmosfera', '/atmɔˈsfɛra/', 'f', 261, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_243', 'powietrze', '/pɔˈvʲɛtʂɛ/', 'n', 262, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_244', 'dwutlenek węgla', '/dvuˈtlɛnɛk ˈvɛŋɡla/', 'm', 263, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_245', 'temperatura powierzchni Ziemi', '/tɛmpɛraˈtura pɔˈvʲɛrxɲi ˈʑɛmʲi/', 'f', 264, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_246', 'szklarnia', '/ʂklarˈɲa/', 'f', 265, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_247', 'zjawisko', '/ˈzjaviskɔ/', 'n', 266, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_248', 'konsekwencja', '/kɔnsɛˈkfɛnt͡sja/', 'f', 267, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_249', 'efekt', '/ˈɛfɛkt/', 'm', 268, 'environment') ON CONFLICT DO NOTHING;

-- ── Theme 13: Katastrofy naturalne ──
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_250', 'palić się', '/ˈpalʲit͡ɕ ɕɛ/', NULL, 270, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_251', 'spalić się', '/ˈspalʲit͡ɕ ɕɛ/', NULL, 271, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_252', 'płonąć', '/ˈpwɔnɔɲt͡ɕ/', NULL, 272, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_253', 'spłonąć', '/ˈspwɔnɔɲt͡ɕ/', NULL, 273, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_254', 'ogień', '/ˈɔɡʲɛɲ/', 'm', 274, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_255', 'pożar', '/ˈpɔʒar/', 'm', 275, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_256', 'gasić', '/ˈɡaɕit͡ɕ/', NULL, 276, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_257', 'ugasić', '/uˈɡaɕit͡ɕ/', NULL, 277, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_258', 'wybuchać', '/vɨˈbuxat͡ɕ/', NULL, 278, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_259', 'wybuchnąć', '/vɨˈbuxnɔɲt͡ɕ/', NULL, 279, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_260', 'trawić', '/ˈtravʲit͡ɕ/', NULL, 280, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_261', 'strawić', '/ˈstravʲit͡ɕ/', NULL, 281, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_262', 'powódź', '/ˈpɔvut͡ɕ/', 'f', 282, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_263', 'fala powodziowa', '/ˈfala pɔvɔˈd͡ʑɔva/', 'f', 283, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_264', 'fala kulminacyjna', '/ˈfala kulmʲinaˈt͡sɨjna/', 'f', 284, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_265', 'zalewać', '/zaˈlɛvat͡ɕ/', NULL, 285, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_266', 'zalać', '/ˈzalʲat͡ɕ/', NULL, 286, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_267', 'porywać', '/pɔˈrɨvat͡ɕ/', NULL, 287, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_268', 'porwać', '/ˈpɔrvat͡ɕ/', NULL, 288, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_269', 'zrywać', '/ˈzrɨvat͡ɕ/', NULL, 289, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_270', 'zerwać', '/ˈzɛrvat͡ɕ/', NULL, 290, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_271', 'występować z brzegów', '/vɨstɛmˈpɔvat͡ɕ z ˈbʐɛɡuf/', NULL, 291, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_272', 'wystąpić z brzegów', '/vɨˈstɔɲit͡ɕ z ˈbʐɛɡuf/', NULL, 292, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_273', 'podmywać', '/pɔdˈmɨvat͡ɕ/', NULL, 293, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_274', 'podmyć', '/ˈpɔdmɨt͡ɕ/', NULL, 294, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_275', 'huragan', '/xuˈraɡan/', 'm', 295, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_276', 'tajfun', '/ˈtajfun/', 'm', 296, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_277', 'tornado', '/tɔrˈnadɔ/', 'n', 297, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_278', 'wiatr porywisty', '/vʲatr pɔrɨˈvʲistɨ/', 'm', 298, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_279', 'wiatr gwałtowny', '/vʲatr ˈɡvawtɔvnɨ/', 'm', 299, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_280', 'wichura', '/vʲiˈxura/', 'f', 300, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_281', 'szaleć', '/ˈʂalɛt͡ɕ/', NULL, 301, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_282', 'rozszaleć się', '/rɔʂˈʂalɛt͡ɕ ɕɛ/', NULL, 302, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_283', 'cichnąć', '/ˈt͡ɕixnɔɲt͡ɕ/', NULL, 303, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_284', 'ucichnąć', '/uˈt͡ɕixnɔɲt͡ɕ/', NULL, 304, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_285', 'susza', '/ˈsuʂa/', 'f', 305, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_286', 'słońce pali', '/ˈswɔɲt͡sɛ ˈpalʲi/', NULL, 306, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_287', 'wysuszyć ziemię', '/vɨˈsuʂɨt͡ɕ ˈʑɛmʲɛ/', NULL, 307, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_288', 'ziemia pęka', '/ˈʑɛmʲa ˈpɛŋka/', NULL, 308, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_289', 'ziemia pęknie', '/ˈʑɛmʲa ˈpɛkɲɛ/', NULL, 309, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_290', 'ziemia wysycha', '/ˈʑɛmʲa vɨˈsɨxa/', NULL, 310, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_291', 'ziemia wyschnie', '/ˈʑɛmʲa ˈvɨʂxɲɛ/', NULL, 311, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_292', 'trzęsienie ziemi', '/tʂɛ̃ˈɕɛɲɛ ˈʑɛmʲi/', 'n', 312, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_293', 'ziemia trzęsie się', '/ˈʑɛmʲa ˈtʂɛ̃ɕɛ ɕɛ/', NULL, 313, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_294', 'ziemia zatrzęsie się', '/ˈʑɛmʲa zaˈtʂɛ̃ɕɛ ɕɛ/', NULL, 314, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_295', 'ziemia zapada się', '/ˈʑɛmʲa zaˈpada ɕɛ/', NULL, 315, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_296', 'ziemia zapadnie się', '/ˈʑɛmʲa zaˈpadɲɛ ɕɛ/', NULL, 316, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_297', 'budynek wali się', '/ˈbudɨnɛk ˈvalʲi ɕɛ/', NULL, 317, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_298', 'budynek zawali się', '/ˈbudɨnɛk zaˈvalʲi ɕɛ/', NULL, 318, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_299', 'ulegać zniszczeniu', '/uˈlɛɡat͡ɕ zɲiʂˈt͡ʂɛɲu/', NULL, 319, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_300', 'ulec zniszczeniu', '/ˈulɛt͡ɕ zɲiʂˈt͡ʂɛɲu/', NULL, 320, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_301', 'runąć', '/ˈrunɔɲt͡ɕ/', NULL, 321, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_302', 'ruiny budynku', '/ˈruʲinɨ buˈdɨŋku/', 'f', 322, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_303', 'katastrofa', '/kataˈstrɔfa/', 'f', 323, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_304', 'dochodzić do katastrofy', '/dɔˈxɔd͡ʑit͡ɕ dɔ kataˈstrɔfɨ/', NULL, 324, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_305', 'dojść do katastrofy', '/dɔjʂt͡ɕ dɔ kataˈstrɔfɨ/', NULL, 325, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_306', 'unikać katastrofy', '/uˈɲikat͡ɕ kataˈstrɔfɨ/', NULL, 326, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_307', 'uniknąć katastrofy', '/uˈɲiknɔɲt͡ɕ kataˈstrɔfɨ/', NULL, 327, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_308', 'katastrofa może mieć miejsce', '/kataˈstrɔfa ˈmɔʐɛ mʲɛt͡ɕ ˈmʲɛjt͡sɛ/', NULL, 328, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_309', 'katastrofalny', '/katastrɔˈfalnɨ/', NULL, 329, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_310', 'katastroficzny', '/katastrɔˈfʲit͡ʂnɨ/', NULL, 330, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_311', 'ewakuować', '/ɛvakuˈɔvat͡ɕ/', NULL, 331, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_312', 'ewakuacja', '/ɛvakuˈat͡sja/', 'f', 332, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_313', 'ocalać', '/ɔˈt͡salat͡ɕ/', NULL, 333, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_314', 'ocalić', '/ɔˈt͡salʲit͡ɕ/', NULL, 334, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_315', 'szkodzić', '/ˈʂkɔd͡ʑit͡ɕ/', NULL, 335, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_316', 'zaszkodzić', '/zaʂˈkɔd͡ʑit͡ɕ/', NULL, 336, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_317', 'szkoda', '/ˈʂkɔda/', 'f', 337, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_318', 'szkodliwy', '/ˈʂkɔdlivɨ/', NULL, 338, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_319', 'ofiara', '/ɔˈfʲara/', 'f', 339, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_320', 'lawa', '/ˈlava/', 'f', 340, 'environment') ON CONFLICT DO NOTHING;

-- ── Theme 14: Śmieci i odpady ──
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_321', 'ścieki', '/ˈɕt͡ɛkʲi/', 'm', 345, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_322', 'oczyszczanie', '/ɔt͡ɕɨʂˈt͡ʂaɲɛ/', 'n', 346, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_323', 'oczyszczalnia ścieków', '/ɔt͡ɕɨʂt͡ʂalˈɲa ˈɕt͡ɛkuf/', 'f', 347, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_324', 'śmiecić', '/ˈɕmʲɛt͡ɕit͡ɕ/', NULL, 348, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_325', 'zaśmiecić', '/zaˈɕmʲɛt͡ɕit͡ɕ/', NULL, 349, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_326', 'śmieci', '/ˈɕmʲɛt͡ɕi/', 'f', 350, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_327', 'śmietnik', '/ˈɕmʲɛtɲik/', 'm', 351, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_328', 'odpady', '/ɔdˈpadɨ/', 'm', 352, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_329', 'odpadki', '/ɔtˈpatki/', 'm', 353, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_330', 'resztki', '/ˈrɛʂtkʲi/', 'f', 354, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_331', 'resztki jedzenia', '/ˈrɛʂtkʲi jɛˈd͡zɛɲa/', 'f', 355, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_332', 'rozkładać się', '/rɔzˈkwadat͡ɕ ɕɛ/', NULL, 356, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_333', 'rozłożyć się', '/rɔzˈwɔʐɨt͡ɕ ɕɛ/', NULL, 357, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_334', 'rozkład', '/ˈrɔskwat/', 'm', 358, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_335', 'wysypisko śmieci', '/vɨsɨˈpiskɔ ˈɕmʲɛt͡ɕi/', 'n', 359, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_336', 'wysypisko komunalne', '/vɨsɨˈpiskɔ kɔmunˈalnɛ/', 'n', 360, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_337', 'wysypisko dzikie', '/vɨsɨˈpiskɔ ˈd͡ʑikʲɛ/', 'n', 361, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_338', 'segregować', '/sɛɡrɛˈɡɔvat͡ɕ/', NULL, 362, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_339', 'posegregować', '/pɔsɛɡrɛˈɡɔvat͡ɕ/', NULL, 363, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_340', 'segregacja', '/sɛɡrɛˈɡat͡sja/', 'f', 364, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_341', 'recykling', '/rɛˈt͡sɨkliŋk/', 'm', 365, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_342', 'makulatura', '/makulaˈtura/', 'f', 366, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_343', 'marnować', '/marˈnɔvat͡ɕ/', NULL, 367, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_344', 'zmarnować', '/zmarˈnɔvat͡ɕ/', NULL, 368, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_345', 'cenny', '/ˈt͡sɛnnɨ/', NULL, 369, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_346', 'bezcenny', '/bɛzˈt͡sɛnnɨ/', NULL, 370, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_347', 'zużywać', '/zuˈʐɨvat͡ɕ/', NULL, 371, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_348', 'zużyć', '/ˈzuʐɨt͡ɕ/', NULL, 372, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_349', 'odzyskiwać', '/ɔdˈzɨskivat͡ɕ/', NULL, 373, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_350', 'odzyskać', '/ɔdˈzɨskat͡ɕ/', NULL, 374, 'environment') ON CONFLICT DO NOTHING;
INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES ('pl_351', 'tryb czuwania', '/trɨp t͡suˈvaɲa/', 'm', 375, 'environment') ON CONFLICT DO NOTHING;

-- ============================================================
-- 2. Insert Russian translations
-- ============================================================

INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_211', 'ru', 'окружающая среда') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_212', 'ru', 'загрязнять') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_213', 'ru', 'загрязнить') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_214', 'ru', 'опустошать') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_215', 'ru', 'опустошить') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_216', 'ru', 'разрушать') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_217', 'ru', 'разрушить') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_218', 'ru', 'заботиться') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_219', 'ru', 'позаботиться') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_220', 'ru', 'следить (за)') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_221', 'ru', 'проследить (за)') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_222', 'ru', 'охранять') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_223', 'ru', 'охранить') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_224', 'ru', 'охрана') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_225', 'ru', 'предотвращать') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_226', 'ru', 'предотвратить') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_227', 'ru', 'отравлять') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_228', 'ru', 'отравить') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_229', 'ru', 'отравление') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_230', 'ru', 'яд') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_231', 'ru', 'ядовитый') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_232', 'ru', 'гибель, уничтожение') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_233', 'ru', 'вымирать') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_234', 'ru', 'вымереть') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_235', 'ru', 'вымирающий вид') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_236', 'ru', 'исчезающий вид') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_237', 'ru', 'вымерший вид') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_238', 'ru', 'уже несуществующий вид') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_239', 'ru', 'парниковый эффект') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_240', 'ru', 'тепличный эффект') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_241', 'ru', 'потепление климата Земли') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_242', 'ru', 'атмосфера') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_243', 'ru', 'воздух') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_244', 'ru', 'диоксид углерода (CO₂)') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_245', 'ru', 'температура поверхности Земли') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_246', 'ru', 'теплица') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_247', 'ru', 'явление') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_248', 'ru', 'последствие, следствие') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_249', 'ru', 'эффект') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_250', 'ru', 'гореть') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_251', 'ru', 'сгореть') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_252', 'ru', 'пылать') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_253', 'ru', 'сгореть дотла') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_254', 'ru', 'огонь') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_255', 'ru', 'пожар') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_256', 'ru', 'тушить') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_257', 'ru', 'потушить') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_258', 'ru', 'вспыхнуть') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_259', 'ru', 'взорваться') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_260', 'ru', 'пожирать (об огне)') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_261', 'ru', 'пожрать (об огне)') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_262', 'ru', 'наводнение') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_263', 'ru', 'паводковая волна') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_264', 'ru', 'кульминационная волна') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_265', 'ru', 'затапливать') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_266', 'ru', 'затопить') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_267', 'ru', 'уносить') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_268', 'ru', 'унести') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_269', 'ru', 'срывать') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_270', 'ru', 'сорвать') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_271', 'ru', 'выходить из берегов') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_272', 'ru', 'выйти из берегов') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_273', 'ru', 'подмывать') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_274', 'ru', 'подмыть') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_275', 'ru', 'ураган') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_276', 'ru', 'тайфун') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_277', 'ru', 'торнадо') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_278', 'ru', 'порывистый ветер') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_279', 'ru', 'резкий ветер') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_280', 'ru', 'шторм, буря') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_281', 'ru', 'бушевать') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_282', 'ru', 'разбушеваться') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_283', 'ru', 'стихать') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_284', 'ru', 'стихнуть') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_285', 'ru', 'засуха') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_286', 'ru', 'солнце жжёт') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_287', 'ru', 'высушить землю') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_288', 'ru', 'земля трескается') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_289', 'ru', 'земля треснет') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_290', 'ru', 'земля пересыхает') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_291', 'ru', 'земля пересохнет') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_292', 'ru', 'землетрясение') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_293', 'ru', 'земля трясётся') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_294', 'ru', 'земля затрясётся') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_295', 'ru', 'земля проваливается') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_296', 'ru', 'земля провалится') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_297', 'ru', 'здание рушится') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_298', 'ru', 'здание обрушится') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_299', 'ru', 'подвергаться разрушению') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_300', 'ru', 'подвергнуться разрушению') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_301', 'ru', 'рухнуть') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_302', 'ru', 'руины здания') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_303', 'ru', 'катастрофа') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_304', 'ru', 'доходить до катастрофы') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_305', 'ru', 'дойти до катастрофы') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_306', 'ru', 'избегать катастрофы') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_307', 'ru', 'избежать катастрофы') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_308', 'ru', 'катастрофа может произойти') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_309', 'ru', 'катастрофальный') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_310', 'ru', 'катастрофический') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_311', 'ru', 'эвакуировать') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_312', 'ru', 'эвакуация') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_313', 'ru', 'спасать') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_314', 'ru', 'спасти') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_315', 'ru', 'вредить') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_316', 'ru', 'навредить') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_317', 'ru', 'вред, ущерб') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_318', 'ru', 'вредный') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_319', 'ru', 'жертва') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_320', 'ru', 'лава') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_321', 'ru', 'сточные воды') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_322', 'ru', 'очистка') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_323', 'ru', 'очистные сооружения') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_324', 'ru', 'мусорить') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_325', 'ru', 'замусорить') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_326', 'ru', 'мусор') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_327', 'ru', 'мусорный бак') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_328', 'ru', 'отходы') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_329', 'ru', 'отбросы') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_330', 'ru', 'остатки') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_331', 'ru', 'остатки еды') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_332', 'ru', 'разлагаться') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_333', 'ru', 'разложиться') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_334', 'ru', 'разложение') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_335', 'ru', 'свалка мусора') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_336', 'ru', 'муниципальная свалка') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_337', 'ru', 'стихийная свалка') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_338', 'ru', 'сортировать') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_339', 'ru', 'рассортировать') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_340', 'ru', 'сортировка') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_341', 'ru', 'переработка, рециклинг') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_342', 'ru', 'макулатура') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_343', 'ru', 'тратить впустую') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_344', 'ru', 'растратить') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_345', 'ru', 'ценный') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_346', 'ru', 'бесценный') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_347', 'ru', 'расходовать') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_348', 'ru', 'израсходовать') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_349', 'ru', 'восстанавливать') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_350', 'ru', 'восстановить') ON CONFLICT DO NOTHING;
INSERT INTO vocab_translation (vocab_id, lang, text) VALUES ('pl_351', 'ru', 'режим ожидания') ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. Insert theme entries
-- ============================================================

INSERT INTO theme (id, title, title_ru, description, description_ru, "order", unlock_theme_id, unlock_min_score)
VALUES ('pl_theme12', 'Ochrona środowiska i efekt cieplarniany', 'Охрана окружающей среды и парниковый эффект',
        'Лексика для обсуждения охраны окружающей среды, парникового эффекта и вымирания видов',
        'Лексика для обсуждения охраны окружающей среды, парникового эффекта и вымирания видов',
        112, NULL, NULL) ON CONFLICT DO NOTHING;

INSERT INTO theme (id, title, title_ru, description, description_ru, "order", unlock_theme_id, unlock_min_score)
VALUES ('pl_theme13', 'Katastrofy naturalne', 'Стихийные катастрофы',
        'Лексика для обсуждения пожаров, наводнений, ураганов, землетрясений и других стихийных катастроф',
        'Лексика для обсуждения пожаров, наводнений, ураганов, землетрясений и других стихийных катастроф',
        113, NULL, NULL) ON CONFLICT DO NOTHING;

INSERT INTO theme (id, title, title_ru, description, description_ru, "order", unlock_theme_id, unlock_min_score)
VALUES ('pl_theme14', 'Śmieci, odpady i oszczędzanie zasobów', 'Мусор, отходы и экономия ресурсов',
        'Лексика для обсуждения мусора, переработки отходов и экономии ресурсов',
        'Лексика для обсуждения мусора, переработки отходов и экономии ресурсов',
        114, NULL, NULL) ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. Insert theme_vocab mappings
-- ============================================================

-- Theme 12: pl_211-pl_249
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_211') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_212') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_213') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_214') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_215') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_216') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_217') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_218') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_219') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_220') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_221') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_222') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_223') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_224') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_225') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_226') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_227') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_228') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_229') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_230') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_231') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_232') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_233') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_234') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_235') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_236') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_237') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_238') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_239') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_240') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_241') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_242') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_243') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_244') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_245') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_246') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_247') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_248') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme12', 'pl_249') ON CONFLICT DO NOTHING;

-- Theme 13: pl_250-pl_320
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_250') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_251') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_252') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_253') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_254') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_255') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_256') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_257') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_258') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_259') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_260') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_261') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_262') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_263') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_264') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_265') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_266') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_267') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_268') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_269') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_270') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_271') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_272') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_273') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_274') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_275') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_276') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_277') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_278') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_279') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_280') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_281') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_282') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_283') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_284') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_285') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_286') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_287') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_288') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_289') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_290') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_291') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_292') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_293') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_294') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_295') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_296') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_297') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_298') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_299') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_300') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_301') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_302') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_303') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_304') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_305') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_306') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_307') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_308') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_309') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_310') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_311') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_312') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_313') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_314') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_315') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_316') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_317') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_318') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_319') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme13', 'pl_320') ON CONFLICT DO NOTHING;

-- Theme 14: pl_321-pl_351
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_321') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_322') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_323') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_324') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_325') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_326') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_327') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_328') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_329') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_330') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_331') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_332') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_333') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_334') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_335') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_336') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_337') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_338') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_339') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_340') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_341') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_342') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_343') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_344') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_345') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_346') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_347') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_348') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_349') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_350') ON CONFLICT DO NOTHING;
INSERT INTO theme_vocab (theme_id, vocab_id) VALUES ('pl_theme14', 'pl_351') ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. Insert theme sections (JSONB grammar content)
-- ============================================================

INSERT INTO theme_section (theme_id, sort_order, type, content)
VALUES ('pl_theme12', 0, 'grammar', '{
  "notes": [
    {
      "title": "Охрана окружающей среды",
      "text": "Ключевые глаголы для описания воздействия на природу:",
      "examples": [
        {"pl": "chronić / ochronić przyrodę", "ru": "охранять / охранить природу"},
        {"pl": "dbać / zadbać o środowisko", "ru": "следить за окружающей средой"},
        {"pl": "troszczyć się o planetę", "ru": "заботиться о планете"},
        {"pl": "zanieczyszczać wodę", "ru": "загрязнять воду"},
        {"pl": "zatruwać powietrze", "ru": "отравлять воздух"},
        {"pl": "zapobiegać zanieczyszczeniu", "ru": "предотвращать загрязнение"}
      ]
    },
    {
      "title": "Парниковый эффект",
      "text": "Как говорят о глобальном потеплении на польском:",
      "examples": [
        {"pl": "efekt cieplarniany (= szklarniowy)", "ru": "парниковый эффект (= тепличный)"},
        {"pl": "ocieplenie klimatu Ziemi", "ru": "потепление климата"},
        {"pl": "dwutlenek węgla (CO₂)", "ru": "диоксид углерода"},
        {"pl": "temperatura powierzchni Ziemi", "ru": "температура поверхности Земли"}
      ]
    },
    {
      "title": "Вымирание видов",
      "text": "Термины, связанные с исчезновением видов:",
      "examples": [
        {"pl": "wymierać → wymarły gatunek", "ru": "ымирать → вымерший вид"},
        {"pl": "wymierający gatunek (= ginący gatunek)", "ru": "вымирающий (= исчезающий) вид"},
        {"pl": "zagłada gatunku", "ru": "гибель вида"}
      ]
    }
  ]
}'::jsonb) ON CONFLICT DO NOTHING;

INSERT INTO theme_section (theme_id, sort_order, type, content)
VALUES ('pl_theme13', 0, 'grammar', '{
  "notes": [
    {
      "title": "Пожар (Pożar)",
      "text": "Как описывают огонь и пожар на польском:",
      "examples": [
        {"pl": "ogień → pożar", "ru": "огонь → пожар"},
        {"pl": "palić się / płonąć", "ru": "гореть / пылать"},
        {"pl": "gasić pożar", "ru": "тушить пожар"},
        {"pl": "ogień trawi budynek", "ru": "огонь пожирает здание"},
        {"pl": "wybuchać", "ru": "вспыхнуть / взорваться"}
      ]
    },
    {
      "title": "Наводнение (Powódź)",
      "text": "Термины, связанные с наводнениями:",
      "examples": [
        {"pl": "powódź → fala powodziowa", "ru": "наводнение → паводковая волна"},
        {"pl": "fala kulminacyjna", "ru": "кульминационная волна"},
        {"pl": "występować z brzegów", "ru": "выходить из берегов"},
        {"pl": "zalewać miasto", "ru": "затапливать город"},
        {"pl": "porywać samochody", "ru": "уносить машины"},
        {"pl": "podmywać brzegi", "ru": "подмывать берега"}
      ]
    },
    {
      "title": "Ураган, тайфун, торнадо",
      "text": "Ветер и шторм на польском:",
      "examples": [
        {"pl": "huragan / tajfun / tornado", "ru": "ураган / тайфун / торнадо"},
        {"pl": "wichura", "ru": "шторм, буря"},
        {"pl": "wiatr porywisty / gwałtowny", "ru": "порывистый / резкий ветер"},
        {"pl": "szaleć → cichnąć", "ru": "бушевать → стихать"}
      ]
    },
    {
      "title": "Землетрясение (Trzęsienie ziemi)",
      "text": "Описания последствий землетрясений:",
      "examples": [
        {"pl": "trzęsienie ziemi", "ru": "землетрясение"},
        {"pl": "ziemia trzęsie się", "ru": "земля трясётся"},
        {"pl": "budynek wali się / zawali się", "ru": "здание рушится / обрушится"},
        {"pl": "ulegać zniszczeniu", "ru": "подвергаться разрушению"},
        {"pl": "runąć → ruiny budynku", "ru": "рухнуть → руины здания"}
      ]
    },
    {
      "title": "Катастрофа: помощь и последствия",
      "text": "Слова для обсуждения катастроф и спасения:",
      "examples": [
        {"pl": "dochodzić do katastrofy", "ru": "доходить до катастрофы"},
        {"pl": "unikać katastrofy", "ru": "избегать катастрофы"},
        {"pl": "katastrofa może mieć miejsce", "ru": "катастрофа может произойти"},
        {"pl": "ewakuować ludzi i zwierzęta", "ru": "эвакуировать людей и животных"},
        {"pl": "ocalać ludzi", "ru": "спасать людей"},
        {"pl": "ofiara → szkoda", "ru": "жертва → ущерб"}
      ]
    }
  ]
}'::jsonb) ON CONFLICT DO NOTHING;

INSERT INTO theme_section (theme_id, sort_order, type, content)
VALUES ('pl_theme14', 0, 'grammar', '{
  "notes": [
    {
      "title": "Мусор и отходы",
      "text": "Основные термины для описания мусора:",
      "examples": [
        {"pl": "śmieci / odpady", "ru": "мусор / отходы"},
        {"pl": "odpadki / resztki", "ru": "отбросы / остатки"},
        {"pl": "śmiecić", "ru": "мусорить"},
        {"pl": "śmietnik", "ru": "мусорный бак"}
      ]
    },
    {
      "title": "Свалки и утилизация",
      "text": "Как говорят о местах хранения мусора:",
      "examples": [
        {"pl": "wysypisko śmieci", "ru": "свалка мусора"},
        {"pl": "wysypisko komunalne", "ru": "муниципальная свалка"},
        {"pl": "wysypisko dzikie", "ru": "стихийная свалка"},
        {"pl": "ścieki → oczyszczalnia ścieków", "ru": "сточные воды → очистные сооружения"},
        {"pl": "rozkładać się → rozkład", "ru": "разлагаться → разложение"}
      ]
    },
    {
      "title": "Сортировка и переработка",
      "text": "Экологичная утилизация:",
      "examples": [
        {"pl": "segregować śmieci", "ru": "сортировать мусор"},
        {"pl": "segregacja szkła, plastiku, metalu, papieru", "ru": "сортировка стекла, пластика, металла, бумаги"},
        {"pl": "recykling", "ru": "переработка, рециклинг"},
        {"pl": "makulatura", "ru": "макулатура"}
      ]
    },
    {
      "title": "Экономия ресурсов",
      "text": "Как говорят о бережном отношении к ресурсам:",
      "examples": [
        {"pl": "marnować wodę, czas, pieniądze", "ru": "тратить впустую воду, время, деньги"},
        {"pl": "cenny → bezcenny", "ru": "ценный → бесценный"},
        {"pl": "zużywać wodę, energię", "ru": "расходовать воду, энергию"},
        {"pl": "odzyskiwać metal, papier", "ru": "восстанавливать металл, бумагу"},
        {"pl": "tryb czuwania", "ru": "режим ожидания (электроприборов)"}
      ]
    }
  ]
}'::jsonb) ON CONFLICT DO NOTHING;
