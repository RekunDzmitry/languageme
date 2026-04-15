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
    } catch {}
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

// AI Assistant API
export const aiApi = {
  // Send a chat message
  chat: (message, exerciseKey, exerciseType = 'conjugation', exerciseContext = null) =>
    api.post('/api/ai/chat', { message, exerciseKey, exerciseType, exerciseContext }),

  // Get conversation history for an exercise
  getConversation: (exerciseKey) =>
    api.get(`/api/ai/conversations/${encodeURIComponent(exerciseKey)}`),

  // Get all recent conversations
  getConversations: (limit = 10) =>
    api.get(`/api/ai/conversations?limit=${limit}`),

  // Get notes
  getNotes: (exerciseKey) =>
    api.get(`/api/ai/notes${exerciseKey ? `?exerciseKey=${encodeURIComponent(exerciseKey)}` : ''}`),

  // Save a note
  saveNote: (exerciseKey, content, title, exerciseType = 'conjugation') =>
    api.post('/api/ai/notes', { exerciseKey, content, exerciseType, title }),

  // Update a note
  updateNote: (noteId, content, title = null) =>
    api.put(`/api/ai/notes/${noteId}`, { content, title }),

  // Delete a note
  deleteNote: (noteId) =>
    api.delete(`/api/ai/notes/${noteId}`),
}
