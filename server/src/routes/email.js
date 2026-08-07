/* global process */
import { Router } from 'express';
import { pool } from '../db/pool.js';
import { authenticate as requireAuth, optionallyAuthenticate } from '../middleware/auth.js';
import { grade as deterministicGrade, METRIC_VERSION } from '../services/emailScoring.js';

const router = Router();

// OpenAI-compatible AI API configuration
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://integrate.api.nvidia.com/v1';
const MODEL_NAME = process.env.AI_MODEL || 'nvidia/nemotron-3-nano-30b-a3b';

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
  const apiKey = process.env.AI_API_KEY || process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new Error('AI_API_KEY or NVIDIA_API_KEY environment variable is not set');
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
// Build evaluation prompt
// ============================================================================

const LANG_LABELS = { ru: 'Russian', en: 'English', pl: 'Polish', fr: 'French' };
const EMAIL_TARGET_LEVELS = ['B1', 'B2'];

function normalizeTargetLevel(targetLevel) {
  return EMAIL_TARGET_LEVELS.includes(targetLevel) ? targetLevel : 'B1';
}

function clampTelcScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(5, Math.round(n)));
}

function telcBand(total) {
  if (total >= 15) return 'B2';
  if (total >= 7) return 'B1';
  return 'below_B1';
}

function normalizePointRating(value, covered) {
  if (['++', '+', '0'].includes(value)) return value;
  if (['Ø', 'O', 'o'].includes(value)) return '0';
  return covered ? '+' : '0';
}

function normalizeTelcRubric(evaluation, pointsCount) {
  const raw = evaluation.telcRubric || {};
  const criteria = raw.criteria || {};
  const fallbackCoverage = evaluation.taskCoverage || {};

  const normalizedCriteria = {
    content: {
      score: clampTelcScore(criteria.content?.score ?? raw.contentScore ?? 0),
      comment: criteria.content?.comment || '',
    },
    composition: {
      score: clampTelcScore(criteria.composition?.score ?? raw.compositionScore ?? 0),
      comment: criteria.composition?.comment || '',
    },
    accuracy: {
      score: clampTelcScore(criteria.accuracy?.score ?? raw.accuracyScore ?? 0),
      comment: criteria.accuracy?.comment || '',
    },
    vocabulary: {
      score: clampTelcScore(criteria.vocabulary?.score ?? raw.vocabularyScore ?? 0),
      comment: criteria.vocabulary?.comment || '',
    },
  };

  const pointRatings = {};
  for (let i = 1; i <= pointsCount; i++) {
    const key = `point${i}`;
    const rawPoint = raw.pointRatings?.[key] || {};
    const fallbackPoint = fallbackCoverage[key] || {};
    pointRatings[key] = {
      rating: normalizePointRating(rawPoint.rating, fallbackPoint.covered === true),
      snippet: rawPoint.snippet || fallbackPoint.snippet || '',
      comment: rawPoint.comment || fallbackPoint.feedback || '',
    };
  }

  const total = Object.values(normalizedCriteria).reduce((sum, item) => sum + item.score, 0);

  return {
    criteria: normalizedCriteria,
    pointRatings,
    total,
    maxTotal: 20,
    percentage: Math.round((total / 20) * 100),
    // Always derive the CEFR band from the criterion total so the points and
    // the band label can never disagree. The model's own cefrBand is ignored
    // because it sometimes contradicts the points it assigned (e.g. 10/20 → below_B1).
    cefrBand: telcBand(total),
    offTopic: raw.offTopic === true,
    taskMisunderstood: raw.taskMisunderstood === true,
    examinerSummary: raw.examinerSummary || '',
  };
}

function buildEvaluationPrompt(userText, taskDescription, points, register, etiquetteHint, nativeLang, targetLevel) {
  // For B1/B2 exercises, all feedback is in Polish
  const langLabel = 'Polish';
  // Word translations go in the learner's native language so added cards are useful
  const nativeLabel = LANG_LABELS[nativeLang] || 'Russian';

  const pointsList = points && points.length > 0
    ? points.map((p, i) => `  ${i + 1}. ${p}`).join('\n')
    : 'No specific points required.';

  const registerInfo = register
    ? `The expected register is: ${register} (${register === 'nieformalny' ? 'informal — casual, friendly tone' : register === 'półformalny' ? 'semi-formal — polite but not stiff' : 'formal — official, professional tone'}). Evaluate whether the register used matches this requirement.`
    : '';

  // Construction replacement instructions — direction depends on target level
  const userLevel = normalizeTargetLevel(targetLevel);
  const replacementInstructions = userLevel === 'B2'
    ? `The learner is targeting B2 level. Identify 2–4 constructions in their text that are too simple (A2/B1 level) and suggest more sophisticated B2-level alternatives. For each, explain why the B2 version sounds more natural or precise.`
    : `The learner is targeting B1 level. Identify 2–4 constructions in their text that are overly complex (B2/C1 level attempts that didn't quite work) and suggest simpler, more natural B1-level alternatives. For each, explain why the simpler version is clearer and more appropriate.`;

  const errorAlternativeInstructions = userLevel === 'B2'
    ? `For every error, propose 1–3 B2-level alternatives that are correct, natural, and richer or more precise than the learner's erroneous version. Alternatives may be single words, short phrases, or constructions.`
    : `For every error, propose 1–3 B1-level alternatives that are correct, natural, clear, and exam-safe. Prefer simple phrasing over complex constructions. Alternatives may be single words, short phrases, or constructions.`;

  // Real catalogue of themes the learner is studying, so the AI files each
  // correction under an EXISTING theme instead of inventing IDs.
  return `Evaluate the following email written by a learner of Polish.
The learner's native language is ${nativeLabel}.
All human-readable feedback and comments must be in ${langLabel}.
The learner's current CEFR target level is ${userLevel}.

WRITING TASK:
"${taskDescription}"

MANDATORY POINTS (the learner must address ALL of them):
${pointsList}

REGISTER: ${register || 'unspecified'}
${registerInfo}

${etiquetteHint || ''}

Here is the email they wrote:
---
${userText}
---

Return a JSON object with this exact structure:
{
  "telcRubric": {
    "criteria": {
      "content": { "score": <integer 0-5>, "comment": "<TELC-style examiner comment in ${langLabel}>" },
      "composition": { "score": <integer 0-5>, "comment": "<comment on structure, coherence, greeting/closing, register in ${langLabel}>" },
      "accuracy": { "score": <integer 0-5>, "comment": "<comment on grammar, spelling, punctuation in ${langLabel}>" },
      "vocabulary": { "score": <integer 0-5>, "comment": "<comment on range and precision of vocabulary in ${langLabel}>" }
    },
    "pointRatings": {
      "point1": { "rating": "++|+|0", "snippet": "<quote from text or empty>", "comment": "<brief content comment in ${langLabel}>" },
      "point2": { "rating": "++|+|0", "snippet": "<quote from text or empty>", "comment": "<brief content comment in ${langLabel}>" },
      "point3": { "rating": "++|+|0", "snippet": "<quote from text or empty>", "comment": "<brief content comment in ${langLabel}>" }
    },
    "offTopic": <true|false>,
    "taskMisunderstood": <true|false>,
    "examinerSummary": "<strict TELC-style summary in ${langLabel}, 1-2 sentences>"
  },
  "taskCoverage": {
    "point1": { "covered": <true|false>, "snippet": "<quote from text showing coverage or empty if not covered>", "feedback": "<brief comment in ${langLabel}>" },
    "point2": { "covered": <true|false>, "snippet": "...", "feedback": "..." },
    "point3": { "covered": <true|false>, "snippet": "...", "feedback": "..." }
  },
  "etiquetteCheck": {
    "greeting": <true|false>,
    "closing": <true|false>,
    "greetingText": "<the greeting used or empty>",
    "closingText": "<the closing used or empty>",
    "feedback": "<comment in ${langLabel}>"
  },
  "registerMatch": <true|false>,
  "overallFeedback": "<brief encouraging summary in ${langLabel}, 2-3 sentences>",
  "errors": [
    {
      "originalText": "<the erroneous fragment from the email>",
      "correction": "<corrected version>",
      "explanation": "<clear explanation in ${langLabel} of what is wrong and why>",
      "category": "spelling|grammar|style|vocabulary",
      "startOffset": <character index where the error starts in the original email text>,
      "endOffset": <character index where the error ends>,
      "proposedWords": [
        {
          "target": "<the corrected Polish word or short phrase to learn>",
        "translation": "<translation in ${nativeLabel}>"
        }
      ],
      "alternatives": [
        {
          "text": "<alternative corrected wording at ${userLevel} level>",
          "type": "word|phrase|construction",
          "level": "${userLevel}",
          "explanation": "<brief explanation in ${langLabel} why this alternative fits ${userLevel}>"
        }
      ]
    }
  ],
  "constructionReplacements": [
    {
      "originalText": "<the user's original phrase from the email>",
      "suggestedText": "<the suggested alternative at ${userLevel} level>",
      "originalLevel": "<estimated CEFR level of the original: A2, B1, B2, or C1>",
      "suggestedLevel": "${userLevel}",
      "explanation": "<brief explanation in ${langLabel} of the level difference and why the suggested version fits better>"
    }
  ]
}

IMPORTANT RULES:
- Score the writing like telc Język polski B1·B2 Szkoła. Use the 4 official writing criteria: I Treść/content, II Kompozycja/composition, III Poprawność/accuracy, IV Słownictwo/vocabulary.
- Each TELC criterion must be an integer from 0 to 5.
- For telcRubric.pointRatings use TELC content marks: "++" means clear, developed, and task-appropriate; "+" means understandable and task-appropriate but not developed; "0" means missing, unclear, or not task-appropriate.
- Content score should follow the point ratings strictly: three developed points deserve 5; three merely adequate points are around 3; missing/unclear points must lower the content score substantially.
- If the text is completely off topic, set offTopic true and give 0 for all four TELC criteria.
- If the task is misunderstood but the text is still a Polish email, set taskMisunderstood true, give content 0, but still score composition, accuracy, and vocabulary.
- Composition includes logical order, cohesion, paragraphing, appropriate greeting/closing, and matching the required register (${register || 'unspecified'}).
- Accuracy is not an error count. Judge whether grammar, spelling, word order, cases, conjugation, and punctuation interfere with communication at B1/B2 level.
- Vocabulary is not just rare words. Judge range, precision, idiomatic suitability, repetition, and lexical mistakes for the task.
- startOffset and endOffset must be exact character positions in the email text (0-indexed)
- For "taskCoverage": evaluate whether each mandatory point was addressed. Set "covered" to true if the user mentions the topic, false if completely missing. Include a short quote from their text as "snippet".
- For "etiquetteCheck": check if the email has an appropriate greeting at the beginning and sign-off at the end, suitable for the given register.
- For "registerMatch": set to true if the overall tone matches the expected register, false if it's too formal or too casual.
- For "proposedWords": ALWAYS include at least one item per error — the corrected word or short phrase as "target", with its "translation" in ${nativeLabel}. Add up to 2 more if the error reveals a related vocabulary gap. Never leave proposedWords empty.
- For "errors": analyze spelling, grammar, style, and vocabulary. Do NOT flag things the learner got right. Only flag actual mistakes.
- You MUST iterate over every item in "errors" and fill "alternatives" for each one. ${errorAlternativeInstructions}
- For "alternatives": use type "word" for one-word lexical replacements, "phrase" for short multi-word replacements, and "construction" for grammar/sentence-pattern rewrites. Never return more than 3 alternatives per error.
- For "constructionReplacements": ${replacementInstructions} Focus on constructions that are grammatically correct but stylistically mismatched to the learner's level. Do NOT include constructions that already have errors (those are covered in "errors").
- If there are no constructions worth replacing, return an empty constructionReplacements array.
- Be constructive and encouraging in overallFeedback.
- Return ONLY the JSON object, no other text, no markdown code fences.`;
}

// Streaming prompts use strict line-oriented text for providers that do not
// reliably honor JSON mode. If the model drifts from the requested format, the
// parsers default missing fields instead of failing the whole evaluation.
const PLAIN_AI_OPTIONS = {
  json: false,
  maxTokens: 2500,
  systemPrompt: 'You are a Polish language tutor. Return plain text only. Follow the requested line format exactly. Do not use JSON, markdown, bullets, or extra commentary.'
};

const ERROR_CATEGORIES = ['spelling', 'grammar', 'style', 'vocabulary'];

function taskContext({ userText, taskDescription, points, register, etiquetteHint, nativeLang, targetLevel }) {
  const nativeLabel = LANG_LABELS[nativeLang] || 'Russian';
  const level = normalizeTargetLevel(targetLevel);
  const pointsList = points?.length ? points.map((p, i) => `${i + 1}. ${p}`).join('\n') : 'No specific points required.';
  return `Learner native language: ${nativeLabel}
Feedback language: Polish
Target level: ${level}
Task: ${taskDescription}
Mandatory points:
${pointsList}
Register: ${register || 'unspecified'}
Etiquette hint: ${etiquetteHint || 'none'}
Email:
<<<EMAIL
${userText}
EMAIL`;
}

function parseBool(value) {
  return /^(yes|true|tak|1)$/i.test(String(value || '').trim());
}

function parseScore(value) {
  return clampTelcScore(String(value || '').match(/\d+/)?.[0]);
}

function parseKeyLines(text) {
  const data = {};
  for (const line of String(text || '').split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim().toUpperCase();
    const value = line.slice(idx + 1).trim();
    if (key) data[key] = value;
  }
  return data;
}

function parseBlocks(text, startMarker, endMarker = 'END') {
  const blocks = [];
  let current = null;
  for (const rawLine of String(text || '').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.toUpperCase() === startMarker) {
      current = {};
      continue;
    }
    if (line.toUpperCase() === endMarker) {
      if (current) blocks.push(current);
      current = null;
      continue;
    }
    if (!current) continue;
    const idx = rawLine.indexOf(':');
    if (idx <= 0) continue;
    const key = rawLine.slice(0, idx).trim().toUpperCase();
    current[key] = rawLine.slice(idx + 1).trim();
  }
  return blocks;
}

function parsePipeLine(value, fields) {
  const parts = String(value || '').split('|').map(part => part.trim());
  return fields.reduce((item, field, idx) => {
    item[field] = parts[idx] || '';
    return item;
  }, {});
}

function findTextOccurrences(text, needle) {
  if (!text || !needle) return [];
  const occurrences = [];
  let fromIndex = 0;
  while (fromIndex <= text.length) {
    const index = text.indexOf(needle, fromIndex);
    if (index === -1) break;
    occurrences.push({ startOffset: index, endOffset: index + needle.length });
    fromIndex = index + Math.max(needle.length, 1);
  }
  return occurrences;
}

function rangesOverlap(a, b) {
  return a.startOffset < b.endOffset && b.startOffset < a.endOffset;
}

function resolveErrorSpan(userText, originalText, accepted = []) {
  const candidates = [originalText, String(originalText || '').trim()]
    .filter((item, idx, arr) => item && arr.indexOf(item) === idx);
  for (const candidate of candidates) {
    for (const occurrence of findTextOccurrences(userText, candidate)) {
      if (accepted.some(existing => rangesOverlap(existing, occurrence))) continue;
      return { ...occurrence, originalText: userText.slice(occurrence.startOffset, occurrence.endOffset), resolved: true };
    }
  }
  return { startOffset: -1, endOffset: -1, originalText: String(originalText || '').trim(), resolved: false };
}

function parseRubricResponse(text, pointsCount) {
  const data = parseKeyLines(text);
  const pointRatings = {};
  for (let i = 1; i <= pointsCount; i++) {
    const rating = data[`POINT_${i}_RATING`];
    pointRatings[`point${i}`] = {
      rating: normalizePointRating(rating, parseBool(data[`POINT_${i}_COVERED`])),
      covered: parseBool(data[`POINT_${i}_COVERED`]),
      snippet: data[`POINT_${i}_SNIPPET`] || '',
      comment: data[`POINT_${i}_COMMENT`] || ''
    };
  }
  return {
    telcRubric: {
      criteria: {
        content: { score: parseScore(data.CONTENT_SCORE), comment: data.CONTENT_COMMENT || '' },
        composition: { score: parseScore(data.COMPOSITION_SCORE), comment: data.COMPOSITION_COMMENT || '' },
        accuracy: { score: parseScore(data.ACCURACY_SCORE), comment: data.ACCURACY_COMMENT || '' },
        vocabulary: { score: parseScore(data.VOCABULARY_SCORE), comment: data.VOCABULARY_COMMENT || '' },
      },
      pointRatings,
      examinerSummary: data.EXAMINER_SUMMARY || ''
    },
    taskCoverage: Object.fromEntries(Object.entries(pointRatings).map(([key, value]) => [
      key,
      { covered: value.covered, snippet: value.snippet, feedback: value.comment }
    ])),
    etiquetteCheck: {
      greeting: parseBool(data.ETIQUETTE_GREETING),
      closing: parseBool(data.ETIQUETTE_CLOSING),
      greetingText: data.GREETING_TEXT || '',
      closingText: data.CLOSING_TEXT || '',
      feedback: data.ETIQUETTE_FEEDBACK || ''
    },
    registerMatch: parseBool(data.REGISTER_MATCH),
    overallFeedback: data.OVERALL_FEEDBACK || data.EXAMINER_SUMMARY || '',
    offTopic: parseBool(data.OFF_TOPIC),
    taskMisunderstood: parseBool(data.TASK_MISUNDERSTOOD)
  };
}

function parseErrorDiscovery(text, category, userText, acceptedRanges) {
  return parseBlocks(text, 'ERROR').map(block => {
    const span = resolveErrorSpan(userText, block.TEXT || block.ORIGINAL || '', acceptedRanges);
    if (span.resolved) acceptedRanges.push(span);
    return {
      category,
      originalText: span.originalText,
      startOffset: span.startOffset,
      endOffset: span.endOffset,
      discoveryNote: block.WHY || '',
      resolved: span.resolved
    };
  });
}

function parseEnrichment(text, err, nativeLang, targetLevel) {
  const lines = String(text || '').split(/\r?\n/);
  const data = parseKeyLines(text);
  const proposedWords = [];
  const alternatives = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.toUpperCase().startsWith('PROPOSED:')) {
      proposedWords.push(parsePipeLine(trimmed.slice(trimmed.indexOf(':') + 1), ['target', 'translation']));
    }
    if (trimmed.toUpperCase().startsWith('ALTERNATIVE:')) {
      alternatives.push(parsePipeLine(trimmed.slice(trimmed.indexOf(':') + 1), ['text', 'type', 'level', 'explanation']));
    }
  }
  const correction = data.CORRECTION || err.originalText;
  return {
    ...err,
    correction,
    explanation: data.EXPLANATION || err.discoveryNote || '',
    proposedWords: proposedWords
      .filter(item => item.target && item.translation)
      .slice(0, 3),
    alternatives: alternatives
      .filter(item => item.text)
      .slice(0, 3)
      .map(item => ({
        text: item.text,
        type: ['word', 'phrase', 'construction'].includes(item.type) ? item.type : 'phrase',
        level: EMAIL_TARGET_LEVELS.includes(item.level) ? item.level : normalizeTargetLevel(targetLevel),
        explanation: item.explanation || ''
      })),
    nativeLang
  };
}

function parseConstructionResponse(text, targetLevel) {
  return parseBlocks(text, 'CONSTRUCTION').map(block => ({
    originalText: block.ORIGINAL || '',
    suggestedText: block.SUGGESTED || '',
    originalLevel: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(block.ORIGINAL_LEVEL) ? block.ORIGINAL_LEVEL : 'B1',
    suggestedLevel: normalizeTargetLevel(targetLevel),
    explanation: block.EXPLANATION || ''
  })).filter(item => item.originalText && item.suggestedText).slice(0, 4);
}

function buildRubricPrompt(context, pointsCount) {
  const pointLines = Array.from({ length: pointsCount }, (_, idx) => `POINT_${idx + 1}_COVERED: yes|no
POINT_${idx + 1}_RATING: ++|+|0
POINT_${idx + 1}_SNIPPET: exact short quote or empty
POINT_${idx + 1}_COMMENT: Polish comment`).join('\n');
  return `${context}

Score TELC Polish B1/B2 writing. Return these lines exactly:
CONTENT_SCORE: 0-5
CONTENT_COMMENT: Polish comment
COMPOSITION_SCORE: 0-5
COMPOSITION_COMMENT: Polish comment
ACCURACY_SCORE: 0-5
ACCURACY_COMMENT: Polish comment
VOCABULARY_SCORE: 0-5
VOCABULARY_COMMENT: Polish comment
${pointLines}
ETIQUETTE_GREETING: yes|no
GREETING_TEXT: exact greeting or empty
ETIQUETTE_CLOSING: yes|no
CLOSING_TEXT: exact closing or empty
ETIQUETTE_FEEDBACK: Polish comment
REGISTER_MATCH: yes|no
OFF_TOPIC: yes|no
TASK_MISUNDERSTOOD: yes|no
EXAMINER_SUMMARY: 1-2 Polish sentences
OVERALL_FEEDBACK: 2-3 constructive Polish sentences`;
}

function buildErrorDiscoveryPrompt(context, category) {
  return `${context}

Find only ${category} mistakes. Return no corrections and no offsets.
For each mistake, use:
ERROR
TEXT: exact mistaken fragment copied from the email
WHY: short Polish reason
END
If there are no ${category} mistakes, return exactly:
NO_ERRORS`;
}

function buildEnrichmentPrompt(context, err, nativeLang, targetLevel) {
  const nativeLabel = LANG_LABELS[nativeLang] || 'Russian';
  const level = normalizeTargetLevel(targetLevel);
  return `${context}

Enrich this ${err.category} mistake:
TEXT: ${err.originalText}
REASON: ${err.discoveryNote || ''}

Return these lines:
CORRECTION: corrected Polish fragment
EXPLANATION: short Polish explanation
PROPOSED: corrected Polish word or short phrase | ${nativeLabel} translation
Optional up to two more PROPOSED lines.
ALTERNATIVE: ${level}-level alternative wording | word|phrase|construction | ${level} | short Polish explanation
Return 1-3 ALTERNATIVE lines.`;
}

function buildConstructionPrompt(context, targetLevel, errors) {
  const level = normalizeTargetLevel(targetLevel);
  const errorTexts = errors.map(err => `- ${err.originalText}`).join('\n') || '(none)';
  const direction = level === 'B2'
    ? 'Find correct but too-simple A2/B1 constructions and suggest richer B2 alternatives.'
    : 'Find correct but over-complex B2/C1 attempts and suggest simpler natural B1 alternatives.';
  return `${context}

Already handled erroneous fragments:
${errorTexts}

${direction}
Do not include fragments that contain actual mistakes.
Use:
CONSTRUCTION
ORIGINAL: exact original phrase
SUGGESTED: suggested replacement
ORIGINAL_LEVEL: A1|A2|B1|B2|C1|C2
EXPLANATION: short Polish explanation
END
If none, return exactly:
NO_CONSTRUCTIONS`;
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

function buildFinalEvaluation({ rubricData, errors, constructionReplacements, pointsCount, targetLevel }) {
  const evaluationForRubric = {
    telcRubric: {
      ...(rubricData.telcRubric || {}),
      offTopic: rubricData.offTopic,
      taskMisunderstood: rubricData.taskMisunderstood
    },
    taskCoverage: rubricData.taskCoverage,
  };
  const telcRubric = normalizeTelcRubric(evaluationForRubric, pointsCount);
  const finalErrors = errors
    .filter(err => err.resolved && err.startOffset >= 0 && err.endOffset > err.startOffset)
    .sort((a, b) => a.startOffset - b.startOffset)
    .map((err, idx) => ({
      id: `err_${idx}`,
      originalText: err.originalText,
      correction: err.correction || err.originalText,
      explanation: err.explanation || '',
      category: ERROR_CATEGORIES.includes(err.category) ? err.category : 'grammar',
      startOffset: err.startOffset,
      endOffset: err.endOffset,
      proposedWords: Array.isArray(err.proposedWords) ? err.proposedWords : [],
      alternatives: Array.isArray(err.alternatives) ? err.alternatives : []
    }));
  return {
    score: telcRubric.percentage,
    telcRubric,
    taskCoverage: rubricData.taskCoverage || {},
    etiquetteCheck: rubricData.etiquetteCheck || {},
    registerMatch: rubricData.registerMatch === true,
    overallFeedback: rubricData.overallFeedback || 'Evaluation completed.',
    targetLevel: normalizeTargetLevel(targetLevel),
    errors: finalErrors,
    constructionReplacements: constructionReplacements || []
  };
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
  const userNativeLang = nativeLang || 'ru';
  const normalizedTargetLevel = normalizeTargetLevel(targetLevel);
  const taskPoints = Array.isArray(points) ? points : [];
  const context = taskContext({
    userText: trimmedText,
    taskDescription,
    points: taskPoints,
    register: register || '',
    etiquetteHint: etiquetteHint || '',
    nativeLang: userNativeLang,
    targetLevel: normalizedTargetLevel
  });

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
  const aiOptions = { ...PLAIN_AI_OPTIONS, signal: requestController.signal };

  try {
    // Rubric step is now deterministic — no LLM. Same input → same rubric.
    writeStreamEvent(res, 'step_started', { step: 'rubric' });
    steps = await updateEvaluationStep({ attemptId: attempt.id, userId, steps, key: 'rubric', patch: { status: 'running', startedAt: new Date().toISOString() } });
    const gradeResult = deterministicGrade(trimmedText, {
      points: taskPoints,
      register: register || 'nieformalny',
      targetLevel: normalizedTargetLevel,
    });
    const rubricData = deterministicRubricEventData(gradeResult);
    steps = await updateEvaluationStep({
      attemptId: attempt.id,
      userId,
      steps,
      key: 'rubric',
      patch: {
        status: 'complete',
        completedAt: new Date().toISOString(),
        data: rubricData,
        metricVersion: gradeResult.metricVersion,
      },
    });
    writeStreamEvent(res, 'step_completed', { step: 'rubric', data: rubricData });
    const acceptedRanges = [];
    const discoveredErrors = [];
    for (const category of ERROR_CATEGORIES) {
      const step = `errors_${category}`;
      writeStreamEvent(res, 'step_started', { step });
      steps = await updateEvaluationStep({ attemptId: attempt.id, userId, steps, key: step, patch: { status: 'running', startedAt: new Date().toISOString() } });
    }

    const discoveryResults = await Promise.all(
      ERROR_CATEGORIES.map(async (category) => ({
        category,
        step: `errors_${category}`,
        raw: await callAI(buildErrorDiscoveryPrompt(context, category), aiOptions)
      }))
    );

    for (const { category, step, raw } of discoveryResults) {
      const parsed = parseErrorDiscovery(raw, category, trimmedText, acceptedRanges);
      discoveredErrors.push(...parsed);
      steps = await updateEvaluationStep({
        attemptId: attempt.id,
        userId,
        steps,
        key: step,
        patch: { status: 'complete', completedAt: new Date().toISOString(), raw, data: parsed }
      });
      writeStreamEvent(res, 'step_completed', { step, data: parsed });
    }

    const enrichmentJobs = [];
    for (let i = 0; i < discoveredErrors.length; i++) {
      const err = discoveredErrors[i];
      const step = `enrichment_${i + 1}`;
      if (!err.resolved) {
        steps = await updateEvaluationStep({ attemptId: attempt.id, userId, steps, key: step, patch: { status: 'skipped', data: err } });
        continue;
      }
      writeStreamEvent(res, 'step_started', { step, errorIndex: i });
      steps = await updateEvaluationStep({ attemptId: attempt.id, userId, steps, key: step, patch: { status: 'running', startedAt: new Date().toISOString(), error: err } });
      enrichmentJobs.push({
        index: i,
        step,
        err,
        run: callAI(buildEnrichmentPrompt(context, err, userNativeLang, normalizedTargetLevel), aiOptions)
      });
    }

    const enrichedErrors = [];
    const enrichmentResults = await Promise.allSettled(enrichmentJobs.map(job => job.run));
    for (let i = 0; i < enrichmentJobs.length; i++) {
      const { step, err } = enrichmentJobs[i];
      const result = enrichmentResults[i];
      if (result.status === 'fulfilled') {
        const raw = result.value;
        const enriched = parseEnrichment(raw, err, userNativeLang, normalizedTargetLevel);
        enrichedErrors.push(enriched);
        steps = await updateEvaluationStep({
          attemptId: attempt.id,
          userId,
          steps,
          key: step,
          patch: { status: 'complete', completedAt: new Date().toISOString(), raw, data: enriched }
        });
        writeStreamEvent(res, 'step_completed', { step, data: enriched });
      } else {
        const errStep = result.reason;
        steps = await updateEvaluationStep({
          attemptId: attempt.id,
          userId,
          steps,
          key: step,
          patch: { status: 'failed', completedAt: new Date().toISOString(), error: errStep.message, data: err }
        });
        writeStreamEvent(res, 'step_failed', { step, error: errStep.message });
      }
    }

    writeStreamEvent(res, 'step_started', { step: 'constructionReplacements' });
    steps = await updateEvaluationStep({ attemptId: attempt.id, userId, steps, key: 'constructionReplacements', patch: { status: 'running', startedAt: new Date().toISOString() } });
    const constructionRaw = await callAI(buildConstructionPrompt(context, normalizedTargetLevel, enrichedErrors), aiOptions);
    const constructionReplacements = parseConstructionResponse(constructionRaw, normalizedTargetLevel);
    steps = await updateEvaluationStep({
      attemptId: attempt.id,
      userId,
      steps,
      key: 'constructionReplacements',
      patch: { status: 'complete', completedAt: new Date().toISOString(), raw: constructionRaw, data: constructionReplacements }
    });
    writeStreamEvent(res, 'step_completed', { step: 'constructionReplacements', data: constructionReplacements });

    const finalEvaluation = buildDeterministicFinalEvaluation({
      gradeResult,
      errors: enrichedErrors,
      constructionReplacements,
    });
    finalEvaluation.targetLevel = normalizedTargetLevel;
    steps = await updateEvaluationStep({ attemptId: attempt.id, userId, steps, key: 'final', patch: { status: 'complete', completedAt: new Date().toISOString(), data: finalEvaluation }, status: 'complete' });
    await pool.query(
      `UPDATE email_attempt
       SET score = $3,
           ai_evaluation = $4::jsonb,
           deterministic_signals = $5::jsonb,
           metric_version = $6,
           evaluation_error = NULL,
           updated_at = NOW()
       WHERE id = $1 AND user_id = $2`,
      [attempt.id, userId, finalEvaluation.score, JSON.stringify(finalEvaluation), JSON.stringify(finalEvaluation.deterministicSignals || {}), METRIC_VERSION]
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

    const userNativeLang = nativeLang || 'ru';
    const normalizedTargetLevel = normalizeTargetLevel(targetLevel);

    // Build prompt and call AI
    const prompt = buildEvaluationPrompt(
      userText.trim(),
      taskDescription,
      points || [],
      register || '',
      etiquetteHint || '',
      userNativeLang,
      normalizedTargetLevel
    );
    let rawResponse;
    try {
      rawResponse = await callAI(prompt);
    } catch (aiErr) {
      console.error('AI call failed:', aiErr.message);
      return res.status(502).json({ error: 'AI evaluation service unavailable', details: aiErr.message });
    }

    // Parse AI response
    let evaluation;
    try {
      // Try to extract JSON from response (handle possible code fences)
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        evaluation = JSON.parse(jsonMatch[0]);
      } else {
        evaluation = JSON.parse(rawResponse);
      }
    } catch {
      console.error('Failed to parse AI response:', rawResponse.substring(0, 500));
      return res.status(502).json({ error: 'AI returned invalid response format', rawPreview: rawResponse.substring(0, 200) });
    }

    // Validate evaluation structure
    if (typeof evaluation.score !== 'number' || !Array.isArray(evaluation.errors)) {
      evaluation.score = evaluation.score ?? 0;
      evaluation.errors = Array.isArray(evaluation.errors) ? evaluation.errors : [];
      evaluation.overallFeedback = evaluation.overallFeedback || 'Evaluation completed.';
    }

    // Normalize taskCoverage
    const pointsCount = (points || []).length;
    const normalizedTaskCoverage = {};
    for (let i = 1; i <= pointsCount; i++) {
      const key = `point${i}`;
      const raw = evaluation.taskCoverage?.[key] || {};
      normalizedTaskCoverage[key] = {
        covered: raw.covered === true,
        snippet: raw.snippet || '',
        feedback: raw.feedback || '',
      };
    }

    const telcRubric = normalizeTelcRubric(evaluation, pointsCount);
    // Deterministic grade overrides the LLM-emitted scores. The LLM still
    // contributes errors and constructionReplacements below; the rubric
    // itself is reproducible.
    const gradeResult = deterministicGrade(userText.trim(), {
      points: points || [],
      register: register || 'nieformalny',
      targetLevel: normalizedTargetLevel,
      offTopic: typeof evaluation.offTopic === 'boolean' ? evaluation.offTopic : null,
      taskMisunderstood: typeof evaluation.taskMisunderstood === 'boolean' ? evaluation.taskMisunderstood : null,
    });

    // Normalize etiquetteCheck
    const rawEtiquette = evaluation.etiquetteCheck || {};
    const normalizedEtiquette = {
      greeting: rawEtiquette.greeting === true,
      closing: rawEtiquette.closing === true,
      greetingText: rawEtiquette.greetingText || '',
      closingText: rawEtiquette.closingText || '',
      feedback: rawEtiquette.feedback || '',
    };

    // Normalize errors
    evaluation.errors = evaluation.errors.map((err, idx) => ({
      id: `err_${idx}`,
      originalText: err.originalText || '',
      correction: err.correction || '',
      explanation: err.explanation || '',
      category: ['spelling', 'grammar', 'style', 'vocabulary'].includes(err.category) ? err.category : 'grammar',
      startOffset: typeof err.startOffset === 'number' ? err.startOffset : 0,
      endOffset: typeof err.endOffset === 'number' ? err.endOffset : 0,
      proposedWords: Array.isArray(err.proposedWords)
          ? err.proposedWords.slice(0, 3).map(w => ({
            target: w.target || '',
            translation: w.translation || '',
          }))
        : [],
      alternatives: Array.isArray(err.alternatives)
        ? err.alternatives.slice(0, 3).map(alt => ({
            text: alt.text || '',
            type: ['word', 'phrase', 'construction'].includes(alt.type) ? alt.type : 'phrase',
            level: EMAIL_TARGET_LEVELS.includes(alt.level) ? alt.level : normalizedTargetLevel,
            explanation: alt.explanation || '',
          })).filter(alt => alt.text)
        : [],
    }));

    // Deduplicate and sort errors by position
    evaluation.errors.sort((a, b) => a.startOffset - b.startOffset);

    // Normalize constructionReplacements
    const constructionReplacements = Array.isArray(evaluation.constructionReplacements)
      ? evaluation.constructionReplacements.map(cr => ({
          originalText: cr.originalText || '',
          suggestedText: cr.suggestedText || '',
          originalLevel: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(cr.originalLevel) ? cr.originalLevel : 'B1',
          suggestedLevel: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(cr.suggestedLevel) ? cr.suggestedLevel : normalizedTargetLevel,
          explanation: cr.explanation || '',
        }))
      : [];

    const finalEvaluation = buildDeterministicFinalEvaluation({
      gradeResult,
      errors: Array.isArray(evaluation.errors) ? evaluation.errors : [],
      constructionReplacements: constructionReplacements,
    });
    finalEvaluation.targetLevel = normalizedTargetLevel;
    return res.json(finalEvaluation);
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
