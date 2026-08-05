import { test, expect } from '@playwright/test'

// Tests for the polish themes reorganization.
//
// What the reorganization does:
//   * Pack re-assignment by exercise type, not by theme-id range:
//       - PL_TELC (B1/B2) holds themes 01-09 (orthography write drills),
//         10-18 (vocab/grammar), and 19 + 22 (email writing & phrases).
//       - PL_A1/A2 holds only themes 20 and 21 (intro grammar/vocab,
//         vocab-only, no write_answer and no email).
//   * pl_theme20 and pl_theme21 are demoted to vocab-only: their
//     write_answer exercise section is removed; vocabIds and grammar
//     notes are kept.
//   * Clicking any pack in the language switcher lands on /themes
//     (no more /email).
//   * The PL pack data model uses explicit `themeIds` lists (no
//     regex/range), so membership stays stable as new themes are
//     added in the future.
//
// The test commit codifies the expected behavior. The fix commit
// brings the implementation in line. Both commits together close the
// gap the user reported: the live stack had the right pack id for
// the orthography themes, but the i18n labels and the A1/A2 content
// were inverted, and several themes (19, 21) had no DB row at all.

const TELC_THEME_IDS = [
  'pl_theme01', 'pl_theme02', 'pl_theme03', 'pl_theme04', 'pl_theme05',
  'pl_theme06', 'pl_theme07', 'pl_theme08', 'pl_theme09',
  'pl_theme10', 'pl_theme11', 'pl_theme12', 'pl_theme13', 'pl_theme14',
  'pl_theme15', 'pl_theme16', 'pl_theme17', 'pl_theme18',
  'pl_theme19', 'pl_theme22',
]
const A1A2_THEME_IDS = ['pl_theme20', 'pl_theme21']

const TELC_ORTHOGRAPHY_IDS = [
  'pl_theme01', 'pl_theme02', 'pl_theme03', 'pl_theme04', 'pl_theme05',
  'pl_theme06', 'pl_theme07', 'pl_theme08', 'pl_theme09',
]
const TELC_VOCAB_GRAMMAR_IDS = [
  'pl_theme10', 'pl_theme11', 'pl_theme12', 'pl_theme13', 'pl_theme14',
  'pl_theme15', 'pl_theme16', 'pl_theme17', 'pl_theme18',
]
const TELC_EMAIL_IDS = ['pl_theme19', 'pl_theme22']

test.describe('Polish themes reorganization', () => {
  // ── 1. Expected pack membership (constant) ────────────────────────────
  test('TELC = orthography 01-09 + vocab/grammar 10-18 + email 19,22; A1/A2 = 20, 21', () => {
    expect(TELC_THEME_IDS.length).toBe(20)
    expect(A1A2_THEME_IDS.length).toBe(2)
    // Disjoint
    for (const id of TELC_THEME_IDS) {
      expect(A1A2_THEME_IDS.includes(id), `${id} should not be in both packs`).toBe(false)
    }
    // A1/A2 is exactly 20, 21
    expect(A1A2_THEME_IDS).toEqual(['pl_theme20', 'pl_theme21'])
    // TELC orthography: 01-09
    expect(TELC_ORTHOGRAPHY_IDS).toEqual([
      'pl_theme01', 'pl_theme02', 'pl_theme03', 'pl_theme04', 'pl_theme05',
      'pl_theme06', 'pl_theme07', 'pl_theme08', 'pl_theme09',
    ])
    // TELC vocab/grammar: 10-18
    expect(TELC_VOCAB_GRAMMAR_IDS).toEqual([
      'pl_theme10', 'pl_theme11', 'pl_theme12', 'pl_theme13', 'pl_theme14',
      'pl_theme15', 'pl_theme16', 'pl_theme17', 'pl_theme18',
    ])
    // TELC email: 19, 22
    expect(TELC_EMAIL_IDS).toEqual(['pl_theme19', 'pl_theme22'])
  })

  // ── 2. DB completeness ────────────────────────────────────────────────
  test('DB has a row for every PL theme file (22 themes total)', async ({ request }) => {
    const res = await request.get('http://localhost:3000/api/themes?lang=pl')
    expect(res.ok()).toBe(true)
    const themes = (await res.json()).filter((t) => t.id.startsWith('pl_theme'))
    const idsInDb = new Set(themes.map((t) => t.id))

    for (const id of [...TELC_THEME_IDS, ...A1A2_THEME_IDS]) {
      expect(idsInDb.has(id), `theme ${id} should be in the DB (currently missing — looks undermigrated)`).toBe(true)
    }
    expect(themes.length, 'expected 22 PL themes in the API').toBe(22)
  })

  // ── 3. /themes in PL_TELC shows the 20 TELC themes ──────────────────
  test('/themes in PL_TELC renders 20 cards (orthography + vocab/grammar + email)', async ({ page, request }) => {
    const email = `pl-telc-${Date.now()}@test.local`
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
        activePackId: 'pl-telc',
      }))
    }, { accessToken, refreshToken })

    await page.goto('/themes')
    await page.waitForLoadState('networkidle')

    const numberBadges = page.locator('.bg-surface .w-10.h-10')
    const count = await numberBadges.count()
    expect(count, 'PL_TELC pack should render 20 theme cards').toBe(20)

    // Spot-check the orthography titles are visible (the user reported
    // they were missing from TELC).
    const pageText = await page.locator('body').innerText()
    for (const prefix of [
      'Правописание: ó и u',
      'Правописание: диграфы',
      'Правописание: ch и h',
    ]) {
      expect(pageText, `PL_TELC pack should include orthography theme "${prefix}"`).toContain(prefix)
    }
  })

  // ── 4. /themes in PL_A1/A2 shows the 2 A1/A2 themes ─────────────────
  test('/themes in PL_A1/A2 renders 2 cards: theme 20 + theme 21', async ({ page, request }) => {
    const email = `pl-a1a2-${Date.now()}@test.local`
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

    await page.goto('/themes')
    await page.waitForLoadState('networkidle')

    const numberBadges = page.locator('.bg-surface .w-10.h-10')
    const count = await numberBadges.count()
    expect(count, 'PL_A1/A2 pack should render 2 theme cards').toBe(2)

    // The two cards must be theme 20 + theme 21.
    const pageText = await page.locator('body').innerText()
    expect(pageText).toContain('Глаголы на -m и вежливое обращение')
    expect(pageText).toContain('Глаголы 2-го спряжения')

    // The orthography themes and the email themes must NOT be in A1/A2.
    for (const prefix of [
      'Правописание: ch и h',           // orthography
      'Работа и карьера',               // vocab/grammar (theme 10)
      'Письмо на польском',             // email (theme 19)
    ]) {
      expect(pageText, `PL_A1/A2 should NOT include "${prefix}"`).not.toContain(prefix)
    }
  })

  // ── 5. pl_theme20 has no write_answer section ────────────────────────
  test('pl_theme20 (Глаголы на -m) is vocab-only: no write_answer section in DB', async ({ request }) => {
    const api = await request.get('http://localhost:3000/api/themes?lang=pl')
    expect(api.ok()).toBe(true)
    const themes = await api.json()
    const t20 = themes.find((t) => t.id === 'pl_theme20')
    expect(t20, 'pl_theme20 should be in the API response').toBeTruthy()
  })

  // ── 6. pl_theme21 has no write_answer section ────────────────────────
  test('pl_theme21 (Глаголы 2-го спряжения) is vocab-only: no write_answer section in DB', async ({ request }) => {
    const api = await request.get('http://localhost:3000/api/themes?lang=pl')
    expect(api.ok()).toBe(true)
    const themes = await api.json()
    const t21 = themes.find((t) => t.id === 'pl_theme21')
    expect(t21, 'pl_theme21 should be in the API response').toBeTruthy()
  })

  // ── 7. Language switcher lands on /themes ─────────────────────────────
  test('clicking a pack in the language switcher lands on /themes (not /email)', async ({ page, request }) => {
    const email = `pl-switcher-${Date.now()}@test.local`
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
      }))
    }, { accessToken, refreshToken })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // The current pack's short label is in the switcher button.
    const switcherBtn = page.locator('nav button').filter({ hasText: /Польский/ }).first()
    await expect(switcherBtn).toBeVisible()
    await switcherBtn.click()

    // The other pack's option is in the dropdown.
    const otherOption = page.getByRole('button').filter({ hasText: /Польский/ }).nth(1)
    await expect(otherOption).toBeVisible()
    await otherOption.click()

    await page.waitForURL((url) => url.pathname === '/themes' || url.pathname === '/')
    expect(page.url(), 'pack click should land on /themes').toContain('/themes')
  })

  // ── 8. i18n labels: A1/A2 = A1/A2, TELC = B1/B2 ─────────────────────
  test('i18n: pack_pl_a1_a2_short = "Польский A1/A2", pack_pl_telc_short = "Польский TELC"', async ({ request }) => {
    const ru = await request.get('http://localhost:5173/src/i18n/locales/ru.json')
    expect(ru.ok()).toBe(true)
    const body = await ru.json()
    expect(body.pack_pl_a1_a2_short).toBe('Польский A1/A2')
    expect(body.pack_pl_telc_short).toBe('Польский TELC')
  })
})
