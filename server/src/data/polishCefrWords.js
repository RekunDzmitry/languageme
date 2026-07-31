// Hand-curated Polish lemma → CEFR band map. Seed list — designed to cover
// the most common A1–C1 lemmas a B1/B2 learner is expected to know. Words
// outside this list are treated as "off-list" (counted for MATTR / repetition
// but not awarded a CEFR band). The list is intentionally small and
// deterministic; production deployment should expand it against a real
// frequency corpus (NKJP, OpenSubtitles).
//
// Bands:
//   A1  — first ~300 lemmas (most common function + concrete nouns)
//   A2  — basic everyday vocabulary
//   B1  — exam-safe B1 vocabulary
//   B2  — exam-safe B2 vocabulary
//   C1  — advanced / topic-specific vocabulary (still CEFR)

const A1 = [
  // pronouns / determiners
  'ja', 'ty', 'on', 'ona', 'my', 'wy', 'oni', 'one',
  'mój', 'moja', 'moje', 'twój', 'twoja', 'twoje', 'jego', 'jej', 'nasz', 'wasz', 'ich',
  'ten', 'ta', 'to',
  'kto', 'co', 'gdzie', 'kiedy', 'jak', 'dlaczego', 'ile',
  'tu', 'tam', 'tutaj',
  // greetings
  'cześć', 'dzień', 'dobry', 'dobranoc', 'do widzenia', 'proszę', 'dziękuję', 'przepraszam', 'tak', 'nie',
  // family
  'matka', 'ojciec', 'rodzina', 'syn', 'córka', 'brat', 'siostra', 'dziecko', 'mąż', 'żona',
  // body
  'ręka', 'noga', 'oko', 'głowa', 'twarz', 'nos', 'usta', 'ucho',
  // time
  'dzień', 'noc', 'tydzień', 'miesiąc', 'rok', 'godzina', 'minuta', 'teraz', 'wczoraj', 'jutro',
  'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota', 'niedziela',
  'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień',
  'wiosna', 'lato', 'jesień', 'zima',
  // numbers
  'jeden', 'dwa', 'trzy', 'cztery', 'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć', 'dziesięć',
  'sto', 'tysiąc', 'milion',
  // food
  'chleb', 'woda', 'mleko', 'kawa', 'herbata', 'piwo', 'mięso', 'ryba', 'owoc', 'warzywo', 'jabłko',
  'cukier', 'sól',
  // places
  'dom', 'mieszkanie', 'pokój', 'kuchnia', 'łazienka', 'miasto', 'wieś', 'kraj', 'Polska', 'świat',
  'sklep', 'szkoła', 'ulica', 'droga', 'park',
  // transport
  'samochód', 'autobus', 'pociąg', 'rower', 'samolot', 'bilet', 'stacja',
  // adjectives (basic)
  'duży', 'mały', 'dobry', 'zły', 'nowy', 'stary', 'ładny', 'brzydki', 'wysoki', 'niski',
  'długi', 'krótki', 'ciepły', 'zimny', 'gorący', 'młody',
  // verbs (basic)
  'być', 'mieć', 'robić', 'iść', 'jechać', 'jeść', 'pić', 'widzieć', 'słyszeć', 'mówić',
  'czytać', 'pisać', 'mieszkać', 'pracować', 'uczyć', 'grać', 'kupować', 'kochać', 'lubić',
  'chcieć', 'móc', 'musieć', 'wiedzieć', 'znać', 'rozumieć', 'czekać', 'szukać', 'znajdować',
  'dać', 'brać', 'otwierać', 'zamykać', 'stać', 'siedzieć', 'leżeć', 'spać', 'wstawać',
  // prepositions / conjunctions / common function
  'i', 'a', 'ale', 'lub', 'albo', 'czy', 'że', 'bo', 'jeśli', 'kiedy', 'gdy',
  'w', 'na', 'z', 'do', 'od', 'dla', 'o', 'po', 'pod', 'przed', 'za', 'przy', 'przez', 'bez',
  'nie', 'już', 'jeszcze', 'bardzo', 'dużo', 'mało', 'trochę', 'zawsze', 'nigdy', 'często',
  'może', 'chyba', 'też', 'także', 'również', 'właśnie', 'tylko', 'nawet', 'tutaj',
  // body functions
  'iść', 'przyjść', 'wyjść', 'pójść', 'przyjechać', 'wyjechać', 'pojechać', 'wrócić',
];

const A2 = [
  // everyday life
  'praca', 'szkoła', 'uniwersytet', 'student', 'uczeń', 'nauczyciel', 'lekarz',
  'firma', 'biuro', 'komputer', 'telefon', 'internet', 'list', 'email',
  'zakupy', 'sklep', 'cena', 'pieniądze', 'rachunek', 'karta',
  'śniadanie', 'obiad', 'kolacja', 'restauracja', 'kawiarnia', 'bar',
  'kino', 'teatr', 'muzyka', 'film', 'książka', 'gazeta', 'program',
  'sport', 'piłka', 'piłka nożna', 'pływanie', 'biegać', 'spacer',
  'plaża', 'morze', 'góry', 'las', 'rzeka', 'jezioro',
  'pogoda', 'deszcz', 'śnieg', 'wiatr', 'słońce', 'chmura',
  'choroba', 'zdrowie', 'apteka', 'szpital', 'tabletka', 'ból', 'głowa',
  'wakacje', 'urlop', 'wycieczka', 'podróż', 'bagaż', 'walizka',
  // relationships
  'kolega', 'koleżanka', 'przyjaciel', 'przyjaciółka', 'sąsiad', 'gość',
  // time expressions
  'wczoraj', 'dzisiaj', 'jutro', 'pojutrze', 'przedwczoraj',
  'rano', 'wieczorem', 'po południu', 'nocą',
  'godzina', 'minuta', 'chwila', 'momencik',
  // transport
  'lotnisko', 'dworzec', 'przystanek', 'metro', 'tramwaj', 'taksówka',
  'pasażer', 'kierowca',
  // verbs (more)
  'pomagać', 'pytać', 'odpowiadać', 'zaczynać', 'kończyć', 'zaczynać', 'kończyć',
  'zapraszać', 'prosić', 'dziękować', 'przepraszać', 'pożyczać',
  'zapominać', 'pamiętać', 'śnić', 'marzyć', 'planować',
  'gotować', 'sprzątać', 'prać', 'prasować', 'naprawiać',
  'podróżować', 'zwiedzać', 'odpoczywać',
  'zmieniać', 'wybierać', 'decydować',
  'tracić', 'znajdować', 'szukać',
  'bać się', 'martwić się', 'cieszyć się', 'śmiać się', 'płakać',
  // adjectives (more)
  'wolny', 'zajęty', 'zmęczony', 'chory', 'zdrowy', 'głodny', 'spragniony',
  'smutny', 'wesoły', 'zadowolony', 'niezadowolony', 'spokojny', 'nerwowy',
  'czysty', 'brudny', 'łatwy', 'trudny', 'ważny',
  'drogi', 'tani', 'ciekawy', 'nudny',
  // adverbs
  'czasem', 'czasami', 'nagle', 'powoli', 'szybko', 'wcześnie', 'późno',
  'daleko', 'blisko', 'wysoko', 'nisko', 'głośno', 'cicho', 'dobrze', 'źle',
];

const B1 = [
  // work & study
  'kariera', 'zawód', 'stanowisko', 'współpracownik', 'szef', 'klient',
  'spotkanie', 'projekt', 'zadanie', 'termin', 'urlop', 'wynagrodzenie', 'pensja',
  'doświadczenie', 'umiejętność', 'kompetencja', 'kwalifikacja', 'CV', 'rozmowa',
  'edukacja', 'nauka', 'wiedza', 'lekcja', 'kurs', 'egzamin', 'ocena',
  'student', 'magister', 'inżynier', 'lekarz', 'nauczyciel', 'profesor',
  // home & living
  'współlokator', 'sąsiad', 'klatka', 'piętro', 'winda', 'balkon', 'ogród',
  'czynsz', 'rachunek', 'umowa', 'wypowiedzenie', 'przeprowadzka',
  'meblować', 'urządzać', 'remont', 'naprawa',
  // health
  'wizyta', 'recepta', 'lekarstwo', 'kuracja', 'objaw', 'gorączka', 'kaszel',
  'dentysta', 'okulista', 'kardiolog', 'chirurg', 'pielęgniarka',
  // travel & culture
  'rezerwacja', 'nocleg', 'hotel', 'hostel', 'namiot', 'pension',
  'przewodnik', 'mapa', 'kompass', 'waluta', 'wymiana', 'granica',
  'zabytek', 'muzeum', 'galeria', 'katedra', 'zamek', 'pałac',
  'koncert', 'festiwal', 'spektakl', 'wystawa', 'przedstawienie',
  // nature
  'środowisko', 'przyroda', 'zwierzę', 'roślina', 'drzewo', 'kwiat',
  'klimat', 'pogoda', 'temperatura', 'wilgotność', 'opady',
  // society
  'społeczeństwo', 'obywatel', 'rząd', 'prezydent', 'minister', 'partia',
  'wybory', 'głosowanie', 'prawo', 'ustawa', 'sąd', 'policja',
  // adjectives
  'świadomy', 'odpowiedzialny', 'niezależny', 'tolerancyjny', 'uczciwy',
  'cierpliwy', 'ambitny', 'kreatywny', 'pomysłowy', 'pracowity', 'leniwy',
  'hojny', 'skąpy', 'towarzyski', 'samotny', 'rozmowny', 'milczący',
  // verbs (more)
  'organizować', 'planować', 'zarządzać', 'kierować', 'prowadzić',
  'negocjować', 'kompromis', 'współpracować', 'reklamować', 'reklamacja',
  'reklamować', 'zareklamować', 'odwoływać', 'odwołać', 'przełożyć', 'przekładać',
  'wynajmować', 'wynająć', 'kupować', 'sprzedawać', 'oszczędzać', 'zarabiać',
  'załatwiać', 'załatwić', 'interesować się', 'zajmować się', 'zajmować',
  'reklamować', 'reklamacja', 'skarga', 'skarżyć się', 'poskarżyć się',
  'wyobrażać sobie', 'wyobrazić sobie', 'zdawać sobie sprawę', 'zdać sobie sprawę',
  'polegać', 'składać się', 'składać', 'odkryć', 'odkrywać', 'wynalazek',
  // discourse & abstract
  'sytuacja', 'problem', 'rozwiązanie', 'powód', 'przyczyna', 'skutek',
  'cel', 'zamiar', 'plan', 'pomysł', 'szansa', 'możliwość', 'okazja',
  'wada', 'zaleta', 'minus', 'plus', 'korzyść', 'strata',
  'wpływ', 'efekt', 'rezultat', 'wynik', 'sukces', 'porażka',
  'poczucie', 'emocja', 'uczucie', 'nastrój', 'wrażenie', 'doświadczenie',
  'tradycja', 'obyczaj', 'zwyczaj', 'kultura', 'religia', 'historia',
  'wolność', 'równość', 'sprawiedliwość', 'pokój', 'wojna', 'konflikt',
];

const B2 = [
  // work
  'przedsiębiorstwo', 'biznes', 'inwestycja', 'zysk', 'strata', 'obrót',
  'gospodarka', 'rynek', 'koniunktura', 'recesja', 'kryzys', 'wzrost',
  'marketing', 'reklama', 'strategia', 'konkurencja', 'monopol', 'konsument',
  'pracodawca', 'pracownik', 'zatrudnienie', 'bezrobocie', 'emerytura',
  'negocjacje', 'umowa', 'kontrakt', 'zobowiązanie', 'gwarancja', 'reklamacja',
  // tech & science
  'technologia', 'innowacja', 'wynalazek', 'odkrycie', 'badanie', 'eksperyment',
  'naukowiec', 'badacz', 'laboratorium', 'teoria', 'hipoteza', 'dowód',
  'sztuczna inteligencja', 'algorytm', 'programowanie', 'oprogramowanie', 'baza danych',
  'cyberbezpieczeństwo', 'prywatność', 'sieć', 'komunikacja', 'infrastruktura',
  // environment
  'ekologia', 'zanieczyszczenie', 'smog', 'emisja', 'recykling', 'odpady',
  'zasoby', 'energia', 'odnawialny', 'nieodnawialny', 'węgiel', 'ropa',
  'różnorodność', 'ekosystem', 'biologia', 'biom', 'biosfera', 'klimat',
  'globalne ocieplenie', 'efekt cieplarniany', 'zmiana klimatu', 'ślad węglowy',
  'katastrofa', 'klęska', 'żywioł', 'powódź', 'trzęsienie', 'huragan',
  // social & political
  'demokracja', 'autorytaryzm', 'totalitaryzm', 'opozycja', 'koalicja', 'opozycja',
  'parlament', 'sejm', 'senat', 'samorząd', 'decentralizacja', 'biurokracja',
  'integracja', 'migracja', 'imigracja', 'emigracja', 'uchodźca', 'azyl',
  'mniejszość', 'większość', 'dyskryminacja', 'rasizm', 'ksenofobia', 'tolerancja',
  'edukacja', 'oświata', 'akademicki', 'uniwersytecki', 'magisterski', 'doktorancki',
  'socjologia', 'psychologia', 'filozofia', 'etyka', 'moralność', 'wartość',
  // media & comms
  'dziennikarstwo', 'dziennikarz', 'redaktor', 'reportaż', 'wywiad', 'artykuł',
  'publikacja', 'wydanie', 'nakład', 'prasa', 'tygodnik', 'miesięcznik',
  'nadawca', 'odbiorca', 'przekaz', 'retoryka', 'perswazja', 'manipulacja',
  'dezinformacja', 'fake news', 'propaganda', 'cenzura', 'wolność słowa',
  // abstract & advanced
  'fenomen', 'zjawisko', 'proces', 'mechanizm', 'struktura', 'system',
  'paradoks', 'dylemat', 'kontrowersja', 'aspekt', 'perspektywa', 'kontekst',
  'tożsamość', 'świadomość', 'podświadomość', 'intuicja', 'racjonalność',
  'percepcja', 'postrzeganie', 'wyobraźnia', 'kreatywność', 'innowacyjność',
  'determinacja', 'motywacja', 'inspiracja', 'ambicja', 'aspiracja',
  'wymiar', 'aspekt', 'aspekt', 'sfera', 'dziedzina', 'dyscyplina',
  'metodologia', 'analiza', 'synteza', 'interpretacja', 'ewaluacja', 'diagnoza',
  'hierarchia', 'struktura', 'organizacja', 'instytucja', 'organizacja pozarządowa',
];

const C1 = [
  // very advanced / topic-specific
  'antropocen', 'biotechnologia', 'nanotechnologia', 'inżynieria genetyczna',
  'edytowanie genów', 'klonowanie', 'transplantologia', 'eutanazja',
  'fundamentalizm', 'ekstremizm', 'radykalizm', 'populizm', 'nacjonalizm',
  'geopolityka', 'geostrategia', 'dyplomacja', 'sankcja', 'embargo',
  'paradoks poznawczy', 'efekt Dunninga-Krugera', 'placebo', 'nocebo',
  'sustainable development', 'zrównoważony rozwój', 'Agenda 2030',
  'wielokulturowość', 'transhumanizm', 'postprawda', 'bańka filtrująca',
  'echo chamber', 'kognitywny', 'behawioralny', 'fenomenologia', 'hermeneutyka',
  'epistemologia', 'ontologia', 'metafizyka', 'dekonstrukcja', 'postmodernizm',
  'antyutopia', 'dystopia', 'utopia', 'eschatologia',
];

// Build the lemma → band map. Deduplicate and put each lemma in the highest
// band it appears in (a word listed in both A2 and B1 ends up B1).
const BAND_RANK = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };
const RANK_TO_BAND = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1' };

const LEMMA_BAND = new Map();
const add = (lemma, band) => {
  if (!lemma) return;
  const current = LEMMA_BAND.get(lemma);
  const newRank = BAND_RANK[band];
  const currentRank = current ? BAND_RANK[current] : 0;
  if (newRank > currentRank) LEMMA_BAND.set(lemma, band);
};
for (const lemma of A1) add(lemma, 'A1');
for (const lemma of A2) add(lemma, 'A2');
for (const lemma of B1) add(lemma, 'B1');
for (const lemma of B2) add(lemma, 'B2');
for (const lemma of C1) add(lemma, 'C1');

export const POLISH_LEMMA_TO_CEFR = Object.freeze(Object.fromEntries(LEMMA_BAND));

// Targets used by scoreVocabulary: at or above this band counts toward the
// "level-appropriate" share. B1 target = B1 + B2 + C1. B2 target = B2 + C1.
export const CEFR_BANDS_AT_OR_ABOVE = {
  A1: ['A1', 'A2', 'B1', 'B2', 'C1'],
  A2: ['A2', 'B1', 'B2', 'C1'],
  B1: ['B1', 'B2', 'C1'],
  B2: ['B2', 'C1'],
  C1: ['C1'],
};

// Look up a word form (not a lemma). The word itself counts only if it
// appears as-is in our seed list. For words not in the list, we try a
// naive suffix-strip and re-lookup. Returns null if unknown.
export function bandForWord(word, lemmatizer) {
  if (!word) return null;
  const lower = word.toLowerCase();
  if (POLISH_LEMMA_TO_CEFR[lower]) return POLISH_LEMMA_TO_CEFR[lower];
  if (lemmatizer) {
    const lemma = lemmatizer(lower);
    if (lemma && POLISH_LEMMA_TO_CEFR[lemma]) return POLISH_LEMMA_TO_CEFR[lemma];
  }
  return null;
}

// Stats for the calibration report / telemetry.
export const CEFR_LIST_STATS = Object.freeze({
  A1: A1.length,
  A2: A2.length,
  B1: B1.length,
  B2: B2.length,
  C1: C1.length,
  totalUnique: LEMMA_BAND.size,
});
