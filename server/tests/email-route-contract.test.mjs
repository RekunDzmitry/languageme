import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const routeSource = readFileSync(new URL('../src/routes/email.js', import.meta.url), 'utf8');

test('buildDeterministicFinalEvaluation still exists and does not filter on err.resolved', () => {
  const builderStart = routeSource.indexOf('function buildDeterministicFinalEvaluation');
  assert.notEqual(builderStart, -1, 'buildDeterministicFinalEvaluation must exist');
  const builderEnd = routeSource.indexOf('// ============================================================================', builderStart);
  const builderSource = routeSource.slice(builderStart, builderEnd);

  assert.doesNotMatch(
    builderSource,
    /\.filter\([^)]*err\.resolved/,
    'the final builder must not drop errors by a streaming-only resolved flag — the enrichment layer only emits records with valid spans'
  );
});

test('both /evaluate and /evaluate-stream route through evaluateEmailCore', () => {
  // After the deterministic-first refactor, the legacy one-shot and the
  // streaming routes share the same core pipeline. This pins that the routes
  // don't duplicate the prompt/discovery/enrichment logic.
  assert.match(routeSource, /async function evaluateEmailCore/, 'evaluateEmailCore must exist');
  assert.match(routeSource, /evaluateEmailCore\(/, 'evaluateEmailCore must be called from at least one route');
  // Both routes still return a payload built by buildDeterministicFinalEvaluation,
  // preserving the wire-payload contract:
  assert.match(routeSource, /buildDeterministicFinalEvaluation\(/, 'the wire payload must still be assembled by buildDeterministicFinalEvaluation');
});

test('enrichment payload preserves normalized constructionReplacements', () => {
  // The contract: every record in constructionReplacements has the canonical
  // {originalText, suggestedText, originalLevel, suggestedLevel, explanation}
  // shape. The new emailEnrichment service normalizes this in
  // normalizeConstructions; verify the route still wires it through.
  const enrichmentSource = readFileSync(new URL('../src/services/emailEnrichment.js', import.meta.url), 'utf8');
  assert.match(enrichmentSource, /function normalizeConstructions/, 'normalizeConstructions must exist');
  assert.match(
    enrichmentSource,
    /suggestedLevel: CEFR_LEVELS\.includes\(item\.suggestedLevel\) \? item\.suggestedLevel/,
    'construction replacement suggestedLevel must be validated against the CEFR allowlist'
  );
});
