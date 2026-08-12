// Playwright coverage for the user-editable conjugation prompt on
// the ConjugationExercise (/learn) page. Pins the contract the user
// asked for:
//   "make prompt message for an user editable (make sure that
//    bootstrap sql in migrations correctly separates predefined
//    and customized parts for that case)"
//
// Asserts the full round-trip:
//   1. The 000_bootstrap.sql migration creates BOTH the reference
//      table (predefined seed: theme_conjugation) AND the user
//      override table (customized: user_conjugation_prompt_override),
//      and the override table sits outside the DROP block so user
//      customizations survive every apply.
//   2. PUT /api/conjugation-prompt-overrides upserts an override.
//   3. GET /api/courses/all rehydrates conjugationsByTheme with the
//      user override for the (theme, verb, pronoun_idx) tuple, so
//      the UI doesn't need to know the data came from the override
//      table rather than the seed.
//   4. The UI surfaces both the Notes pill (replacing the old AI
//      badge) and a click-to-edit prompt under it.

import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const REGISTER_URL = 'http://localhost:3000/api/auth/register'

async function registerAndPinPack(request, page) {
  const email = `cp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.local`
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

test('migration separates predefined conjugation data from user overrides', () => {
  // Server-side: the bootstrap must create BOTH the reference table
  // (predefined seed from theme_conjugation) AND the user override
  // table (customized rows from user_conjugation_prompt_override).
  // This guards the contract the user asked for explicitly.
  const sql = readFileSync(
    join(__dirname, '..', 'server', 'src', 'db', 'migrations', '000_bootstrap.sql'),
    'utf8'
  )
  expect(sql).toMatch(/CREATE TABLE theme_conjugation/)
  expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS user_conjugation_prompt_override/)
  // The user table must NOT be inside the DROP TABLE block at the top
  // of the bootstrap — that block wipes reference data on every apply
  // and would clobber user customizations.
  const dropBlock = sql.split('===== USER SCHEMA')[0]
  expect(dropBlock).not.toMatch(/user_conjugation_prompt_override/)
})

test('PUT /api/conjugation-prompt-overrides upserts and bundle rehydrates with override', async ({ page, request }) => {
  const { accessToken } = await registerAndPinPack(request, page)

  // Upsert a custom prompt for fr_theme01/achever/0/ru. The seed
  // says "завершаю"; we override with a marker the seed will never
  // contain so we can detect the override in the bundle.
  const customText = 'завершаю_ТЕСТОВЫЙ_ОВЕРРАЙД'
  const put = await request.put(
    'http://localhost:3000/api/conjugation-prompt-overrides/fr_theme01/achever/0?lang=ru',
    {
      headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },
      data: { text: customText },
    }
  )
  expect(put.ok()).toBe(true)
  const putJson = await put.json()
  expect(putJson.text).toBe(customText)

  // Re-fetch /api/courses/all and assert the override won over the
  // seed. The bundle rehydration is the contract the rest of the UI
  // reads from, so this is the meaningful behavior to pin.
  const bundle = await request.get('http://localhost:3000/api/courses/all?native_lang=ru', {
    headers: { authorization: `Bearer ${accessToken}` },
  })
  expect(bundle.ok()).toBe(true)
  const data = await bundle.json()
  const fr = data.fr || data
  const forms = fr.conjugationsByTheme?.fr_theme01?.achever
  expect(forms).toBeDefined()
  expect(forms[0]).toBe(customText)
  // Other cells must be untouched (the override is per-cell, not
  // whole-verb).
  expect(forms[1]).toBe('завершаешь')

  // Cleanup so the test is idempotent.
  await request.delete(
    'http://localhost:3000/api/conjugation-prompt-overrides/fr_theme01/achever/0?lang=ru',
    { headers: { authorization: `Bearer ${accessToken}` } }
  )
})

test('ConjugationExercise UI shows a Notes pill and an editable prompt', async ({ page, request }) => {
  await registerAndPinPack(request, page)
  // /learn/fr_theme01 drills the conjugation cards in the canonical seed.
  await page.goto('/learn/fr_theme01')
  await page.waitForLoadState('networkidle')

  // The Notes pill on the top-right (replaces the old AI badge).
  const notesPill = page.getByRole('button', { name: /notes/i }).first()
  await expect(notesPill).toBeVisible({ timeout: 5000 })

  // Reveal the first card so the prompt form part is rendered.
  const reveal = page.getByRole('button', { name: /показать|reveal|révéler/i }).first()
  if (await reveal.isVisible().catch(() => false)) {
    await reveal.click()
  }
  // Either way, the prompt must be a clickable affordance (not a
  // plain text node). The dotted underline is the visual cue.
  const editablePrompt = page.getByTitle(/изменить подсказку|edit conjugation prompt|modifier l'invite/i).first()
  await expect(editablePrompt).toBeVisible({ timeout: 5000 })
})
