-- Add Mikitko basic-lexicon examples to Polish theme 20

BEGIN;

INSERT INTO vocab (id, target, ipa, gender, freq, theme) VALUES
  ('pl_516', 'Pamiętam to.', '/paˈmjɛntam tɔ/', NULL, 556, 'verbs_m_polite'),
  ('pl_517', 'Spotykam się z Anną.', '/spɔˈtɨkam ɕɛ z ˈannɔ̃/', NULL, 557, 'verbs_m_polite'),
  ('pl_518', 'Trzymam książkę.', '/ˈtʂɨmam ˈkɕɔ̃ʂkɛ/', NULL, 558, 'verbs_m_polite'),
  ('pl_519', 'Gram w piłkę.', '/ɡram f ˈpiwkɛ/', NULL, 559, 'verbs_m_polite'),
  ('pl_520', 'Śpiewam piosenkę.', '/ˈɕpjɛvam pjɔˈsɛŋkɛ/', NULL, 560, 'verbs_m_polite'),
  ('pl_521', 'Pomagam mamie.', '/pɔˈmaɡam ˈmamjɛ/', NULL, 561, 'verbs_m_polite'),
  ('pl_522', 'Odpowiadam na pytanie.', '/ɔtpɔˈvjadam na pɨˈtaɲɛ/', NULL, 562, 'verbs_m_polite'),
  ('pl_523', 'Używam słownika.', '/uˈʐɨvam swɔvˈɲika/', NULL, 563, 'verbs_m_polite'),
  ('pl_524', 'Sprawdzam słowo.', '/ˈspravd͡zam ˈswɔvɔ/', NULL, 564, 'verbs_m_polite'),
  ('pl_525', 'Zbieram znaczki.', '/ˈzbjɛram ˈznat͡ʂki/', NULL, 565, 'verbs_m_polite')
ON CONFLICT (id) DO UPDATE SET
  target = EXCLUDED.target,
  ipa = EXCLUDED.ipa,
  gender = EXCLUDED.gender,
  freq = EXCLUDED.freq,
  theme = EXCLUDED.theme;

INSERT INTO vocab_translation (vocab_id, lang, text) VALUES
  ('pl_516', 'ru', 'Я это помню.'),
  ('pl_517', 'ru', 'Я встречаюсь с Анной.'),
  ('pl_518', 'ru', 'Я держу книгу.'),
  ('pl_519', 'ru', 'Я играю в футбол.'),
  ('pl_520', 'ru', 'Я пою песню.'),
  ('pl_521', 'ru', 'Я помогаю маме.'),
  ('pl_522', 'ru', 'Я отвечаю на вопрос.'),
  ('pl_523', 'ru', 'Я пользуюсь словарём.'),
  ('pl_524', 'ru', 'Я проверяю слово.'),
  ('pl_525', 'ru', 'Я собираю марки.'),
  ('pl_516', 'en', 'I remember it.'),
  ('pl_517', 'en', 'I am meeting Anna.'),
  ('pl_518', 'en', 'I am holding a book.'),
  ('pl_519', 'en', 'I am playing football.'),
  ('pl_520', 'en', 'I am singing a song.'),
  ('pl_521', 'en', 'I am helping mom.'),
  ('pl_522', 'en', 'I am answering the question.'),
  ('pl_523', 'en', 'I am using a dictionary.'),
  ('pl_524', 'en', 'I am checking a word.'),
  ('pl_525', 'en', 'I collect stamps.')
ON CONFLICT (vocab_id, lang) DO UPDATE SET text = EXCLUDED.text;

INSERT INTO theme_vocab (theme_id, vocab_id) VALUES
  ('pl_theme20', 'pl_516'),
  ('pl_theme20', 'pl_517'),
  ('pl_theme20', 'pl_518'),
  ('pl_theme20', 'pl_519'),
  ('pl_theme20', 'pl_520'),
  ('pl_theme20', 'pl_521'),
  ('pl_theme20', 'pl_522'),
  ('pl_theme20', 'pl_523'),
  ('pl_theme20', 'pl_524'),
  ('pl_theme20', 'pl_525')
ON CONFLICT DO NOTHING;

UPDATE theme
SET
  description = 'Польские вопросы, спряжение rozumieć/szukać и обращения Pan/Pani',
  description_ru = 'Польские вопросы, спряжение rozumieć/szukać и обращения Pan/Pani'
WHERE id = 'pl_theme20';

UPDATE theme_section
SET content = $json$
{
  "type": "grammar",
  "notes": [
    {
      "title": "Глаголы с -m в форме ja",
      "text": "У многих частотных польских глаголов в 1-м лице единственного числа окончание -m. Часто достаточно убрать -ć у инфинитива и добавить личное окончание: -m, -sz, нулевое, -my, -cie, -ją.",
      "examples": [
        { "pl": "rozumieć → rozumiem, rozumiesz, rozumie", "ru": "понимать → я понимаю, ты понимаешь, он/она понимает" },
        { "pl": "szukać → szukam, szukasz, szuka", "ru": "искать → я ищу, ты ищешь, он/она ищет" },
        { "pl": "mieszkać → mieszkam w Polsce", "ru": "жить → я живу в Польше" },
        { "pl": "czytać → czytam książkę", "ru": "читать → я читаю книгу" },
        { "pl": "kochać → kocham cię", "ru": "любить → я тебя люблю" },
        { "pl": "pamiętać → Pamiętam to.", "ru": "помнить → Я это помню." },
        { "pl": "trzymać → Trzymam książkę.", "ru": "держать → Я держу книгу." },
        { "pl": "grać → Gram w piłkę.", "ru": "играть → Я играю в футбол." },
        { "pl": "śpiewać → Śpiewam piosenkę.", "ru": "петь → Я пою песню." }
      ]
    },
    {
      "title": "Глаголы с się",
      "text": "Возвратная частица się обычно стоит после глагола или рядом с ним. В форме ja окончание глагола остаётся тем же: spotykam się.",
      "examples": [
        { "pl": "spotykać się → Spotykam się z Anną.", "ru": "встречаться → Я встречаюсь с Анной." },
        { "pl": "Spotykasz się z Markiem?", "ru": "Ты встречаешься с Мареком?" }
      ]
    },
    {
      "title": "Управление частотных глаголов",
      "text": "У некоторых глаголов важно запоминать не только форму ja, но и падеж или предлог после глагола.",
      "examples": [
        { "pl": "pomagać komuś → Pomagam mamie.", "ru": "помогать кому-то → Я помогаю маме." },
        { "pl": "odpowiadać na coś → Odpowiadam na pytanie.", "ru": "отвечать на что-то → Я отвечаю на вопрос." },
        { "pl": "używać czegoś → Używam słownika.", "ru": "пользоваться чем-то → Я пользуюсь словарём." },
        { "pl": "sprawdzać coś → Sprawdzam słowo.", "ru": "проверять что-то → Я проверяю слово." },
        { "pl": "zbierać coś → Zbieram znaczki.", "ru": "собирать что-то → Я собираю марки." }
      ]
    },
    {
      "title": "Czekać na + biernik",
      "text": "Глагол czekać требует предлога na и винительного падежа.",
      "examples": [
        { "pl": "Czekam na Annę.", "ru": "Я жду Анну." },
        { "pl": "Czekasz na tramwaj?", "ru": "Ты ждёшь трамвай?" }
      ]
    },
    {
      "title": "Как задавать вопросы",
      "text": "Вопрос можно сделать интонацией или частицей czy. Частица czy ставится в начало предложения и делает вопрос более явным.",
      "examples": [
        { "pl": "Przyjdziesz na moje urodziny?", "ru": "Ты придёшь ко мне на день рождения?" },
        { "pl": "Czy przyjdziesz na moje urodziny?", "ru": "Придёшь ли ты ко мне на день рождения?" },
        { "pl": "Słyszysz?", "ru": "Ты слышишь?" }
      ]
    },
    {
      "title": "Вежливое обращение Pan/Pani",
      "text": "В польском вежливое обращение строится не через wy, а через Pan/Pani с глаголом в 3-м лице единственного числа.",
      "examples": [
        { "pl": "Czy Pan mówi po polsku?", "ru": "Вы говорите по-польски? (к мужчине)" },
        { "pl": "Czy Pani mieszka tutaj?", "ru": "Вы живёте здесь? (к женщине)" },
        { "pl": "Panowie / Panie / Państwo", "ru": "господа / дамы / дамы и господа, смешанная группа" }
      ]
    },
    {
      "title": "Звательный падеж",
      "text": "При прямом обращении Pan меняется на Panie, а Pani остаётся Pani.",
      "examples": [
        { "pl": "Panie Profesorze!", "ru": "Господин профессор!" },
        { "pl": "Pani Anno!", "ru": "Госпожа Анна!" }
      ]
    },
    {
      "title": "Глагол как целое предложение",
      "text": "Личное окончание часто уже показывает подлежащее, поэтому местоимение можно опустить.",
      "examples": [
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
    },
    {
      "verb": "szukać",
      "translation": "искать",
      "rows": [
        { "pronoun": "ja", "form": "szukam", "ipa": "/ˈʂukam/" },
        { "pronoun": "ty", "form": "szukasz", "ipa": "/ˈʂukaʂ/" },
        { "pronoun": "on/ona/ono", "form": "szuka", "ipa": "/ˈʂuka/" },
        { "pronoun": "my", "form": "szukamy", "ipa": "/ʂuˈkamɨ/" },
        { "pronoun": "wy", "form": "szukacie", "ipa": "/ʂuˈkat͡ɕɛ/" },
        { "pronoun": "oni/one", "form": "szukają", "ipa": "/ʂuˈkajɔ̃/" }
      ]
    }
  ]
}
$json$::jsonb
WHERE theme_id = 'pl_theme20' AND sort_order = 0 AND type = 'grammar';

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
        "title": "Глаголы с -m в форме ja",
        "text": "У многих частотных польских глаголов в 1-м лице единственного числа окончание -m. Часто достаточно убрать -ć у инфинитива и добавить личное окончание: -m, -sz, нулевое, -my, -cie, -ją.",
        "examples": [
          { "pl": "rozumieć → rozumiem, rozumiesz, rozumie", "ru": "понимать → я понимаю, ты понимаешь, он/она понимает" },
          { "pl": "szukać → szukam, szukasz, szuka", "ru": "искать → я ищу, ты ищешь, он/она ищет" },
          { "pl": "pamiętać → Pamiętam to.", "ru": "помнить → Я это помню." },
          { "pl": "trzymać → Trzymam książkę.", "ru": "держать → Я держу книгу." }
        ]
      }
    ],
    "tables": []
  }
  $json$::jsonb
WHERE NOT EXISTS (
  SELECT 1
  FROM theme_section
  WHERE theme_id = 'pl_theme20' AND sort_order = 0 AND type = 'grammar'
);

INSERT INTO theme_section (theme_id, sort_order, type, content)
SELECT
  'pl_theme20',
  1,
  'exercises',
  $json$
  {
    "type": "exercises",
    "exercises": [
      { "type": "write_answer", "category": "Глаголы на -am", "prompt": "Я это помню.", "answer": "Pamiętam to.", "hint": "pamiętać → pamiętam" },
      { "type": "write_answer", "category": "Глаголы с się", "prompt": "Я встречаюсь с Анной.", "answer": "Spotykam się z Anną.", "hint": "spotykać się z kimś; z Anną" },
      { "type": "write_answer", "category": "Глаголы на -am", "prompt": "Я держу книгу.", "answer": "Trzymam książkę.", "hint": "trzymać → trzymam; biernik: książkę" },
      { "type": "write_answer", "category": "Глаголы на -am", "prompt": "Я играю в футбол.", "answer": "Gram w piłkę.", "hint": "grać w coś; w piłkę" },
      { "type": "write_answer", "category": "Глаголы на -am", "prompt": "Я пою песню.", "answer": "Śpiewam piosenkę.", "hint": "śpiewać → śpiewam; biernik: piosenkę" },
      { "type": "write_answer", "category": "Управление глаголов", "prompt": "Я помогаю маме.", "answer": "Pomagam mamie.", "hint": "pomagać komuś; celownik: mamie" },
      { "type": "write_answer", "category": "Управление глаголов", "prompt": "Я отвечаю на вопрос.", "answer": "Odpowiadam na pytanie.", "hint": "odpowiadać na coś; na pytanie" },
      { "type": "write_answer", "category": "Управление глаголов", "prompt": "Я пользуюсь словарём.", "answer": "Używam słownika.", "hint": "używać czegoś; dopełniacz: słownika" },
      { "type": "write_answer", "category": "Управление глаголов", "prompt": "Я проверяю слово.", "answer": "Sprawdzam słowo.", "hint": "sprawdzać coś; biernik: słowo" },
      { "type": "write_answer", "category": "Управление глаголов", "prompt": "Я собираю марки.", "answer": "Zbieram znaczki.", "hint": "zbierać coś; biernik: znaczki" }
    ]
  }
  $json$::jsonb
WHERE NOT EXISTS (
  SELECT 1
  FROM theme_section
  WHERE theme_id = 'pl_theme20' AND sort_order = 1 AND type = 'exercises'
);

UPDATE theme_section
SET content = $json$
{
  "type": "exercises",
  "exercises": [
    { "type": "write_answer", "category": "Глаголы на -am", "prompt": "Я это помню.", "answer": "Pamiętam to.", "hint": "pamiętać → pamiętam" },
    { "type": "write_answer", "category": "Глаголы с się", "prompt": "Я встречаюсь с Анной.", "answer": "Spotykam się z Anną.", "hint": "spotykać się z kimś; z Anną" },
    { "type": "write_answer", "category": "Глаголы на -am", "prompt": "Я держу книгу.", "answer": "Trzymam książkę.", "hint": "trzymać → trzymam; biernik: książkę" },
    { "type": "write_answer", "category": "Глаголы на -am", "prompt": "Я играю в футбол.", "answer": "Gram w piłkę.", "hint": "grać w coś; w piłkę" },
    { "type": "write_answer", "category": "Глаголы на -am", "prompt": "Я пою песню.", "answer": "Śpiewam piosenkę.", "hint": "śpiewać → śpiewam; biernik: piosenkę" },
    { "type": "write_answer", "category": "Управление глаголов", "prompt": "Я помогаю маме.", "answer": "Pomagam mamie.", "hint": "pomagać komuś; celownik: mamie" },
    { "type": "write_answer", "category": "Управление глаголов", "prompt": "Я отвечаю на вопрос.", "answer": "Odpowiadam na pytanie.", "hint": "odpowiadać na coś; na pytanie" },
    { "type": "write_answer", "category": "Управление глаголов", "prompt": "Я пользуюсь словарём.", "answer": "Używam słownika.", "hint": "używać czegoś; dopełniacz: słownika" },
    { "type": "write_answer", "category": "Управление глаголов", "prompt": "Я проверяю слово.", "answer": "Sprawdzam słowo.", "hint": "sprawdzać coś; biernik: słowo" },
    { "type": "write_answer", "category": "Управление глаголов", "prompt": "Я собираю марки.", "answer": "Zbieram znaczki.", "hint": "zbierać coś; biernik: znaczki" }
  ]
}
$json$::jsonb
WHERE theme_id = 'pl_theme20' AND sort_order = 1 AND type = 'exercises';

COMMIT;
