import { test, expect } from '@playwright/test'

test('French themes are all unlocked (anonymous user)', async ({ page }) => {
  // Mirror of tests/check-polish-unlock.spec.js for the FR course. The
  // anonymous path uses the local isThemeUnlocked fallback in
  // src/utils/progress.js (which already permits every fr_themeXX), so this
  // is a regression guard against accidentally re-introducing the chain in
  // the client-side data.
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.setItem('lm_settings', JSON.stringify({
      nativeLang: 'ru',
      targetLang: 'fr',
      uiLang: 'ru',
      autoPlayAudio: true,
    }))
  })

  await page.goto('/themes')
  await page.waitForLoadState('networkidle')

  const lockCount = await page.locator('text=🔒').count()
  console.log(`Locked FR themes (anonymous): ${lockCount}`)
  expect(lockCount, 'no French theme card should be locked').toBe(0)

  // Sample titles that span the chain so a partial regression is caught.
  for (const title of [
    'Местоимения и глаголы 1-й группы (-er)',         // fr_theme01 — already NULL
    'Отрицательная форма',                            // fr_theme02 — was chained
    'Вопросительная форма',                           // fr_theme03
    'Глагол «avoir» (иметь)',                         // fr_theme05
    'Прошедшее время (passé composé)',                // fr_theme07
    'Свободная беседа',                               // fr_theme26
    'Возвратные глаголы',                             // fr_theme31 — chain tip
  ]) {
    const card = page.locator('.bg-surface').filter({ hasText: title }).first()
    await expect(card, `theme card "${title}" exists`).toBeVisible()
    const lockInCard = await card.locator('text=🔒').count()
    expect(lockInCard, `"${title}" should be unlocked`).toBe(0)
  }

  await page.screenshot({ path: 'tests/screenshots/fr-themes-unlock.png', fullPage: true })
})
