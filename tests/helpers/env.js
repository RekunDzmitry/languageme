// Shared test environment helpers.
//
// The API base is overridable so the suite can target an isolated
// stack (docker-compose.review.yml, api on 3100) instead of the
// default 3000, which may be serving a different worktree.
export const API_URL = process.env.PW_API_URL || 'http://localhost:3000'

let seq = 0

// Register a fresh user and return its tokens. Each call gets a
// unique address so tests never collide on the `user.email` unique
// index, even within the same millisecond.
export async function registerUser(request, prefix = 'rev') {
  seq += 1
  const email = `${prefix}-${Date.now()}-${seq}@test.local`
  const res = await request.post(`${API_URL}/api/auth/register`, {
    data: { email, password: 'testpass123' },
  })
  if (!res.ok()) {
    throw new Error(`register failed: ${res.status()} ${await res.text()}`)
  }
  const { accessToken, refreshToken } = await res.json()
  return { email, accessToken, refreshToken }
}

// Seed localStorage so the app boots authenticated with a known
// pack/language selection. Must be called after a navigation to an
// app-origin page (localStorage is origin-scoped).
export async function authenticatePage(page, tokens, settings = {}) {
  await page.goto('/')
  await page.evaluate(({ accessToken, refreshToken, settings }) => {
    localStorage.setItem('lm_access_token', accessToken)
    localStorage.setItem('lm_refresh_token', refreshToken)
    localStorage.setItem('lm_settings', JSON.stringify({
      nativeLang: 'ru',
      targetLang: 'pl',
      uiLang: 'ru',
      autoPlayAudio: false,
      activePackId: 'pl-a1-a2',
      ...settings,
    }))
  }, { ...tokens, settings })
}

// Create a user-authored card straight through the API, bypassing
// the modal. Returns the created card.
export async function createUserCard(request, accessToken, data) {
  const res = await request.post(`${API_URL}/api/user-cards`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    data,
  })
  if (!res.ok()) {
    throw new Error(`createUserCard failed: ${res.status()} ${await res.text()}`)
  }
  return res.json()
}
