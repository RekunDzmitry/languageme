import { test, expect } from '@playwright/test'

// End-to-end coverage for the user-authored flashcards feature
// (migration 025 + /api/user-cards + CardsPage modal + study loop).
// The test exercises the full happy path: register, create a card,
// edit it, study it, delete it — and asserts the srs_card row lives
// only as long as the user card. Also verifies the pack-scoped
// catch-all (migration 026): a card filed while the fr-foundations
// pack is active lands in fr-foundations_other, not the legacy
// per-language fr_other.

test('user can create, edit, study, and delete a personal flashcard, tied to the active pack', async ({ page, request }) => {
  const email = `ucards-${Date.now()}@test.local`
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
      autoPlayAudio: false,
      // Pin the active pack so the pack-scoped catch-all is the
      // one the modal offers. (Otherwise the test would be
      // sensitive to the user's saved settings.)
      activePackId: 'fr-foundations',
    }))
  }, { accessToken, refreshToken })

  // ---- CREATE ----
  await page.goto('/cards')
  await page.waitForLoadState('networkidle')

  await page.getByRole('button', { name: /\+ Новая карточка/i }).click()

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible({ timeout: 5000 })

  await dialog.getByPlaceholder(/bonjour, merci/i).fill('salutations')
  await dialog.getByPlaceholder(/привет, спасибо/i).fill('привет')

  // Theme defaults to the pack-scoped catch-all (fr-foundations_other)
  // — the "Other" option in the modal. Lock it explicitly so the
  // test is robust to default changes.
  const themeSelect = dialog.getByRole('combobox')
  await themeSelect.selectOption({ label: 'Мои карточки' })

  await dialog.getByRole('button', { name: 'Сохранить' }).click()

  await expect(dialog).not.toBeVisible({ timeout: 5000 })
  await expect(page.locator('text=salutations').first()).toBeVisible({ timeout: 5000 })

  // ---- Server-side sanity ----
  const list1 = await request.get('http://localhost:3000/api/user-cards?target=fr', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const cards = await list1.json()
  expect(cards).toHaveLength(1)
  expect(cards[0].target).toBe('salutations')
  // The critical assertion for the bug fix: the card is filed under
  // the pack-scoped catch-all, NOT the per-language legacy one.
  expect(cards[0].themeId).toBe('fr-foundations_other')
  const cardId = cards[0].id
  expect(cardId).toMatch(/^usr_[0-9a-f]{32}$/)

  const srs1 = await request.get('http://localhost:3000/api/study/cards?target=fr', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const srsRows = await srs1.json()
  const srsMatch = srsRows.find((r) => r.vocab_id === cardId)
  expect(srsMatch, 'srs_card row should exist for new user card').toBeTruthy()
  expect(srsMatch.reps).toBe(0)

  // ---- EDIT ----
  await page.getByRole('button', { name: 'Изменить' }).first().click()
  await expect(dialog).toBeVisible({ timeout: 5000 })
  await dialog.getByPlaceholder(/привет, спасибо/i).fill('формальное приветствие')
  await dialog.locator('textarea').fill('подсказка для теста')
  await dialog.getByRole('button', { name: 'Сохранить' }).click()


  await expect(page.locator('text=формальное приветствие').first()).toBeVisible({ timeout: 5000 })

  // ---- STUDY (pack-scoped catch-all route) ----
  await page.goto('/study/fr-foundations_other')
  await page.waitForLoadState('networkidle')

  await expect(page.locator('text=нажмите, чтобы открыть').first()).toBeVisible({ timeout: 8000 })
  const front = await page.textContent('body')
  expect(front).toContain('формальное приветствие')

  await page.getByRole('button', { name: /нажмите, чтобы открыть/ }).click()
  await page.waitForTimeout(300)
  const back = await page.textContent('body')
  expect(back).toContain('salutations')
  expect(back).toContain('подсказка для теста')

  await page.getByRole('button', { name: 'Хорошо' }).click()
  await page.waitForTimeout(500)

  const srs2 = await request.get('http://localhost:3000/api/study/cards?target=fr', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const srsRows2 = await srs2.json()
  const srsAfter = srsRows2.find((r) => r.vocab_id === cardId)
  expect(srsAfter.reps).toBe(1)

  // ---- DELETE ----
  await page.goto('/cards')
  await page.waitForLoadState('networkidle')

  page.on('dialog', (d) => d.accept())
  await page.getByRole('button', { name: 'Удалить' }).first().click()

  await expect(page.locator('text=подсказка для теста')).toHaveCount(0, { timeout: 5000 })

  const srs3 = await request.get('http://localhost:3000/api/study/cards?target=fr', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const srsRows3 = await srs3.json()
  expect(srsRows3.find((r) => r.vocab_id === cardId)).toBeUndefined()

  const list2 = await request.get('http://localhost:3000/api/user-cards?target=fr', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  expect((await list2.json())).toEqual([])

  // Identity-safety: the server rejects an id with a non-usr_ prefix
  // even for the caller's own (non-existent) row.
  const badPatch = await request.patch('http://localhost:3000/api/user-cards/fr_001', {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: { translation: 'hijack' },
  })
  expect(badPatch.status()).toBe(404)
})

// Cross-pack isolation: a card filed under one pack's catch-all
// must not surface in another pack's catch-all section. This is the
// specific behaviour the user asked for in the bug report.
test('user card is isolated to the pack it was filed under', async ({ page, request }) => {
  const email = `ucards-iso-${Date.now()}@test.local`
  const password = 'testpass123'

  const reg = await request.post('http://localhost:3000/api/auth/register', {
    data: { email, password },
  })
  const { accessToken, refreshToken } = await reg.json()

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

  // File a card while pl-a1-a2 is the active pack.
  await page.goto('/cards')
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: /\+ Новая карточка/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
  await page.getByRole('dialog').getByPlaceholder(/bonjour, merci/i).fill('a1-word')
  await page.getByRole('dialog').getByPlaceholder(/привет, спасибо/i).fill('слово A1')
  await page.getByRole('dialog').getByRole('combobox').selectOption({ label: 'Мои карточки' })
  await page.getByRole('dialog').getByRole('button', { name: 'Сохранить' }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })

  // The card's themeId must be the pl-a1-a2 catch-all, not pl_other
  // (the per-language legacy id) and not pl-telc_other.
  const list = await request.get('http://localhost:3000/api/user-cards?target=pl', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const cards = await list.json()
  expect(cards).toHaveLength(1)
  expect(cards[0].themeId).toBe('pl-a1-a2_other')

  // Navigate to the pl-telc pack's catch-all route. The card should
  // NOT be in the study queue there.
  await page.goto('/study/pl-telc_other')
  await page.waitForLoadState('networkidle')
  // The pl-telc_other study session should be empty (no user cards
  // filed under it, and no static cards either). The "all caught up"
  // empty state is rendered.
  await expect(page.getByText(/Всё повторено|Занятие окончено/).first()).toBeVisible({ timeout: 8000 })
})
