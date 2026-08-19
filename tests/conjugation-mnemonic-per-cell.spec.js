// Playwright coverage for per-cell conjugation mnemonics on
// ConjugationExercise (/learn and /training).
//
// Pins the contract the user asked for:
//   "mnemonics in training sessions are verb wide but should be
//    applied only to a specific exercise (for theme 1 french
//    it's pronoun + verb)"
//
// Asserts the full round-trip:
//   1. The 000_bootstrap.sql migration creates
//      user_conjugation_mnemonic outside the DROP block so user
//      customizations survive every apply (same pattern as
//      user_conjugation_prompt_override).
//   2. PUT /api/conjugation-mnemonics upserts a per-cell mnemonic
//      keyed by (theme, verb, pronoun, lang).
//   3. GET /api/courses/all rehydrates
//      conjugationMnemonicsByTheme[themeId][infinitive][pronounIdx]
//      with the override, so ConjugationExercise reads it without a
//      second round-trip.
//   4. Cell-level override isolation: writing a mnemonic for
//      pronoun_idx=0 must NOT bleed into pronoun_idx=1 (per-cell,
//      not per-verb).
//   5. Lang scoping: a mnemonic for the same cell in two native
//      langs must not bleed across the bundle (the prompt-override
//      lang-isolation fix from PR-37 applies symmetrically here).
//   6. ConjugationExercise surfaces a click-to-edit mnemonic box
//      that lets the user write a per-cell hint, and the resolved
//      hint at render time reflects the per-cell value.

import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const REGISTER_URL = 'http://localhost:3000/api/auth/register'

async function registerAndPinPack(request, page) {
  const email = `mnem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.local`
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

test('migration separates predefined conjugation data from per-cell user mnemonics', () => {
  // The user table must exist in the canonical seed AND must NOT
  // sit inside the DROP block — that block wipes reference data on
  // every apply and would clobber user customizations. Mirrors the
  // PR-36 prompt-override contract.
  const sql = readFileSync(
    join(__dirname, '..', 'server', 'src', 'db', 'migrations', '000_bootstrap.sql'),
    'utf8'
  )
  expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS user_conjugation_mnemonic/)
  const dropBlock = sql.split('===== USER SCHEMA')[0]
  expect(dropBlock).not.toMatch(/user_conjugation_mnemonic/)

  // Schema-only cutover file must also carry the table so legacy
  // DBs gain it during the cutover (same mirror used for
  // user_conjugation_prompt_override).
  const schemaOnly = readFileSync(
    join(__dirname, '..', 'server', 'src', 'db', 'migrations', '_schema_only.sql'),
    'utf8'
  )
  expect(schemaOnly).toMatch(/CREATE TABLE IF NOT EXISTS user_conjugation_mnemonic/)
})

test('PUT /api/conjugation-mnemonics upserts and bundle rehydrates per-cell mnemonic', async ({ page, request }) => {
  const { accessToken } = await registerAndPinPack(request, page)

  // Use a marker the seed never contains so we can detect the
  // override in the bundle. The seed for fr_theme01/achever is the
  // default ru conjugation table; we override the "I finish" cell
  // (pronoun_idx=0).
  const customText = 'завершаю_МНЕМОНИК_ТЕСТ'
  const put = await request.put(
    'http://localhost:3000/api/conjugation-mnemonics/fr_theme01/achever/0?lang=ru',
    {
      headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },
      data: { text: customText },
    }
  )
  expect(put.ok()).toBe(true)
  const putJson = await put.json()
  expect(putJson.text).toBe(customText)

  // Re-fetch /api/courses/all and assert the override shows up
  // under conjugationMnemonicsByTheme.
  const bundle = await request.get('http://localhost:3000/api/courses/all?native_lang=ru', {
    headers: { authorization: `Bearer ${accessToken}` },
  })
  expect(bundle.ok()).toBe(true)
  const data = await bundle.json()
  const fr = data.fr || data
  const cellMap = fr.conjugationMnemonicsByTheme?.fr_theme01?.achever
  expect(cellMap).toBeDefined()
  expect(cellMap['0']).toBe(customText)

  // Per-cell, not per-verb: pronoun_idx=1 must NOT be set.
  expect(cellMap['1']).toBeUndefined()

  // Cleanup so the test is idempotent.
  await request.delete(
    'http://localhost:3000/api/conjugation-mnemonics/fr_theme01/achever/0?lang=ru',
    { headers: { authorization: `Bearer ${accessToken}` } }
  )
})

test('per-cell mnemonics are filtered by nativeLang (lang isolation, mirrors PR-37 fix)', async ({ page, request }) => {
  const { accessToken } = await registerAndPinPack(request, page)

  // Same cell, two langs. The same lang-isolation invariant that
  // applies to user_conjugation_prompt_override applies here: a
  // user with overrides in two native langs would otherwise see the
  // wrong-language row overwrite the right one in the in-memory
  // map.
  const ruText = 'завершаю_LANG_RU'
  const enText = 'I finish_LANG_EN'

  const putRu = await request.put(
    'http://localhost:3000/api/conjugation-mnemonics/fr_theme01/achever/0?lang=ru',
    {
      headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },
      data: { text: ruText },
    }
  )
  expect(putRu.ok()).toBe(true)

  const putEn = await request.put(
    'http://localhost:3000/api/conjugation-mnemonics/fr_theme01/achever/0?lang=en',
    {
      headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },
      data: { text: enText },
    }
  )
  expect(putEn.ok()).toBe(true)

  // Bundle for native_lang=ru: the ru row must win, the en marker
  // must NOT bleed into the ru bundle.
  const ruBundle = await request.get('http://localhost:3000/api/courses/all?native_lang=ru', {
    headers: { authorization: `Bearer ${accessToken}` },
  })
  expect(ruBundle.ok()).toBe(true)
  const ruData = await ruBundle.json()
  const ruAsString = JSON.stringify(ruData)
  expect(ruAsString).toContain(ruText)
  expect(ruAsString).not.toContain(enText)

  // Cleanup.
  await request.delete(
    'http://localhost:3000/api/conjugation-mnemonics/fr_theme01/achever/0?lang=ru',
    { headers: { authorization: `Bearer ${accessToken}` } }
  )
  await request.delete(
    'http://localhost:3000/api/conjugation-mnemonics/fr_theme01/achever/0?lang=en',
    { headers: { authorization: `Bearer ${accessToken}` } }
  )
})

test('ConjugationExercise editor accepts and renders a per-cell mnemonic', async ({ page, request }) => {
  const { accessToken } = await registerAndPinPack(request, page)

  // The first card in a fresh session is "parler/0" (je parle).
  // Write a per-cell mnemonic for that exact (theme, verb,
  // pronoun) tuple so the reveal side renders our marker.
  const customText = 'говорю_RENDER_ТЕСТ'
  const put = await request.put(
    'http://localhost:3000/api/conjugation-mnemonics/fr_theme01/parler/0?lang=ru',
    {
      headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },
      data: { text: customText },
    }
  )
  expect(put.ok()).toBe(true)

  // /learn/fr_theme01 drills the conjugation cards in the canonical seed.
  await page.goto('/learn/fr_theme01')
  await page.waitForLoadState('networkidle')

  // Click past the pre-session "GO" so ConjugationSession mounts.
  const goButton = page.getByRole('button', { name: /^\s*GO\s*$/i })
  await goButton.click({ timeout: 5000 })
  await page.waitForLoadState('networkidle')

  // Reveal the first card so the mnemonic section renders.
  const reveal = page.getByRole('button', {
    name: /нажмите, чтобы открыть|показать|reveal|révéler|pokaż|odkryj/i,
  }).first()
  if (await reveal.isVisible().catch(() => false)) {
    await reveal.click()
  }

  // The per-cell mnemonic must render in the "MEMORY HOOK" card.
  // The "Подсказка для запоминания" header is locale-stable enough
  // (Russian for the ru/ru UI used in this test) — we match by
  // the marker text directly since the marker is unique.
  await expect(page.getByText(customText).first()).toBeVisible({ timeout: 5000 })

  // Cleanup.
  await request.delete(
    'http://localhost:3000/api/conjugation-mnemonics/fr_theme01/parler/0?lang=ru',
    { headers: { authorization: `Bearer ${accessToken}` } }
  )
})

test('ConjugationExercise clearing a per-cell mnemonic immediately hides the stale cell value', async ({ page, request }) => {
  const { accessToken } = await registerAndPinPack(request, page)

  const customText = 'говорю_CLEAR_ТЕСТ'
  const put = await request.put(
    'http://localhost:3000/api/conjugation-mnemonics/fr_theme01/parler/0?lang=ru',
    {
      headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },
      data: { text: customText },
    }
  )
  expect(put.ok()).toBe(true)

  await page.goto('/learn/fr_theme01')
  await page.waitForLoadState('networkidle')

  await page.getByRole('button', { name: /^\s*GO\s*$/i }).click({ timeout: 5000 })
  await page.waitForLoadState('networkidle')

  const reveal = page.getByRole('button', {
    name: /нажмите, чтобы открыть|показать|reveal|révéler|pokaż|odkryj/i,
  }).first()
  if (await reveal.isVisible().catch(() => false)) {
    await reveal.click()
  }

  await expect(page.getByText(customText).first()).toBeVisible({ timeout: 5000 })

  await page.getByText(customText).first().click()
  const editor = page.getByRole('textbox').last()
  await editor.fill('')
  await page.getByRole('button', { name: /сохранить мнемонику|save mnemonic|enregistrer|zapisz/i }).click()

  await expect(page.getByText(customText).first()).toBeHidden({ timeout: 5000 })

  const get = await request.get('http://localhost:3000/api/conjugation-mnemonics', {
    headers: { authorization: `Bearer ${accessToken}` },
  })
  expect(get.ok()).toBe(true)
  const rows = await get.json()
  expect(rows.some(row =>
    row.theme_id === 'fr_theme01' &&
    row.infinitive === 'parler' &&
    row.pronoun_idx === 0 &&
    row.lang === 'ru'
  )).toBe(false)
})
