// AI provider service: builds prompts, calls the OpenAI-compatible endpoint,
// and exposes a single runAICall() entry point so the admin sandbox and
// Polish email evaluation share the same request/response shape and config.

const AI_BASE_URL = process.env.AI_BASE_URL || 'https://integrate.api.nvidia.com/v1';
const MODEL_NAME = process.env.AI_MODEL || 'nvidia/nemotron-3-nano-30b-a3b';
const AI_PROVIDER = process.env.AI_PROVIDER || (AI_BASE_URL.includes('nvidia.com') ? 'nvidia-nim' : 'openai-compatible');

// Default system prompt for the admin sandbox.
// Admins pass `systemPromptOverride` from the sandbox to swap it out.
function buildSystemPrompt(exerciseContext = null, { systemPromptOverride } = {}) {
  if (systemPromptOverride && systemPromptOverride.trim()) {
    return systemPromptOverride;
  }

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

function getApiKey() {
  return process.env.AI_API_KEY || process.env.NVIDIA_API_KEY;
}

export function getAIConfig() {
  return { baseUrl: AI_BASE_URL, model: MODEL_NAME, provider: AI_PROVIDER };
}

// Single outbound call. Returns a structured result so callers can log it
// uniformly regardless of success or failure.
export async function runAICall({ messages }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    const err = new Error('AI_API_KEY or NVIDIA_API_KEY environment variable is not set');
    err.code = 'NO_API_KEY';
    throw err;
  }

  const start = Date.now();
  let response;
  try {
    response = await fetch(`${AI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages,
        max_tokens: 2000,
      }),
    });
  } catch (err) {
    const e = new Error(`AI request failed: ${err.message}`);
    e.code = 'NETWORK';
    e.durationMs = Date.now() - start;
    throw e;
  }

  const durationMs = Date.now() - start;

  if (!response.ok) {
    const errorText = await response.text();
    const e = new Error(`AI API error: ${response.status} - ${errorText.slice(0, 500)}`);
    e.code = 'HTTP';
    e.httpStatus = response.status;
    e.durationMs = durationMs;
    throw e;
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  const usage = data.usage || {};

  return {
    content,
    durationMs,
    httpStatus: response.status,
    inputTokens: usage.prompt_tokens ?? null,
    outputTokens: usage.completion_tokens ?? null,
  };
}

export { buildSystemPrompt, AI_BASE_URL, MODEL_NAME, AI_PROVIDER };
