#!/usr/bin/env node
// Run the deterministic emailScoring service over every fixture in
// tests/email-scoring.fixtures.json and report per-criterion MAE plus
// CEFR band agreement. Exit non-zero if MAE exceeds the gate.
//
// Usage: node scripts/grade-fixtures.mjs
//        node scripts/grade-fixtures.mjs --gate 0.5   (default gate)
//
// This is the calibration entry point. The thresholds and weights in
// emailScoring.js are tuned until the per-criterion MAE drops below the
// gate and the band agreement reaches 85%.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { grade } from '../src/services/emailScoring.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_PATH = join(__dirname, '..', 'tests', 'email-scoring.fixtures.json');

const args = process.argv.slice(2);
let gate = 0.5;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--gate') gate = Number(args[++i]);
}

const raw = await readFile(FIXTURES_PATH, 'utf8');
const { metricVersion, fixtures } = JSON.parse(raw);

console.log(`\nCalibration report — metric ${metricVersion}\n`);
console.log('id'.padEnd(28), 'c1  c2  c3  c4  tot  band  expected  actual  Δ  match');
console.log('-'.repeat(110));

const errors = { content: 0, composition: 0, accuracy: 0, vocabulary: 0 };
let totalDelta = 0;
let bandAgree = 0;

for (const f of fixtures) {
  const { rubric } = grade(f.userText, {
    points: f.points,
    register: f.register,
    targetLevel: f.level,
  });
  const exp = f.expected;
  const dC = Math.abs(rubric.criteria.content.score - exp.content);
  const dCo = Math.abs(rubric.criteria.composition.score - exp.composition);
  const dA = Math.abs(rubric.criteria.accuracy.score - exp.accuracy);
  const dV = Math.abs(rubric.criteria.vocabulary.score - exp.vocabulary);
  const dTotal = Math.abs(rubric.total - exp.total);
  const dBand = rubric.cefrBand === exp.band ? 0 : 1;
  if (dBand === 0) bandAgree++;
  errors.content += dC;
  errors.composition += dCo;
  errors.accuracy += dA;
  errors.vocabulary += dV;
  totalDelta += dTotal;
  const flag = dTotal > 2 || dBand === 1 ? '✗' : '✓';
  console.log(
    f.id.padEnd(28),
    String(rubric.criteria.content.score).padStart(2),
    String(rubric.criteria.composition.score).padStart(3),
    String(rubric.criteria.accuracy.score).padStart(3),
    String(rubric.criteria.vocabulary.score).padStart(3),
    String(rubric.total).padStart(4),
    String(rubric.cefrBand).padStart(5),
    ` ${String(exp.content)}/${exp.composition}/${exp.accuracy}/${exp.vocabulary}=${exp.total} ${exp.band}`.padEnd(11),
    ' vs ',
    `${rubric.criteria.content.score}/${rubric.criteria.composition.score}/${rubric.criteria.accuracy.score}/${rubric.criteria.vocabulary.score}=${rubric.total} ${rubric.cefrBand}`.padEnd(11),
    `Δ=${dTotal}`.padStart(5),
    ' ',
    flag,
  );
}

const n = fixtures.length;
const mae = {
  content: errors.content / n,
  composition: errors.composition / n,
  accuracy: errors.accuracy / n,
  vocabulary: errors.vocabulary / n,
  total: totalDelta / n,
  bandAgreement: bandAgree / n,
};

console.log('\n');
console.log(`Per-criterion MAE:`);
for (const [k, v] of Object.entries(mae)) {
  console.log(`  ${k.padEnd(16)} ${typeof v === 'number' ? v.toFixed(3) : v}`);
}

const maxMae = Math.max(mae.content, mae.composition, mae.accuracy, mae.vocabulary);
const bandOk = mae.bandAgreement >= 0.85;

console.log(`\nGate: MAE ≤ ${gate} per criterion, band agreement ≥ 0.85`);
console.log(`  max MAE         = ${maxMae.toFixed(3)}  ${maxMae <= gate ? 'PASS' : 'FAIL'}`);
console.log(`  band agreement  = ${(mae.bandAgreement * 100).toFixed(0)}%  ${bandOk ? 'PASS' : 'FAIL'}`);

if (maxMae > gate || !bandOk) {
  console.log('\nCalibration gate NOT met. Tune thresholds/weights in emailScoring.js and re-run.\n');
  process.exit(1);
} else {
  console.log('\nCalibration gate met. The metric is ready to ship.\n');
  process.exit(0);
}
