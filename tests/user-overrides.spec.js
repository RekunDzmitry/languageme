// Playwright coverage for the user-override surface on the
// Flashcard (study/learn), VocabCard (cards), and WriteAnswer
// (training) UI components.
//
// Pins the contract the user asked for:
//   "an user can be able to change a translation/expected answers
//    of vocab/write exercises in cards UI and in learning UI
//    (those changes should override prefilled translations then)"
//
// RED at landing: no edit control exists on any of the three
// surfaces, so the assertions below fail. GREEN once the UI
// commit lands and adds the override affordance.

import { test, expect } from '@playwright/test'

const REGISTER_URL = 'http://localhost:3000/api/auth/register'

async function registerAndPinPack(request, page) {
  const email = `ovr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.local`
  const password = 'testpass123'
  const reg = await request.post(REGISTER_URL, {
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
      targetLang: 'fr',
      uiLang: 'ru',
      autoPlayAudio: false,
      activePackId: 'fr-foundations',
    }))
  }, { accessToken, refreshToken })
  return { email, accessToken, refreshToken }
}

// ---------------------------------------------------------------------------
// VocabCard — /cards (the "Cards" page lists vocab from the active pack)
// ---------------------------------------------------------------------------

test('VocabCard exposes a "edit translation" control that overrides the seed translation', async ({ page, request }) => {
  await registerAndPinPack(request, page)
  await page.goto('/cards')
  await page.waitForLoadState('networkidle')

  // Click the first vocab card to expand it
  const firstCard = page.locator('text=/^bonjour$|^pénétrer$|fr_/').first()
  await firstCard.scrollIntoViewIfNeeded()
  await firstCard.click({ force: true }).catch(() => {})

  // Look for an edit control near the translation line.
  // The translation currently reads the seed value (e.g. "привет").
  // After the override, the displayed translation must change to the
  // user-typed text and survive a page reload.
  const editButton = page.getByRole('button', {
    name: /edit translation|изменить перевод|редактировать перевод/i,
  }).first()
  await expect(editButton).toBeVisible({ timeout: 5000 })

  await editButton.click()
  const input = page.getByRole('textbox').last()
  await input.fill('МОЁ_ЗНАЧЕНИЕ')
  await page.getByRole('button', { name: /save|сохранить/i }).first().click()

  // Reload — the override must persist
  await page.reload()
  await page.waitForLoadState('networkidle')
  await expect(page.locator('text=МОЁ_ЗНАЧЕНИЕ').first()).toBeVisible({ timeout: 5000 })
})

// ---------------------------------------------------------------------------
// Flashcard — /learn (the half-circle reveal card)
// ---------------------------------------------------------------------------

test('Flashcard shows an edit-translation affordance and the override wins over the seed', async ({ page, request }) => {
  await registerAndPinPack(request, page)
  await page.goto('/learn')
  await page.waitForLoadState('networkidle')

  // The first card needs a click to start. We rely on whatever the
  // page surfaces — typically a "Start" / "Reveal" button.
  const startOrReveal = page.getByRole('button', { name: /reveal|start|показать|начать/i }).first()
  if (await startOrReveal.isVisible().catch(() => false)) {
    await startOrReveal.click()
  }

  const editBtn = page.getByRole('button', {
    name: /edit translation|изменить перевод/i,
  }).first()
  await expect(editBtn).toBeVisible({ timeout: 5000 })
  await editBtn.click()
  const input = page.getByRole('textbox').last()
  await input.fill('FLASHCARD_OVERRIDE')
  await page.getByRole('button', { name: /save|сохранить/i }).first().click()

  // The card prompt (top of the reveal) should now read the override
  await expect(page.locator('text=FLASHCARD_OVERRIDE').first()).toBeVisible({ timeout: 5000 })
})

// ---------------------------------------------------------------------------
// WriteAnswer — /training (theme exercises)
// ---------------------------------------------------------------------------

test('WriteAnswer shows an edit-expected-answers affordance and the override wins over the seed', async ({ page, request }) => {
  await registerAndPinPack(request, page)
  // fr_theme01 has a write_answer exercise in the canonical seed.
  await page.goto('/training/fr_theme01')
  await page.waitForLoadState('networkidle')

  // Look for an "edit expected answer" button on the active exercise.
  const editBtn = page.getByRole('button', {
    name: /edit expected answer|изменить ожидаемый ответ|edit answer/i,
  }).first()
  await expect(editBtn).toBeVisible({ timeout: 5000 })
  await editBtn.click()

  const textbox = page.getByRole('textbox').last()
  await textbox.fill('!!!CUSTOM_EXPECTED!!!')
  await page.getByRole('button', { name: /save|сохранить/i }).first().click()

  // After the override, the "correct answer" reveal line should show
  // the user override when the exercise is completed.
  // We don't need to actually answer — just verify the override is
  // stored by reloading and ensuring the new expected answer is what
  // /api/courses/all now returns.
  const apiCheck = await page.evaluate(async () => {
    const r = await fetch('/api/courses/all?native_lang=ru', {
      headers: { authorization: `Bearer ${localStorage.getItem('lm_access_token')}` },
    })
    if (!r.ok) return null
    const bundle = await r.json()
    const fr = bundle.fr || bundle
    const theme = fr.themes.find(t => t.id === 'fr_theme01')
    if (!theme) return null
    const exSection = (theme.sections || []).find(s => s.type === 'exercises')
    if (!exSection) return null
    const ex0 = exSection.exercises?.[0]
    if (!ex0) return null
    if (Array.isArray(ex0.answers)) return ex0.answers
    return ex0.answer
  })
  expect(apiCheck).toBeTruthy()
  // The user override should be present in the response
  if (Array.isArray(apiCheck)) {
    expect(apiCheck.some(a => String(a).includes('!!!CUSTOM_EXPECTED!!!'))).toBe(true)
  } else {
    expect(String(apiCheck)).toContain('!!!CUSTOM_EXPECTED!!!')
  }
})
