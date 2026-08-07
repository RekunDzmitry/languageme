/* global process */
import { Router } from 'express';
import { pool } from '../db/pool.js';
import { authenticate as requireAuth, optionallyAuthenticate } from '../middleware/auth.js';
import { grade as deterministicGrade, METRIC_VERSION } from '../services/emailScoring.js';
import { discoverErrors } from '../services/emailDiscovery.js';
import {
  buildEnrichmentPrompt,
  buildEnrichmentRequestBody,
  parseEnrichmentResponse,
  fallbackEnrichment,
  ENRICHMENT_MAX_TOKENS,
} from '../services/emailEnrichment.js';
import { findTextOccurrences, rangesOverlap, resolveErrorSpan } from '../services/emailSpanHelpers.js';

const router = Router();

// OpenAI-compatible AI API configuration
const AI_BASE_URL = process.env.AI_BASE_URL || process.env.OPENCODE_BASE_URL || 'https://opencode.ai/zen/go/v1';
const MODEL_NAME = process.env.AI_MODEL || process.env.OPENCODE_MODEL || 'deepseek-v4-flash';

// Catch-all theme for corrections the user doesn't attach to a real theme.
const OTHER_THEME_ID = 'pl_other';

// ============================================================================
// AI call helper
// ============================================================================

// The OpenCode gateway is flaky: it occasionally returns a 5xx, or a 200 with
// an empty `content` body. Both are transient, so callAI retries a few times
// with a short backoff before surfacing the failure.
const AI_MAX_ATTEMPTS = 3;
const AI_RETRY_DELAY_MS = 1500;
const EMAIL_EVALUATION_TIMEOUT_MS = Number(process.env.EMAIL_EVALUATION_TIMEOUT_MS || 180000);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const USE_NVIDIA_NIM = AI_BASE_URL.includes('nvidia.com');

function buildChatRequestBody(prompt, options = {}) {
  const {
    systemPrompt = 'You are a Polish language tutor. Return ONLY one valid JSON object. Do not include reasoning, markdown, labels, or explanatory text.',
    json = true,
    maxTokens = 8000,
  } = options;

  return {
    model: MODEL_NAME,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2,
    top_p: 0.9,
    max_tokens: maxTokens,
    // NVIDIA NIM (Nemotron) rejects `response_format: {type: "json_object"}` with a 500
    // ("invalid type: unit variant, expected newtype variant" — Rust serde deserialization).
    // The system prompt already demands JSON-only output and the parser at /api/email/evaluate
    // tolerates code-fenced JSON, so we skip the OpenAI JSON-mode field for NVIDIA.
    ...(json && !USE_NVIDIA_NIM ? { response_format: { type: 'json_object' } } : {}),
    ...(USE_NVIDIA_NIM ? {
      chat_template_kwargs: { enable_thinking: false },
      reasoning_budget: 0
    } : {})
  };
}

async function callAIOnce(prompt, apiKey, options = {}) {
  const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: 'POST',
    signal: options.signal,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(buildChatRequestBody(prompt, options)),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenCode API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0] || {};
  const message = choice.message || {};
  const rawContent = message.content ?? choice.text ?? message.reasoning_content ?? '';
  const content = Array.isArray(rawContent)
    ? rawContent.map(part => typeof part === 'string' ? part : part?.text || part?.content || '').join('')
    : String(rawContent || '');
  // An empty 200 response is a transient gateway hiccup — treat it as an error
  // so the retry loop kicks in instead of returning '' and failing to parse.
  if (!content.trim()) {
    const finishReason = choice.finish_reason || choice.finishReason || 'unknown';
    throw new Error(`OpenCode API returned empty content (finish_reason=${finishReason})`);
  }
  return content;
}

async function callAI(prompt, options = {}) {
  const apiKey = process.env.AI_API_KEY || process.env.NVIDIA_API_KEY || process.env.OPENCODE_API_KEY;
  if (!apiKey) {
    throw new Error('AI_API_KEY, NVIDIA_API_KEY, or OPENCODE_API_KEY environment variable is not set');
  }

  let lastErr;
  for (let attempt = 1; attempt <= AI_MAX_ATTEMPTS; attempt++) {
    try {
      return await callAIOnce(prompt, apiKey, options);
    } catch (err) {
      lastErr = err;
      if (attempt < AI_MAX_ATTEMPTS) {
        console.warn(`AI call attempt ${attempt}/${AI_MAX_ATTEMPTS} failed: ${err.message} — retrying`);
        await sleep(AI_RETRY_DELAY_MS * attempt);
      }
    }
  }
  throw lastErr;
}

// ============================================================================
// Small helpers used by both routes
// ============================================================================

const EMAIL_TARGET_LEVELS = ['B1', 'B2'];
const ERROR_CATEGORIES = ['spelling', 'grammar', 'punctuation', 'style', 'vocabulary'];

function normalizeTargetLevel(targetLevel) {
  return EMAIL_TARGET_LEVELS.includes(targetLevel) ? targetLevel : 'B1';
}

async function updateEvaluationStep({ attemptId, userId, steps, key, patch, status }) {
  const nextSteps = {
    ...steps,
    [key]: {
      ...(steps[key] || {}),
      ...patch
    }
  };
  await pool.query(
    `UPDATE email_attempt
     SET evaluation_steps = $3::jsonb,
         evaluation_status = COALESCE($4, evaluation_status),
         updated_at = NOW()
     WHERE id = $1 AND user_id = $2`,
    [attemptId, userId, JSON.stringify(nextSteps), status || null]
  );
  return nextSteps;
}
function writeStreamEvent(res, type, payload = {}) {
  res.write(`${JSON.stringify({ type, ...payload })}\n`);
}

// Build the per-criterion streaming event payload from a deterministic
// grade result. Mirrors the shape of `parseRubricResponse` so the existing
// downstream code (and the frontend event handler) can keep reading
// `telcRubric` / `taskCoverage` / `etiquetteCheck` / `registerMatch` /
// `overallFeedback` / `offTopic` / `taskMisunderstood` the same way.
function deterministicRubricEventData(gradeResult) {
  const { rubric, parts } = gradeResult;
  const taskCoverage = {};
  const perPoint = parts.content.signals.perPoint || [];
  for (let i = 0; i < perPoint.length; i++) {
    const p = perPoint[i];
    taskCoverage[`point${i + 1}`] = {
      covered: p.covered === 1,
      snippet: '',
      feedback: '',
    };
  }
  const comp = parts.composition.signals;
  const etiquetteCheck = {
    greeting: comp.greeting,
    closing: comp.closing,
    greetingText: comp.greetingText || '',
    closingText: comp.closingText || '',
    feedback: '',
  };
  // Register match: accept if the body has either kind of marker AND the
  // composition Rm passed (1 in the 0-1 register-fit signal). Without
  // markers we cannot tell — fall back to false so we never claim a
  // mismatch for a text that simply lacks the lexicon overlap.
  const hasMarkers = comp.registerMarkers.formal + comp.registerMarkers.informal > 0;
  return {
    telcRubric: rubric,
    taskCoverage,
    etiquetteCheck,
    registerMatch: hasMarkers ? comp.RmScore > 0.5 : false,
    overallFeedback: rubric.examinerSummary,
    offTopic: rubric.offTopic,
    taskMisunderstood: rubric.taskMisunderstood,
  };
}

// Final wire payload used by both the streaming and the single-prompt
// routes. Mirrors the shape produced by the legacy `buildFinalEvaluation`
// so the client JSON contract is unchanged.
function buildDeterministicFinalEvaluation({ gradeResult, errors = [], constructionReplacements = [] }) {
  const { rubric, parts, metricVersion } = gradeResult;
  const finalErrors = (Array.isArray(errors) ? errors : [])
    .filter(err => err && err.startOffset >= 0 && err.endOffset > err.startOffset)
    .sort((a, b) => a.startOffset - b.startOffset)
    .map((err, idx) => ({
      id: `err_${idx}`,
      originalText: err.originalText || '',
      correction: err.correction || err.originalText,
      explanation: err.explanation || '',
      category: ERROR_CATEGORIES.includes(err.category) ? err.category : 'grammar',
      startOffset: err.startOffset,
      endOffset: err.endOffset,
      proposedWords: Array.isArray(err.proposedWords) ? err.proposedWords : [],
      alternatives: Array.isArray(err.alternatives) ? err.alternatives : [],
    }));

  const comp = parts.composition.signals;
  const hasMarkers = comp.registerMarkers.formal + comp.registerMarkers.informal > 0;

  return {
    score: rubric.percentage,
    telcRubric: rubric,
    taskCoverage: deterministicRubricEventData(gradeResult).taskCoverage,
    etiquetteCheck: {
      greeting: comp.greeting,
      closing: comp.closing,
      greetingText: comp.greetingText || '',
      closingText: comp.closingText || '',
      feedback: '',
    },
    registerMatch: hasMarkers ? comp.RmScore > 0.5 : false,
    overallFeedback: rubric.examinerSummary,
    targetLevel: rubric.criteria ? null : null, // set by caller
    errors: finalErrors,
    constructionReplacements: Array.isArray(constructionReplacements) ? constructionReplacements : [],
    metricVersion,
    deterministicSignals: {
      composition: parts.composition.signals,
      accuracy: parts.accuracy.signals,
      vocabulary: parts.vocabulary.signals,
      content: parts.content.signals,
    },
  };
}

// ============================================================================
// Shared evaluation core (used by /evaluate and /evaluate-stream)
// ============================================================================
//
// The pipeline:
//   1. Deterministic rubric via `deterministicGrade` (no LLM).
//   2. Deterministic error discovery via `discoverErrors` (Hunspell +
//      punctuation + grammar rules). Byte-precise offsets, no LLM.
//   3. ONE enrichment call: LLM annotates each deterministic error with
//      explanation + correction + proposedWords + alternatives, plus any
//      style/vocabulary errors the deterministic stack can't see, plus up to
//      4 constructionReplacements. The LLM sees the whole email and the full
//      error list in one prompt — no more fragment-only guessing.
//   4. Wire-payload assembly via `buildDeterministicFinalEvaluation`.
//   5. Optional streaming event hook so the streaming route can emit NDJSON.
//
// The optional `onEvent` callback lets the streaming route emit progress
// events without coupling the core to Express. Each event is a plain object
// with `type` plus arbitrary payload fields.
//
// On LLM failure the core returns the deterministic errors with empty
// enrichment fields — the wire payload is still valid, the attempt still
// saves, the user still gets their scores and the deterministic errors.

async function evaluateEmailCore({
  userText,
  taskDescription,
  nativeLang,
  points,
  register,
  etiquetteHint,
  targetLevel,
  onEvent,
  signal,
}) {
  const trimmedText = userText.trim();
  const userNativeLang = nativeLang || 'ru';
  const normalizedTargetLevel = normalizeTargetLevel(targetLevel);
  const taskPoints = Array.isArray(points) ? points : [];

  // ---- Step 1: deterministic rubric ----
  onEvent?.({ type: 'step_started', step: 'rubric' });
  const gradeResult = deterministicGrade(trimmedText, {
    points: taskPoints,
    register: register || 'nieformalny',
    targetLevel: normalizedTargetLevel,
  });
  const rubricEventData = deterministicRubricEventData(gradeResult);
  onEvent?.({
    type: 'step_completed',
    step: 'rubric',
    data: rubricEventData,
    metricVersion: gradeResult.metricVersion,
  });

  // ---- Step 2: deterministic error discovery ----
  onEvent?.({ type: 'step_started', step: 'discovery' });
  const discoveredErrors = discoverErrors(trimmedText);
  onEvent?.({
    type: 'step_completed',
    step: 'discovery',
    data: discoveredErrors,
    counts: {
      total: discoveredErrors.length,
      spelling: discoveredErrors.filter(e => e.category === 'spelling').length,
      punctuation: discoveredErrors.filter(e => e.category === 'punctuation').length,
      grammar: discoveredErrors.filter(e => e.category === 'grammar').length,
    },
  });

  // ---- Step 3: single LLM enrichment call ----
  let enrichedErrors = fallbackEnrichment(discoveredErrors).enrichedErrors;
  let constructionReplacements = [];
  let llmError = null;
  let enrichmentRaw = null;

  onEvent?.({ type: 'step_started', step: 'enrichment' });
  try {
    const prompt = buildEnrichmentPrompt({
      userText: trimmedText,
      taskDescription,
      points: taskPoints,
      register: register || '',
      etiquetteHint: etiquetteHint || '',
      nativeLang: userNativeLang,
      targetLevel: normalizedTargetLevel,
      discoveredErrors,
    });
    enrichmentRaw = await callAI(prompt, {
      json: !USE_NVIDIA_NIM,
      maxTokens: ENRICHMENT_MAX_TOKENS,
      signal,
    });
    const parsed = parseEnrichmentResponse(enrichmentRaw, trimmedText, discoveredErrors);
    enrichedErrors = parsed.enrichedErrors;
    constructionReplacements = parsed.constructionReplacements;
    onEvent?.({
      type: 'step_completed',
      step: 'enrichment',
      data: enrichedErrors,
      constructionReplacements,
      counts: {
        total: enrichedErrors.length,
        llmAdded: enrichedErrors.length - discoveredErrors.length,
      },
    });
  } catch (err) {
    llmError = err.message;
    console.warn('LLM enrichment failed; using deterministic errors only:', err.message);
    onEvent?.({
      type: 'step_failed',
      step: 'enrichment',
      error: err.message,
      deterministicFallback: true,
    });
  }

  // ---- Step 4: wire payload assembly ----
  const evaluation = buildDeterministicFinalEvaluation({
    gradeResult,
    errors: enrichedErrors,
    constructionReplacements,
  });
  evaluation.targetLevel = normalizedTargetLevel;
  return {
    evaluation,
    discoveredErrors,
    enrichedErrors,
    constructionReplacements,
    llmError,
    enrichmentRaw,
  };
}

// ============================================================================
// POST /api/email/evaluate-stream — progressive persisted evaluation
// ============================================================================
router.post('/evaluate-stream', requireAuth, async (req, res) => {
  const { userText, taskDescription, nativeLang, points, register, etiquetteHint, targetLevel, themeId, exerciseIdx } = req.body;
  const userId = req.user.sub;

  if (!userText || !userText.trim()) return res.status(400).json({ error: 'userText is required' });
  if (!taskDescription || !taskDescription.trim()) return res.status(400).json({ error: 'taskDescription is required' });
  if (themeId === undefined || exerciseIdx === undefined) return res.status(400).json({ error: 'themeId and exerciseIdx are required' });
  const parsedExerciseIdx = Number(exerciseIdx);
  if (!Number.isInteger(parsedExerciseIdx)) return res.status(400).json({ error: 'exerciseIdx must be an integer' });

  const trimmedText = userText.trim();

  const { rows } = await pool.query(
    `INSERT INTO email_attempt
       (user_id, theme_id, exercise_idx, user_text, evaluation_status, evaluation_steps, updated_at)
     VALUES ($1, $2, $3, $4, 'running', '{}'::jsonb, NOW())
     RETURNING id, created_at`,
    [userId, themeId, parsedExerciseIdx, trimmedText]
  );
  const attempt = rows[0];
  let steps = {};

  res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('X-Accel-Buffering', 'no');
  writeStreamEvent(res, 'attempt_created', { attemptId: attempt.id, createdAt: attempt.created_at });

  const requestController = new AbortController();
  const requestTimeout = setTimeout(() => requestController.abort(), EMAIL_EVALUATION_TIMEOUT_MS);

  // Bridge core events to NDJSON output + DB persistence. The core emits
  // {type, step, ...} events synchronously — multiple updates can fire while
  // the previous UPDATE is still in flight. We maintain an in-memory `steps`
  // mirror synchronously (the authoritative view) and serialize DB writes
  // through a single promise chain so each UPDATE writes the latest snapshot
  // instead of a stale one. The last write wins for the same key (correct:
  // later events override earlier ones for the same step).
  let stepsWriteChain = Promise.resolve();
  const onEvent = (evt) => {
    writeStreamEvent(res, evt.type, evt);
    if (evt.type === 'step_started' || evt.type === 'step_completed' || evt.type === 'step_failed') {
      const step = evt.step;
      const patch = {
        status: evt.type === 'step_started' ? 'running'
              : evt.type === 'step_failed'  ? 'failed'
              : 'complete',
        ...(evt.type === 'step_completed' ? { completedAt: new Date().toISOString() } : {}),
        ...(evt.type === 'step_started'  ? { startedAt:  new Date().toISOString() } : {}),
        ...(evt.data !== undefined ? { data: evt.data } : {}),
        ...(evt.error ? { error: evt.error } : {}),
        ...(evt.counts ? { counts: evt.counts } : {}),
        ...(evt.metricVersion ? { metricVersion: evt.metricVersion } : {}),
      };
      // 1. Update the in-memory mirror synchronously — this is what the final
      //    'final' update below reads from.
      steps = { ...steps, [step]: { ...(steps[step] || {}), ...patch } };
      // 2. Queue the DB write so each one runs against the latest snapshot.
      stepsWriteChain = stepsWriteChain.then(() => pool.query(
        `UPDATE email_attempt
         SET evaluation_steps = $3::jsonb, updated_at = NOW()
         WHERE id = $1 AND user_id = $2`,
        [attempt.id, userId, JSON.stringify(steps)],
      ).catch(dbErr => console.error(`Failed to persist step ${step}:`, dbErr.message)));
    }
  };

  try {
    const result = await evaluateEmailCore({
      userText: trimmedText,
      taskDescription,
      nativeLang,
      points: Array.isArray(points) ? points : [],
      register: register || '',
      etiquetteHint: etiquetteHint || '',
      targetLevel,
      onEvent,
      signal: requestController.signal,
    });
    // Wait for every queued step write to land before the final step runs,
    // so the final 'evaluation_steps' JSONB is the cumulative snapshot.
    await stepsWriteChain;
    const finalEvaluation = result.evaluation;
    steps = await updateEvaluationStep({ attemptId: attempt.id, userId, steps, key: 'final', patch: { status: 'complete', completedAt: new Date().toISOString(), data: finalEvaluation }, status: 'complete' });
    await pool.query(
      `UPDATE email_attempt
       SET score = $3,
           ai_evaluation = $4::jsonb,
           deterministic_signals = $5::jsonb,
           metric_version = $6,
           evaluation_error = $7,
           updated_at = NOW()
       WHERE id = $1 AND user_id = $2`,
      [attempt.id, userId, finalEvaluation.score, JSON.stringify(finalEvaluation), JSON.stringify(finalEvaluation.deterministicSignals || {}), METRIC_VERSION, result.llmError || null]
    );
    const autoAdded = await autoAddCorrectionExercises(userId, attempt.id, finalEvaluation);
    writeStreamEvent(res, 'evaluation_complete', { attemptId: attempt.id, evaluation: finalEvaluation, autoAdded });
    clearTimeout(requestTimeout);
    res.end();
  } catch (err) {
    console.error('Progressive email evaluation failed:', err);
    clearTimeout(requestTimeout);
    await pool.query(
      `UPDATE email_attempt
       SET evaluation_status = 'failed',
           evaluation_error = $3,
           updated_at = NOW()
       WHERE id = $1 AND user_id = $2`,
      [attempt.id, userId, err.message]
    );
    writeStreamEvent(res, 'step_failed', { step: 'evaluation', error: err.message });
    res.end();
  }
});

// ============================================================================
// POST /api/email/evaluate — evaluate user's email
// ============================================================================

router.post('/evaluate', optionallyAuthenticate, async (req, res) => {
  try {
    const { userText, taskDescription, nativeLang, points, register, etiquetteHint, targetLevel } = req.body;

    if (!userText || !userText.trim()) {
      return res.status(400).json({ error: 'userText is required' });
    }
    if (!taskDescription || !taskDescription.trim()) {
      return res.status(400).json({ error: 'taskDescription is required' });
    }

    // The legacy one-shot endpoint now shares the same core pipeline as the
    // streaming route: deterministic rubric, deterministic discovery, single
    // enrichment LLM call. The wire payload shape is unchanged.
    let result;
    try {
      result = await evaluateEmailCore({
        userText,
        taskDescription,
        nativeLang,
        points: points || [],
        register: register || '',
        etiquetteHint: etiquetteHint || '',
        targetLevel,
      });
    } catch (coreErr) {
      console.error('Email evaluation core error:', coreErr.message);
      return res.status(500).json({ error: 'Failed to evaluate email', details: coreErr.message });
    }

    return res.json(result.evaluation);
  } catch (err) {
    console.error('Email evaluation error:', err);
    res.status(500).json({ error: 'Failed to evaluate email', details: err.message });
  }
});

// ============================================================================
// Auto-add corrections as write_answer drills
// ============================================================================

// Turn each graded error into a personal write_answer drill, filed under the
// theme the AI matched it to (falling back to the catch-all). Returns the list
// of corrected words now in the user's drills (newly added or already present)
// so the client can mark them as added. Never throws — a drill-creation hiccup
// must not fail the attempt save.
async function autoAddCorrectionExercises(userId, attemptId, aiEvaluation) {
  try {
    const errors = Array.isArray(aiEvaluation?.errors) ? aiEvaluation.errors : [];

    // One canonical card per error: its primary correction. Extra proposedWords
    // (related vocab gaps) stay opt-in via the "+" button in the UI.
    const candidates = [];
    for (const err of errors) {
      const pw = Array.isArray(err.proposedWords) ? err.proposedWords[0] : null;
      const rawTarget = pw?.target || '';
      const answer = rawTarget.trim();
      const promptText = (pw?.translation || '').trim();
      if (!answer || !promptText) continue;
      candidates.push({
        // rawTarget is returned verbatim so the client can match it against the
        // popover's proposedWords[].target (which it keys "added" state by).
        rawTarget,
        answer,
        prompt: promptText,
        hint: err.explanation ? String(err.explanation).trim() : null,
        themeId: pw.suggestedThemeId || null,
      });
    }
    if (candidates.length === 0) return [];

    // Resolve every requested theme to a real one in a single round-trip;
    // unknown/empty/"other" all collapse to the catch-all theme.
    const requestedIds = [...new Set(candidates.map(c => c.themeId).filter(Boolean))];
    const knownIds = new Set();
    if (requestedIds.length > 0) {
      const { rows } = await pool.query('SELECT id FROM theme WHERE id = ANY($1)', [requestedIds]);
      rows.forEach(r => knownIds.add(r.id));
    }
    const resolveTheme = id => (id && id !== OTHER_THEME_ID && knownIds.has(id) ? id : OTHER_THEME_ID);

    // Collapse duplicates within this attempt by (theme, answer).
    const byKey = new Map();
    for (const c of candidates) {
      const resolvedThemeId = resolveTheme(c.themeId);
      byKey.set(`${resolvedThemeId} ${c.answer}`, { ...c, resolvedThemeId });
    }
    const unique = [...byKey.values()];

    // Skip drills the user already has (same theme + answer), so re-grading the
    // same email doesn't pile up duplicates.
    const { rows: existing } = await pool.query(
      `SELECT theme_id, answer FROM user_write_exercise
        WHERE user_id = $1 AND source = 'email' AND answer = ANY($2::text[])`,
      [userId, unique.map(u => u.answer)]
    );
    const existingKeys = new Set(existing.map(r => `${r.theme_id} ${r.answer}`));

    // Insert each drill individually so one failure doesn't block the rest.
    const added = [];
    for (const u of unique) {
      const key = `${u.resolvedThemeId} ${u.answer}`;
      if (existingKeys.has(key)) {
        added.push(u.rawTarget); // Already present — still report as added.
        continue;
      }
      try {
        await pool.query(
          `INSERT INTO user_write_exercise (user_id, theme_id, prompt, answer, hint, attempt_id)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [userId, u.resolvedThemeId, u.prompt, u.answer, u.hint, attemptId || null]
        );
        added.push(u.rawTarget);
      } catch (insertErr) {
        console.error(`Failed to auto-add drill "${u.answer}" to theme ${u.resolvedThemeId}:`, insertErr.message);
        // Continue with remaining drills.
      }
    }

    return added;
  } catch (err) {
    console.error('Auto-add of correction drills failed:', err.message);
    return [];
  }
}

// ============================================================================
// POST /api/email/save-attempt — save evaluation attempt
// ============================================================================

router.post('/save-attempt', requireAuth, async (req, res) => {
  try {
    const { themeId, exerciseIdx, userText, score, aiEvaluation } = req.body;
    const userId = req.user.sub;

    if (!userText || themeId === undefined || exerciseIdx === undefined) {
      return res.status(400).json({ error: 'userText, themeId, and exerciseIdx are required' });
    }

    const result = await pool.query(
      `INSERT INTO email_attempt (user_id, theme_id, exercise_idx, user_text, score, ai_evaluation)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at`,
      [userId, themeId, exerciseIdx, userText, score ?? null, aiEvaluation ? JSON.stringify(aiEvaluation) : null]
    );

    const attempt = result.rows[0];

    // Auto-file each correction into its matched theme's write_answer drills.
    const autoAdded = aiEvaluation
      ? await autoAddCorrectionExercises(userId, attempt.id, aiEvaluation)
      : [];

    res.status(201).json({ ...attempt, autoAdded });
  } catch (err) {
    console.error('Error saving email attempt:', err);
    res.status(500).json({ error: 'Failed to save attempt', details: err.message });
  }
});

// ============================================================================
// POST /api/email/add-exercise — turn a correction into a write_answer drill
// ============================================================================

router.post('/add-exercise', requireAuth, async (req, res) => {
  try {
    const { attemptId, targetWord, translation, hint, themeId } = req.body;
    const userId = req.user.sub;

    if (!targetWord || !translation) {
      return res.status(400).json({ error: 'targetWord and translation are required' });
    }

    // The user types the corrected target-language phrase; prompt them with
    // its native-language meaning.
    const answer = targetWord.trim();
    const prompt = translation.trim();
    const explanation = hint ? String(hint).trim() : null;

    // Resolve the requested theme; an empty/"other"/unknown value falls back
    // to the catch-all "Moje ćwiczenia" theme.
    let resolvedThemeId = OTHER_THEME_ID;
    if (themeId && themeId !== OTHER_THEME_ID) {
      const { rows } = await pool.query('SELECT id FROM theme WHERE id = $1', [themeId]);
      if (rows.length > 0) resolvedThemeId = rows[0].id;
    }

    const { rows: [created] } = await pool.query(
      `INSERT INTO user_write_exercise (user_id, theme_id, prompt, answer, hint, attempt_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, theme_id, prompt, answer, hint, created_at`,
      [userId, resolvedThemeId, prompt, answer, explanation, attemptId || null]
    );

    res.status(201).json(created);
  } catch (err) {
    console.error('Error adding exercise:', err);
    res.status(500).json({ error: 'Failed to add exercise', details: err.message });
  }
});

// ============================================================================
// GET /api/email/history — get user's email writing history
// ============================================================================

router.get('/history', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { limit = 10, includeText, themeId, exerciseIdx } = req.query;

    const filters = ['user_id = $1'];
    const vals = [userId];
    if (themeId) {
      vals.push(themeId);
      filters.push(`theme_id = $${vals.length}`);
    }
    if (exerciseIdx !== undefined) {
      vals.push(parseInt(exerciseIdx));
      filters.push(`exercise_idx = $${vals.length}`);
    }
    vals.push(parseInt(limit));

    const result = await pool.query(
      `SELECT id, theme_id, exercise_idx, score, created_at,
              ${includeText === 'true' ? `LEFT(user_text, 150) AS user_text_preview,` : ''}
              ${includeText === 'true' ? `ai_evaluation->>'overallFeedback' AS overall_feedback,` : ''}
              ${includeText === 'true' ? `jsonb_array_length(ai_evaluation->'errors') AS error_count` : '0 AS error_count'}
       FROM email_attempt
       WHERE ${filters.join(' AND ')}
       ORDER BY created_at DESC
       LIMIT $${vals.length}`,
      vals
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching email history:', err);
    res.status(500).json({ error: 'Failed to fetch history', details: err.message });
  }
});

// ============================================================================
// DELETE /api/email/history — clear all attempts for one exercise
// (themeId + exerciseIdx required; no global wipe is exposed)
// ============================================================================

router.delete('/history', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { themeId, exerciseIdx } = req.query;

    if (!themeId || exerciseIdx === undefined) {
      return res.status(400).json({ error: 'themeId and exerciseIdx are required' });
    }

    const result = await pool.query(
      `DELETE FROM email_attempt
       WHERE user_id = $1 AND theme_id = $2 AND exercise_idx = $3`,
      [userId, themeId, parseInt(exerciseIdx)]
    );

    res.json({ deleted: result.rowCount });
  } catch (err) {
    console.error('Error clearing email history:', err);
    res.status(500).json({ error: 'Failed to clear history', details: err.message });
  }
});

// ============================================================================
// DELETE /api/email/history/:id — delete a single attempt
// ============================================================================

router.delete('/history/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM email_attempt WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    res.json({ deleted: result.rowCount });
  } catch (err) {
    console.error('Error deleting email attempt:', err);
    res.status(500).json({ error: 'Failed to delete attempt', details: err.message });
  }
});

// ============================================================================
// GET /api/email/history/:id — get a single attempt with full details
// ============================================================================

router.get('/history/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, theme_id, exercise_idx, user_text, score, ai_evaluation, created_at
       FROM email_attempt
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching history detail:', err);
    res.status(500).json({ error: 'Failed to fetch history detail', details: err.message });
  }
});

// ============================================================================
// GET /api/email/added-words — get words user has added from emails
// ============================================================================

router.get('/added-words', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;

    const result = await pool.query(
      `SELECT id, target_word, translation, added_to_srs, vocab_id, created_at
       FROM email_added_vocab
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching added words:', err);
    res.status(500).json({ error: 'Failed to fetch added words', details: err.message });
  }
});

export default router;
