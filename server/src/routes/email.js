import { Router } from 'express';
import { pool } from '../db/pool.js';
import { authenticate as requireAuth, optionallyAuthenticate } from '../middleware/auth.js';

const router = Router();

// OpenCode Go API configuration
const OPENCODE_BASE_URL = 'https://opencode.ai/zen/go/v1';
const MODEL_NAME = 'qwen3.6-plus';

// ============================================================================
// AI call helper
// ============================================================================

async function callAI(prompt) {
  const apiKey = process.env.OPENCODE_API_KEY;
  if (!apiKey) {
    throw new Error('OPENCODE_API_KEY environment variable is not set');
  }

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
      // Disable extended reasoning: with thinking on, this model takes ~110s
      // for the structured-JSON eval and the gateway intermittently 500s/503s.
      // Reasoning off returns the same JSON in ~25s, reliably.
      reasoning_effort: 'none',
      max_tokens: 8000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenCode API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// ============================================================================
// Build evaluation prompt
// ============================================================================

const LANG_LABELS = { ru: 'Russian', en: 'English', pl: 'Polish', fr: 'French' };

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
  const userLevel = targetLevel || 'B1';
  const replacementInstructions = userLevel === 'B2'
    ? `The learner is targeting B2 level. Identify 2–4 constructions in their text that are too simple (A2/B1 level) and suggest more sophisticated B2-level alternatives. For each, explain why the B2 version sounds more natural or precise.`
    : `The learner is targeting B1 level. Identify 2–4 constructions in their text that are overly complex (B2/C1 level attempts that didn't quite work) and suggest simpler, more natural B1-level alternatives. For each, explain why the simpler version is clearer and more appropriate.`;

  return `Evaluate the following email written by a Polish language learner.
The learner's native language is ${langLabel}.
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
  "score": <number 0-100>,
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
          "suggestedThemeId": "<theme ID like pl_theme10, pl_theme15, or null>"
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
- startOffset and endOffset must be exact character positions in the email text (0-indexed)
- For "taskCoverage": evaluate whether each mandatory point was addressed. Set "covered" to true if the user mentions the topic, false if completely missing. Include a short quote from their text as "snippet".
- For "etiquetteCheck": check if the email has an appropriate greeting at the beginning and sign-off at the end, suitable for the given register.
- For "registerMatch": set to true if the overall tone matches the expected register, false if it's too formal or too casual.
- For "proposedWords": ALWAYS include at least one item per error — the corrected word or short phrase as "target", with its "translation" in ${nativeLabel}. Add up to 2 more if the error reveals a related vocabulary gap. Never leave proposedWords empty.
- For "errors": analyze spelling, grammar, style, and vocabulary. Do NOT flag things the learner got right. Only flag actual mistakes.
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
    const { userText, taskDescription, targetLang: emailTargetLang, nativeLang, points, register, etiquetteHint, targetLevel } = req.body;
    const userId = req.user?.sub || null;

    if (!userText || !userText.trim()) {
      return res.status(400).json({ error: 'userText is required' });
    }
    if (!taskDescription || !taskDescription.trim()) {
      return res.status(400).json({ error: 'taskDescription is required' });
    }

    const targetLang = emailTargetLang || 'pl';
    const userNativeLang = nativeLang || 'ru';

    // Build prompt and call AI
    const prompt = buildEvaluationPrompt(
      userText.trim(),
      taskDescription,
      points || [],
      register || '',
      etiquetteHint || '',
      userNativeLang,
      targetLevel || 'B1'
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
    } catch (parseErr) {
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
            suggestedThemeId: w.suggestedThemeId || null,
          }))
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
          suggestedLevel: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(cr.suggestedLevel) ? cr.suggestedLevel : (targetLevel || 'B1'),
          explanation: cr.explanation || '',
        }))
      : [];

    res.json({
      score: evaluation.score,
      taskCoverage: normalizedTaskCoverage,
      etiquetteCheck: normalizedEtiquette,
      registerMatch: evaluation.registerMatch === true,
      overallFeedback: evaluation.overallFeedback || '',
      errors: evaluation.errors,
      constructionReplacements,
    });
  } catch (err) {
    console.error('Email evaluation error:', err);
    res.status(500).json({ error: 'Failed to evaluate email', details: err.message });
  }
});

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

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error saving email attempt:', err);
    res.status(500).json({ error: 'Failed to save attempt', details: err.message });
  }
});

// ============================================================================
// POST /api/email/add-exercise — turn a correction into a write_answer drill
// ============================================================================

// Catch-all theme for corrections the user doesn't attach to a real theme.
const OTHER_THEME_ID = 'pl_other';

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
    const { limit = 10 } = req.query;

    const result = await pool.query(
      `SELECT id, theme_id, exercise_idx, score, created_at
       FROM email_attempt
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, parseInt(limit)]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching email history:', err);
    res.status(500).json({ error: 'Failed to fetch history', details: err.message });
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
