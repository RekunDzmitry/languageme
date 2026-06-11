/* global process */
import { Router } from 'express';
import { pool } from '../db/pool.js';
import { authenticate as requireAuth, optionallyAuthenticate } from '../middleware/auth.js';

const router = Router();

// OpenCode Go API configuration
const OPENCODE_BASE_URL = 'https://opencode.ai/zen/go/v1';
const MODEL_NAME = process.env.OPENCODE_MODEL || 'deepseek-v4-flash';

// Catch-all theme for corrections the user doesn't attach to a real theme.
const OTHER_THEME_ID = 'pl_other';

// ============================================================================
// Theme classification helper
// ============================================================================

// Polish themes the AI can classify errors into (excludes the catch-all).
// Returned in display order so the prompt lists them coherently.
async function fetchClassifiableThemes() {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, description
         FROM theme
        WHERE lang = 'pl' AND id <> $1
        ORDER BY "order"`,
      [OTHER_THEME_ID]
    );
    return rows;
  } catch (err) {
    console.error('Failed to load themes for classification:', err.message);
    return [];
  }
}

// ============================================================================
// AI call helper
// ============================================================================

// The OpenCode gateway is flaky: it occasionally returns a 5xx, or a 200 with
// an empty `content` body. Both are transient, so callAI retries a few times
// with a short backoff before surfacing the failure.
const AI_MAX_ATTEMPTS = 3;
const AI_RETRY_DELAY_MS = 1500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function callAIOnce(prompt, apiKey) {
  const response = await fetch(`${OPENCODE_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: 'You are a Polish language tutor. Return ONLY valid JSON, no markdown, no extra text.' },
        { role: 'user', content: prompt }
      ],
      // Keep reasoning low for faster, cheaper structured-JSON evaluation.
      reasoning_effort: 'low',
      max_tokens: 8000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenCode API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '';
  // An empty 200 response is a transient gateway hiccup — treat it as an error
  // so the retry loop kicks in instead of returning '' and failing to parse.
  if (!content.trim()) {
    throw new Error('OpenCode API returned empty content');
  }
  return content;
}

async function callAI(prompt) {
  const apiKey = process.env.OPENCODE_API_KEY;
  if (!apiKey) {
    throw new Error('OPENCODE_API_KEY environment variable is not set');
  }

  let lastErr;
  for (let attempt = 1; attempt <= AI_MAX_ATTEMPTS; attempt++) {
    try {
      return await callAIOnce(prompt, apiKey);
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

function buildEvaluationPrompt(userText, taskDescription, points, register, etiquetteHint, nativeLang, targetLevel, themes = []) {
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
  const themesBlock = themes.length > 0
    ? themes
        .map(th => `- ${th.id}: ${th.title}${th.description ? ` — ${th.description}` : ''}`)
        .join('\n')
    : '(no themes available — use null for every suggestedThemeId)';

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

AVAILABLE THEMES (the grammar/vocabulary topics the learner is studying — file each correction under the single most relevant one):
${themesBlock}

Return a JSON object with this exact structure:
{
  "score": <number 0-100 derived from telcRubric.total / 20>,
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
    "total": <integer 0-20>,
    "maxTotal": 20,
    "percentage": <integer 0-100>,
    "cefrBand": "B2|B1|below_B1",
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
          "translation": "<translation in ${nativeLabel}>",
          "suggestedThemeId": "<exact theme ID from AVAILABLE THEMES that best fits this correction, or null>"
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
- Each TELC criterion must be an integer from 0 to 5. telcRubric.total must be the sum of the four criteria, max 20. score must be Math.round(total / 20 * 100).
- CEFR writing band: 15-20 = B2, 7-14 = B1, 0-6 = below_B1.
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
- For "suggestedThemeId": you MUST use one of the EXACT theme IDs listed under AVAILABLE THEMES (e.g. copy the "pl_themeNN" token verbatim). Pick the single theme whose topic best matches the correction. If no listed theme clearly fits, use null. Never invent a theme ID that is not in the list.
- For "errors": analyze spelling, grammar, style, and vocabulary. Do NOT flag things the learner got right. Only flag actual mistakes.
- You MUST iterate over every item in "errors" and fill "alternatives" for each one. ${errorAlternativeInstructions}
- For "alternatives": use type "word" for one-word lexical replacements, "phrase" for short multi-word replacements, and "construction" for grammar/sentence-pattern rewrites. Never return more than 3 alternatives per error.
- For "constructionReplacements": ${replacementInstructions} Focus on constructions that are grammatically correct but stylistically mismatched to the learner's level. Do NOT include constructions that already have errors (those are covered in "errors").
- If there are no constructions worth replacing, return an empty constructionReplacements array.
- Be constructive and encouraging in overallFeedback.
- Return ONLY the JSON object, no other text, no markdown code fences.`;
}

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

    // Real theme catalogue — fed to the prompt so the AI classifies each
    // correction into an existing theme, and used below to reject hallucinated IDs.
    const classifiableThemes = await fetchClassifiableThemes();
    const validThemeIds = new Set(classifiableThemes.map(th => th.id));

    // Build prompt and call AI
    const prompt = buildEvaluationPrompt(
      userText.trim(),
      taskDescription,
      points || [],
      register || '',
      etiquetteHint || '',
      userNativeLang,
      normalizedTargetLevel,
      classifiableThemes
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
            // Drop hallucinated IDs so the UI/auto-add only ever sees real themes.
            suggestedThemeId: validThemeIds.has(w.suggestedThemeId) ? w.suggestedThemeId : null,
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

    res.json({
      score: telcRubric.percentage,
      telcRubric,
      taskCoverage: normalizedTaskCoverage,
      etiquetteCheck: normalizedEtiquette,
      registerMatch: evaluation.registerMatch === true,
      overallFeedback: evaluation.overallFeedback || '',
      targetLevel: normalizedTargetLevel,
      errors: evaluation.errors,
      constructionReplacements,
    });
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

    for (const u of unique) {
      const key = `${u.resolvedThemeId} ${u.answer}`;
      if (existingKeys.has(key)) continue;
      await pool.query(
        `INSERT INTO user_write_exercise (user_id, theme_id, prompt, answer, hint, attempt_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, u.resolvedThemeId, u.prompt, u.answer, u.hint, attemptId || null]
      );
    }

    // Report every correction word now in the user's drills.
    return unique.map(u => u.rawTarget);
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
