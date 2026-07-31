// Hardcoded Polish-language examiner comments for the 4 official TELC Język
// polski B1·B2 Szkoła writing criteria, keyed by integer score 0–5.
// Mirrors the official mark-descriptor register (A/B/C/D → 5/3/1/0 with
// intermediate 2/4). The LLM no longer generates these — every learner with
// the same score reads the same comment.
//
// Sourced from the official TELC Marking Criteria for Writing (telc.hu) and
// adapted to the Polish variant's per-criterion 0–5 scale. Final wording
// should be reviewed by a Polish-language teacher.

export const COMMENTS = {
  content: {
    5: 'Praca w pełni realizuje temat. Wszystkie punkty polecenia zostały rozwinięte szczegółowo, we właściwej kolejności i zgodnie z zadaniem.',
    4: 'Temat zrealizowany w większości. Punkty rozwinięte, choć niektóre mogłyby być bardziej szczegółowe lub lepiej uargumentowane.',
    3: 'Temat podjęty, ale rozwinięcie punktów jest nierównomierne. Zaleca się głębsze przedstawienie wybranych aspektów.',
    2: 'Realizacja tematu powierzchowna. Niektóre punkty polecenia nie zostały rozwinięte.',
    1: 'Temat podjęty jedynie fragmentarycznie. Większość punktów polecenia pozostała bez rozwinięcia.',
    0: 'Temat nie został zrealizowany lub praca jest nie na temat.',
  },

  composition: {
    5: 'Układ tekstu jest logiczny i spójny. Powitanie, rozwinięcie i zakończenie są dostosowane do tematu i stylu.',
    4: 'Tekst jest w większości dobrze zorganizowany. Wybór stylu odpowiedni, choć spójność mogłaby być lepsza.',
    3: 'Struktura tekstu czytelna, ale spójność i łączenie zdań wymagają poprawy.',
    2: 'Układ tekstu częściowo uporządkowany. Wybór stylu nie zawsze odpowiedni.',
    1: 'Tekst trudny do śledzenia. Brak spójności między częściami.',
    0: 'Brak wyraźnej struktury. Powitanie lub zakończenie nieobecne bądź niedostosowane do tematu.',
  },

  accuracy: {
    5: 'Błędy językowe, ortograficzne i interpunkcyjne nie utrudniają komunikacji lub nie występują.',
    4: 'Drobne błędy językowe i ortograficzne, które nie zakłócają rozumienia tekstu.',
    3: 'Kilka błędów językowych, ortograficznych lub interpunkcyjnych, które mogą chwilowo utrudniać lekturę.',
    2: 'Liczne błędy, które wymagają ponownego czytania i utrudniają zrozumienie tekstu.',
    1: 'Błędy liczne i poważne; cel komunikacyjny osiągnięty jedynie częściowo.',
    0: 'Błędy tak liczne, że cel komunikacyjny nie został zrealizowany. Cała praca oceniona na 0 punktów.',
  },

  vocabulary: {
    5: 'Słownictwo bogate, precyzyjne i adekwatne do tematu. Wyrażenia naturalne i zróżnicowane.',
    4: 'Słownictwo dość szerokie, na ogół adekwatne. Nieliczne powtórzenia lub nieprecyzyjne sformułowania.',
    3: 'Słownictwo wystarczające, ale ograniczone. Widoczne powtórzenia i niewielkie usterki leksykalne.',
    2: 'Słownictwo ubogie, z licznymi powtórzeniami. Dobór słów często nieadekwatny do tematu.',
    1: 'Bardzo ograniczone słownictwo; liczne niewłaściwe użycia lub zapożyczenia.',
    0: 'Słownictwo nie pozwala na realizację zadania. Liczne błędy leksykalne.',
  },
};

// One- or two-sentence examiner summary, keyed by CEFR band. Mirrors the
// real TELC certificate-grade phrasing.
export const BAND_SUMMARY = {
  B2: 'Praca spełnia wymagania poziomu B2. Uzyskany wynik kwalifikuje wypowiedź do oceny bardzo dobrej.',
  B1: 'Praca spełnia wymagania poziomu B1. Uzyskany wynik kwalifikuje wypowiedź do oceny dobrej.',
  below_B1: 'Praca nie osiąga poziomu B1. Wymaga dalszej pracy nad rozwinięciem tematu, poprawnością i zasobem słownictwa.',
};

export const OFF_TOPIC_SUMMARY =
  'Praca nie jest na temat. Wszystkie kryteria oceniono na 0 punktów zgodnie z zasadami egzaminu.';

export const TASK_MISUNDERSTOOD_SUMMARY =
  'Polecenie zostało źle zrozumiane. Treść oceniona na 0, pozostałe kryteria ocenione zgodnie z jakością języka.';

// Default for sub-100 emails that miss the official B1 floor.
export const POINT_RUBRIC = { 5: 'A', 4: 'A−', 3: 'B', 2: 'B−', 1: 'C', 0: 'D' };
