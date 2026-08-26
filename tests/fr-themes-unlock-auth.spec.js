import { test, expect } from '@playwright/test'

test('French themes 02-31 are unlocked for a fresh authenticated user', async ({ page, request }) => {
  // Mirror of tests/polish-themes-unlock-auth.spec.js. This is the path that
  // actually exercises the API gate at server/src/routes/progress.js:42
  // (GET /themes/:themeId/unlock) and :73 (GET /themes/unlock-status) — the
  // route returns unlocked:false whenever theme.unlock_theme_id is non-null
  // AND the prior theme's progress does not meet unlock_min_score. After
  // migration 036 the fr_theme02..31 rows have unlock_theme_id=NULL, so the
  // gate short-circuits at progress.js:48 to unlocked:true.

  const email = `frtest-${Date.now()}@test.local`
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
      targetLang: 'fr',
      uiLang: 'ru',
      autoPlayAudio: true,
    }))
  }, { accessToken, refreshToken })

  await page.goto('/themes')
  await page.waitForLoadState('networkidle')

  await expect(page.getByRole('heading', { name: 'Темы французского' })).toBeVisible()

  const lockedCount = await page.locator('text=🔒').count()
  console.log(`Locked FR themes (authenticated): ${lockedCount}`)
  expect(lockedCount, 'authenticated fresh user should see zero locked FR themes').toBe(0)

  for (const title of [
    'Отрицательная форма',                  // fr_theme02
    'Вопросительная форма',                 // fr_theme03
    'Фразы этикета',                        // fr_theme04
    'Глагол «avoir» (иметь)',               // fr_theme05
    'Прошедшее время (passé composé)',      // fr_theme07
    'Будущее время',                        // fr_theme10
    'Свободная беседа',                     // fr_theme26
    'Возвратные глаголы',                   // fr_theme31
  ]) {
    const card = page.locator('.bg-surface').filter({ hasText: title }).first()
    await expect(card, `theme card "${title}" exists`).toBeVisible()
    const lockInCard = await card.locator('text=🔒').count()
    expect(lockInCard, `"${title}" should be unlocked for authenticated user`).toBe(0)
  }

  await page.screenshot({ path: 'tests/screenshots/fr-themes-auth.png', fullPage: true })
})
