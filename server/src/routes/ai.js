import { Router } from 'express';
import { pool } from '../db/pool.js';
import { authenticate as requireAuth } from '../middleware/auth.js';
import { config } from '../config.js';

const router = Router();

// OpenCode Go API configuration
const OPENCODE_BASE_URL = 'https://opencode.ai/zen/go/v1';
const MODEL_NAME = 'kimi-k2.5';

// System prompt for the language learning assistant
function buildSystemPrompt(exerciseContext = null) {
  let contextInfo = '';
  
  if (exerciseContext) {
    if (exerciseContext.verb) {
      contextInfo += '\n\n📚 КОНТЕКСТ УПРАЖНЕНИЯ:\n';
      contextInfo += `Глагол: ${exerciseContext.verb.infinitive}\n`;
      contextInfo += `Значение: ${exerciseContext.verb.meaning}\n`;
      if (exerciseContext.verb.group) {
        contextInfo += `Группа: ${exerciseContext.verb.group}\n`;
      }
    }
    
    if (exerciseContext.prompt) {
      contextInfo += `Задание (на русском): ${exerciseContext.prompt}\n`;
    }
    
    if (exerciseContext.answer) {
      contextInfo += `Правильный ответ (на французском): ${exerciseContext.answer}\n`;
    }
    
    if (contextInfo) {
      contextInfo = `Пользователь сейчас выполняет упражнение на спряжение глагола. ${contextInfo}`;
    }
  }
  
  return `Ты дружелюбный помощник для изучения французского языка в приложении LanguageMe.
Отвечай на русском, но можешь смешивать с французским для примеров.
Будь краток, полезен и используй примеры из реальной жизни.

Когда пользователь спрашивает о слове или глаголе, объясняй:
1. Точное значение и оттенки
2. Контекст использования (формальный/неформальный)
3. Примеры предложений
4. Синонимы и антонимы если есть

Если спрашивают о спряжении - давай полную таблицу спряжения.

Будь особенно внимателен к контексту упражнения, о котором спрашивает пользователь.${contextInfo}`;
}

// ============================================================================
// OpenAI-Compatible API Call
// ============================================================================

async function chatWithAI(messages) {
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
      messages: messages,
      max_tokens: 2000,
      temperature: 0.7,
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

    // Call OpenCode API
    const assistantMessage = await chatWithAI(messages);

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
  const apiKey = process.env.OPENCODE_API_KEY;
  
  if (!apiKey) {
    return res.json({
      status: 'not_configured',
      message: 'OPENCODE_API_KEY environment variable is not set'
    });
  }

  res.json({
    status: 'ok',
    provider: 'opencode-go',
    model: MODEL_NAME,
    message: 'OpenCode Go AI is configured and ready'
  });
});

export default router;
