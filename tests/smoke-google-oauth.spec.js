import { test, expect } from '@playwright/test'

// Verifies the local Google OAuth wiring end-to-end without completing
// real consent: clicks the in-app Google button, follows the 302 chain
// and lands on accounts.google.com with the expected client_id and
// redirect_uri. A human completes the consent + 2FA; this just proves
// nothing on the local side is broken.
test('Google login button redirects to accounts.google.com with the local callback', async ({ page, context }) => {
  const failures = []
  page.on('pageerror', (e) => failures.push('pageerror: ' + e.message))
  page.on('console', (m) => {
    if (m.type() === 'error' && !/409 \(Conflict\)|status of 409|HMR|favicon|webSocket|WebSocket|DevTools/i.test(m.text())) {
      failures.push('console.error: ' + m.text().slice(0, 200))
    }
  })

  // 1. Land on the auth page
  await page.goto('/auth')
  await expect(page).toHaveTitle(/LanguageMe/i)

  // 2. Find and click the Google button (the second "Войти" button is the Google one)
  const googleBtn = page.getByRole('button', { name: /войти через google/i })
  await expect(googleBtn).toBeVisible({ timeout: 5_000 })

  // 3. Follow the click. We do NOT await navigation to a real Google URL
  //    (that requires real consent); instead we intercept and check the
  //    request we end up making to Google.
  const googleReq = page.waitForRequest(
    (req) => req.url().startsWith('https://accounts.google.com/'),
    { timeout: 10_000 }
  )
  await googleBtn.click()
  const req = await googleReq
  const url = new URL(req.url())

  expect(url.host, 'should hit accounts.google.com').toBe('accounts.google.com')
  expect(url.pathname, 'should hit /o/oauth2/v2/auth').toBe('/o/oauth2/v2/auth')
  expect(url.searchParams.get('client_id')).toBe('710696264208-peogjllgo7m777r4aa7nnc7fro5j4qu4.apps.googleusercontent.com')
  expect(url.searchParams.get('redirect_uri')).toBe('http://localhost:5173/api/auth/google/callback')
  expect(url.searchParams.get('scope')).toContain('email')
  expect(url.searchParams.get('response_type')).toBe('code')

  expect(failures, `unexpected errors: ${failures.join('\n')}`).toEqual([])
})
