import { test, expect } from '@playwright/test'

// Regression coverage for /learn (pl) including user-authored
// cards. The /learn route for Polish renders <StudySession> with
// a pool of vocabulary to drill. `StudyPage` (/study/:themeId)
// correctly builds that pool as `[...staticVocab, ...userVocab
// filtered by scope]`, but `LearnPage` was building it from
// static VOCAB only — so a user card filed in the active pack's
// catch-all (`pl-a1-a2_other`) never appeared in the un-scoped
// /learn session. The user reported this when they created a
// card in pl-a1-a2 and saw only the first seed card on /learn.

test('user-authored card surfaces first in /learn for the active pack (pl)', async ({ page, request }) => {
  const email = `ucards-learn-${Date.now()}@test.local`
  const password = 'testpass123'

  const reg = await request.post('http://localhost:3000/api/auth/register', {
    data: { email, password },
  })
  const { accessToken, refreshToken } = await reg.json()

  // Pin the active pack so the pack-scoped catch-all is the one
  // the modal offers, mirroring the other user-cards tests.
  await page.goto('/')
  await page.evaluate(({ accessToken, refreshToken }) => {
    localStorage.setItem('lm_access_token', accessToken)
    localStorage.setItem('lm_refresh_token', refreshToken)
    localStorage.setItem('lm_settings', JSON.stringify({
      nativeLang: 'ru',
      targetLang: 'pl',
      uiLang: 'ru',
      autoPlayAudio: false,
      activePackId: 'pl-a1-a2',
    }))
  }, { accessToken, refreshToken })

  // File a user card while pl-a1-a2 is the active pack. The card
  // lands in the pack-scoped catch-all `pl-a1-a2_other`.
  await page.goto('/cards')
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: /\+ Новая карточка/i }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible({ timeout: 5000 })
  // Use positional locators instead of placeholder text — the
  // placeholders differ by targetLang (pl uses "Słowo / fraza",
  // fr uses "bonjour, merci…"), so the first two `<input>`s in
  // the modal are language-agnostic.
  await dialog.locator('input').first().fill('test')
  await dialog.locator('input').nth(1).fill('тест')
  await dialog.getByRole('combobox').selectOption({ label: 'Мои карточки' })
  await dialog.getByRole('button', { name: 'Сохранить' }).click()
  await expect(dialog).not.toBeVisible({ timeout: 5000 })

  // Navigate to the un-scoped /learn route for the active pack.
  // With the bug, the user card is not in the pool and the first
  // card is a seed card (not 'тест'). After the fix, the user
  // card is in the pool and wins the due-priority, so the first
  // card's front shows 'тест'.
  await page.goto('/learn')
  await page.waitForLoadState('networkidle')
  await expect(page.getByText(/нажмите, чтобы открыть/).first()).toBeVisible({ timeout: 8000 })
  const front = await page.textContent('body')
  expect(front, 'first card front should be the user card translation').toContain('тест')
})
