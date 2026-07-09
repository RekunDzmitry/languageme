import { Router } from 'express';
import { pool } from '../db/pool.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { buildSystemPrompt, runAICall } from '../services/ai.js';
import { logAIRequest } from '../middleware/aiLog.js';

const router = Router();

// List all users
router.get('/users', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, display_name, native_lang, target_lang, created_at FROM "user" ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// User progress overview
router.get('/users/:userId/progress', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { userId } = req.params;

    const { rows: cards } = await pool.query(
      'SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE reps >= 3)::int AS mastered FROM srs_card WHERE user_id = $1',
      [userId]
    );
    const { rows: themes } = await pool.query(
      'SELECT * FROM theme_progress WHERE user_id = $1 ORDER BY theme_id',
      [userId]
    );
    const { rows: [reviewStats] } = await pool.query(
      'SELECT COUNT(*)::int AS total_reviews FROM review WHERE user_id = $1',
      [userId]
    );

    res.json({
      cards: cards[0],
      themes,
      totalReviews: reviewStats.total_reviews,
    });
  } catch (err) { next(err); }
});

// Hardest words analytics
router.get('/analytics/hardest-words', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT v.id, v.target, AVG(r.quality)::real AS avg_quality, COUNT(r.id)::int AS review_count
       FROM review r JOIN vocab v ON v.id = r.vocab_id
       GROUP BY v.id HAVING COUNT(r.id) >= 5
       ORDER BY AVG(r.quality) ASC LIMIT 20`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// ============================================================================
// AI Observability
// ============================================================================

// List AI request log rows. Filters: userId, isSandbox ('true'|'false'|omitted),
// q (matches assistant_message or user message text). Paginated.
router.get('/ai-logs', authenticate, adminOnly, async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    const { userId, isSandbox, q } = req.query;

    const where = [];
    const params = [];
    if (userId) {
      params.push(userId);
      where.push(`l.user_id = $${params.length}`);
    }
    if (isSandbox === 'true') {
      where.push('l.is_sandbox = true');
    } else if (isSandbox === 'false') {
      where.push('l.is_sandbox = false');
    }
    if (q && q.trim()) {
      params.push(`%${q.trim()}%`);
      const i = params.length;
      where.push(`(l.assistant_message ILIKE $${i} OR l.system_prompt ILIKE $${i} OR l.messages::text ILIKE $${i})`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    params.push(limit, offset);

    const { rows } = await pool.query(
      `SELECT l.id, l.user_id, l.is_sandbox, l.source, l.exercise_key, l.exercise_type,
              l.model, l.provider, l.assistant_message, l.duration_ms, l.http_status,
              l.input_tokens, l.output_tokens, l.error, l.created_at,
              u.email AS user_email
       FROM ai_request_log l
       LEFT JOIN "user" u ON u.id = l.user_id
       ${whereSql}
       ORDER BY l.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ rows, limit, offset });
  } catch (err) { next(err); }
});

// Single AI log row with full messages and system prompt.
router.get('/ai-logs/:id', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT l.*, u.email AS user_email
       FROM ai_request_log l
       LEFT JOIN "user" u ON u.id = l.user_id
       WHERE l.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// Aggregate header for the admin UI.
router.get('/ai-logs-summary', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { rows: [totals] } = await pool.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE is_sandbox = true)::int AS sandbox,
         COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours')::int AS last_24h,
         COUNT(*) FILTER (WHERE error IS NOT NULL)::int AS errors
       FROM ai_request_log`
    );
    const { rows: perUser } = await pool.query(
      `SELECT u.email, COUNT(*)::int AS count
       FROM ai_request_log l LEFT JOIN "user" u ON u.id = l.user_id
       WHERE l.user_id IS NOT NULL
       GROUP BY u.email
       ORDER BY count DESC
       LIMIT 10`
    );
    res.json({ ...totals, perUser });
  } catch (err) { next(err); }
});

// Admin sandbox: run a one-off AI call with arbitrary system prompt and
// exercise context. Does NOT touch user-owned ai_conversation/ai_message.
// Always logged to ai_request_log with is_sandbox=true.
router.post('/ai-sandbox', authenticate, adminOnly, async (req, res, next) => {
  try {
    const {
      systemPrompt,
      exerciseContext = null,
      message,
      history = [], // optional [{role,content}] turns from previous runs
    } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'message is required' });
    }
    if (systemPrompt != null && typeof systemPrompt !== 'string') {
      return res.status(400).json({ error: 'systemPrompt must be a string' });
    }

    const finalSystemPrompt = buildSystemPrompt(exerciseContext, {
      systemPromptOverride: systemPrompt,
    });

    const safeHistory = (Array.isArray(history) ? history : [])
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-10);

    const messages = [
      { role: 'system', content: finalSystemPrompt },
      ...safeHistory,
      { role: 'user', content: message },
    ];

    const userId = req.user.sub;

    let result;
    try {
      result = await runAICall({ messages });
    } catch (err) {
      await logAIRequest({
        userId,
        isSandbox: true,
        source: 'sandbox',
        systemPrompt: finalSystemPrompt,
        messages,
        error: { message: err.message, code: err.code, httpStatus: err.httpStatus, durationMs: err.durationMs },
      });
      return res.status(502).json({ error: 'AI call failed', details: err.message });
    }

    const logged = await logAIRequest({
      userId,
      isSandbox: true,
      source: 'sandbox',
      systemPrompt: finalSystemPrompt,
      messages,
      result,
    });

    res.json({
      message: result.content,
      logId: logged?.id || null,
      durationMs: result.durationMs,
      model: result.httpStatus ? undefined : undefined,
      httpStatus: result.httpStatus,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
    });
  } catch (err) { next(err); }
});

export default router;
