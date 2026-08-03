import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const routeSource = readFileSync(new URL('../src/routes/email.js', import.meta.url), 'utf8');

test('/api/email/evaluate keeps normalized LLM errors in the deterministic final payload', () => {
  const builderStart = routeSource.indexOf('function buildDeterministicFinalEvaluation');
  assert.notEqual(builderStart, -1, 'buildDeterministicFinalEvaluation must exist');
  const builderEnd = routeSource.indexOf('// ============================================================================', builderStart);
  const builderSource = routeSource.slice(builderStart, builderEnd);

  assert.doesNotMatch(
    builderSource,
    /\.filter\([^)]*err\.resolved/,
    'one-shot /evaluate errors are normalized without a streaming-only resolved flag, so the final builder must not drop them'
  );
});

test('/api/email/evaluate returns normalized construction replacements', () => {
  assert.match(
    routeSource,
    /const finalEvaluation = buildDeterministicFinalEvaluation\(\{\s*gradeResult,\s*errors:\s*Array\.isArray\(evaluation\.errors\)\s*\?\s*evaluation\.errors\s*:\s*\[\],\s*constructionReplacements:\s*constructionReplacements,\s*\}\);/s,
    'the one-shot route should pass the normalized constructionReplacements variable, not the raw evaluation.constructionReplacements array'
  );
});
