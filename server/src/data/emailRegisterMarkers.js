// Fixed Polish lexica for register, discourse and collocation analysis.
// Used by the deterministic email scorer; everything here is hand-curated and
// versioned alongside the metric so the formula stays reproducible.
//
// Word-boundary convention: every regex uses the Unicode-aware boundary
// (?!\\p{L}) / (?<!\\p{L}) with the `u` flag, because JS' built-in \b is
// ASCII-only and would never see "ć" or "ł" as a word character.

const U = 'iu';

// Match `word` as a whole word (Polish letter class).
const W = (pat) => new RegExp(`(?<!\\p{L})${pat}(?!\\p{L})`, U);
// Match `^word` at the start of a line as a whole word.
const WS = (pat) => new RegExp(`^${pat}(?!\\p{L})`, U);

export const REGISTER = {
  nieformalny: {
    label: 'nieformalny',
    greetings: [
      WS('cześć'),
      WS('hej'),
      WS('witaj'),
      WS('drogi\\s+\\p{L}+[.!]?\\s*'),
      WS('droga\\s+\\p{L}+[.!]?\\s*'),
      WS('kochany'),
      WS('kochana'),
    ],
    closings: [
      W('pozdrawiam'),
      W('całuję'),
      W('ściskam'),
      W('na razie'),
      W('trzymaj się'),
      W('do zobaczenia'),
      W('do napisania'),
      W('do usłyszenia'),
      W('papa'),
      W('pa'),
    ],
    formalMarkers: [
      'szanowny', 'szanowna', 'uprzejmie', 'niniejszym', 'z poważaniem',
      'łączyć', 'pozwolić sobie', 'w związku z', 'niniejszy', 'zwracam się',
    ],
    informalMarkers: [
      'cześć', 'hej', 'pa', 'papa', 'spoko', 'fajny', 'fajna', 'fajne',
      'super', 'ekstra', 'ogarnąć', 'ogarniam', 'kumpel', 'ziom', 'lol',
      'git', 'luzik', 'narka', 'elo', 'siema', 'wio',
    ],
  },

  półformalny: {
    label: 'półformalny',
    greetings: [
      WS('dzień dobry'),
      WS('dobry wieczór'),
      WS('witam serdecznie'),
      WS('drogi\\s+\\p{L}+[.!]?\\s*'),
      WS('droga\\s+\\p{L}+[.!]?\\s*'),
    ],
    closings: [
      W('pozdrawiam serdecznie'),
      W('serdeczne pozdrowienia'),
      W('z poważaniem'),
      W('łączy pozdrowienia'),
      W('do usłyszenia'),
      W('z pozdrowieniami'),
    ],
    formalMarkers: [
      'uprzejmie', 'zwracam się z prośbą', 'byłbym wdzięczny', 'byłabym wdzięczna',
      'serdeczne pozdrowienia', 'w nawiązaniu do', 'w odpowiedzi na',
    ],
    informalMarkers: [
      'cześć', 'hej', 'spoko', 'fajny', 'fajna', 'super', 'git', 'narka', 'elo',
    ],
  },

  formalny: {
    label: 'formalny',
    greetings: [
      WS('szanowny panie'),
      WS('szanowna pani'),
      WS('szanowni państwo'),
      WS('wysoki sądzie'),
      WS('dzień dobry,'),
      WS('dzień dobry\\s+(panie|pani)'),
    ],
    closings: [
      W('z poważaniem'),
      W('łączę wyrazy szacunku'),
      W('wyrazy szacunku'),
      W('uprzejmie pozdrawiam'),
      W('z wyrazami szacunku'),
    ],
    formalMarkers: [
      'szanowny', 'szanowna', 'niniejsym', 'uprzejmie', 'zwracam się',
      'pozwalam sobie', 'w związku z', 'w nawiązaniu do', 'niniejszy',
      'stosownie do', 'na podstawie',
    ],
    informalMarkers: [
      'cześć', 'hej', 'spoko', 'fajny', 'fajna', 'super', 'git', 'narka', 'elo',
      'kumpel', 'ziom', 'lol', 'siema', 'wio',
    ],
  },
};

// Discourse markers that signal a structured, well-connected email.
// Density of these markers is one of the Kompozycja signals.
export const DISCOURSE_MARKERS = [
  // Sequence
  'najpierw', 'potem', 'następnie', 'na koniec', 'na zakończenie', 'wreszcie',
  // Cause / effect
  'ponieważ', 'dlatego', 'więc', 'zatem', 'w związku z tym', 'a więc',
  'gdyż', 'bo', 'to dlatego',
  // Contrast
  'ale', 'jednak', 'mimo to', 'z drugiej strony', 'natomiast', 'za to',
  'chociaż', 'choć', 'mimo że', 'pomimo że',
  // Addition
  'poza tym', 'oprócz tego', 'co więcej', 'ponadto', 'dodatkowo', 'również',
  'także', 'też',
  // Exemplification
  'na przykład', 'np.', 'mianowicie', 'to znaczy', 'innymi słowy',
  // Summary
  'podsumowując', 'ogólnie rzecz biorąc', 'reasumując', 'w sumie', 'ogólnie',
  // Reference
  'jak wspomniałem', 'jak wspomniałam', 'jak pisałem', 'jak pisałam',
];

// Common Polish collocations. Used as a quick "naturalness" signal: the
// fraction of learner bigrams (filtered to content words) that match one of
// these is the Coll signal. Curated; not exhaustive.
export const COLLOCATIONS = [
  // verb + case
  'dziękować za', 'dziękuję za', 'prosić o', 'proszę o', 'pytać o', 'pytam o',
  'interesować się', 'zajmować się', 'zajmuję się', 'martwić się o',
  'cieszyć się z', 'cieszę się z', 'zależeć od', 'składać się z',
  'polegać na', 'składać się na', 'przyczynić się do',
  'skupiać się na', 'skupiam się na', 'skupić się na',
  'odnosić się do', 'odnosi się do', 'dotyczyć', 'dotyczy',
  'zdecydować się na', 'zdecydowałem się na', 'zdecydowałam się na',
  'wrócić do', 'wróciłem do', 'wróciłam do', 'wracam do',
  'przyjechać do', 'przyjechałem do', 'przychałam do', 'przyjeżdżam do',
  'wyjechać z', 'wyjechałem z', 'wyjechałam z',
  'odpowiadać na', 'odpowiedzieć na', 'odpowiadam na',
  'rozmawiać o', 'rozmawiałem o', 'rozmawialiśmy o', 'rozmawiali o',
  'pracować w', 'pracuję w', 'pracowałem w', 'pracowałam w',
  'mieszkać w', 'mieszkam w', 'mieszkałem w', 'mieszkałam w',
  'uczyć się', 'uczę się', 'uczyłem się', 'uczyłam się',
  'podobać się', 'podoba mi się', 'podobało mi się',
  'marzyć o', 'marzę o', 'marzyłem o', 'marzyłam o',
  'myśleć o', 'myślę o', 'myślałem o', 'myślałam o',
  'tęsknić za', 'tęsknię za', 'tęskniłem za', 'tęskniłam o',
  'spotkać się z', 'spotykam się z', 'spotkałem się z', 'spotkałam się z',
  'znać się z', 'znam się z', 'poznać się z',
  'dzielić się z', 'dzielę się z', 'dzieliłem się z',
  'rozumieć coś', 'nie rozumieć', 'rozumiem', 'nie rozumiem',
  'zgodzić się z', 'zgadzam się z', 'nie zgadzam się z',
  'zakochać się w', 'zakochałem się w', 'zakochałam się w',
  // adjective + noun
  'wysokie zarobki', 'wysoka jakość', 'wysoki poziom', 'wysokie ceny',
  'dobra pogoda', 'zła pogoda', 'ciepła pogoda',
  'długi dzień', 'krótki dzień', 'ciężki dzień',
  'nowa praca', 'stara praca', 'ciężka praca', 'lekka praca',
  'wielkie dzięki', 'serdeczne pozdrowienia', 'ciepłe pozdrowienia',
  'bliski przyjaciel', 'bliscy przyjaciele', 'droga przyjaciółka',
  'czynsz za mieszkanie', 'czynsz za pokój',
  'wakacje letnie', 'wakacje zimowe', 'ferie zimowe',
  'kurs języka', 'kurs języka polskiego', 'lekcja języka',
  // adverb + verb
  'bardzo proszę', 'serdecznie zapraszam', 'serdecznie dziękuję',
  'szczerze mówiąc', 'ogólnie rzecz biorąc', 'co do mnie', 'co do ciebie',
  'w każdym razie', 'w tym przypadku', 'w tej sytuacji',
  'od czasu do czasu', 'od dawna', 'od kilku lat',
  // time expressions
  'w zeszłym tygodniu', 'w ubiegłym tygodniu', 'w zeszłym miesiącu',
  'w ubiegłym miesiącu', 'w zeszłym roku', 'w ubiegłym roku',
  'w przyszłym tygodniu', 'w przyszłym miesiącu', 'w przyszłym roku',
  'przez cztery tygodnie', 'przez tydzień', 'przez miesiąc', 'przez rok',
  'od poniedziałku', 'od wtorku', 'od środy', 'od czwartku', 'od piątku',
  'w poniedziałek', 'we wtorek', 'w środę', 'w czwartek', 'w piątek',
  'w weekend', 'w sobotę', 'w niedzielę',
  'rano', 'po południu', 'wieczorem', 'nocą', 'w nocy',
  // topic-specific
  'wziąć udział', 'brać udział', 'wziąłem udział', 'brałem udział',
  'podjąć decyzję', 'podjąłem decyzję', 'podejmować decyzje',
  'złożyć zamówienie', 'złożyłem zamówienie', 'składać zamówienie',
  'złożyć reklamację', 'złożyłem reklamację', 'składać reklamację',
  'zarezerwować pokój', 'zarezerwowałem pokój', 'rezerwować pokój',
  'zmienić termin', 'zmieniłem termin', 'zmieniać termin',
];

// Common Polish lemmas that, when found in a text, count as
// "definitely a Polish content word" — used to drop the function-word noise
// when computing lexical-diversity / collocation metrics.
export const POLISH_FUNCTION_WORDS = new Set([
  // pronouns
  'ja', 'ty', 'on', 'ona', 'ono', 'my', 'wy', 'oni', 'one', 'siebie',
  'mnie', 'ciebie', 'jego', 'jej', 'nas', 'was', 'ich', 'sobie',
  'mój', 'moja', 'moje', 'moi', 'twój', 'twoja', 'twoje', 'twoi',
  'nasz', 'nasza', 'nasze', 'nasi', 'wasz', 'wasza', 'wasze', 'wasi',
  'ten', 'ta', 'to', 'ci', 'te', 'tamten', 'tamta', 'tamto', 'taki', 'taka', 'takie',
  // prepositions
  'w', 'we', 'na', 'z', 'ze', 'do', 'od', 'dla', 'o', 'po', 'pod', 'przed',
  'za', 'między', 'obok', 'przy', 'bez', 'przez', 'ku', 'wokół', 'wzdłuż',
  'spośród', 'pomimo', 'mimo', 'wobec',
  // conjunctions & particles
  'i', 'a', 'ale', 'lub', 'albo', 'czy', 'że', 'żeby', 'aby', 'gdy', 'gdyby',
  'kiedy', 'jeśli', 'jeżeli', 'więc', 'zatem', 'jednak', 'natomiast',
  'bo', 'ponieważ', 'gdyż', 'chociaż', 'choć', 'mimo', 'mimo że', 'mimo iż',
  'właśnie', 'już', 'jeszcze', 'też', 'także', 'również', 'jedynie', 'tylko',
  'nawet', 'chyba', 'może', 'pewnie', 'znowu', 'znów',
  // aux / common verbs (function-ish)
  'być', 'to', 'się',
  // common adverbs
  'tu', 'tutaj', 'tam', 'teraz', 'wtedy', 'potem', 'później', 'wcześniej',
  'zawsze', 'nigdy', 'często', 'rzadko', 'czasami', 'czasem', 'wczoraj',
  'dzisiaj', 'jutro', 'przedwczoraj', 'pojutrze',
  'bardzo', 'dużo', 'mało', 'trochę', 'wiele',
  'tak', 'nie', 'no', 'jedynie',
  'stąd', 'dlatego',
]);
