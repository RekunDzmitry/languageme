// Polish NLP helpers used by the deterministic email scorer.
//
// Deterministic, pure functions — no LLM calls, no network, no randomness.
// Every export is safe to call from request handlers; expensive lookups
// (Hunspell dictionary) are cached in module scope so the first request
// pays the load cost and subsequent ones are O(1) per token.
//
// Word-boundary convention: every regex uses the Unicode-aware boundary
// (?<!\\p{L}) / (?!\\p{L}) with the `u` flag. JS' built-in \b is ASCII-only
// and would never see "ć" or "ł" as a word character.

import nspell from 'nspell';
import plDict from 'dictionary-pl';

import {
  REGISTER,
  DISCOURSE_MARKERS,
  COLLOCATIONS,
  POLISH_FUNCTION_WORDS,
} from '../data/emailRegisterMarkers.js';
import {
  POLISH_LEMMA_TO_CEFR,
  CEFR_BANDS_AT_OR_ABOVE,
  CEFR_LIST_STATS,
} from '../data/polishCefrWords.js';

const WB_LEFT = '(?<!\\p{L})';
const WB_RIGHT = '(?!\\p{L})';
const W = (pat) => new RegExp(`${WB_LEFT}${pat}${WB_RIGHT}`, 'giu');

let _spell = null;
function getSpell() {
  if (!_spell) {
    const factory = nspell.default || nspell;
    _spell = factory(plDict);
  }
  return _spell;
}

const POLISH_WORD_RE = /[A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż]+/g;
const POLISH_SENTENCE_RE = /[^.!?…]+[.!?…]+|[^.!?…]+$/g;

export function tokenizeWords(text) {
  if (!text) return [];
  const matches = text.match(POLISH_WORD_RE);
  return matches || [];
}

export function wordCount(text) {
  return tokenizeWords(text).length;
}

export function splitSentences(text) {
  if (!text) return [];
  const matches = text.match(POLISH_SENTENCE_RE);
  if (!matches) return [];
  return matches.map(s => s.trim()).filter(Boolean);
}

export function splitParagraphs(text) {
  if (!text) return [];
  return text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
}

// Polish verb forms that the simple suffix-strip can't reduce to the bare
// stem. Consulted BEFORE the suffix-strip pass so verbs like "jechać" map
// "jadę" / "jedziesz" / "jechałem" all to "jechać" and content-word
// assignment doesn't silently drop coverage.
const IRREGULAR_FORMS = {
  // jechać
  jadę: 'jechać', jedziesz: 'jechać', jedzie: 'jechać',
  jedziemy: 'jechać', jedziecie: 'jechać', jadą: 'jechać',
  jechałem: 'jechać', jechałam: 'jechać', jechałeś: 'jechać', jechałaś: 'jechać',
  jechaliśmy: 'jechać', jechaliście: 'jechać', jechał: 'jechać', jechała: 'jechać',
  jechali: 'jechać', jechały: 'jechać',
  // być
  jestem: 'być', jesteś: 'być', jest: 'być', jesteśmy: 'być',
  jesteście: 'być', są: 'być',
  byłem: 'być', byłam: 'być', byłeś: 'być', byłaś: 'być',
  byliśmy: 'być', byliście: 'być', był: 'być', była: 'być', byli: 'być', były: 'być',
  // mieć
  mam: 'mieć', masz: 'mieć', ma: 'mieć', mamy: 'mieć', macie: 'mieć', mają: 'mieć',
  miałem: 'mieć', miałam: 'mieć', miałeś: 'mieć', miałaś: 'mieć',
  mieliśmy: 'mieć', mieliście: 'mieć', miał: 'mieć', miała: 'mieć', mieli: 'mieć', miały: 'mieć',
  // iść
  idę: 'iść', idziesz: 'iść', idzie: 'iść', idziemy: 'iść', idziecie: 'iść', idą: 'iść',
  szedłem: 'iść', szłam: 'iść', szedłeś: 'iść', szłaś: 'iść',
  szliśmy: 'iść', szliście: 'iść', szedł: 'iść', szła: 'iść', szli: 'iść', szły: 'iść',
  // móc
  mogę: 'móc', możesz: 'móc', może: 'móc', możemy: 'móc', możecie: 'móc', mogą: 'móc',
  mógł: 'móc', mogła: 'móc', mogli: 'móc',
  mogłem: 'móc', mogłam: 'móc', mogłeś: 'móc', mogłaś: 'móc',
  // jeść
  jem: 'jeść', jesz: 'jeść', je: 'jeść', jemy: 'jeść', jecie: 'jeść', jedzą: 'jeść',
  jadłem: 'jeść', jadłam: 'jeść', jadłeś: 'jeść', jadłaś: 'jeść',
  jadł: 'jeść', jadła: 'jeść', jedli: 'jeść', jadły: 'jeść',
  // pić
  piję: 'pić', pijesz: 'pić', pije: 'pić', pijemy: 'pić', pijecie: 'pić', piją: 'pić',
  piłem: 'pić', piłaś: 'pić', pił: 'pić', piła: 'pić', pili: 'pić', piły: 'pić',
  // wiedzieć
  wiem: 'wiedzieć', wiesz: 'wiedzieć', wie: 'wiedzieć', wiemy: 'wiedzieć', wiecie: 'wiedzieć', wiedzą: 'wiedzieć',
  wiedziałem: 'wiedzieć', wiedziałaś: 'wiedzieć', wiedział: 'wiedzieć', wiedziała: 'wiedzieć', wiedzieli: 'wiedzieć',
  // robić
  robię: 'robić', robisz: 'robić', robi: 'robić', robimy: 'robić', robicie: 'robić', robią: 'robić',
  robiłem: 'robić', robiłam: 'robić', robiłeś: 'robić', robiłaś: 'robić',
  robiliśmy: 'robić', robiliście: 'robić', robił: 'robić', robiła: 'robić', robili: 'robić', robiły: 'robić',
  // mówić
  mówię: 'mówić', mówisz: 'mówić', mówi: 'mówić', mówimy: 'mówić', mówicie: 'mówić', mówią: 'mówić',
  mówiłem: 'mówić', mówiłam: 'mówić', mówił: 'mówić', mówiła: 'mówić', mówili: 'mówić',
  // czytać
  czytam: 'czytać', czytasz: 'czytać', czyta: 'czytać', czytamy: 'czytać', czytacie: 'czytać', czytają: 'czytać',
  // pisać
  piszę: 'pisać', piszesz: 'pisać', pisze: 'pisać', piszemy: 'pisać', piszecie: 'pisać', piszą: 'pisać',
  // widzieć
  widzę: 'widzieć', widzisz: 'widzieć', widzi: 'widzieć', widzimy: 'widzieć', widzicie: 'widzieć', widzą: 'widzieć',
  // mieszkać
  mieszkam: 'mieszkać', mieszkasz: 'mieszkać', mieszka: 'mieszkać', mieszkamy: 'mieszkać', mieszkacie: 'mieszkać', mieszkają: 'mieszkać',
  // pracować
  pracuję: 'pracować', pracujesz: 'pracować', pracuje: 'pracować',
  pracujemy: 'pracować', pracujecie: 'pracować', pracują: 'pracować',
  // uczyć
  uczę: 'uczyć', uczysz: 'uczyć', uczy: 'uczyć', uczymy: 'uczyć', uczycie: 'uczyć', uczą: 'uczyć',
  // kochać
  kocham: 'kochać', kochasz: 'kochać', kocha: 'kochać', kochamy: 'kochać', kochacie: 'kochać', kochają: 'kochać',
  // lubić
  lubię: 'lubić', lubisz: 'lubić', lubi: 'lubić', lubimy: 'lubić', lubicie: 'lubić', lubią: 'lubić',
  // chcieć
  chcę: 'chcieć', chcesz: 'chcieć', chce: 'chcieć', chcemy: 'chcieć', chcecie: 'chcieć', chcą: 'chcieć',
  chciałem: 'chcieć', chciałam: 'chcieć', chciał: 'chcieć', chciała: 'chcieć', chcieli: 'chcieć',
  // musieć
  muszę: 'musieć', musisz: 'musieć', musi: 'musieć', musimy: 'musieć', musicie: 'musieć', muszą: 'musieć',
  musiałem: 'musieć', musiałam: 'musieć', musiał: 'musieć', musiała: 'musieć',
  // znać
  znam: 'znać', znasz: 'znać', zna: 'znać', znamy: 'znać', znacie: 'znać', znają: 'znać',
  // rozumieć
  rozumiem: 'rozumieć', rozumiesz: 'rozumieć', rozumie: 'rozumieć', rozumiemy: 'rozumieć', rozumiecie: 'rozumieć', rozumieją: 'rozumieć',
  // dać
  dam: 'dać', dasz: 'dać', da: 'dać', damy: 'dać', dacie: 'dać', dadzą: 'dać',
  dałem: 'dać', dałaś: 'dać', dał: 'dać', dała: 'dać', dali: 'dać',
  // brać
  biorę: 'brać', bierzesz: 'brać', bierze: 'brać', bierzemy: 'brać', bierzecie: 'brać', biorą: 'brać',
  // kupić
  kupię: 'kupić', kupisz: 'kupić', kupi: 'kupić', kupimy: 'kupić', kupicie: 'kupić', kupią: 'kupić',
  kupiłem: 'kupić', kupiłam: 'kupić', kupił: 'kupić', kupiła: 'kupić', kupili: 'kupić',
  // sprzedać
  sprzedam: 'sprzedać', sprzedasz: 'sprzedać', sprzeda: 'sprzedać',
  // pomagać
  pomagam: 'pomagać', pomagasz: 'pomagać', pomaga: 'pomagać', pomagamy: 'pomagać', pomagacie: 'pomagać', pomagają: 'pomagać',
  // dziękować
  dziękuję: 'dziękować', dziękujesz: 'dziękować', dziękuje: 'dziękować',
  dziękowaliśmy: 'dziękować', dziękowałem: 'dziękować', dziękowałam: 'dziękować', dziękował: 'dziękować',
  // pytać
  pytam: 'pytać', pytasz: 'pytać', pyta: 'pytać', pytamy: 'pytać', pytacie: 'pytać', pytają: 'pytać',
  // prosić
  proszę: 'prosić', prosisz: 'prosić', prosi: 'prosić', prosimy: 'prosić', prosicie: 'prosić', proszą: 'prosić',
};

const POLISH_ENDINGS = [
  'owaliśmy', 'owaliście', 'owałam', 'owałeś', 'owałaś',
  'łem', 'łam', 'łeś', 'łaś', 'ło', 'li', 'ły',
  'owi', 'emu', 'ami', 'ach', 'imi', 'ymi', 'ego', 'iej',
  'esz', 'asz', 'isz',
  'ę', 'am', 'asz', 'a', 'e', 'i', 'y', 'o', 'u',
];

export function lemmatize(word) {
  if (!word) return '';
  const lower = word.toLowerCase();
  if (IRREGULAR_FORMS[lower]) return IRREGULAR_FORMS[lower];
  if (POLISH_LEMMA_TO_CEFR[lower]) return lower;
  for (const ending of POLISH_ENDINGS) {
    if (lower.length > ending.length + 2 && lower.endsWith(ending)) {
      const stem = lower.slice(0, -ending.length);
      if (POLISH_LEMMA_TO_CEFR[stem]) return stem;
      for (const alt of [stem + 'a', stem + 'e', stem + 'y', stem + 'i', stem + 'o']) {
        if (POLISH_LEMMA_TO_CEFR[alt]) return alt;
      }
    }
  }
  return lower;
}

export function findSpellingErrors(text) {
  const spell = getSpell();
  const errors = [];
  let match;
  POLISH_WORD_RE.lastIndex = 0;
  while ((match = POLISH_WORD_RE.exec(text)) !== null) {
    const word = match[0];
    if (!spell.correct(word)) {
      errors.push({
        word,
        offset: match.index,
        endOffset: match.index + word.length,
        suggestions: spell.suggest(word).slice(0, 5),
        category: 'spelling',
        severity: 1,
      });
    }
  }
  return errors;
}

const PUNCT_RULES = [
  {
    id: 'space_before_punct',
    test: (text) => {
      const matches = [...text.matchAll(/[ \t\u00A0]([.,;:!?])/g)];
      return matches.map(m => ({ category: 'punctuation', severity: 1, offset: m.index, endOffset: m.index + m[0].length, message: 'spacja przed znakiem interpunkcyjnym' }));
    },
  },
  {
    id: 'no_space_after_punct',
    test: (text) => {
      const matches = [...text.matchAll(/([.,;:!?])(?=[A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż])/g)];
      return matches.map(m => ({ category: 'punctuation', severity: 1, offset: m.index, endOffset: m.index + 1, message: 'brak spacji po znaku interpunkcyjnym' }));
    },
  },
  {
    id: 'sentence_capital',
    test: (text) => {
      const matches = [...text.matchAll(/([.!?…])\s+([a-ząćęłńóśźż])/g)];
      return matches.map(m => ({ category: 'punctuation', severity: 1, offset: m.index + m[0].indexOf(m[2]), endOffset: m.index + m[0].indexOf(m[2]) + 1, message: 'mała litera po kropce' }));
    },
  },
  {
    id: 'missing_end_punct',
    test: (text) => {
      const trimmed = text.replace(/\s+$/, '');
      if (!trimmed) return [];
      const last = trimmed[trimmed.length - 1];
      if (!/[.!?…]/.test(last)) {
        return [{ category: 'punctuation', severity: 0, offset: trimmed.length - 1, endOffset: trimmed.length, message: 'brak końca zdania' }];
      }
      return [];
    },
  },
];

export function findPunctuationErrors(text) {
  const errs = [];
  for (const rule of PUNCT_RULES) {
    try {
      const found = rule.test(text);
      for (const f of found) errs.push(f);
    } catch {}
  }
  return errs;
}

const GRAMMAR_RULES = [
  { id: 'dziękować_za', re: /dziękuję\s+(?!za\b)(?!\p{L})([\s\S]{0,30})/giu, severity: 3, message: 'czasownik „dziękować" łączy się z „za" + dopełniacz' },
  { id: 'dziękować_dla', re: W('dziękuję\\s+dla'), severity: 3, message: 'po „dziękuję" nie używamy „dla"' },
  { id: 'prosić_o', re: /proszę\s+(?!o\b)(?!\p{L})([\s\S]{0,30})/giu, severity: 3, message: 'czasownik „prosić" łączy się z „o" + biernik' },
  { id: 'interesować_się_instr', re: /interesuję\s+się\s+(\p{L}+(?:em|ą))/giu, severity: 2, message: 'po „interesować się" + narzędnik' },
  { id: 'cieszyć_się_z', re: /cieszę\s+się\s+(?!z\b)(?!\p{L})([\s\S]{0,30})/giu, severity: 3, message: 'po „cieszyć się" + „z" + dopełniacz' },
  { id: 'zależeć_od', re: /zależy\s+(?!od\b)(?!\p{L})([\s\S]{0,30})/giu, severity: 3, message: 'po „zależeć" + „od" + dopełniacz' },
  { id: 'składać_się_z', re: /składa\s+się\s+(?!z\b)(?!\p{L})([\s\S]{0,30})/giu, severity: 3, message: 'po „składać się" + „z" + dopełniacz' },
  { id: 'martwić_się_o', re: /martwię\s+się\s+(?!o\b)(?!\p{L})([\s\S]{0,30})/giu, severity: 3, message: 'po „martwić się" + „o" + biernik' },
  { id: 'mówić_o', re: /mówię\s+(?!o\b)(?!\p{L})([\s\S]{0,30})/giu, severity: 2, message: 'po „mówić" + „o" + miejscownik' },
  { id: 'pytać_o', re: /pytam\s+(?!o\b)(?!\p{L})([\s\S]{0,30})/giu, severity: 3, message: 'po „pytać" + „o" + biernik' },
  { id: 'myśleć_o', re: /myślę\s+(?!o\b)(?!\p{L})([\s\S]{0,30})/giu, severity: 2, message: 'po „myśleć" + „o" + miejscownik' },
  { id: 'tęsknić_za', re: /tęsknię\s+(?!za\b)(?!\p{L})([\s\S]{0,30})/giu, severity: 3, message: 'po „tęsknić" + „za" + narzędnik' },
  { id: 'w_vs_na_locative', re: W('na\\s+(Warszawie|Krakowie|Poznaniu|Gdańsku|Wrocławiu)'), severity: 3, message: 'po miastach + „w" (miejscownik), nie „na"' },
  { id: 'w_vs_na_genitive', re: W('w\\s+(Polsce|Niemczech|Europie|Azj[yi]|Ameryce)'), severity: 2, message: 'po krajach/regionach w dopełniaczu → „w" + dopełniacz' },
  { id: 'anglicism_basic', re: W('(meeting|dziejting|ajdej|okej)'), severity: 2, message: 'sprawdź: możliwy anglicyzm' },
];

export function findGrammarErrors(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const errs = [];
  for (const rule of GRAMMAR_RULES) {
    if (rule.severity === 0) continue;
    rule.re.lastIndex = 0;
    let m;
    while ((m = rule.re.exec(lower)) !== null) {
      errs.push({
        ruleId: rule.id,
        category: 'grammar',
        severity: rule.severity,
        offset: m.index,
        endOffset: m.index + m[0].length,
        match: m[0],
        message: rule.message,
      });
      if (m.index === rule.re.lastIndex) rule.re.lastIndex++;
    }
  }
  return errs;
}

export function findAllErrors(text) {
  const spelling = findSpellingErrors(text);
  const punctuation = findPunctuationErrors(text);
  const grammar = findGrammarErrors(text);
  return { spelling, punctuation, grammar, all: [...spelling, ...punctuation, ...grammar] };
}

// Truly generic "always present in every Polish sentence" lemmas. Keep
// this set MINIMAL — modal verbs like chcieć, móc, musieć carry meaning
// in real TELC tasks ("czy chce dołączyć?" / "co możesz zrobić?") so
// they MUST survive the content-overlap match. Only "być" / "mieć" /
// "wiedzieć" / "znać" are generic enough to filter.
const STOP_CONTENT_LEMMAS = new Set([
  'być', 'mieć', 'wiedzieć', 'znać',
]);

export function sentenceCosine(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function contentBow(sentence) {
  const out = new Set();
  for (const t of tokenizeWords(sentence)) {
    const lower = t.toLowerCase();
    if (lower.length <= 2 || POLISH_FUNCTION_WORDS.has(lower)) continue;
    const lemma = lemmatize(lower);
    if (STOP_CONTENT_LEMMAS.has(lemma)) continue;
    out.add(lemma);
  }
  return out;
}

export function assignSentencesToPoints(text, points) {
  const sentences = splitSentences(text);
  if (sentences.length === 0 || points.length === 0) {
    return points.map(() => ({ sentences: [], coverage: 0, wordCount: 0, depthSignals: 0 }));
  }
  const pointBows = points.map(p => ({ bow: contentBow(p) }));
  return points.map((point, idx) => {
    const target = pointBows[idx].bow;
    const assigned = sentences.filter(s => {
      const bow = contentBow(s);
      let common = 0;
      for (const w of bow) if (target.has(w)) common++;
      return common >= 1 || sentenceCosine(bow, target) >= 0.15;
    });
    const coverage = assigned.length > 0 ? 1 : 0;
    const joinedText = assigned.join(' ');
    return {
      sentences: assigned,
      coverage,
      wordCount: wordCount(joinedText),
      depthSignals: countDepthSignals(joinedText),
      coverageStrength: assigned.length,
    };
  });
}

const DEPTH_REGEXES = {
  number: /\b\d+(?:[.,]\d+)?\b/g,
  year: /\b(?:1[89]|20)\d{2}\b/g,
  time: /(?:^|\s)(rano|wieczorem|po\s+południu|wcześnie|późno|w\s+poniedziałek|w\s+wtorek|w\s+środę|w\s+czwartek|w\s+piątek|w\s+sobotę|w\s+niedzielę|w\s+zeszłym\s+tygodniu|w\s+ubiegłym\s+(?:tygodniu|miesiącu|roku)|w\s+przyszłym\s+(?:tygodniu|miesiącu|roku)|przez\s+\p{L}+|od\s+poniedziałku)(?=\s|$)/giu,
  cause: W('(bo|ponieważ|dlatego|gdyż|w\\s+związku\\s+z\\s+tym|a\\s+więc|zatem)'),
  contrast: W('(ale|jednak|natomiast|mimo\\s+to|chociaż|choć|z\\s+drugiej\\s+strony|za\\s+to)'),
  example: W('(np\\.|na\\s+przykład|mianowicie|to\\s+znaczy|innymi\\s+słowy)'),
  place: W('(Warszawa|Warszawie|Warszawę|Kraków|Krakowie|Kraków|Gdańsk|Gdańsku|Gdańska|Poznań|Poznaniu|Poznania|Wrocław|Wrocławiu|Wrocławi[aę]|Polska|Polsce|Polskę|Niemcy|Niemczech|Europ[aie]|Francj[ai]|Włoch[ay]|Hiszpani[ai]|Rosj[ai]|Ukrain[ye]|Czech[ay]|Słowacj[ai]|Litw[ey]|Łotw[ey]|Estoni[ai])'),
  personal: W('(Byłem|Byłam|Poszedłem|Poszłam|Pojadłem|Jadłem|Jadłam|Mieszkałem|Mieszkałam|Pracowałem|Pracowałam|Robiłem|Robiłam|Czytałem|Czytałam|Pisałem|Pisałam|Słuchałem|Słuchałam|Oglądałem|Oglądałam|jadę|jedziemy|mieszkam|mieszkamy|pracuję|pracujemy|uczę\\s+się|uczymy\\s+się|robię|robimy|widzę|widzimy|słucham|czytam|czytamy)'),
};

export function countDepthSignals(text) {
  if (!text) return 0;
  let n = 0;
  for (const re of Object.values(DEPTH_REGEXES)) {
    const m = text.match(re);
    if (m) n += m.length;
  }
  return n;
}

export function mattr(text, windowSize = 500) {
  const tokens = tokenizeWords(text).map(t => t.toLowerCase());
  if (tokens.length === 0) return 0;
  if (tokens.length <= windowSize) {
    return new Set(tokens).size / tokens.length;
  }
  let totalRatio = 0;
  let count = 0;
  for (let start = 0; start + windowSize <= tokens.length; start += windowSize) {
    const slice = tokens.slice(start, start + windowSize);
    totalRatio += new Set(slice).size / windowSize;
    count++;
  }
  return count ? totalRatio / count : 0;
}

export function cefrDistribution(text) {
  const tokens = tokenizeWords(text).map(t => t.toLowerCase());
  const counts = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, off: 0 };
  let content = 0;
  for (const t of tokens) {
    if (t.length <= 2 || POLISH_FUNCTION_WORDS.has(t)) continue;
    content++;
    const band = lookupBand(t);
    counts[band || 'off']++;
  }
  if (content === 0) return counts;
  for (const k of Object.keys(counts)) counts[k] /= content;
  return counts;
}

function lookupBand(word) {
  if (POLISH_LEMMA_TO_CEFR[word]) return POLISH_LEMMA_TO_CEFR[word];
  const lemma = lemmatize(word);
  if (POLISH_LEMMA_TO_CEFR[lemma]) return POLISH_LEMMA_TO_CEFR[lemma];
  return null;
}

export function cefrAtOrAbove(text, level) {
  const dist = cefrDistribution(text);
  const allowed = new Set(CEFR_BANDS_AT_OR_ABOVE[level] || []);
  let n = 0;
  for (const k of allowed) n += dist[k] || 0;
  return n;
}

export function repetitionIndex(text) {
  const tokens = tokenizeWords(text).map(t => t.toLowerCase()).filter(t => t.length > 2);
  if (tokens.length === 0) return 0;
  const counts = new Map();
  for (const t of tokens) counts.set(t, (counts.get(t) || 0) + 1);
  let repeated = 0;
  for (const [, c] of counts) if (c >= 3) repeated++;
  return repeated / counts.size;
}

export function collocationRate(text) {
  const tokens = tokenizeWords(text).map(t => t.toLowerCase()).filter(t => t.length > 2 && !POLISH_FUNCTION_WORDS.has(t));
  if (tokens.length < 2) return 0;
  let bigrams = 0;
  let hits = 0;
  for (let i = 0; i < tokens.length - 1; i++) {
    const bigram = `${tokens[i]} ${tokens[i + 1]}`;
    bigrams++;
    if (COLLOCATIONS.includes(bigram)) hits++;
  }
  return bigrams === 0 ? 0 : hits / bigrams;
}

function firstGreetingCandidate(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return '';
  const first = lines[0];
  if (first.length <= 60) return first;
  const m = first.match(/^([^.!?…]{1,40}[.!?…]?)/);
  return (m ? m[1] : first).trim();
}

function looksLikeName(line) {
  if (line.length > 30) return false;
  if (/[,!?…]/.test(line)) return false;
  return /^[A-ZĄĆĘŁŃÓŚŹŻ][\p{L}\s-]*[\p{L}]$/u.test(line);
}

function lastClosingCandidate(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return '';
  if (lines.length >= 2 && looksLikeName(lines[lines.length - 1])) {
    return lines[lines.length - 2];
  }
  if (lines.length >= 2) return lines[lines.length - 1];
  const sentences = splitSentences(text);
  if (sentences.length === 0) return '';
  return sentences[sentences.length - 1].trim();
}

export function detectGreeting(text, registerKey) {
  const reg = REGISTER[registerKey] || REGISTER.nieformalny;
  const candidate = firstGreetingCandidate(text);
  if (!candidate) return { match: false, text: '' };
  for (const re of reg.greetings) {
    if (re.test(candidate)) return { match: true, text: candidate };
  }
  return { match: false, text: candidate };
}

export function detectClosing(text, registerKey) {
  const reg = REGISTER[registerKey] || REGISTER.nieformalny;
  const candidate = lastClosingCandidate(text);
  if (!candidate) return { match: false, text: '' };
  for (const re of reg.closings) {
    if (re.test(candidate)) return { match: true, text: candidate };
  }
  return { match: false, text: candidate };
}

export function registerMarkerCounts(text, registerKey) {
  const reg = REGISTER[registerKey] || REGISTER.nieformalny;
  const lower = text.toLowerCase();
  let formal = 0;
  let informal = 0;
  for (const m of reg.formalMarkers) {
    const re = W(escapeRegExp(m));
    const found = lower.match(re);
    if (found) formal += found.length;
  }
  for (const m of reg.informalMarkers) {
    const re = W(escapeRegExp(m));
    const found = lower.match(re);
    if (found) informal += found.length;
  }
  return { formal, informal };
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const OFFTOPIC_MIN_WORDS = 20;

export function offTopicByCoverage(text, points) {
  if (!points || points.length === 0) return false;
  const textTokenSet = new Set();
  for (const t of tokenizeWords(text)) {
    const lower = t.toLowerCase();
    if (lower.length > 2) textTokenSet.add(lower);
    textTokenSet.add(lemmatize(lower));
  }
  const wc = wordCount(text);
  if (wc < OFFTOPIC_MIN_WORDS) return false;
  let allEmpty = true;
  for (const point of points) {
    const ptoks = tokenizeWords(point).map(t => t.toLowerCase());
    let any = false;
    for (const t of ptoks) {
      if (t.length <= 3) continue;
      if (textTokenSet.has(t)) { any = true; break; }
      if (textTokenSet.has(lemmatize(t))) { any = true; break; }
    }
    if (any) { allEmpty = false; break; }
  }
  return allEmpty;
}

export function listStats() {
  return {
    cefrList: { ...CEFR_LIST_STATS },
    grammarRules: GRAMMAR_RULES.filter(r => r.severity > 0).length,
    punctRules: PUNCT_RULES.length,
    discourseMarkers: DISCOURSE_MARKERS.length,
    collocations: COLLOCATIONS.length,
    functionWords: POLISH_FUNCTION_WORDS.size,
    irregularForms: Object.keys(IRREGULAR_FORMS).length,
    stopContentLemmas: STOP_CONTENT_LEMMAS.size,
  };
}
