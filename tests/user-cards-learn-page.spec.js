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

  // Step 4: delete the card. The CardsPage delete button uses
  // window.confirm; auto-accept it. Then assert the row is gone
  // and the srs_card row is also gone (plan §Verification item 5).
  await page.goto('/cards')
  await page.waitForLoadState('networkidle')
  // /cards renders rows as <div class="grid"> (not <tr>). Find the
  // delete button in the same grid row as the word 'test'.
  const deleteBtn = page.getByRole('button', { name: 'Удалить' }).first()
  await expect(deleteBtn, 'user card delete button should be visible on /cards before delete').toBeVisible({ timeout: 5000 })
  // Confirm the row also contains the user card word.
  await expect(page.getByText('test', { exact: true }).first()).toBeVisible({ timeout: 5000 })
  // Capture srs_card count before delete for the regression check
  const srsBefore = await request.get('http://localhost:3000/api/study/cards?target=pl', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const srsBeforeRows = await srsBefore.json()
  const userCardSrsCount = srsBeforeRows.filter((r) => r.vocab_id?.startsWith('usr_')).length
  expect(userCardSrsCount, 'user card should have an srs_card row before delete').toBeGreaterThan(0)

  page.once('dialog', (d) => d.accept())
  await deleteBtn.click()
  await expect(page.getByRole('button', { name: 'Удалить' }), 'delete button should disappear after delete').toHaveCount(0, { timeout: 5000 })
  await expect(page.getByText('test', { exact: true }), 'user card word should disappear after delete').toHaveCount(0, { timeout: 5000 })

  const listAfter = await request.get('http://localhost:3000/api/user-cards?target=pl', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const cardsAfter = await listAfter.json()
  expect(cardsAfter, 'GET /api/user-cards should be empty after delete').toEqual([])

  const srsAfter = await request.get('http://localhost:3000/api/study/cards?target=pl', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const srsAfterRows = await srsAfter.json()
  const userCardSrsAfter = srsAfterRows.filter((r) => r.vocab_id?.startsWith('usr_')).length
  expect(userCardSrsAfter, 'srs_card row for the user card should be gone after delete').toBe(0)
})
