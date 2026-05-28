-- Seed Polish theme 20: verbs ending in -m and polite address

BEGIN;

INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES
  ('pl_492', 'rozumieć', '/rɔˈzumjɛt͡ɕ/', NULL, 532, 'verbs_m_polite'),
  ('pl_493', 'rozumiem', '/rɔˈzumjɛm/', NULL, 533, 'verbs_m_polite'),
  ('pl_494', 'rozumiesz', '/rɔˈzumjɛʂ/', NULL, 534, 'verbs_m_polite'),
  ('pl_495', 'szukać', '/ˈʂukat͡ɕ/', NULL, 535, 'verbs_m_polite'),
  ('pl_496', 'szukam', '/ˈʂukam/', NULL, 536, 'verbs_m_polite'),
  ('pl_497', 'mieszkać', '/ˈmjɛʂkat͡ɕ/', NULL, 537, 'verbs_m_polite'),
  ('pl_498', 'mieszkam w Polsce', '/ˈmjɛʂkam f ˈpɔlst͡sɛ/', NULL, 538, 'verbs_m_polite'),
  ('pl_499', 'czytać', '/ˈt͡ʂɨtat͡ɕ/', NULL, 539, 'verbs_m_polite'),
  ('pl_500', 'czytam książkę', '/ˈt͡ʂɨtam ˈkɕɔ̃ʂkɛ/', NULL, 540, 'verbs_m_polite'),
  ('pl_501', 'kochać', '/ˈkɔxat͡ɕ/', NULL, 541, 'verbs_m_polite'),
  ('pl_502', 'kocham cię', '/ˈkɔxam t͡ɕɛ/', NULL, 542, 'verbs_m_polite'),
  ('pl_503', 'grać', '/ɡrat͡ɕ/', NULL, 543, 'verbs_m_polite'),
  ('pl_504', 'śpiewać', '/ˈɕpjɛvat͡ɕ/', NULL, 544, 'verbs_m_polite'),
  ('pl_505', 'czekać na', '/ˈt͡ʂɛkat͡ɕ na/', NULL, 545, 'verbs_m_polite'),
  ('pl_506', 'Czekam na Annę.', '/ˈt͡ʂɛkam na ˈannɛ/', NULL, 546, 'verbs_m_polite'),
  ('pl_507', 'czy', '/t͡ʂɨ/', NULL, 547, 'verbs_m_polite'),
  ('pl_508', 'Czy przyjdziesz na moje urodziny?', '/t͡ʂɨ pʂɨjˈd͡ʑɛʂ na ˈmɔjɛ urɔˈd͡ʑinɨ/', NULL, 548, 'verbs_m_polite'),
  ('pl_509', 'Pan', '/pan/', 'm', 549, 'verbs_m_polite'),
  ('pl_510', 'Pani', '/ˈpaɲi/', 'f', 550, 'verbs_m_polite'),
  ('pl_511', 'Czy Pan mówi po polsku?', '/t͡ʂɨ pan ˈmuvi pɔ ˈpɔlsku/', NULL, 551, 'verbs_m_polite'),
  ('pl_512', 'Czy Pani mieszka tutaj?', '/t͡ʂɨ ˈpaɲi ˈmjɛʂka ˈtutaj/', NULL, 552, 'verbs_m_polite'),
  ('pl_513', 'Państwo', '/ˈpaɲstfɔ/', NULL, 553, 'verbs_m_polite'),
  ('pl_514', 'Panie Profesorze!', '/ˈpaɲɛ prɔfɛˈsɔʐɛ/', NULL, 554, 'verbs_m_polite'),
  ('pl_515', 'Widzę. Słyszysz? Idę.', '/ˈvid͡zɛ ˈswɨʂɨʂ ˈidɛ/', NULL, 555, 'verbs_m_polite')
ON CONFLICT DO NOTHING;

INSERT INTO vocab_translation (vocab_id, lang, text) VALUES
  ('pl_492', 'ru', 'понимать'),
  ('pl_493', 'ru', 'я понимаю'),
  ('pl_494', 'ru', 'ты понимаешь'),
  ('pl_495', 'ru', 'искать'),
  ('pl_496', 'ru', 'я ищу'),
  ('pl_497', 'ru', 'жить, проживать'),
  ('pl_498', 'ru', 'я живу в Польше'),
  ('pl_499', 'ru', 'читать'),
  ('pl_500', 'ru', 'я читаю книгу'),
  ('pl_501', 'ru', 'любить'),
  ('pl_502', 'ru', 'я тебя люблю'),
  ('pl_503', 'ru', 'играть'),
  ('pl_504', 'ru', 'петь'),
  ('pl_505', 'ru', 'ждать кого-то/что-то'),
  ('pl_506', 'ru', 'Я жду Анну.'),
  ('pl_507', 'ru', 'ли; вопросительная частица'),
  ('pl_508', 'ru', 'Ты придёшь ко мне на день рождения?'),
  ('pl_509', 'ru', 'господин; Вы (к мужчине)'),
  ('pl_510', 'ru', 'госпожа; Вы (к женщине)'),
  ('pl_511', 'ru', 'Вы говорите по-польски? (к мужчине)'),
  ('pl_512', 'ru', 'Вы живёте здесь? (к женщине)'),
  ('pl_513', 'ru', 'дамы и господа; Вы (к группе)'),
  ('pl_514', 'ru', 'Господин профессор!'),
  ('pl_515', 'ru', 'Я вижу. Ты слышишь? Я иду.')
ON CONFLICT DO NOTHING;

INSERT INTO theme (id, lang, title, title_ru, description, description_ru, "order", unlock_theme_id, unlock_min_score)
VALUES (
  'pl_theme20',
  'pl',
  'Czasowniki na -m i formy grzecznościowe',
  'Глаголы на -m и вежливое обращение',
  'Dodatkowe zasoby, pytania po polsku, odmiana rozumieć/szukać i zwroty Pan/Pani',
  'Дополнительные ресурсы, польские вопросы, спряжение rozumieć/szukać и обращения Pan/Pani',
  20,
  NULL,
  NULL
) ON CONFLICT DO NOTHING;

INSERT INTO theme_vocab (theme_id, vocab_id)
SELECT 'pl_theme20', id
FROM vocab
WHERE id BETWEEN 'pl_492' AND 'pl_515'
ON CONFLICT DO NOTHING;

INSERT INTO theme_section (theme_id, sort_order, type, content)
SELECT
  'pl_theme20',
  0,
  'grammar',
  $json$
  {
    "type": "grammar",
    "notes": [
      {
        "title": "Ресурсы для самостоятельной проверки",
        "text": "Для примеров в контексте полезны Glosbe, Bab.la и Reverso Context; для произношения — Forvo; для форм слова — Wiktionary. Фразу можно проверить поиском в кавычках.",
        "examples": [
          { "pl": "Glosbe / Bab.la / Reverso Context", "ru": "контекстные словари и примеры употребления" },
          { "pl": "Forvo", "ru": "произношение от носителей" },
          { "pl": "Wiktionary", "ru": "спряжения и склонения" }
        ]
      },
      {
        "title": "Глаголы с -m в форме ja",
        "text": "У многих частотных польских глаголов в 1-м лице единственного числа окончание -m. Часто достаточно убрать -ć у инфинитива и добавить личное окончание: -m, -sz, нулевое, -my, -cie, -ją.",
        "examples": [
          { "pl": "rozumieć → rozumiem, rozumiesz, rozumie", "ru": "понимать → я понимаю, ты понимаешь, он/она понимает" },
          { "pl": "szukać → szukam, szukasz, szuka", "ru": "искать → я ищу, ты ищешь, он/она ищет" },
          { "pl": "Czekam na Annę.", "ru": "Я жду Анну." }
        ]
      },
      {
        "title": "Вопросы и вежливое обращение",
        "text": "Вопрос можно сделать интонацией или частицей czy. Вежливое обращение строится через Pan/Pani с глаголом в 3-м лице единственного числа.",
        "examples": [
          { "pl": "Czy przyjdziesz na moje urodziny?", "ru": "Ты придёшь ко мне на день рождения?" },
          { "pl": "Czy Pan mówi po polsku?", "ru": "Вы говорите по-польски? (к мужчине)" },
          { "pl": "Czy Pani mieszka tutaj?", "ru": "Вы живёте здесь? (к женщине)" }
        ]
      },
      {
        "title": "Звательный падеж и короткие предложения",
        "text": "При прямом обращении Pan меняется на Panie, а Pani остаётся Pani. Личное окончание глагола часто уже показывает подлежащее.",
        "examples": [
          { "pl": "Panie Profesorze!", "ru": "Господин профессор!" },
          { "pl": "Widzę.", "ru": "Я вижу." },
          { "pl": "Słyszysz?", "ru": "Ты слышишь?" },
          { "pl": "Idę.", "ru": "Я иду." }
        ]
      }
    ],
    "tables": [
      {
        "verb": "rozumieć",
        "translation": "понимать",
        "rows": [
          { "pronoun": "ja", "form": "rozumiem", "ipa": "/rɔˈzumjɛm/" },
          { "pronoun": "ty", "form": "rozumiesz", "ipa": "/rɔˈzumjɛʂ/" },
          { "pronoun": "on/ona/ono", "form": "rozumie", "ipa": "/rɔˈzumjɛ/" },
          { "pronoun": "my", "form": "rozumiemy", "ipa": "/rɔzuˈmjɛmɨ/" },
          { "pronoun": "wy", "form": "rozumiecie", "ipa": "/rɔzuˈmjɛt͡ɕɛ/" },
          { "pronoun": "oni/one", "form": "rozumieją", "ipa": "/rɔzuˈmjɛjɔ̃/" }
        ]
      }
    ]
  }
  $json$::jsonb
WHERE NOT EXISTS (
  SELECT 1
  FROM theme_section
  WHERE theme_id = 'pl_theme20' AND sort_order = 0 AND type = 'grammar'
);

COMMIT;
