import { test, expect } from '@playwright/test'

test('Polish themes are all unlocked', async ({ page }) => {
  // Set Polish as target language via localStorage
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.setItem('lm_settings', JSON.stringify({
      nativeLang: 'ru',
      targetLang: 'pl',
      uiLang: 'ru',
      autoPlayAudio: true,
    }))
  })

  // Navigate to themes page
  await page.goto('/themes')
  await page.waitForLoadState('networkidle')

  // Find all theme items - they should NOT have lock text
  const lockedThemes = page.locator('text=🔒')
  const lockCount = await lockedThemes.count()
  console.log(`Locked themes: ${lockCount}`)

  // Count total theme divs (bg-surface)
  const themeDivs = page.locator('.bg-surface')
  const totalCount = await themeDivs.count()
  console.log(`Total theme cards: ${totalCount}`)

  // Check for specific Polish theme titles
  // We need to look at the actual rendered content
  const pageText = await page.locator('body').innerText()
  console.log('Page text sample:', pageText.substring(0, 500))

  // Check that "Правописание: ch и h" is visible (without lock)
  const chTheme = page.getByText('Правописание: ch и h', { exact: true })
  const chVisible = await chTheme.isVisible()
  console.log(`Theme "ch и h" visible: ${chVisible}`)

  // Check that it does NOT have lock nearby
  if (chVisible) {
    const nearbyLock = chTheme.locator('../../..').locator('text=🔒')
    const hasLock = await nearbyLock.count()
    console.log(`  Lock near "ch и h": ${hasLock}`)
    expect(hasLock).toBe(0)
  }

  // Check for "Правописание: j и i" - should be visible, not locked
  const jiTheme = page.getByText('j и i', { exact: false })
  const jiCount = await jiTheme.count()
  console.log(`Theme "j и i" matches: ${jiCount}`)

  // Check for "Правописание: gie и ge"
  const gieTheme = page.getByText('gie и ge', { exact: false })
  const gieCount = await gieTheme.count()
  console.log(`Theme "gie и ge" matches: ${gieCount}`)

  // Assert: no locked themes should be visible (Polish themes)
  expect(lockCount).toBe(0)

  await page.screenshot({ path: 'tests/screenshots/polish-themes-unlock-v3.png', fullPage: true })
})