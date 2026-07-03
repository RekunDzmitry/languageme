import { test, expect } from '@playwright/test'

// Throwaway spec to eyeball mobile (375px) layouts for the mobile-ui pass.
// Runs against the dev server on :5174 (proxies /api -> :3000).
const BASE = 'http://localhost:5174'
const API = 'http://localhost:3000'

test.use({ viewport: { width: 375, height: 812 } })

async function login(page, request) {
  const email = `mobile-${Date.now()}-${Math.floor(Math.random() * 1e6)}@test.local`
  const password = 'testpass123'
  const res = await request.post(`${API}/api/auth/register`, { data: { email, password } })
  expect(res.ok()).toBe(true)
  const { accessToken, refreshToken } = await res.json()
  await page.goto(`${BASE}/`)
  await page.evaluate(({ accessToken, refreshToken }) => {
    localStorage.setItem('lm_access_token', accessToken)
    localStorage.setItem('lm_refresh_token', refreshToken)
    localStorage.setItem('lm_settings', JSON.stringify({
      nativeLang: 'ru', targetLang: 'pl', uiLang: 'ru', autoPlayAudio: false,
    }))
  }, { accessToken, refreshToken })
}

// Assert the page never scrolls horizontally (nothing wider than the viewport).
async function expectNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    const de = document.documentElement
    return { scrollW: de.scrollWidth, clientW: de.clientWidth }
  })
  expect(overflow.scrollW, `${label}: horizontal overflow (scrollW ${overflow.scrollW} > clientW ${overflow.clientW})`).toBeLessThanOrEqual(overflow.clientW + 1)
}

const ROUTES = [
  ['dashboard', '/'],
  ['themes', '/themes'],
  ['training', '/training'],
  ['cards', '/cards'],
  ['email', '/email'],
]

for (const [name, path] of ROUTES) {
  test(`mobile @375 – ${name}`, async ({ page, request }) => {
    await login(page, request)
    await page.goto(`${BASE}${path}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    await page.screenshot({ path: `tests/screenshots/mobile-${name}.png`, fullPage: true })
    await expectNoHorizontalOverflow(page, name)
  })
}

test('mobile @375 – theme detail + vocab grid', async ({ page, request }) => {
  await login(page, request)
  await page.goto(`${BASE}/themes`)
  await page.waitForLoadState('networkidle')
  const firstTheme = page.locator('div.cursor-pointer').first()
  await firstTheme.click()
  await page.waitForURL(/\/themes\/[a-z0-9_]+/, { timeout: 10000 })
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(400)
  await page.screenshot({ path: 'tests/screenshots/mobile-theme-detail.png', fullPage: true })
  await expectNoHorizontalOverflow(page, 'theme-detail')
})

test('mobile @375 – email drawer opens', async ({ page, request }) => {
  await login(page, request)
  await page.goto(`${BASE}/email`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500)
  const drawerBtn = page.getByRole('button', { name: 'Zadania' }).first()
  await expect(drawerBtn).toBeVisible()
  await drawerBtn.click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: 'tests/screenshots/mobile-email-drawer.png', fullPage: true })
  await expectNoHorizontalOverflow(page, 'email-drawer')
})

test('mobile @375 – flashcard rating buttons wrap 2x2', async ({ page, request }) => {
  await login(page, request)
  await page.goto(`${BASE}/study/pl_theme10`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(600)
  const reveal = page.getByRole('button', { name: /нажмите, чтобы открыть/ }).first()
  await expect(reveal).toBeVisible({ timeout: 8000 })
  await reveal.click()
  await page.waitForTimeout(400)
  await expect(page.getByRole('button', { name: 'Легко' })).toBeVisible()
  await page.screenshot({ path: 'tests/screenshots/mobile-flashcard.png', fullPage: true })
  await expectNoHorizontalOverflow(page, 'flashcard')
})
