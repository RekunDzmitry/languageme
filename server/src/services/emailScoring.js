// Deterministic TELC Polish B1·B2 email scoring service.
//
// Pure functions — no LLM calls, no network, no randomness, no Date.now().
// Every input → output is reproducible. The LLM is only used for:
//   - per-error discovery and corrections (kept as the LLM step)
//   - per-point "stance" classification (small 0/1 task; defaults to 1
//     on LLM failure so a flaky LLM never costs the learner a point)
//   - optional narrative comment flavour (a separate per-criterion
//     sentence that is NEVER used to derive the score)
//
// Public exports:
//   scoreComposition(text, register)        -> { score, signals }
//   scoreAccuracy(text)                     -> { score, signals, errors }
//   scoreVocabulary(text, targetLevel)      -> { score, signals }
//   scoreContent(text, points, stance)      -> { score, signals }
//   aggregateRubric(parts)                  -> full telcRubric + band + pct
//   applyDisqualifier(rubric)               -> rubric (mutates)
//   attachHardcodedComments(rubric, flags)  -> rubric with .comment fields
//   grade(text, ctx)                        -> the whole pipeline at once
//
// Thresholds here are placeholders; they will be tuned in the calibration
// pass against the 30-email human-rated fixture set. The shape of the
// formulas is fixed; only the constants change.

import {
  tokenizeWords,
  wordCount,
  splitSentences,
  splitParagraphs,
  detectGreeting,
  detectClosing,
  registerMarkerCounts,
  findAllErrors,
  mattr,
  cefrAtOrAbove,
  repetitionIndex,
  collocationRate,
  assignSentencesToPoints,
  offTopicByCoverage,
  sentenceCosine,
} from './polishNlp.js';
import {
  COMMENTS,
  BAND_SUMMARY,
  OFF_TOPIC_SUMMARY,
  TASK_MISUNDERSTOOD_SUMMARY,
} from '../data/telcComments.js';

// Local helper: bag-of-words for a string. Kept private to the scoring
// service because polishNlp's `sentenceBow` is not exported (intentionally
// small API surface for callers that don't need it).
const bow = (text) => new Set(tokenizeWords(text).map(t => t.toLowerCase()));

// Version stamp — bumped whenever a threshold changes. Stored in
// email_attempt.metric_version for reproducibility / re-derivation.
export const METRIC_VERSION = '2026-07-31.1';

// ────────────────────────────────────────────────────────────────────────────
// Composition (II Kompozycja)
// ────────────────────────────────────────────────────────────────────────────

export function scoreComposition(text, registerKey) {
  const reg = registerKey || 'nieformalny';
  const greeting = detectGreeting(text, reg);
  const closing = detectClosing(text, reg);
  const markers = registerMarkerCounts(text, reg);
  const paragraphs = splitParagraphs(text);
  const sentences = splitSentences(text);

  const G = greeting.match ? 1 : 0;
  const C = closing.match ? 1 : 0;

  let Rm = 0;
  if (reg === 'nieformalny') {
    Rm = (markers.informal > 0 || markers.formal === 0) ? 1 : 0;
  } else if (reg === 'półformalny') {
    Rm = (markers.formal > 0 && markers.informal === 0) ? 1 : 0;
  } else if (reg === 'formalny') {
    Rm = (markers.formal >= 1 && markers.informal === 0) ? 1 : 0;
  }

  const P = paragraphs.length > 0 ? Math.min(1, paragraphs.length / 3) : 0;

  let Lcv = 0;
  if (sentences.length >= 2) {
    const lens = sentences.map(s => tokenizeWords(s).length);
    const mean = lens.reduce((a, b) => a + b, 0) / lens.length;
    const variance = lens.reduce((a, l) => a + (l - mean) ** 2, 0) / lens.length;
    const stddev = Math.sqrt(variance);
    const cov = mean > 0 ? stddev / mean : 0;
    Lcv = Math.min(1, cov / 0.6);
  }

  let M = 0;
  const wc = wordCount(text);
  if (wc > 0) {
    const conjunctions = (text.match(/\b(i|ale|więc|ponieważ|dlatego|jednak|bo|natomiast|chociaż|choć|zatem|aby|żeby)\b/giu) || []).length;
    M = Math.min(1, conjunctions / Math.max(1, wc / 15));
  }

  const raw = 0.30 * G + 0.25 * C + 0.20 * Rm + 0.10 * P + 0.10 * Lcv + 0.05 * M;
  const score = Math.max(0, Math.min(5, Math.floor(raw * 5)));

  return {
    score,
    signals: {
      greeting: greeting.match,
      greetingText: greeting.text,
      closing: closing.match,
      closingText: closing.text,
      registerMarkers: markers,
      paragraphCount: paragraphs.length,
      sentenceCount: sentences.length,
      Lcv,
      M,
      raw,
    },
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Accuracy (III Poprawność)
// ────────────────────────────────────────────────────────────────────────────

const RHO_BANDS = [
  { max: 1.0, score: 5 },
  { max: 3.0, score: 4 },
  { max: 6.0, score: 3 },
  { max: 10.0, score: 2 },
  { max: 15.0, score: 1 },
  { max: Infinity, score: 0 },
];

const CRITICAL_THRESHOLD = 6;

export function scoreAccuracy(text) {
  const wc = wordCount(text);
  const errs = findAllErrors(text);
  const all = errs.all;

  const weighted = all.reduce((sum, e) => sum + (e.severity || 1), 0);
  const rho = wc > 0 ? (weighted / wc) * 100 : 0;
  const critical = all.filter(e => (e.severity || 0) >= 3).length;

  let score;
  for (const band of RHO_BANDS) {
    if (rho <= band.max) { score = band.score; break; }
  }
  if (critical > CRITICAL_THRESHOLD) score = 0;

  return {
    score,
    signals: {
      errorCount: all.length,
      spelling: errs.spelling.length,
      punctuation: errs.punctuation.length,
      grammar: errs.grammar.length,
      critical,
      weighted,
      wordCount: wc,
      rho,
    },
    errors: all,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Vocabulary (IV Słownictwo)
// ────────────────────────────────────────────────────────────────────────────

export function scoreVocabulary(text, targetLevel = 'B1') {
  const m = mattr(text);
  const cefr = cefrAtOrAbove(text, targetLevel);
  const rep = repetitionIndex(text);
  const coll = collocationRate(text);
  const regCx = Math.min(1, cefr + 0.1);

  const mattrNorm = Math.max(0, Math.min(1, (m - 0.4) / 0.45));

  const raw = 0.30 * mattrNorm + 0.30 * cefr + 0.10 * (1 - rep) + 0.20 * coll + 0.10 * regCx;
  const score = Math.max(0, Math.min(5, Math.floor(raw * 5)));

  return {
    score,
    signals: {
      mattr: m,
      mattrNormalized: mattrNorm,
      cefrAtOrAbove: cefr,
      repetition: rep,
      collocation: coll,
      registerConformance: regCx,
      targetLevel,
      raw,
    },
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Content (I Treść)
// ────────────────────────────────────────────────────────────────────────────

export function scoreContent(text, points, stance = null) {
  const safePoints = Array.isArray(points) ? points : [];
  if (safePoints.length === 0) {
    return {
      score: 0,
      signals: { perPoint: [], reason: 'no-points' },
    };
  }

  const assignments = assignSentencesToPoints(text, safePoints);
  const perPoint = assignments.map((a, idx) => {
    const point = safePoints[idx];
    let relevance = 0;
    if (a.sentences.length > 0) {
      const pointBow = bow(point);
      const spanBow = bow(a.sentences.join(' '));
      relevance = sentenceCosine(pointBow, spanBow);
    }
    const stanceVal = stance && typeof stance[idx] === 'number' ? (stance[idx] ? 1 : 0) : 1;
    const covered = a.coverage ? 1 : 0;
    const wcNorm = Math.min(1, a.wordCount / 30);
    const depthNorm = Math.min(1, a.depthSignals / 2);
    const pointRaw = 0.50 * wcNorm + 0.20 * depthNorm + 0.20 * stanceVal + 0.10 * relevance;
    return {
      idx,
      point,
      covered,
      wordCount: a.wordCount,
      depthSignals: a.depthSignals,
      stance: stanceVal,
      relevance,
      raw: pointRaw,
    };
  });

  const meanRaw = perPoint.reduce((sum, p) => sum + p.raw, 0) / perPoint.length;
  const coveredCount = perPoint.filter(p => p.covered).length;
  const coverageMultiplier = coveredCount === 0 ? 0 : 0.5 + 0.5 * (coveredCount / perPoint.length);
  const adjusted = meanRaw * coverageMultiplier;
  const score = Math.max(0, Math.min(5, Math.floor(adjusted * 5)));

  return {
    score,
    signals: {
      perPoint,
      meanRaw,
      coverageMultiplier,
      adjusted,
      coveredCount,
    },
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Aggregation
// ────────────────────────────────────────────────────────────────────────────

function bandFromTotal(total) {
  if (total >= 15) return 'B2';
  if (total >= 7) return 'B1';
  return 'below_B1';
}

export function aggregateRubric(parts) {
  const criteria = {
    content: { score: parts.content.score },
    composition: { score: parts.composition.score },
    accuracy: { score: parts.accuracy.score },
    vocabulary: { score: parts.vocabulary.score },
  };
  const total = criteria.content.score + criteria.composition.score + criteria.accuracy.score + criteria.vocabulary.score;
  return {
    criteria,
    pointRatings: parts.content.signals.perPoint ? parts.content.signals.perPoint.reduce((acc, p) => {
      acc[`point${p.idx + 1}`] = {
        rating: p.covered && p.raw >= 0.6 ? '++' : p.covered ? '+' : '0',
        snippet: '',
        comment: '',
      };
      return acc;
    }, {}) : {},
    total,
    maxTotal: 20,
    percentage: Math.round((total / 20) * 100),
    cefrBand: bandFromTotal(total),
    offTopic: false,
    taskMisunderstood: false,
  };
}

export function applyDisqualifier(rubric) {
  if (rubric.criteria.content.score === 0 || rubric.criteria.accuracy.score === 0) {
    for (const k of Object.keys(rubric.criteria)) rubric.criteria[k].score = 0;
    rubric.total = 0;
    rubric.percentage = 0;
  }
  return rubric;
}

export function attachHardcodedComments(rubric, { offTopic = false, taskMisunderstood = false } = {}) {
  for (const [key, item] of Object.entries(rubric.criteria)) {
    const s = Math.max(0, Math.min(5, item.score));
    item.comment = COMMENTS[key][s];
  }
  if (offTopic) {
    rubric.examinerSummary = OFF_TOPIC_SUMMARY;
  } else if (taskMisunderstood) {
    rubric.examinerSummary = TASK_MISUNDERSTOOD_SUMMARY;
  } else {
    rubric.examinerSummary = BAND_SUMMARY[rubric.cefrBand];
  }
  return rubric;
}

// ────────────────────────────────────────────────────────────────────────────
// One-shot grading
// ────────────────────────────────────────────────────────────────────────────

export function grade(text, ctx = {}) {
  const {
    points = [],
    register = 'nieformalny',
    targetLevel = 'B1',
    stance = null,
    offTopic = null,
    taskMisunderstood = null,
    narrativeComments = null,
  } = ctx;

  const composition = scoreComposition(text, register);
  const accuracy = scoreAccuracy(text);
  const vocabulary = scoreVocabulary(text, targetLevel);
  const content = scoreContent(text, points, stance);

  const offTopicFinal = offTopic != null ? offTopic : offTopicByCoverage(text, points);
  const taskMisunderstoodFinal = taskMisunderstood === true;

  let rubric = aggregateRubric({ content, composition, accuracy, vocabulary });
  if (offTopicFinal) {
    for (const k of Object.keys(rubric.criteria)) rubric.criteria[k].score = 0;
    rubric.total = 0;
    rubric.percentage = 0;
    rubric.offTopic = true;
  }
  if (taskMisunderstoodFinal) {
    rubric.criteria.content.score = 0;
    rubric.total = rubric.criteria.content.score + rubric.criteria.composition.score + rubric.criteria.accuracy.score + rubric.criteria.vocabulary.score;
    rubric.percentage = Math.round((rubric.total / 20) * 100);
    rubric.taskMisunderstood = true;
  }
  rubric = applyDisqualifier(rubric);
  rubric.cefrBand = bandFromTotal(rubric.total);
  rubric = attachHardcodedComments(rubric, { offTopic: rubric.offTopic, taskMisunderstood: rubric.taskMisunderstood });

  if (narrativeComments) {
    for (const [key, item] of Object.entries(rubric.criteria)) {
      if (narrativeComments[key]) item.comment = narrativeComments[key];
    }
  }

  return {
    rubric,
    parts: { content, composition, accuracy, vocabulary },
    metricVersion: METRIC_VERSION,
  };
}
