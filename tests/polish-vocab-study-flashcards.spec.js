import { test, expect } from '@playwright/test'

test('clicking Start on Polish vocab theme opens flashcard study session', async ({ page, request }) => {
  const email = `pl-study-${Date.now()}@test.local`
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
      targetLang: 'pl',
      uiLang: 'ru',
      autoPlayAudio: false,
    }))
  }, { accessToken, refreshToken })

  await page.goto('/training')
  await page.waitForLoadState('networkidle')

  const pracaCard = page.locator('text=Работа и карьера').first()
  await expect(pracaCard).toBeVisible()
  await pracaCard.click()

  const startBtn = page.getByRole('button', { name: 'Начать тренировку' }).first()
  await expect(startBtn).toBeVisible()
  await startBtn.click()

  await page.waitForURL(/\/training\/pl_theme10/)
  await expect(page.locator('text=нажмите, чтобы открыть')).toBeVisible({ timeout: 5000 })

  // Front should show Russian translation, not the Polish target word
  const ruTranslations = ['работа', 'профессия', 'специалист', 'карьера', 'резюме']
  const polishWords = ['praca', 'zawód', 'specjalista', 'kariera', 'CV']

  const front = await page.textContent('body')
  const ruFound = ruTranslations.some(w => front.toLowerCase().includes(w))
  expect(ruFound, `front should show a Russian translation: ${ruTranslations.join(', ')}`).toBe(true)

  // Click the reveal button → answer should show the Polish target word
  await page.getByRole('button', { name: 'нажмите, чтобы открыть →' }).click()
  await page.waitForTimeout(300)
  const back = await page.textContent('body')
  const plFound = polishWords.some(w => back.includes(w))
  expect(plFound, `revealed answer should show a Polish word: ${polishWords.join(', ')}`).toBe(true)
  await expect(page.getByRole('button', { name: 'Легко' })).toBeVisible()

  await page.screenshot({ path: 'tests/screenshots/polish-study-praca.png', fullPage: true })
})
