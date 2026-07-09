// aiLog: append a single row to ai_request_log describing one AI call.
// Fire-and-forget by design — logging must never fail a user request, but we
// still want a structured failure if the DB is down.

import { pool } from '../db/pool.js';
import { MODEL_NAME, AI_PROVIDER } from '../services/ai.js';

const MAX_CONTENT_LEN = 8000;

function truncate(text, max = MAX_CONTENT_LEN) {
  if (text == null) return text;
  const s = String(text);
  return s.length > max ? `${s.slice(0, max)}…[+${s.length - max}]` : s;
}

function summarizeMessages(messages) {
  // Keep the full structure but cap each content so a runaway blob doesn't
  // bloat the row. Admin still sees the full conversation in the drawer.
  return (messages || []).map((m) => ({
    role: m.role,
    content: truncate(m.content),
  }));
}

/**
 * Log a single AI call. Never throws.
 * @param {object} args
 * @param {string} [args.userId]      uuid of caller; null for sandbox previews
 * @param {boolean} [args.isSandbox]  true for admin sandbox requests
 * @param {'chat'|'sandbox'} args.source
 * @param {string} [args.exerciseKey]
 * @param {string} [args.exerciseType]
 * @param {string} args.systemPrompt
 * @param {Array<{role:string,content:string}>} args.messages
 * @param {{content?:string,durationMs?:number,httpStatus?:number,inputTokens?:number,outputTokens?:number}} [args.result]
 * @param {{code?:string,message:string,durationMs?:number,httpStatus?:number}} [args.error]
 */
export async function logAIRequest(args) {
  try {
    const {
      userId = null,
      isSandbox = false,
      source,
      exerciseKey = null,
      exerciseType = null,
      systemPrompt,
      messages,
      result = null,
      error = null,
    } = args;

    const row = {
      user_id: userId,
      is_sandbox: isSandbox,
      source,
      exercise_key: exerciseKey,
      exercise_type: exerciseType,
      model: MODEL_NAME,
      provider: AI_PROVIDER,
      system_prompt: truncate(systemPrompt, MAX_CONTENT_LEN * 2),
      messages: JSON.stringify(summarizeMessages(messages)),
      assistant_message: result?.content != null ? truncate(result.content) : null,
      input_tokens: result?.inputTokens ?? null,
      output_tokens: result?.outputTokens ?? null,
      duration_ms: result?.durationMs ?? error?.durationMs ?? null,
      http_status: result?.httpStatus ?? error?.httpStatus ?? null,
      error: error ? truncate(error.message) : null,
    };

    const cols = Object.keys(row);
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
    const values = cols.map((c) => row[c]);

    const { rows } = await pool.query(
      `INSERT INTO ai_request_log (${cols.join(', ')})
       VALUES (${placeholders})
       RETURNING id, created_at`,
      values
    );
    return rows[0] || null;
  } catch (err) {
    // Never propagate: logging must not break a request.
    console.error('[aiLog] failed to persist request log:', err.message);
    return null;
  }
}
