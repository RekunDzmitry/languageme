// Unit tests for the deterministic emailScoring service.
// Run with: node --test tests/email-scoring.test.mjs
//
// These tests are hermetic: no DB, no network, no LLM. They assert:
//   - reproducibility: same input → byte-identical rubric across 100 runs
//   - band mapping: ρ thresholds produce the expected TELC 0-5 score
//   - disqualifier: content=0 OR accuracy=0 ⇒ total=0
//   - hardcoded comments: lookup is deterministic and key-stable
//   - register detection: greeting/closing are matched for each register
//   - off-topic heuristic: a completely unrelated long email is flagged

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  grade,
  scoreComposition,
  scoreAccuracy,
  scoreContent,
  aggregateRubric,
  applyDisqualifier,
  attachHardcodedComments,
  METRIC_VERSION,
} from '../src/services/emailScoring.js';
import {
  COMMENTS,
  BAND_SUMMARY,
  OFF_TOPIC_SUMMARY,
  TASK_MISUNDERSTOOD_SUMMARY,
} from '../src/data/telcComments.js';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const SAMPLE_POINTS = [
  'Opisz, jak był zorganizowany kurs i jak wyglądał Twój plan dnia.',
  'Opowiedz o innych uczestnikach kursu.',
  'Napisz, co i dlaczego podobało Ci się najbardziej.',
];

const GOOD_EMAIL = `Cześć Marku!

Dawno się nie widzieliśmy. Właśnie wróciłem z intensywnego kursu języka polskiego we Wrocławiu, gdzie spędziłem cztery tygodnie. Chciałem Ci opowiedzieć, jak wyglądał mój plan dnia i co najbardziej mi się podobało.

Kurs był zorganizowany bardzo dobrze. Codziennie rano od 9:00 do 14:00 miałem lekcje w sali wykładowej. Potem obiad w stołówce, a po południu zwiedzanie miasta lub zajęcia dodatkowe. Nauczyciel był bardzo cierpliwy i pomocny.

W kursie uczestniczyło dwadzieścia osób z różnych krajów. Najwięcej było Hiszpanów i Włochów, ale też kilku Niemców i Francuzów. Poznałem Jarka i Broneka z Gdyni, z którymi chodziłem na kawę po zajęciach. Wszyscy byli bardzo mili.

Najbardziej podobały mi się warsztaty z wymowy, bo nauczycielka pokazywała, jak poprawnie wymawiać polskie głoski. Podobało mi się też, że mogliśmy rozmawiać po polsku cały dzień, nie tylko na lekcjach.

Mam nadzieję, że kiedyś razem pójdziemy na taki kurs!

Pozdrawiam serdecznie,
Dima`;

// Critical-severity grammar mistakes by design (Dziękuję + dla = severity 3).
const BAD_EMAIL = 'Wczoraj byłem w sklep i kupić mleko. Dziękuję dla wszystkich za pomoc. Proszę informacje. Mieszkam w Warsawa.';

const OFF_TOPIC_EMAIL = `Cześć Marku!

Pogoda jest dzisiaj bardzo ładna. Słońce świeci na niebie i jest ciepło. Lubię chodzić na spacery w parku, kiedy jest ładna pogoda. Ptaki śpiewają w drzewach, a dzieci bawią się na placu zabaw.`;

const NO_GREETING_EMAIL = 'To jest test bez powitania i bez zakończenia. Po prostu tekst.';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test('reproducibility: same input produces byte-identical rubric across 100 runs', () => {
  const ctx = { points: SAMPLE_POINTS, register: 'nieformalny', targetLevel: 'B1' };
  const first = grade(GOOD_EMAIL, ctx);
  const baseline = JSON.stringify(first.rubric);
  for (let i = 0; i < 100; i++) {
    const next = grade(GOOD_EMAIL, ctx);
    assert.equal(JSON.stringify(next.rubric), baseline, `run ${i} differs from baseline`);
  }
});

test('hardcoded comments are deterministic and key-stable', () => {
  for (const criterion of ['content', 'composition', 'accuracy', 'vocabulary']) {
    for (const score of [0, 1, 2, 3, 4, 5]) {
      const expected = COMMENTS[criterion][score];
      assert.equal(typeof expected, 'string', `${criterion}.${score} must be a string`);
      assert.ok(expected.length > 0, `${criterion}.${score} must be non-empty`);
    }
  }
  for (const band of ['B2', 'B1', 'below_B1']) {
    assert.ok(typeof BAND_SUMMARY[band] === 'string');
  }
  assert.equal(typeof OFF_TOPIC_SUMMARY, 'string');
  assert.equal(typeof TASK_MISUNDERSTOOD_SUMMARY, 'string');
});

test('accuracy score mapping: ρ → TELC score', () => {
  const clean = scoreAccuracy('To jest czyste zdanie bez błędów.');
  assert.equal(clean.score, 5, `clean text should score 5, got ${clean.score} (ρ=${clean.signals.rho.toFixed(2)})`);

  const veryBad = scoreAccuracy(BAD_EMAIL);
  assert.ok(veryBad.signals.errorCount > 0, 'bad text should have errors');
  assert.ok(veryBad.signals.critical > 0, `bad text should have critical errors, got critical=${veryBad.signals.critical}`);
  assert.equal(veryBad.score, 0, `bad text should score 0, got ${veryBad.score}`);
});

test('disqualifier: content=0 OR accuracy=0 forces total=0', () => {
  const result = grade(BAD_EMAIL, { points: SAMPLE_POINTS, register: 'nieformalny' });
  assert.equal(result.rubric.criteria.accuracy.score, 0, 'bad text accuracy must be 0');
  assert.equal(result.rubric.total, 0, 'disqualifier must zero the total');
  assert.equal(result.rubric.percentage, 0, 'disqualifier must zero the percentage');

  const manual = aggregateRubric({
    content: { score: 0, signals: { perPoint: [] } },
    composition: { score: 5, signals: {} },
    accuracy: { score: 4, signals: {} },
    vocabulary: { score: 4, signals: {} },
  });
  assert.equal(manual.total, 13, 'pre-disqualifier total is 13');
  applyDisqualifier(manual);
  assert.equal(manual.total, 0, 'content=0 forces total=0');
});

test('attachHardcodedComments: comments come from the static tables', () => {
  const rubric = aggregateRubric({
    content: { score: 3, signals: { perPoint: [] } },
    composition: { score: 4, signals: {} },
    accuracy: { score: 5, signals: {} },
    vocabulary: { score: 2, signals: {} },
  });
  attachHardcodedComments(rubric);
  assert.equal(rubric.criteria.content.comment, COMMENTS.content[3]);
  assert.equal(rubric.criteria.composition.comment, COMMENTS.composition[4]);
  assert.equal(rubric.criteria.accuracy.comment, COMMENTS.accuracy[5]);
  assert.equal(rubric.criteria.vocabulary.comment, COMMENTS.vocabulary[2]);
  assert.equal(rubric.examinerSummary, BAND_SUMMARY[rubric.cefrBand]);
});

test('attachHardcodedComments: off-topic overrides examinerSummary', () => {
  const rubric = aggregateRubric({
    content: { score: 0, signals: { perPoint: [] } },
    composition: { score: 0, signals: {} },
    accuracy: { score: 0, signals: {} },
    vocabulary: { score: 0, signals: {} },
  });
  rubric.offTopic = true;
  attachHardcodedComments(rubric, { offTopic: true });
  assert.equal(rubric.examinerSummary, OFF_TOPIC_SUMMARY);
});

test('composition: greeting + closing detection is register-aware', () => {
  const informal = scoreComposition(GOOD_EMAIL, 'nieformalny');
  assert.equal(informal.signals.greeting, true, 'informal greeting must match');
  assert.equal(informal.signals.closing, true, `informal closing must match, got text=${JSON.stringify(informal.signals.closingText)}`);

  const formalEmail = 'Szanowny Panie,\n\nPiszę w sprawie reklamacji. Oczekuję odpowiedzi.\n\nZ poważaniem,\nJan Kowalski';
  const formal = scoreComposition(formalEmail, 'formalny');
  assert.equal(formal.signals.greeting, true, 'formal greeting must match');
  assert.equal(formal.signals.closing, true, 'formal closing must match');
});

test('composition: no greeting or closing scores low', () => {
  const noGreet = scoreComposition(NO_GREETING_EMAIL, 'nieformalny');
  assert.equal(noGreet.signals.greeting, false, 'missing greeting must not match');
  assert.equal(noGreet.signals.closing, false, 'missing closing must not match');
  const complete = scoreComposition(GOOD_EMAIL, 'nieformalny');
  assert.ok(noGreet.score < complete.score, `no-greet (${noGreet.score}) must score < complete (${complete.score})`);
});

test('content: per-point coverage drives the score', () => {
  const good = scoreContent(GOOD_EMAIL, SAMPLE_POINTS);
  assert.equal(good.signals.coveredCount, 3, 'good email must cover all 3 points');
  assert.ok(good.score >= 3, `good content score must be ≥3, got ${good.score}`);

  const off = scoreContent(OFF_TOPIC_EMAIL, SAMPLE_POINTS);
  assert.equal(off.signals.coveredCount, 0, `off-topic must cover 0 points, got ${off.signals.coveredCount}`);
  assert.equal(off.score, 0, 'off-topic content score must be 0');
});

test('grade() flags off-topic automatically', () => {
  const result = grade(OFF_TOPIC_EMAIL, { points: SAMPLE_POINTS, register: 'nieformalny' });
  assert.equal(result.rubric.offTopic, true, 'off-topic email must set offTopic=true');
  assert.equal(result.rubric.total, 0, 'off-topic total must be 0');
});

test('grade() respects explicit offTopic override', () => {
  const result = grade(GOOD_EMAIL, { points: SAMPLE_POINTS, register: 'nieformalny', offTopic: true });
  assert.equal(result.rubric.offTopic, true);
  assert.equal(result.rubric.total, 0);
});

test('grade() returns metricVersion on every call', () => {
  const result = grade(GOOD_EMAIL, { points: SAMPLE_POINTS });
  assert.equal(result.metricVersion, METRIC_VERSION);
  assert.ok(METRIC_VERSION.match(/^\d{4}-\d{2}-\d{2}\.\d+$/), 'metric version must be a YYYY-MM-DD.N stamp');
});

test('good email: ends up in B1 or B2 band', () => {
  const result = grade(GOOD_EMAIL, { points: SAMPLE_POINTS, register: 'nieformalny', targetLevel: 'B1' });
  assert.ok(['B1', 'B2'].includes(result.rubric.cefrBand), `good email should be B1/B2, got ${result.rubric.cefrBand}`);
  assert.ok(result.rubric.total >= 7, `good email total must be ≥7 (B1 floor), got ${result.rubric.total}`);
});

test('bad email: ends up below B1', () => {
  const result = grade(BAD_EMAIL, { points: SAMPLE_POINTS, register: 'nieformalny', targetLevel: 'B1' });
  assert.equal(result.rubric.cefrBand, 'below_B1', `bad email must be below_B1, got ${result.rubric.cefrBand}`);
});
