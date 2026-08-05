// Per-fixture deep debug helper. Loads a fixture by id and dumps every
// signal that drives each criterion's score, so the calibration pass can
// pinpoint exactly which formula or regex is the culprit.
//
// Usage: node scripts/debug-fixture.mjs email_02_wspollokatorzy

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { grade, scoreComposition, scoreAccuracy, scoreVocabulary, scoreContent } from '../src/services/emailScoring.js';
import { offTopicByCoverage } from '../src/services/polishNlp.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_PATH = join(__dirname, '..', 'tests', 'email-scoring.fixtures.json');

const id = process.argv[2];
if (!id) { console.error('usage: node scripts/debug-fixture.mjs <fixture-id>'); process.exit(2); }

const { fixtures } = JSON.parse(await readFile(FIXTURES_PATH, 'utf8'));
const f = fixtures.find(x => x.id === id);
if (!f) { console.error(`no fixture with id "${id}"`); process.exit(2); }

console.log(`=== Fixture: ${f.id} ===`);
console.log(`register=${f.register}  targetLevel=${f.level}`);
console.log(`expected: c=${f.expected.content} co=${f.expected.composition} a=${f.expected.accuracy} v=${f.expected.vocabulary}  total=${f.expected.total}  band=${f.expected.band}`);
console.log(`notes: ${f.expected.notes || '(none)'}`);
console.log();

const text = f.userText;
console.log(`text length: ${text.length} chars, ${text.split(/\s+/).filter(Boolean).length} whitespace-tokens`);
console.log();

const offTopic = offTopicByCoverage(text, f.points);
console.log(`offTopicByCoverage: ${offTopic}`);
console.log();

const c = scoreComposition(text, f.register);
console.log(`--- composition ---  score=${c.score}`);
console.log(`  greeting: ${c.signals.greeting}  text=${JSON.stringify(c.signals.greetingText)}`);
console.log(`  closing:  ${c.signals.closing}  text=${JSON.stringify(c.signals.closingText)}`);
console.log(`  register markers: ${JSON.stringify(c.signals.registerMarkers)}`);
console.log(`  paragraphs: ${c.signals.paragraphCount}  sentences: ${c.signals.sentenceCount}`);
console.log(`  Lcv: ${c.signals.Lcv.toFixed(3)}  M: ${c.signals.M.toFixed(3)}`);
console.log(`  raw: ${c.signals.raw.toFixed(3)}`);
console.log();

const a = scoreAccuracy(text);
console.log(`--- accuracy ---  score=${a.score}`);
console.log(`  errors: total=${a.signals.errorCount} spelling=${a.signals.spelling} grammar=${a.signals.grammar} punct=${a.signals.punctuation}`);
console.log(`  critical (severity ≥3): ${a.signals.critical}`);
console.log(`  weighted: ${a.signals.weighted}  wordCount: ${a.signals.wordCount}  ρ: ${a.signals.rho.toFixed(2)}`);
console.log();

const v = scoreVocabulary(text, f.level);
console.log(`--- vocabulary ---  score=${v.score}`);
console.log(`  mattr: ${v.signals.mattr.toFixed(3)}  normalized: ${v.signals.mattrNormalized.toFixed(3)}`);
console.log(`  cefrAtOrAbove(${f.level}): ${v.signals.cefrAtOrAbove.toFixed(3)}`);
console.log(`  repetition: ${v.signals.repetition.toFixed(3)}`);
console.log(`  collocation: ${v.signals.collocation.toFixed(3)}`);
console.log(`  registerConformance: ${v.signals.registerConformance.toFixed(3)}`);
console.log(`  raw: ${v.signals.raw.toFixed(3)}`);
console.log();

const ct = scoreContent(text, f.points);
console.log(`--- content ---  score=${ct.score}  coveredCount=${ct.signals.coveredCount}`);
for (const p of ct.signals.perPoint) {
  console.log(`  pt${p.idx + 1}: cov=${p.covered}  wc=${p.wordCount}  depth=${p.depthSignals}  stance=${p.stance}  rel=${p.relevance.toFixed(2)}  raw=${p.raw.toFixed(2)}`);
  console.log(`     first sentence: ${JSON.stringify(p.sentences[0]?.slice(0, 80))}`);
}
console.log();

const g = grade(text, { points: f.points, register: f.register, targetLevel: f.level });
console.log(`--- final ---  total=${g.rubric.total}  band=${g.rubric.cefrBand}  offTopic=${g.rubric.offTopic}`);
console.log(`  content: ${g.rubric.criteria.content.score}  composition: ${g.rubric.criteria.composition.score}  accuracy: ${g.rubric.criteria.accuracy.score}  vocabulary: ${g.rubric.criteria.vocabulary.score}`);
