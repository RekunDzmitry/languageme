// User-specified behavioral tests for the polish themes reorganization.
//
// These tests codify what the user sees in the UI after the three
// reorganization commits are applied. They focus on rendered output,
// not on DB internals — the user's spec is the rendered list.
//
// User's spec (from the latest message):
//   1. /themes for polish A1/A2 should display themes
//      "Глаголы на -m и вежливое обращение" and
//      "Глаголы 2-го спряжения и существительные мужского рода"
//      with numbers 1 and 2.
//   2. /training for polish A1/A2 should display
//      "Cwiczenia 0/0" and "Email 0/0". "Słowa - 2 themes" mentioned.
//   3. Cwiczenia for polish TELC should display these themes:
//        Правописание: ó и u
//        Правописание: диграфы (cz, dz, dz, dz, ch, rz, sz)
//        Правописание: мягкость согласных (kreska vs i)
//        Правописание: z и rz
//        Правописание: ch и h
//        Правописание: ż и rz
//        Правописание: gie и ge
//        Правописание: носовые e, a и сочетания en/em/on/om
//        Правописание: прописные и строчные буквы
//        E-mail: структура и фразы
//   2. /training for polish A1/A2 should display
//      "Ćwiczenia 0/0" and "Email 0/0". "Słowa - 2 themes" mentioned.
//        Работа и карьера
//        Образование и обучение
//        Охрана окружающей среды и парниковый эффект
//        Стихийные катастрофы
//   3. Ćwiczenia for polish TELC should display these themes:
//        Цифровой номадизм
//        Конструкции с падежами
//        Социальные сети
//        Мы и медиа

import { test, expect } from '@playwright/test'

const ORTHOGRAPHY_THEMES = [
  'Правописание: ó и u',
  'Правописание: диграфы',
  'Правописание: мягкость согласных',
  'Правописание: ż и rz',
  'Правописание: ch и h',
  'Правописание: j и i',
  'Правописание: gie и ge',
  'Правописание: носовые',
  'Правописание: прописные',
  'E-mail: структура и фразы',
]

const VOCAB_GRAMMAR_THEMES = [
  'Работа и карьера',
  'Образование и обучение',
  'Охрана окружающей среды',
  'Стихийные катастрофы',
  'Мусор, отходы',
  'Цифровой номадизм',
  'Конструкции с падежами',
  'Социальные сети',
  'Мы и медиа',
]

const A1A2_THEMES = [
  'Глаголы на -m и вежливое обращение',
  'Глаголы 2-го спряжения',
]

// A theme card in /themes uses .bg-surface > .w-10.h-10 (the badge)
// A theme card in /training uses .bg-surface + font-mono span (theme.order.)
async function loginAsPack(page, request, suffix, packId) {
  const email = `pl-${suffix}-${Date.now()}@test.local`
  const password = 'testpass123'
  const reg = await request.post('http://localhost:3000/api/auth/register', {
    data: { email, password },
  })
  expect(reg.ok(), 'register should succeed').toBe(true)
  const { accessToken, refreshToken } = await reg.json()
  await page.goto('/')
  await page.evaluate(
    ({ accessToken, refreshToken, packId }) => {
      localStorage.setItem('lm_access_token', accessToken)
      localStorage.setItem('lm_refresh_token', refreshToken)
      localStorage.setItem('lm_settings', JSON.stringify({
        nativeLang: 'ru',
        targetLang: 'pl',
        uiLang: 'ru',
        autoPlayAudio: false,
        activePackId: packId,
      }))
    },
    { accessToken, refreshToken, packId },
  )
}

test.describe('Polish themes reorganization - rendered UI', () => {
  test('/themes for PL_A1/A2 shows 2 cards (theme 20 + theme 21) numbered 1 and 2', async ({
    page,
    request,
  }) => {
    await loginAsPack(page, request, 'a1a2-themes', 'pl-a1-a2')
    await page.goto('/themes')
    await page.waitForLoadState('networkidle')

    // ThemesListPage renders the order as a badge: <div class="w-10 h-10 ...">{theme.order}</div>
    const numberBadges = page.locator('.bg-surface .w-10.h-10')
    await expect(numberBadges).toHaveCount(2)

    const badgeTexts = (await numberBadges.allInnerTexts()).map((t) => t.trim())
    expect(badgeTexts).toEqual(['1', '2'])

    const pageText = await page.locator('body').innerText()
    for (const theme of A1A2_THEMES) {
      expect(pageText, `/themes (pl-a1-a2) should include "${theme}"`).toContain(theme)
    }
    // Telc-only themes should NOT appear in a1/a2
    for (const theme of [...ORTHOGRAPHY_THEMES, ...VOCAB_GRAMMAR_THEMES]) {
      expect(pageText, `/themes (pl-a1-a2) should NOT include "${theme}"`).not.toContain(theme)
    }
  })

  test('/training for PL_A1/A2 shows Ćwiczenia 0/0 and Email 0/0; Słowa shows 2 themes (even with user-authored write_answer drills on theme 20/21)', async ({
    page,
    request,
  }) => {
    await loginAsPack(page, request, 'a1a2-training', 'pl-a1-a2')
    // Pre-seed a user-authored write_answer drill on pl_theme20. In the
    // PL_A1_A2 pack themes 20/21 are vocab-only, so this drill must NOT
    // make Ćwiczenia jump from 0/0 to 0/1 (that's the bug this test pins).
    const ls = await page.evaluate(() => ({
      at: localStorage.getItem('lm_access_token'),
      rt: localStorage.getItem('lm_refresh_token'),
    }))
    const seedRes = await request.post('http://localhost:3000/api/email/add-exercise', {
      headers: { Authorization: `Bearer ${ls.at}` },
      data: {
        targetWord: 'rozumiem',
        translation: 'я понимаю',
        themeId: 'pl_theme20',
      },
    })
    expect(seedRes.ok(), 'seed user exercise should succeed').toBe(true)

    await page.goto('/training')
    await page.waitForLoadState('networkidle')

    // Tab buttons: <button><span>Ćwiczenia</span><span>0/0</span></button>
    const cwiczeniaTab = page.getByRole('button', { name: /Ćwiczenia/i }).first()
    await expect(cwiczeniaTab).toBeVisible()
    await expect(cwiczeniaTab).toContainText('0/0')

    const emailTab = page.getByRole('button', { name: /Email/ }).first()
    await expect(emailTab).toBeVisible()
    await expect(emailTab).toContainText('0/0')

    // Switch to Słowa and confirm both A1/A2 themes render.
    const slowaTab = page.getByRole('button', { name: /Słowa/ }).first()
    await expect(slowaTab).toBeVisible()
    await slowaTab.click()
    await page.waitForTimeout(500)

    // TrainingPage renders theme cards with <span class="font-mono">N.</span>
    const slowaNumbers = page.locator('.bg-surface .font-mono')
    await expect(slowaNumbers).toHaveCount(2)

    const slowaPageText = await page.locator('body').innerText()
    for (const theme of A1A2_THEMES) {
      expect(slowaPageText, `Słowa (pl-a1-a2) should include "${theme}"`).toContain(theme)
    }
  })

  test('Cwiczenia for PL_TELC shows exactly the 10 orthography + email themes (user-authored write_answer drills on Słowa themes do not leak in)', async ({
    page,
    request,
  }) => {
    await loginAsPack(page, request, 'telc-cwiczenia', 'pl-telc')
    // Pre-seed a user-authored write_answer drill on a Słowa-only theme
    // (theme 10, "Работа и карьера"). The PL_TELC Cwiczenia contract is
    // "the 10 seeded orthography+email themes only" — this drill must
    // surface under the catch-all "Moje ćwiczenia" theme, NOT get
    // injected into the Słowa theme and break the 10-card contract.
    const ls = await page.evaluate(() => ({
      at: localStorage.getItem('lm_access_token'),
      rt: localStorage.getItem('lm_refresh_token'),
    }))
    const seedRes = await request.post('http://localhost:3000/api/email/add-exercise', {
      headers: { Authorization: `Bearer ${ls.at}` },
      data: {
        targetWord: 'praca',
        translation: 'работа',
        themeId: 'pl_theme10',
      },
    })
    expect(seedRes.ok(), 'seed user exercise should succeed').toBe(true)

    await page.goto('/training')
    await page.waitForLoadState('networkidle')

    const cwiczeniaTab = page.getByRole('button', { name: /Ćwiczenia/i }).first()
    await expect(cwiczeniaTab).toBeVisible()
    await cwiczeniaTab.click()
    await page.waitForTimeout(500)

    // TrainingPage renders theme cards with <span class="font-mono">N.</span>
    // The 10 seeded theme cards are still present (the user drill did
    // not get injected into theme 10). The catch-all "Moje ćwiczenia"
    // card carries the user drill.
    const cards = page.locator('.bg-surface .font-mono')
    await expect(cards).toHaveCount(11)

    const pageText = await page.locator('body').innerText()
    for (const theme of ORTHOGRAPHY_THEMES) {
      expect(pageText, `Cwiczenia (pl-telc) should include "${theme}"`).toContain(theme)
    }
    // The Słowa-only theme 10 must NOT have been promoted into Cwiczenia
    // (it would be a 11th card BEFORE the catch-all). Use a more specific
    // check: the page text should not show theme 10's display number
    // adjacent to its title in the Cwiczenia list. The catch-all uses
    // order: "★" instead of a number.
    const slowaLeaked = await page
      .locator('.bg-surface')
      .filter({ hasText: 'Работа и карьера' })
      .count()
    expect(slowaLeaked, 'theme 10 should not appear as a Cwiczenia card').toBe(0)
  })

  test('Słowa for PL_TELC shows exactly the 9 vocab/grammar themes', async ({
    page,
    request,
  }) => {
    await loginAsPack(page, request, 'telc-slowa', 'pl-telc')
    await page.goto('/training')
    await page.waitForLoadState('networkidle')

    const slowaTab = page.getByRole('button', { name: /Słowa/ }).first()
    await expect(slowaTab).toBeVisible()
    await slowaTab.click()
    await page.waitForTimeout(500)

    // 9 theme cards.
    const cards = page.locator('.bg-surface .font-mono')
    await expect(cards).toHaveCount(9)

    const pageText = await page.locator('body').innerText()
    for (const theme of VOCAB_GRAMMAR_THEMES) {
      expect(pageText, `Słowa (pl-telc) should include "${theme}"`).toContain(theme)
    }
  })
})