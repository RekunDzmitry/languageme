import { Router } from 'express';
import { pool } from '../db/pool.js';
import { authenticate as requireAuth } from '../middleware/auth.js';
import { logAIRequest } from '../middleware/aiLog.js';
import { buildSystemPrompt, runAICall, getAIConfig } from '../services/ai.js';

const router = Router();

// ============================================================================
// API Routes
// ============================================================================

// Get or create conversation for an exercise
async function getOrCreateConversation(userId, exerciseKey, exerciseType) {
  const existing = await pool.query(
    `SELECT id FROM ai_conversation
     WHERE user_id = $1 AND exercise_key = $2
     ORDER BY updated_at DESC LIMIT 1`,
    [userId, exerciseKey]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }

  const result = await pool.query(
    `INSERT INTO ai_conversation (user_id, exercise_key, exercise_type)
     VALUES ($1, $2, $3) RETURNING id`,
    [userId, exerciseKey, exerciseType]
  );

  return result.rows[0].id;
}

// Get conversation history
router.get('/conversations/:exerciseKey', requireAuth, async (req, res) => {
  try {
    const { exerciseKey } = req.params;
    const userId = req.user.sub;

    const conv = await pool.query(
      `SELECT id, exercise_key, exercise_type, created_at, updated_at
       FROM ai_conversation
       WHERE user_id = $1 AND exercise_key = $2
       ORDER BY updated_at DESC LIMIT 1`,
      [userId, exerciseKey]
    );

    if (conv.rows.length === 0) {
      return res.json({ conversation: null, messages: [] });
    }

    const messages = await pool.query(
      `SELECT id, role, content, created_at
       FROM ai_message
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conv.rows[0].id]
    );

    res.json({
      conversation: conv.rows[0],
      messages: messages.rows
    });
  } catch (err) {
    console.error('Error fetching conversation:', err);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Send a chat message
router.post('/chat', requireAuth, async (req, res) => {
  try {
    const { message, exerciseKey, exerciseType = 'conjugation', exerciseContext = null } = req.body;
    const userId = req.user.sub;

    if (!message || !exerciseKey) {
      return res.status(400).json({ error: 'Message and exerciseKey are required' });
    }

    // Get or create conversation
    const conversationId = await getOrCreateConversation(userId, exerciseKey, exerciseType);

    // Get recent messages for context
    const recentMessages = await pool.query(
      `SELECT role, content FROM ai_message
       WHERE conversation_id = $1
       ORDER BY created_at DESC LIMIT 10`,
      [conversationId]
    );

    // Build conversation messages for API
    const conversationHistory = recentMessages.rows.reverse().map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    // Build full messages array with context-aware system prompt
    const systemPrompt = buildSystemPrompt(exerciseContext);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Call AI provider. logAIRequest is fire-and-forget so a logging failure
    // never breaks a user request, and we still log the call once we have a
    // result (success or error).
    let result;
    try {
      result = await runAICall({ messages });
    } catch (err) {
      logAIRequest({
        userId,
        source: 'chat',
        exerciseKey,
        exerciseType,
        systemPrompt,
        messages,
        error: { message: err.message, code: err.code, httpStatus: err.httpStatus, durationMs: err.durationMs },
      });
      throw err;
    }

    const assistantMessage = result.content;

    // Save user message
    await pool.query(
      `INSERT INTO ai_message (conversation_id, role, content) VALUES ($1, 'user', $2)`,
      [conversationId, message]
    );

    // Save assistant message
    await pool.query(
      `INSERT INTO ai_message (conversation_id, role, content) VALUES ($1, 'assistant', $2)`,
      [conversationId, assistantMessage]
    );

    // Update conversation timestamp
    await pool.query(
      `UPDATE ai_conversation SET updated_at = NOW() WHERE id = $1`,
      [conversationId]
    );

    logAIRequest({
      userId,
      source: 'chat',
      exerciseKey,
      exerciseType,
      systemPrompt,
      messages,
      result,
    });

    res.json({
      message: assistantMessage,
      conversationId
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to send message', details: err.message });
  }
});

// Get all notes for user
router.get('/notes', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { exerciseKey } = req.query;

    let query = `
      SELECT id, exercise_key, exercise_type, title, content, created_at, updated_at
      FROM ai_note
      WHERE user_id = $1
    `;
    const params = [userId];

    if (exerciseKey) {
      query += ` AND exercise_key = $2`;
      params.push(exerciseKey);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Create a note
router.post('/notes', requireAuth, async (req, res) => {
  try {
    const { exerciseKey, exerciseType = 'conjugation', title, content } = req.body;
    const userId = req.user.sub;

    if (!exerciseKey || !content) {
      return res.status(400).json({ error: 'exerciseKey and content are required' });
    }

    const result = await pool.query(
      `INSERT INTO ai_note (user_id, exercise_key, exercise_type, title, content)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, exercise_key, exercise_type, title, content, created_at`,
      [userId, exerciseKey, exerciseType, title || null, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating note:', err);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update a note
router.put('/notes/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user.sub;

    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }

    const result = await pool.query(
      `UPDATE ai_note 
       SET title = COALESCE($1, title), content = $2, updated_at = NOW()
       WHERE id = $3 AND user_id = $4
       RETURNING id, exercise_key, exercise_type, title, content, created_at, updated_at`,
      [title, content, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating note:', err);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete a note
router.delete('/notes/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;

    const result = await pool.query(
      `DELETE FROM ai_note WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ deleted: true });
  } catch (err) {
    console.error('Error deleting note:', err);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Get recent conversations
router.get('/conversations', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { limit = 10 } = req.query;

    const result = await pool.query(
      `SELECT c.id, c.exercise_key, c.exercise_type, c.created_at, c.updated_at,
              (SELECT content FROM ai_message WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
              (SELECT COUNT(*) FROM ai_message WHERE conversation_id = c.id) as message_count
       FROM ai_conversation c
       WHERE c.user_id = $1
       ORDER BY c.updated_at DESC
       LIMIT $2`,
      [userId, parseInt(limit)]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Health check endpoint for AI service
router.get('/status', async (req, res) => {
  const apiKey = process.env.AI_API_KEY || process.env.NVIDIA_API_KEY || process.env.OPENCODE_API_KEY;

  if (!apiKey) {
    return res.json({
      status: 'not_configured',
      message: 'AI_API_KEY, NVIDIA_API_KEY, or OPENCODE_API_KEY environment variable is not set'
    });
  }

  const { provider, model } = getAIConfig();
  res.json({
    status: 'ok',
    provider,
    model,
    message: `${provider} AI is configured and ready`
  });
});

export default router;
