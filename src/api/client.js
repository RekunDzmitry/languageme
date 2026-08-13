const TOKEN_KEY = 'lm_access_token'
const REFRESH_KEY = 'lm_refresh_token'

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setTokens(access, refresh) {
  localStorage.setItem(TOKEN_KEY, access)
  localStorage.setItem(REFRESH_KEY, refresh)
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

let refreshPromise = null

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem(REFRESH_KEY)
    if (!refreshToken) throw new Error('No refresh token')

    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!res.ok) throw new Error('Refresh failed')

    const data = await res.json()
    setTokens(data.accessToken, data.refreshToken)
    return data.accessToken
  })()

  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}

export async function api(endpoint, options = {}) {
  const { body, ...rest } = options
  const headers = { ...rest.headers }

  const token = getAccessToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (body && typeof body === 'object') {
    headers['Content-Type'] = 'application/json'
  }

  let res = await fetch(endpoint, {
    ...rest,
    headers,
    body: body && typeof body === 'object' ? JSON.stringify(body) : body,
    cache: 'no-cache',
  })

  if (res.status === 401 && token) {
    try {
      const newToken = await refreshAccessToken()
      headers['Authorization'] = `Bearer ${newToken}`
      res = await fetch(endpoint, {
        ...rest,
        headers,
        body: body && typeof body === 'object' ? JSON.stringify(body) : body,
      })
    } catch {
      clearTokens()
      window.dispatchEvent(new Event('auth:logout'))
      throw new Error('Session expired')
    }
  }

  if (!res.ok) {
    const error = new Error(`API error ${res.status}`)
    try {
      error.data = await res.json()
    } catch {
      error.data = null
    }
    error.status = res.status
    throw error
  }

  const text = await res.text()
  return text ? JSON.parse(text) : null
}

api.get = (endpoint) => api(endpoint)
api.post = (endpoint, body) => api(endpoint, { method: 'POST', body })
api.patch = (endpoint, body) => api(endpoint, { method: 'PATCH', body })
api.put = (endpoint, body) => api(endpoint, { method: 'PUT', body })
api.delete = (endpoint) => api(endpoint, { method: 'DELETE' })

// Themes API
export const themesApi = {
  // List all themes (all languages); caller filters by lang
  list: () => api.get('/api/themes'),
}

// Exercise Cards API (Polish Spelling)
export const exerciseApi = {
  // Get all exercise cards for user
  getCards: () => api.get('/api/study/exercises'),

  // Review an exercise card
  review: (exerciseKey, themeId, quality) =>
    api.post('/api/study/exercises/review', { exerciseKey, themeId, quality }),

  // User-authored write_answer drills (created from email corrections)
  getUserExercises: () => api.get('/api/study/write-exercises'),
}
// Study session analytics endpoints. These are fire-and-forget
// for the frontend — failures must not break the study session.
// See server/src/routes/study.js for the server-side handlers.
export const studyApi = {
  // Log the initial queue when the user enters /learn or /study/<themeId>.
  sessionStart: (data) => api.post('/api/study/session-start', data),
}


// Exercise Notes API (user-authored notes on WriteAnswer exercises)
export const exerciseNoteApi = {
  // Get notes, optionally filtered by theme
  getByTheme: (themeId) =>
    api.get(`/api/exercise-notes${themeId ? `?themeId=${encodeURIComponent(themeId)}` : ''}`),

  // Upsert a note for an exercise
  save: (exerciseKey, themeId, content) =>
    api.put(`/api/exercise-notes/${encodeURIComponent(exerciseKey)}`, { themeId, content }),

  // Delete a note
  delete: (exerciseKey) =>
    api.delete(`/api/exercise-notes/${encodeURIComponent(exerciseKey)}`),
}

async function streamPost(endpoint, body, onEvent) {
  let token = getAccessToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  let res = await fetch(endpoint, {
    method: 'POST',
    headers,
    cache: 'no-cache',
    body: JSON.stringify(body),
  })

  if (res.status === 401 && token) {
    token = await refreshAccessToken()
    res = await fetch(endpoint, {
      method: 'POST',
      headers: { ...headers, Authorization: `Bearer ${token}` },
      cache: 'no-cache',
      body: JSON.stringify(body),
    })
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const error = new Error(text || `Request failed: ${res.status}`)
    error.status = res.status
    error.responseText = text
    throw error
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let finalEvent = null

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      if (!line.trim()) continue
      const event = JSON.parse(line)
      finalEvent = event
      onEvent?.(event)
    }
  }

  buffer += decoder.decode()
  if (buffer.trim()) {
    const event = JSON.parse(buffer)
    finalEvent = event
    onEvent?.(event)
  }

  return finalEvent
}

function isMissingEndpointError(error) {
  return (
    error?.status === 404 ||
    (error?.status === 401 && !getAccessToken()) ||
    /Cannot POST \/api\/email\/evaluate-stream/i.test(error?.message || '')
  )
}

async function evaluateEmailLegacy(payload, onEvent) {
  onEvent?.({ type: 'step_started', step: 'evaluation' })

  const evaluation = await api.post('/api/email/evaluate', payload)
  let attempt = null
  let autoAdded = []

  if (payload.themeId !== undefined && payload.exerciseIdx !== undefined) {
    try {
      attempt = await api.post('/api/email/save-attempt', {
        themeId: payload.themeId,
        exerciseIdx: payload.exerciseIdx,
        userText: payload.userText,
        score: evaluation.score,
        aiEvaluation: evaluation,
      })
      autoAdded = Array.isArray(attempt.autoAdded) ? attempt.autoAdded : []
    } catch (err) {
      if (err.status !== 401) throw err
    }
  }

  const finalEvent = {
    type: 'evaluation_complete',
    attemptId: attempt?.id ?? null,
    evaluation,
    autoAdded,
  }

  onEvent?.({ type: 'step_completed', step: 'evaluation', data: evaluation })
  onEvent?.(finalEvent)

  return finalEvent
}

// Email Writing API
export const emailApi = {
  // Evaluate user's email (TELC format)
  evaluate: (userText, taskDescription, targetLang = 'pl', nativeLang = 'ru', points, register, etiquetteHint, targetLevel = 'B1') =>
    api.post('/api/email/evaluate', { userText, taskDescription, targetLang, nativeLang, points, register, etiquetteHint, targetLevel }),

  evaluateStream: async (payload, onEvent) => {
    try {
      return await streamPost('/api/email/evaluate-stream', payload, onEvent)
    } catch (err) {
      if (!isMissingEndpointError(err)) throw err
      return evaluateEmailLegacy(payload, onEvent)
    }
  },

  // Save evaluation attempt to history
  saveAttempt: (themeId, exerciseIdx, userText, score, aiEvaluation) =>
    api.post('/api/email/save-attempt', { themeId, exerciseIdx, userText, score, aiEvaluation }),

  // Turn a correction into a write_answer drill (optionally attached to a theme)
  addExercise: (attemptId, targetWord, translation, hint = null, themeId = null) =>
    api.post('/api/email/add-exercise', { attemptId, targetWord, translation, hint, themeId }),

  // Get user's email writing history, optionally scoped to one exercise
  getHistory: (limit = 20, themeId = null, exerciseIdx = null) => {
    let qs = `?limit=${limit}&includeText=true`
    if (themeId != null) qs += `&themeId=${encodeURIComponent(themeId)}`
    if (exerciseIdx != null) qs += `&exerciseIdx=${exerciseIdx}`
    return api.get(`/api/email/history${qs}`)
  },

  // Get a single attempt with full details (text + evaluation)
  getHistoryDetail: (id) =>
    api.get(`/api/email/history/${id}`),

  // Delete a single attempt
  deleteAttempt: (id) =>
    api.delete(`/api/email/history/${id}`),

  // Clear all attempts for one exercise (theme + exercise index required)
  clearHistory: (themeId, exerciseIdx) =>
    api.delete(`/api/email/history?themeId=${encodeURIComponent(themeId)}&exerciseIdx=${exerciseIdx}`),

  // Get words user has added from emails
  getAddedWords: () =>
    api.get('/api/email/added-words'),
}

// Vocabulary Notes API (user-authored notes on vocabulary words)
export const vocabNoteApi = {
  // Get notes, optionally filtered by vocab
  getByVocab: (vocabId) =>
    api.get(`/api/vocab-notes${vocabId ? `?vocabId=${encodeURIComponent(vocabId)}` : ''}`),

  // Upsert a note for a vocab word
  save: (vocabId, content) =>
    api.put(`/api/vocab-notes/${encodeURIComponent(vocabId)}`, { content }),

  // Delete a note
  delete: (vocabId) =>
    api.delete(`/api/vocab-notes/${encodeURIComponent(vocabId)}`),
}

// User-authored flashcards API. Mirrors the shape of vocabNoteApi:
// camelCase methods, no manual token plumbing. The id is the server's
// `usr_<uuid>` — never a seed id, so it can't collide with fr_/pl_
// srs_card lookups in the study loop.
export const userCardsApi = {
  list: (targetLang) =>
    api.get(`/api/user-cards${targetLang ? `?target=${encodeURIComponent(targetLang)}` : ''}`),
  create: (data) => api.post('/api/user-cards', data),
  update: (id, data) => api.patch(`/api/user-cards/${encodeURIComponent(id)}`, data),
  remove: (id) => api.delete(`/api/user-cards/${encodeURIComponent(id)}`),
}


// Per-user conjugation prompt overrides. Mirrors the shape of the
// other override APIs: composite key (themeId, infinitive, pronounIdx,
// lang) hits one cell of theme_conjugation.forms[] on the server side.
// The server also injects the result into the /api/courses/all
// bundle, so the UI rarely has to GET this list — the save() call
// below is what the user triggers from the prompt edit field.
export const conjugationPromptOverridesApi = {
  list: () => api.get('/api/conjugation-prompt-overrides'),

  // themeId / infinitive are strings; pronounIdx is 0-5; lang is a
  // BCP-47-ish native code (ru, fr, en, ...). The server's SQL is
  // stringly-keyed, so encoding is just URL escape.
  save: ({ themeId, infinitive, pronounIdx, lang, text }) =>
    api.put(
      `/api/conjugation-prompt-overrides/${encodeURIComponent(themeId)}/${encodeURIComponent(infinitive)}/${pronounIdx}?lang=${encodeURIComponent(lang)}`,
      { text }
    ),

  remove: ({ themeId, infinitive, pronounIdx, lang }) =>
    api.delete(
      `/api/conjugation-prompt-overrides/${encodeURIComponent(themeId)}/${encodeURIComponent(infinitive)}/${pronounIdx}?lang=${encodeURIComponent(lang)}`
    ),
}
