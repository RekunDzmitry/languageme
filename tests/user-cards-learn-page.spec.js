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
  expect(reg.ok()).toBe(true)
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
  await dialog.locator('input').first().fill('test')
  await dialog.locator('input').nth(1).fill('тест')
  await dialog.getByRole('combobox').selectOption({ label: 'Мои карточки' })
  await dialog.getByRole('button', { name: 'Сохранить' }).click()
  await expect(dialog).not.toBeVisible({ timeout: 5000 })
  await expect(page.locator('text=test').first()).toBeVisible({ timeout: 5000 })

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
// Regression for commit ee9160b: the refill effect was dropping
// the user card off the tail of the queue when userVocab was
// already loaded at lazy_init time (poolUsrCount > 0 at mount).
// The overflow calculation used queue.length as the cap and the
// tail-drop loop walked from queue[queue.length-1] back to
// queue[0], removing the user card from seenIdsRef and replacing
// the entire queue with seed cards from `missing`. The user card
// flashed for ~50ms then disappeared.
//
// The fix: early-return when no user cards in `missing`, and
// skip user cards in the tail-drop loop. Without the merge
// fix in fetchProgress, the test can't reproduce the bug
// scenario because the StudySession mounts with userVocab empty
// (the API response lands AFTER the StudySession's lazy_init).
// With the merge fix (next.userVocab = { ...prev.userVocab }),
// the API response can't clobber optimistic userVocab entries,
// and the test can wait for fetchProgress to populate userVocab
// before navigating to /learn.
test('refill effect preserves the user card when userVocab is loaded at mount (regression for ee9160b)', async ({ page, request }) => {
  const email = `refill-bug-${Date.now()}@test.local`
  const password = 'testpass123'

  const reg = await request.post('http://localhost:3000/api/auth/register', {
    data: { email, password },
  })
  expect(reg.ok()).toBe(true)
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

  // Create the user card via the API. With the merge fix in
  // fetchProgress, the next refresh populates userVocab with
  // this card without overwriting any optimistic entries.
  const createRes = await request.post('http://localhost:3000/api/user-cards', {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: { targetLang: 'pl', target: 'refillbug', translation: 'рефилбаг', themeId: 'pl-a1-a2_other' },
  })
  expect(createRes.ok()).toBe(true)
  const created = await createRes.json()
  expect(created.id).toMatch(/^usr_[0-9a-f]{32}$/)

  // Navigate to / to trigger fetchProgress on a fresh mount.
  // Wait for it to complete (userVocab now includes the user
  // card from the API).
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.waitForFunction(
    () => window.__userProgressIsProgressLoading === false,
    null,
    { timeout: 10000 }
  )

  // Navigate to /learn. The full page reload resets React state,
  // so fetchProgress runs again on the new mount. Wait for it
  // to complete so the StudySession's lazy_init runs with
  // userVocab populated (poolUsrCount > 0), placing the user
  // card at position 0 of the initial queue. This is the exact
  // scenario where the bug manifested: the refill effect then
  // ran, computed `missing` (all seed cards not in the queue,
  // user card NOT in missing because it's already there), and
  // the overflow loop walked from queue[9] back to queue[0],
  // deleting the user card from seenIdsRef and replacing the
  // entire queue with seed cards.
  await page.goto('/learn')
  await page.waitForLoadState('networkidle')
  await page.waitForFunction(
    () => window.__userProgressIsProgressLoading === false,
    null,
    { timeout: 10000 }
  )
  await expect(page.getByText(/нажмите, чтобы открыть/).first()).toBeVisible({ timeout: 8000 })

  // Initial render: user card is first because userVocab was
  // loaded at lazy_init time. Use a specific selector for the
  // first card's translation (not body text, which could
  // contain the user card's translation from other elements).
  const firstCardSelector = '.text-3xl.font-extrabold'
  await expect(page.locator(firstCardSelector).first()).toBeVisible({ timeout: 5000 })
  const firstCardInitial = (await page.locator(firstCardSelector).first().textContent()) ?? ''
  expect(firstCardInitial, 'first card should be the user card after initial render').toContain('рефилбаг')

  // Wait for the refill effect to run and re-render. The
  // refill effect fires in a useEffect with deps
  // [themeVocab, cards, sessionComplete]; it runs once on
  // mount with the initial values. 2s is enough for the
  // useEffect + re-render to settle.
  await page.waitForTimeout(2000)

  // After the refill effect has run, the user card should
  // STILL be the first card. With the bug, the refill effect
  // would have dropped it from the tail and replaced the queue
  // with seed cards, so the first card's translation would be
  // a seed card's translation (e.g., "да") instead of
  // "рефилбаг".
  const firstCardAfter = (await page.locator(firstCardSelector).first().textContent()) ?? ''
  expect(firstCardAfter, 'user card should still be first after refill effect runs (was dropped by overflow in ee9160b)').toContain('рефилбаг')
})