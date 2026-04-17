// Polish vocabulary for Russian speakers
// Translations are in Russian

const _VOCAB = [
  // Podstawy / Basics
  { id: "pl_001", target: "tak", ipa: "/tak/", gender: null, freq: 1, theme: "basics", themeIds: ["theme01"], translations: { ru: "да", en: "yes" } },
  { id: "pl_002", target: "nie", ipa: "/ɲɛ/", gender: null, freq: 2, theme: "basics", themeIds: ["theme01"], translations: { ru: "нет", en: "no" } },
  { id: "pl_003", target: "cześć", ipa: "/ˈtʂɛɕtɕ/", gender: null, freq: 3, theme: "greetings", themeIds: ["theme01"], translations: { ru: "привет", en: "hi" } },
  { id: "pl_004", target: "dzień dobry", ipa: "/ˈdʑɛɲ ˈdɔbrɨ/", gender: null, freq: 4, theme: "greetings", themeIds: ["theme01"], translations: { ru: "добрый день", en: "good day" } },
  { id: "pl_005", target: "dobry wieczór", ipa: "/ˈdɔbrɨ ˈvʲɛtʂur/", gender: null, freq: 5, theme: "greetings", themeIds: ["theme01"], translations: { ru: "добрый вечер", en: "good evening" } },
  { id: "pl_006", target: "dobranoc", ipa: "/dɔˈbranɔts/", gender: null, freq: 6, theme: "greetings", themeIds: ["theme01"], translations: { ru: "спокойной ночи", en: "good night" } },
  { id: "pl_007", target: "do widzenia", ipa: "/dɔ vʲidˈzɛɲa/", gender: null, freq: 7, theme: "greetings", themeIds: ["theme01"], translations: { ru: "до свидания", en: "goodbye" } },
  { id: "pl_008", target: "proszę", ipa: "/ˈprɔʃɛ/", gender: null, freq: 8, theme: "basics", themeIds: ["theme01"], translations: { ru: "пожалуйста", en: "please" } },
  { id: "pl_009", target: "dziękuję", ipa: "/dʑɛŋˈkujɛ/", gender: null, freq: 9, theme: "basics", themeIds: ["theme01"], translations: { ru: "спасибо", en: "thank you" } },
  { id: "pl_010", target: "przepraszam", ipa: "/pʃɛpraˈʃam/", gender: null, freq: 10, theme: "basics", themeIds: ["theme01"], translations: { ru: "извините", en: "sorry" } },

  // Заместительные местоимения / Pronouns
  { id: "pl_011", target: "ja", ipa: "/ja/", gender: null, freq: 11, theme: "pronouns", themeIds: ["theme01"], translations: { ru: "я", en: "I" } },
  { id: "pl_012", target: "ty", ipa: "/tɨ/", gender: null, freq: 12, theme: "pronouns", themeIds: ["theme01"], translations: { ru: "ты", en: "you (singular)" } },
  { id: "pl_013", target: "on", ipa: "/ɔn/", gender: null, freq: 13, theme: "pronouns", themeIds: ["theme01"], translations: { ru: "он", en: "he" } },
  { id: "pl_014", target: "ona", ipa: "/ˈɔna/", gender: null, freq: 14, theme: "pronouns", themeIds: ["theme01"], translations: { ru: "она", en: "she" } },
  { id: "pl_015", target: "my", ipa: "/mɨ/", gender: null, freq: 15, theme: "pronouns", themeIds: ["theme01"], translations: { ru: "мы", en: "we" } },
  { id: "pl_016", target: "wy", ipa: "/vɨ/", gender: null, freq: 16, theme: "pronouns", themeIds: ["theme01"], translations: { ru: "вы", en: "you (plural)" } },
  { id: "pl_017", target: "oni", ipa: "/ˈɔɲi/", gender: null, freq: 17, theme: "pronouns", themeIds: ["theme01"], translations: { ru: "они (м.р.)", en: "they (masc.)" } },
  { id: "pl_018", target: "one", ipa: "/ˈɔnɛ/", gender: null, freq: 18, theme: "pronouns", themeIds: ["theme01"], translations: { ru: "они (жен.р.)", en: "they (fem.)" } },

  // Глаголы быть/быć
  { id: "pl_019", target: "być", ipa: "/bɨtʂ/", gender: null, freq: 20, theme: "verbs", themeIds: ["theme02"], translations: { ru: "быть", en: "to be" } },
  { id: "pl_020", target: "jestem", ipa: "/ˈjɛstɛm/", gender: null, freq: 21, theme: "verbs", themeIds: ["theme02"], translations: { ru: "я есть (буду)", en: "I am" } },
  { id: "pl_021", target: "jesteś", ipa: "/ˈjɛstɛɕ/", gender: null, freq: 22, theme: "verbs", themeIds: ["theme02"], translations: { ru: "ты есть (будешь)", en: "you are" } },
  { id: "pl_022", target: "jest", ipa: "/jɛst/", gender: null, freq: 23, theme: "verbs", themeIds: ["theme02"], translations: { ru: "он/она есть (будет)", en: "he/she is" } },
  { id: "pl_023", target: "jesteśmy", ipa: "/ˈjɛstɛzmɨ/", gender: null, freq: 24, theme: "verbs", themeIds: ["theme02"], translations: { ru: "мы есть (будем)", en: "we are" } },
  { id: "pl_024", target: "jesteście", ipa: "/ˈjɛstɛɕtɕɛ/", gender: null, freq: 25, theme: "verbs", themeIds: ["theme02"], translations: { ru: "вы есть (будете)", en: "you (pl.) are" } },
  { id: "pl_025", target: "są", ipa: "/sɔ̃/", gender: null, freq: 26, theme: "verbs", themeIds: ["theme02"], translations: { ru: "они есть (будут)", en: "they are" } },

  // Люди / People
  { id: "pl_026", target: "człowiek", ipa: "/ˈtʂwɔvʲɛk/", gender: "m", freq: 30, theme: "people", themeIds: ["theme03"], translations: { ru: "человек", en: "person" } },
  { id: "pl_027", target: "mężczyzna", ipa: "/mɛŋʃˈtʂɨzna/", gender: "m", freq: 31, theme: "people", themeIds: ["theme03"], translations: { ru: "мужчина", en: "man" } },
  { id: "pl_028", target: "kobieta", ipa: "/kɔˈbʲɛta/", gender: "f", freq: 32, theme: "people", themeIds: ["theme03"], translations: { ru: "женщина", en: "woman" } },
  { id: "pl_029", target: "dziecko", ipa: "/ˈdʑɛtʂkɔ/", gender: "n", freq: 33, theme: "people", themeIds: ["theme03"], translations: { ru: "ребёнок", en: "child" } },
  { id: "pl_030", target: "chłopiec", ipa: "/ˈxwɔpʲɛts/", gender: "m", freq: 34, theme: "people", themeIds: ["theme03"], translations: { ru: "мальчик", en: "boy" } },
  { id: "pl_031", target: "dziewczyna", ipa: "/dʑɛfˈtʂɨna/", gender: "f", freq: 35, theme: "people", themeIds: ["theme03"], translations: { ru: "девочка", en: "girl" } },

  // Семья / Family
  { id: "pl_032", target: "rodzina", ipa: "/rɔˈdʑina/", gender: "f", freq: 40, theme: "family", themeIds: ["theme03"], translations: { ru: "семья", en: "family" } },
  { id: "pl_033", target: "matka", ipa: "/ˈmatka/", gender: "f", freq: 41, theme: "family", themeIds: ["theme03"], translations: { ru: "мать", en: "mother" } },
  { id: "pl_034", target: "ojciec", ipa: "/ˈɔjtʂɛts/", gender: "m", freq: 42, theme: "family", themeIds: ["theme03"], translations: { ru: "отец", en: "father" } },
  { id: "pl_035", target: "siostra", ipa: "/ˈɕɔstra/", gender: "f", freq: 43, theme: "family", themeIds: ["theme03"], translations: { ru: "сестра", en: "sister" } },
  { id: "pl_036", target: "brat", ipa: "/brat/", gender: "m", freq: 44, theme: "family", themeIds: ["theme03"], translations: { ru: "брат", en: "brother" } },

  // Числа / Numbers
  { id: "pl_037", target: "jeden", ipa: "/ˈjɛdɛn/", gender: null, freq: 50, theme: "numbers", themeIds: ["theme04"], translations: { ru: "один", en: "one" } },
  { id: "pl_038", target: "dwa", ipa: "/dva/", gender: null, freq: 51, theme: "numbers", themeIds: ["theme04"], translations: { ru: "два", en: "two" } },
  { id: "pl_039", target: "trzy", ipa: "/tʃɨ/", gender: null, freq: 52, theme: "numbers", themeIds: ["theme04"], translations: { ru: "три", en: "three" } },
  { id: "pl_040", target: "cztery", ipa: "/ˈtʂtɛrɨ/", gender: null, freq: 53, theme: "numbers", themeIds: ["theme04"], translations: { ru: "четыре", en: "four" } },
  { id: "pl_041", target: "pięć", ipa: "/pʲɛɲtʂ/", gender: null, freq: 54, theme: "numbers", themeIds: ["theme04"], translations: { ru: "пять", en: "five" } },
  { id: "pl_042", target: "sześć", ipa: "/ˈʃɛɕtʂ/", gender: null, freq: 55, theme: "numbers", themeIds: ["theme04"], translations: { ru: "шесть", en: "six" } },
  { id: "pl_043", target: "siedem", ipa: "/ˈɕɛdɛm/", gender: null, freq: 56, theme: "numbers", themeIds: ["theme04"], translations: { ru: "семь", en: "seven" } },
  { id: "pl_044", target: "osiem", ipa: "/ˈɔɕɛm/", gender: null, freq: 57, theme: "numbers", themeIds: ["theme04"], translations: { ru: "восемь", en: "eight" } },
  { id: "pl_045", target: "dziewięć", ipa: "/dʑɛˈvʲɛɲtʂ/", gender: null, freq: 58, theme: "numbers", themeIds: ["theme04"], translations: { ru: "девять", en: "nine" } },
  { id: "pl_046", target: "dziesięć", ipa: "/dʑɛˈɕɛɲtʂ/", gender: null, freq: 59, theme: "numbers", themeIds: ["theme04"], translations: { ru: "десять", en: "ten" } },

  // Время / Time
  { id: "pl_047", target: "teraz", ipa: "/ˈtɛras/", gender: null, freq: 60, theme: "time", themeIds: ["theme05"], translations: { ru: "сейчас", en: "now" } },
  { id: "pl_048", target: "dziś", ipa: "/dʑiɕ/", gender: null, freq: 61, theme: "time", themeIds: ["theme05"], translations: { ru: "сегодня", en: "today" } },
  { id: "pl_049", target: "jutro", ipa: "/ˈjutrɔ/", gender: null, freq: 62, theme: "time", themeIds: ["theme05"], translations: { ru: "завтра", en: "tomorrow" } },
  { id: "pl_050", target: "wczoraj", ipa: "/ˈftʃɔraj/", gender: null, freq: 63, theme: "time", themeIds: ["theme05"], translations: { ru: "вчера", en: "yesterday" } },
  { id: "pl_051", target: "rano", ipa: "/ˈrano/", gender: null, freq: 64, theme: "time", themeIds: ["theme05"], translations: { ru: "утро", en: "morning" } },
  { id: "pl_052", target: "wieczór", ipa: "/ˈvʲɛtʂur/", gender: null, freq: 65, theme: "time", themeIds: ["theme05"], translations: { ru: "вечер", en: "evening" } },
  { id: "pl_053", target: "noc", ipa: "/nɔts/", gender: null, freq: 66, theme: "time", themeIds: ["theme05"], translations: { ru: "ночь", en: "night" } },
  { id: "pl_054", target: "dzień", ipa: "/dʑɛɲ/", gender: null, freq: 67, theme: "time", themeIds: ["theme05"], translations: { ru: "день", en: "day" } },
  { id: "pl_055", target: "tydzień", ipa: "/ˈtɨdʑɛɲ/", gender: null, freq: 68, theme: "time", themeIds: ["theme05"], translations: { ru: "неделя", en: "week" } },
  { id: "pl_056", target: "miesiąc", ipa: "/ˈmʲɛɕɔnts/", gender: null, freq: 69, theme: "time", themeIds: ["theme05"], translations: { ru: "месяц", en: "month" } },

  // Места / Places
  { id: "pl_057", target: "dom", ipa: "/dɔm/", gender: "m", freq: 70, theme: "places", themeIds: ["theme06"], translations: { ru: "дом", en: "house" } },
  { id: "pl_058", target: "mieszkanie", ipa: "/mʲɛˈʃkaɲɛ/", gender: "n", freq: 71, theme: "places", themeIds: ["theme06"], translations: { ru: "квартира", en: "apartment" } },
  { id: "pl_059", target: "miasto", ipa: "/ˈmʲastɔ/", gender: "n", freq: 72, theme: "places", themeIds: ["theme06"], translations: { ru: "город", en: "city" } },
  { id: "pl_060", target: "wioska", ipa: "/ˈvʲɔska/", gender: "f", freq: 73, theme: "places", themeIds: ["theme06"], translations: { ru: "деревня", en: "village" } },
  { id: "pl_061", target: "ulica", ipa: "/ˈulitsa/", gender: "f", freq: 74, theme: "places", themeIds: ["theme06"], translations: { ru: "улица", en: "street" } },
  { id: "pl_062", target: "sklep", ipa: "/sklɛp/", gender: "m", freq: 75, theme: "places", themeIds: ["theme06"], translations: { ru: "магазин", en: "shop" } },
  { id: "pl_063", target: "restauracja", ipa: "/rɛstauˈratsja/", gender: "f", freq: 76, theme: "places", themeIds: ["theme06"], translations: { ru: "ресторан", en: "restaurant" } },
  { id: "pl_064", target: "szkoła", ipa: "/ˈʃkɔwa/", gender: "f", freq: 77, theme: "places", themeIds: ["theme06"], translations: { ru: "школа", en: "school" } },
  { id: "pl_065", target: "praca", ipa: "/ˈpratsa/", gender: "f", freq: 78, theme: "work", themeIds: ["theme06"], translations: { ru: "работа", en: "work" } },

  // Глаголы / Verbs
  { id: "pl_066", target: "mieć", ipa: "/mʲɛtʂ/", gender: null, freq: 80, theme: "verbs", themeIds: ["theme02"], translations: { ru: "иметь", en: "to have" } },
  { id: "pl_067", target: "robić", ipa: "/ˈrɔbʲitʂ/", gender: null, freq: 81, theme: "verbs", themeIds: ["theme07"], translations: { ru: "делать", en: "to do/make" } },
  { id: "pl_068", target: "iść", ipa: "/iɕtʂ/", gender: null, freq: 82, theme: "verbs", themeIds: ["theme07"], translations: { ru: "идти", en: "to go" } },
  { id: "pl_069", target: "jechać", ipa: "/ˈjɛxatʂ/", gender: null, freq: 83, theme: "verbs", themeIds: ["theme07"], translations: { ru: "ехать", en: "to travel" } },
  { id: "pl_070", target: "mówić", ipa: "/ˈmuvʲitʂ/", gender: null, freq: 84, theme: "verbs", themeIds: ["theme07"], translations: { ru: "говорить", en: "to speak" } },
  { id: "pl_071", target: "rozumieć", ipa: "/rɔˈzʊmʲɛtʂ/", gender: null, freq: 85, theme: "verbs", themeIds: ["theme07"], translations: { ru: "понимать", en: "to understand" } },
  { id: "pl_072", target: "jeść", ipa: "/jɛɕtʂ/", gender: null, freq: 86, theme: "verbs", themeIds: ["theme07"], translations: { ru: "есть", en: "to eat" } },
  { id: "pl_073", target: "pić", ipa: "/pʲitʂ/", gender: null, freq: 87, theme: "verbs", themeIds: ["theme07"], translations: { ru: "пить", en: "to drink" } },
  { id: "pl_074", target: "spać", ipa: "/spaɲtʂ/", gender: null, freq: 88, theme: "verbs", themeIds: ["theme07"], translations: { ru: "спать", en: "to sleep" } },
  { id: "pl_075", target: "uczyć się", ipa: "/ˈutʂɨtʂ ɕɛ/", gender: null, freq: 89, theme: "verbs", themeIds: ["theme07"], translations: { ru: "учиться", en: "to learn" } },

  // Еда / Food
  { id: "pl_076", target: "woda", ipa: "/ˈvoda/", gender: "f", freq: 90, theme: "food", themeIds: ["theme08"], translations: { ru: "вода", en: "water" } },
  { id: "pl_077", target: "chleb", ipa: "/xlɛp/", gender: "m", freq: 91, theme: "food", themeIds: ["theme08"], translations: { ru: "хлеб", en: "bread" } },
  { id: "pl_078", target: "masło", ipa: "/ˈmaswɔ/", gender: "n", freq: 92, theme: "food", themeIds: ["theme08"], translations: { ru: "масло", en: "butter" } },
  { id: "pl_079", target: "mięso", ipa: "/ˈmʲɛɲsɔ/", gender: "n", freq: 93, theme: "food", themeIds: ["theme08"], translations: { ru: "мясо", en: "meat" } },
  { id: "pl_080", target: "kurczak", ipa: "/ˈkurtʃak/", gender: "m", freq: 94, theme: "food", themeIds: ["theme08"], translations: { ru: "курица", en: "chicken" } },
  { id: "pl_081", target: "ryba", ipa: "/ˈrɨba/", gender: "f", freq: 95, theme: "food", themeIds: ["theme08"], translations: { ru: "рыба", en: "fish" } },
  { id: "pl_082", target: "ser", ipa: "/sɛr/", gender: "m", freq: 96, theme: "food", themeIds: ["theme08"], translations: { ru: "сыр", en: "cheese" } },
  { id: "pl_083", target: "mleko", ipa: "/ˈmlɛkɔ/", gender: "n", freq: 97, theme: "food", themeIds: ["theme08"], translations: { ru: "молоко", en: "milk" } },
  { id: "pl_084", target: "jajko", ipa: "/ˈjajkɔ/", gender: "n", freq: 98, theme: "food", themeIds: ["theme08"], translations: { ru: "яйцо", en: "egg" } },
  { id: "pl_085", target: "owoc", ipa: "/ˈɔvɔts/", gender: "m", freq: 99, theme: "food", themeIds: ["theme08"], translations: { ru: "фрукт", en: "fruit" } },

  // Прилагательные / Adjectives
  { id: "pl_086", target: "duży", ipa: "/ˈduʒɨ/", gender: null, freq: 100, theme: "adjectives", themeIds: ["theme09"], translations: { ru: "большой", en: "big" } },
  { id: "pl_087", target: "mały", ipa: "/ˈmawɨ/", gender: null, freq: 101, theme: "adjectives", themeIds: ["theme09"], translations: { ru: "маленький", en: "small" } },
  { id: "pl_088", target: "dobry", ipa: "/ˈdɔbrɨ/", gender: null, freq: 102, theme: "adjectives", themeIds: ["theme09"], translations: { ru: "хороший", en: "good" } },
  { id: "pl_089", target: "zły", ipa: "/zwɨ/", gender: null, freq: 103, theme: "adjectives", themeIds: ["theme09"], translations: { ru: "плохой", en: "bad" } },
  { id: "pl_090", target: "nowy", ipa: "/ˈnɔvɨ/", gender: null, freq: 104, theme: "adjectives", themeIds: ["theme09"], translations: { ru: "новый", en: "new" } },
  { id: "pl_091", target: "stary", ipa: "/ˈstarɨ/", gender: null, freq: 105, theme: "adjectives", themeIds: ["theme09"], translations: { ru: "старый", en: "old" } },
  { id: "pl_092", target: "ładny", ipa: "/ˈwadnɨ/", gender: null, freq: 106, theme: "adjectives", themeIds: ["theme09"], translations: { ru: "красивый", en: "beautiful" } },
  { id: "pl_093", target: "brzydki", ipa: "/ˈbʒɨtkʲi/", gender: null, freq: 107, theme: "adjectives", themeIds: ["theme09"], translations: { ru: "уродливый", en: "ugly" } },
  { id: "pl_094", target: "szybki", ipa: "/ˈʃɨpkʲi/", gender: null, freq: 108, theme: "adjectives", themeIds: ["theme09"], translations: { ru: "быстрый", en: "fast" } },
  { id: "pl_095", target: "wolny", ipa: "/ˈvɔlnɨ/", gender: null, freq: 109, theme: "adjectives", themeIds: ["theme09"], translations: { ru: "медленный", en: "slow" } },
]

export const VOCAB = _VOCAB

// Polish verb conjugations for Training page
const PL_PRONOUNS = [
  { index: 0, label: 'ja', translation: 'я' },
  { index: 1, label: 'ty', translation: 'ты' },
  { index: 2, label: 'on/ona/ono', translation: 'он/она/оно' },
  { index: 3, label: 'my', translation: 'мы' },
  { index: 4, label: 'wy', translation: 'вы' },
  { index: 5, label: 'oni/one', translation: 'они' },
]

// być (to be) - present tense
const verbByc = {
  infinitive: 'być',
  translation: 'быть',
  group: 'irregular',
  conjugations: {
    pres: ['jestem', 'jesteś', 'jest', 'jesteśmy', 'jesteście', 'są'],
  },
}

// mieć (to have) - present tense
const verbMiec = {
  infinitive: 'mieć',
  translation: 'иметь',
  group: 'regular',
  conjugations: {
    pres: ['mam', 'masz', 'ma', 'mamy', 'macie', 'mają'],
  },
}

// mówić (to speak) - present tense
const verbMowic = {
  infinitive: 'mówić',
  translation: 'говорить',
  group: 'regular',
  conjugations: {
    pres: ['mówię', 'mówisz', 'mówi', 'mówimy', 'mówicie', 'mówią'],
  },
}

// rozumieć (to understand) - present tense
const verbRozumiec = {
  infinitive: 'rozumieć',
  translation: 'понимать',
  group: 'regular',
  conjugations: {
    pres: ['rozumiem', 'rozumiesz', 'rozumie', 'rozumiemy', 'rozumiecie', 'rozumieją'],
  },
}

// jeść (to eat) - present tense
const verbJesc = {
  infinitive: 'jeść',
  translation: 'есть',
  group: 'irregular',
  conjugations: {
    pres: ['jem', 'jesz', 'je', 'jemy', 'jecie', 'jedzą'],
  },
}

// iść (to go) - present tense
const verbIsc = {
  infinitive: 'iść',
  translation: 'идти',
  group: 'irregular',
  conjugations: {
    pres: ['idę', 'idziesz', 'idzie', 'idziemy', 'idziecie', 'idą'],
  },
}

export const THEMES = [
  {
    id: "theme01",
    title: "Podstawy i powitania",
    titleRu: "Основы и приветствия",
    order: 1,
    description: "Podstawowe słowa i zwroty grzecznościowe",
    descriptionRu: "Базовая лексика и вежливые выражения",
    sections: [],
    verbList: [verbByc, verbMiec, verbMowic, verbRozumiec],
  },
  {
    id: "theme02",
    title: "Czasowniki być i mieć",
    titleRu: "Глаголы быть и иметь",
    order: 2,
    description: "Odmiana czasowników być i mieć w czasie teraźniejszym",
    descriptionRu: "Спряжение глаголов быть и иметь в настоящем времени",
    sections: [],
    verbList: [verbJesc, verbIsc],
  },
  {
    id: "theme03",
    title: "Ludzie i rodzina",
    titleRu: "Люди и семья",
    order: 3,
    description: "Członkowie rodziny i określenia ludzi",
    descriptionRu: "Члены семьи и обозначения людей",
    sections: []
  },
  {
    id: "theme04",
    title: "Liczby",
    titleRu: "Числа",
    order: 4,
    description: "Liczby od 1 do 100",
    descriptionRu: "Числа от 1 до 100",
    sections: []
  },
  {
    id: "theme05",
    title: "Czas i dni tygodnia",
    titleRu: "Время и дни недели",
    order: 5,
    description: "Pory dnia, dni tygodnia, miesiące",
    descriptionRu: "Время суток, дни недели, месяцы",
    sections: []
  },
  {
    id: "theme06",
    title: "Miejsca",
    titleRu: "Места",
    order: 6,
    description: "Gdzie jesteśmy? Miejsca w mieście",
    descriptionRu: "Где мы находимся? Места в городе",
    sections: []
  },
  {
    id: "theme07",
    title: "Czasowniki",
    titleRu: "Глаголы",
    order: 7,
    description: "Najważniejsze czasowniki po polsku",
    descriptionRu: "Важнейшие глаголы на польском",
    sections: []
  },
  {
    id: "theme08",
    title: "Jedzenie i picie",
    titleRu: "Еда и напитки",
    order: 8,
    description: "Produkty spożywcze i napoje",
    descriptionRu: "Продукты питания и напитки",
    sections: []
  },
  {
    id: "theme09",
    title: "Przymiotniki",
    titleRu: "Прилагательные",
    order: 9,
    description: "Opisywanie świata wokół nas",
    descriptionRu: "Описание окружающего мира",
    sections: []
  },
  {
    id: "theme10",
    title: "Zdania i gramatyka",
    titleRu: "Предложения и грамматика",
    order: 10,
    description: "Budowanie prostych zdań po polsku",
    descriptionRu: "Построение простых предложений на польском",
    sections: []
  },
]
