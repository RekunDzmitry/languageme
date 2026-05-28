import { test, expect } from '@playwright/test'

test('Polish themes 6-9 are unlocked for a fresh authenticated user', async ({ page, request }) => {
  const email = `pltest-${Date.now()}@test.local`
  const password = 'testpass123'

  const res = await request.post('http://localhost:3000/api/auth/register', {
    data: { email, password },
  })
  expect(res.ok()).toBe(true)
  const { accessToken, refreshToken } = await res.json()

  await page.goto('/')
  await page.evaluate(({ accessToken, refreshToken }) => {
    localStorage.setItem('lm_access_token', accessToken)
    localStorage.setItem('lm_refresh_token', refreshToken)
    localStorage.setItem('lm_settings', JSON.stringify({
      nativeLang: 'ru',
      targetLang: 'pl',
      uiLang: 'ru',
      autoPlayAudio: true,
    }))
  }, { accessToken, refreshToken })

  await page.goto('/themes')
  await page.waitForLoadState('networkidle')

  await expect(page.getByRole('heading', { name: 'Темы польского' })).toBeVisible()

  const lockedCount = await page.locator('text=🔒').count()
  console.log(`Locked Polish themes (authenticated): ${lockedCount}`)

  for (const title of ['Правописание: j и i', 'Правописание: gie и ge', 'Правописание: носовые ę, ą и сочетания en/em/on/om', 'Правописание: прописные и строчные буквы']) {
    const card = page.locator('.bg-surface').filter({ hasText: title }).first()
    await expect(card, `theme card "${title}" exists`).toBeVisible()
    const lockInCard = await card.locator('text=🔒').count()
    expect(lockInCard, `theme "${title}" should be unlocked`).toBe(0)
  }

  expect(lockedCount).toBe(0)

  await page.screenshot({ path: 'tests/screenshots/polish-themes-auth.png', fullPage: true })
})
