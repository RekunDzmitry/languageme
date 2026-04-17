// Theme 01 for Polish speakers
// All content in Polish

import { stubTheme } from './stubTheme'

const theme01 = {
  id: 'theme01',
  order: 1,
  title: 'Zaimki osobowe i czasowniki I grupy (-er)',
  titleRu: 'Местоимения и глаголы 1-й группы',
  description: 'Poznaj zaimki osobowe i regularne czasowniki I grupy na -er w czasie teraźniejszym',
  descriptionRu: 'Личные местоимения и правильные глаголы 1-й группы на -er в настоящем времени',
  unlockCondition: null,
  vocabIds: ['fr_008', 'fr_016', 'fr_037', 'fr_044', 'fr_001', 'fr_003', 'fr_081', 'fr_082', 'fr_083', 'fr_084', 'fr_085', 'fr_086', 'fr_087', 'fr_088', 'fr_089', 'fr_090', 'fr_091', 'fr_092', 'fr_093', 'fr_094', 'fr_095', 'fr_096', 'fr_097', 'fr_098', 'fr_099', 'fr_100', 'fr_101', 'fr_102', 'fr_103', 'fr_104', 'fr_105', 'fr_106', 'fr_107', 'fr_108', 'fr_109', 'fr_110', 'fr_111', 'fr_112', 'fr_113', 'fr_114', 'fr_115', 'fr_116', 'fr_117', 'fr_118', 'fr_119', 'fr_120', 'fr_121', 'fr_122', 'fr_123', 'fr_124', 'fr_125', 'fr_126', 'fr_127', 'fr_128', 'fr_129', 'fr_130', 'fr_131', 'fr_132', 'fr_133', 'fr_134', 'fr_135', 'fr_136', 'fr_137', 'fr_138', 'fr_139', 'fr_140', 'fr_141', 'fr_142', 'fr_143', 'fr_144', 'fr_145', 'fr_146', 'fr_147', 'fr_148', 'fr_149', 'fr_150', 'fr_151', 'fr_152', 'fr_153', 'fr_154', 'fr_155', 'fr_156', 'fr_157', 'fr_158', 'fr_159', 'fr_160', 'fr_161', 'fr_162', 'fr_163', 'fr_164', 'fr_165', 'fr_166', 'fr_167', 'fr_168', 'fr_169', 'fr_170', 'fr_171', 'fr_172', 'fr_173', 'fr_174', 'fr_175', 'fr_176', 'fr_177', 'fr_178', 'fr_179', 'fr_180', 'fr_181', 'fr_182', 'fr_183', 'fr_184', 'fr_185', 'fr_186', 'fr_187', 'fr_188', 'fr_189', 'fr_190', 'fr_191', 'fr_192', 'fr_193', 'fr_194', 'fr_195', 'fr_196', 'fr_197', 'fr_198', 'fr_199', 'fr_200', 'fr_201', 'fr_202', 'fr_203', 'fr_204', 'fr_205', 'fr_206', 'fr_207', 'fr_208', 'fr_209', 'fr_210', 'fr_211', 'fr_212', 'fr_213', 'fr_214', 'fr_215', 'fr_216', 'fr_217', 'fr_218', 'fr_219', 'fr_220', 'fr_221', 'fr_222', 'fr_223', 'fr_224', 'fr_225', 'fr_226', 'fr_227', 'fr_228', 'fr_229', 'fr_230', 'fr_231', 'fr_232', 'fr_233', 'fr_234', 'fr_235', 'fr_236', 'fr_237', 'fr_238', 'fr_239', 'fr_240', 'fr_241', 'fr_242', 'fr_243', 'fr_244', 'fr_245', 'fr_246', 'fr_247', 'fr_248', 'fr_249', 'fr_250', 'fr_251', 'fr_252', 'fr_253', 'fr_254', 'fr_255', 'fr_256', 'fr_257', 'fr_258', 'fr_259', 'fr_260', 'fr_261', 'fr_262', 'fr_263', 'fr_264', 'fr_265', 'fr_266', 'fr_267', 'fr_268', 'fr_269', 'fr_270', 'fr_271', 'fr_272', 'fr_273', 'fr_274', 'fr_275', 'fr_276', 'fr_277', 'fr_278', 'fr_279', 'fr_280', 'fr_281', 'fr_282', 'fr_283', 'fr_284', 'fr_285', 'fr_286', 'fr_287', 'fr_288', 'fr_289', 'fr_290', 'fr_291', 'fr_292', 'fr_293', 'fr_294', 'fr_295', 'fr_296', 'fr_297', 'fr_298', 'fr_299', 'fr_300', 'fr_301', 'fr_302', 'fr_303', 'fr_304', 'fr_305', 'fr_309', 'fr_310', 'fr_311', 'fr_312', 'fr_313', 'fr_314', 'fr_315', 'fr_316', 'fr_317', 'fr_318', 'fr_319', 'fr_320', 'fr_321', 'fr_322', 'fr_323', 'fr_324', 'fr_325', 'fr_326', 'fr_327', 'fr_328', 'fr_329', 'fr_330', 'fr_331', 'fr_332', 'fr_333', 'fr_334', 'fr_335', 'fr_336', 'fr_337', 'fr_338', 'fr_339', 'fr_340', 'fr_341', 'fr_342', 'fr_343', 'fr_344', 'fr_345', 'fr_346', 'fr_347', 'fr_348', 'fr_349', 'fr_350', 'fr_351', 'fr_352', 'fr_353', 'fr_354', 'fr_355', 'fr_356', 'fr_357', 'fr_358', 'fr_359', 'fr_360', 'fr_361', 'fr_362', 'fr_363', 'fr_364', 'fr_365', 'fr_366', 'fr_367', 'fr_368', 'fr_369', 'fr_370', 'fr_371', 'fr_372', 'fr_373', 'fr_374', 'fr_375', 'fr_376', 'fr_377', 'fr_378', 'fr_379', 'fr_380', 'fr_381', 'fr_382', 'fr_383', 'fr_384', 'fr_385', 'fr_386', 'fr_387', 'fr_388', 'fr_389', 'fr_390', 'fr_391', 'fr_392'],
  sections: [
    {
      type: 'grammar',
      notes: [
        {
          title: 'Zaimki osobowe',
          text: 'We francuskim jest 8 zaimków osobowych. W przeciwieństwie do polskiego, zaimek jest zawsze używany z czasownikiem.',
          examples: [
            { fr: 'Je', pl: 'Ja' },
            { fr: 'Tu', pl: 'Ty' },
            { fr: 'Il / Elle', pl: 'On / Ona' },
            { fr: 'Nous', pl: 'My' },
            { fr: 'Vous', pl: 'Wy (lub grzecznościowe Pan/Pani)' },
            { fr: 'Ils / Elles', pl: 'Oni (m.) / One (ż.)' },
          ]
        },
        {
          title: 'Trzy grupy czasowników francuskich',
          text: 'Wszystkie czasowniki francuskie dzielą się na trzy grupy:\n\n• I grupa (-er): największa i najbardziej regularna. Około 90% wszystkich czasowników! Np: parler, manger, aimer, travailler.\n\n• II grupa (-ir z -issons): regularne czasowniki na -ir. Np: finir → nous finissons, choisir → nous choisissons.\n\n• III grupa: wszystkie pozostałe — czasowniki nieregularne. Np: être, avoir, aller, faire, prendre.\n\nW tej lekcji uczymy się czasowników I grupy — najprostszych i najczęstszych.',
          examples: [
            { fr: 'parler, manger, aimer, donner', pl: 'I grupa (-er)' },
            { fr: 'finir, choisir, agir', pl: 'II grupa (-ir)' },
            { fr: 'être, avoir, aller, faire', pl: 'III grupa (nieregularne)' },
          ]
        },
        {
          title: 'Odmiana czasowników I grupy (-er)',
          text: 'Aby odmienić czasowniki I grupy, usuwamy końcówkę -er od bezokolicznika — otrzymujemy temat (le radical). Następnie dodajemy końcówki: -e, -es, -e, -ons, -ez, -ent. Temat się nie zmienia!',
          examples: [
            { fr: 'Je mange', pl: 'Jem' },
            { fr: 'Tu manges', pl: 'Jesz' },
            { fr: 'Il mange', pl: 'Je (on)' },
            { fr: 'Nous mangeons', pl: 'Jemy' },
            { fr: 'Vous mangez', pl: 'Jecie (Wy)' },
            { fr: 'Ils mangent', pl: 'Jedzą' },
          ]
        }
      ],
      tables: []
    },
    {
      type: 'grammar',
      notes: [
        {
          title: 'Czasowniki I grupy ze zmianą tematu',
          text: 'Wiele czasowników I grupy (-er) zmienia temat w formach z „niemą" końcówką (je, tu, il, ils). Temat nie zmienia się w formach nous i vous.\n\nWyróżniamy kilka typów zmian:',
          examples: []
        },
        {
          title: 'e → è (acheter, lever, mener…)',
          text: 'Nieakcentowane „e" w przedostatniej sylabie zamienia się w „è" przed niemą końcówką.',
          examples: [
            { fr: "j'achète, tu achètes, il achète", pl: 'ale: nous achetons, vous achetez' },
            { fr: 'je lève, tu lèves, il lève', pl: 'ale: nous levons, vous levez' },
            { fr: 'je mène, tu mènes, il mène', pl: 'ale: nous menons, vous menez' },
          ]
        },
        {
          title: 'é → è (préférer, espérer, répéter…)',
          text: 'Zamknięte „é" w ostatniej sylabie tematu przechodzi w „è" przed niemą końcówką.',
          examples: [
            { fr: 'je préfère, tu préfères, il préfère', pl: 'ale: nous préférons, vous préférez' },
            { fr: "j'espère, tu espères, il espère", pl: 'ale: nous espérons, vous espérez' },
            { fr: 'je répète, tu répètes, il répète', pl: 'ale: nous répétons, vous répétez' },
          ]
        },
        {
          title: 'Zdwojenie spółgłoski (appeler, jeter…)',
          text: 'Spółgłoska przed niemą końcówką (-e, -es) się podwaja.',
          examples: [
            { fr: "j'appelle, tu appelles, il appelle", pl: 'ale: nous appelons, vous appelez' },
            { fr: 'je jette, tu jettes, il jette', pl: 'ale: nous jetons, vous jetez' },
          ]
        },
        {
          title: 'Voyelle + y → voyelle + i + ye (payer…)',
          text: 'W formach je, tu, il, ils przed końcówką -e, -es po samogłosce + y samogłoska się podwaja jako -i-, a -y- staje się -y- tylko w części.',
          examples: [
            { fr: 'je paie, tu paies, il paie', pl: 'ale: nous payons, vous payez' },
            { fr: 'je joue, tu joues, il joue', pl: 'ale: nous jouons, vous jouez' },
          ]
        }
      ],
      tables: [
        {
          title: 'Odmiana czasownika „parler" (mówić)',
          headers: ['Osoba', 'francuski', 'polski'],
          rows: [
            ['ja', 'Je parle', 'Mówię'],
            ['ty', 'Tu parles', 'Mówisz'],
            ['on/ona', 'Il/Elle parle', 'Mówi'],
            ['my', 'Nous parlons', 'Mówimy'],
            ['wy', 'Vous parlez', 'Mówicie'],
            ['oni/one', 'Ils/Elles parlent', 'Mówią'],
          ]
        }
      ]
    }
  ]
}

export const themes = [theme01]
