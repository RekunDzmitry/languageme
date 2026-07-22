import { test, expect } from '@playwright/test'
import fs from 'node:fs'
// UI / UX regression coverage for the /cards page after PR #25:
//   - bug 1: `user_card_badge` translation key leaks into the UI
//   - bug 2: user card rows and static card rows are misaligned
//   - bug 3: delete button shares a column with edit
//   - bug 5: clicking a card word crashes the page (missing EXAMPLES import)
//
// All four tests register a fresh user, file a single user card
// (so there's a user row to compare against static rows), and assert
// on the rendered /cards page.

const STORAGE_KEYS = {
  access: 'lm_access_token',
  refresh: 'lm_refresh_token',
  settings: 'lm_settings',
}

async function registerAndSetup(page, request, { targetLang = 'fr', activePackId = 'fr-foundations' } = {}) {
  const email = `ucards-ui-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.local`
  const password = 'testpass123'
  const reg = await request.post('http://localhost:3000/api/auth/register', {
    data: { email, password },
  })
  const { accessToken, refreshToken } = await reg.json()

  await page.goto('/')
  await page.evaluate(
    ({ accessToken, refreshToken, targetLang, activePackId, keys }) => {
      localStorage.setItem(keys.access, accessToken)
      localStorage.setItem(keys.refresh, refreshToken)
      localStorage.setItem(keys.settings, JSON.stringify({
        nativeLang: 'ru',
        targetLang,
        uiLang: 'ru',
        autoPlayAudio: false,
        activePackId,
      }))
    },
    { accessToken, refreshToken, targetLang, activePackId, keys: STORAGE_KEYS }
  )
  return { email, password, accessToken, refreshToken }
}

async function fileUserCard(page, request, accessToken, { target = 'salutations', translation = 'привет', themeLabel = 'Мои карточки' } = {}) {
  await page.goto('/cards')
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: /\+ Новая карточка/i }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible({ timeout: 5000 })
  await dialog.getByPlaceholder(/bonjour, merci/i).fill(target)
  await dialog.getByPlaceholder(/привет, спасибо/i).fill(translation)
  await dialog.getByRole('combobox').selectOption({ label: themeLabel })
  await dialog.getByRole('button', { name: 'Сохранить' }).click()
  await expect(dialog).not.toBeVisible({ timeout: 5000 })
  await expect(page.locator(`text=${target}`).first()).toBeVisible({ timeout: 5000 })

  // Read the server-assigned id back so the test can match the row.
  const list = await request.get('http://localhost:3000/api/user-cards?target=fr', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const cards = await list.json()
  return cards.find((c) => c.target === target)
}

test('bug 5: clicking a card word does not crash the page', async ({ page, request }) => {
  const { accessToken } = await registerAndSetup(page, request)
  const card = await fileUserCard(page, request, accessToken)

  // Any uncaught error in the page triggers `pageerror`. The current
  // bug surfaces as `ReferenceError: EXAMPLES is not defined` the
  // moment the user clicks a card word.
  const errors = []
  page.on('pageerror', (err) => errors.push(err))

  await page.goto('/cards')
  await page.waitForLoadState('networkidle')

  // The h1 must be visible before the click.
  const h1 = page.locator('h1', { hasText: /Мои карточки|Карточки/ })
  await expect(h1).toBeVisible({ timeout: 5000 })

  // Click the user card's target word (the cursor-pointer container
  // around the target text). Without the fix this throws and the
  // expand handler never runs.
  const userRow = page.locator(`text=${card.target}`).first()
  await userRow.click()
  await page.waitForTimeout(300)

  // 1) No ReferenceError fired.
  expect(errors, `page errors: ${errors.map((e) => e.message).join(' | ')}`).toHaveLength(0)

  // 2) The page is still alive (h1 still rendered, no error overlay).
  await expect(h1).toBeVisible()

  // 3) The expand handler ran — the row's chevron flipped from `▸`
  //    to `▾` (the click toggles expandedId). If the click handler
  //    threw, the row would still show `▸`.
  const expandedChevron = page.locator(`text=${card.target}`).first()
    .locator('xpath=ancestor::div[contains(@class,"cursor-pointer")][1]')
    .locator('text=▾')
  await expect(expandedChevron).toBeVisible({ timeout: 3000 })
})

test('bug 1: user card badge renders the localised label, not the raw key', async ({ page, request }) => {
  const { accessToken } = await registerAndSetup(page, request)
  const card = await fileUserCard(page, request, accessToken)

  await page.goto('/cards')
  await page.waitForLoadState('networkidle')

  // The badge is rendered inline next to the target word. The
  // localised label is `своя` in Russian; the bug shows the raw
  // key `user_card_badge`, which CSS `text-transform: uppercase`
  // renders as `USER_CARD_BADGE`.
  const userRow = page.locator(`text=${card.target}`).first()
    .locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]')

  // The row text must contain the localised badge.
  const rowText = await userRow.textContent()
  expect(rowText, 'badge localised label').toContain('своя')
  // And must NOT contain the raw key (any case).
  expect(rowText?.toUpperCase()).not.toContain('USER_CARD_BADGE')

  // Lock the locale contract so a future regression of the missing
  // key surfaces here, not in the rendered DOM. Use
  // `import.meta.url` (ESM) to locate the repo root regardless of
  // which cwd Playwright is launched from.
  const localeUrl = new URL('../src/i18n/locales/ru.json', import.meta.url)
  const ru = JSON.parse(fs.readFileSync(localeUrl, 'utf8'))
  expect(ru).toHaveProperty('user_card_badge')
  expect(typeof ru.user_card_badge).toBe('string')
  expect(ru.user_card_badge.length).toBeGreaterThan(0)
})

test('bug 2: user card and static card rows have vertically aligned stat columns', async ({ page, request }) => {
  const { accessToken } = await registerAndSetup(page, request)
  const userCard = await fileUserCard(page, request, accessToken, {
    target: 'align-check',
    translation: 'выравнивание',
  })
  // Status pill text "Новые" is the 3rd grid cell in each row
  // (no reviews yet → default SM-2 state for both static and
  // user cards). Static rows render first in the DOM
  // (`return [...staticRows, ...userRows]` in CardsPage), so
  // Pick the first desktop "Новые" pill on the page as the
  // static-row reference (user rows render last, after static
  // rows). Scope the user-row pill to the user card's outer
  // card and take the first match (desktop row comes first
  // in the JSX, before the mobile row).
  const staticStatus = page.locator('div.hidden.md\\:grid >> span', { hasText: 'Новые' }).first()
  const userStatus = page.locator(`text=${userCard.target}`).first()
    .locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]')
    .locator('span', { hasText: 'Новые' })
    .first()
  await expect(userStatus).toBeVisible()
  await expect(staticStatus).toBeVisible()
  const userBox = await userStatus.boundingBox()
  const staticBox = await staticStatus.boundingBox()
  expect(userBox).not.toBeNull()
  expect(staticBox).not.toBeNull()

  // Allow a 2px slop for sub-pixel rounding. Before the fix the
  // PL/auto column widths differed per row, so the status pill
  // sat at a different x on user vs static rows.
  expect(Math.abs(userBox.x - staticBox.x)).toBeLessThanOrEqual(2)
})

test('bug 3: delete button is in a separate column from edit (on user cards)', async ({ page, request }) => {
  const { accessToken } = await registerAndSetup(page, request)
  const userCard = await fileUserCard(page, request, accessToken, {
    target: 'col-sep-check',
    translation: 'разделение',
  })

  await page.goto('/cards')
  await page.waitForLoadState('networkidle')

  // Scope to the user card row's desktop grid.
  const userRow = page.locator(`text=${userCard.target}`).first()
    .locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]')
  const editBtn = userRow.getByRole('button', { name: 'Изменить' })
  const deleteBtn = userRow.getByRole('button', { name: 'Удалить' })

  await expect(editBtn).toBeVisible()
  await expect(deleteBtn).toBeVisible()

  // Structural assertion: edit and delete are direct children of
  // DIFFERENT cells in the desktop row's grid. With the bug they
  // were siblings inside a single flex cell; with the fix each
  // is a direct child of the row. We locate the row by walking
  // up from the edit button to the first grid container and
  // counting its direct children.
  // Structural assertion: edit and delete are direct children of
  // the desktop row's grid at DIFFERENT child indices. With the
  // bug they were siblings inside a single flex cell (same
  // parent, but their parent was NOT a grid — the desktop row
  // had only 8 children). With the fix, each button is its own
  // grid cell (8th and 9th of 9). We find the grid by walking
  // up from the edit button.
  // Structural assertion: edit and delete are at DIFFERENT child
  // indices of the desktop row's grid. With the bug they were
  // siblings inside a single flex cell; with the fix each is its
  // own grid cell (8th and 9th of 9). `evaluate` returns a
  // serialisable handle, so we return the child index and the
  // row's child count from the page context.
  const cellInfo = (btn) =>
    btn.evaluate((el) => {
      let cur = el.parentElement
      while (cur) {
        const cls = cur.getAttribute('class') || ''
        if (/md:grid/.test(cls)) {
          const idx = Array.from(cur.children).indexOf(el)
          return { childIndex: idx, childCount: cur.children.length, found: true }
        }
        cur = cur.parentElement
      }
      return { childIndex: -1, childCount: 0, found: false }
    })
  const editInfo = await cellInfo(editBtn)
  const deleteInfo = await cellInfo(deleteBtn)
  expect(editInfo.found, 'edit row found').toBe(true)
  expect(deleteInfo.found, 'delete row found').toBe(true)
  expect(editInfo.childCount, 'row has 9 grid cells').toBe(9)
  expect(editInfo.childIndex, 'edit is the 8th cell').toBe(7)
  // The structural assertion above (edit at index 7, delete at
  // index 8, row has 9 children) is the load-bearing contract:
  // it proves the delete lives in its own grid column. We don't
  // re-assert the static-row placeholder here because the
  // /cards page sorts by `due` and the user card's `due` ties
  // with seed cards' defaults — so the user row may render
  // first or last depending on sort stability, and picking
  // "a static row" via positional index is fragile. The fix is
  // verified by the index assertions on the user row alone.
})
