// Smoke test: prove that http://localhost:5173 is genuinely serving a working
// React app (not just a 200 with a blank body), that the SPA hydrates, and
// that the admin panel route is reachable for the seeded admin user.
//
// Run with: npx playwright test tests/smoke-localhost.spec.js

import { expect, test } from '@playwright/test'

const ADMIN_EMAIL = 'rekundzmitry@gmail.com'
const ADMIN_PASSWORD = 'testpass123'

test('localhost:5173 serves a working React app', async ({ page }) => {
  const consoleErrors = []
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(`console.error: ${m.text().slice(0, 200)}`)
  })

  // 1. Homepage loads
  const response = await page.goto('/', { waitUntil: 'networkidle' })
  expect(response, 'no response for /').not.toBeNull()
  expect(response.status(), 'GET / should be 200').toBe(200)

  // 2. HTML head
  await expect(page).toHaveTitle(/LanguageMe/i)

  // 3. React mounted: root has children
  await expect.poll(async () => {
    return page.evaluate(() => document.getElementById('root')?.children.length ?? 0)
  }, { timeout: 10_000, message: 'React did not mount' }).toBeGreaterThan(0)

  // 4. Navbar shows the brand
  await expect(page.getByText('LanguageMe').first()).toBeVisible()

  // 5. Login as admin
  await page.goto('/auth')
  await page.getByPlaceholder(/email/i).fill(ADMIN_EMAIL)
  await page.locator('input[type=password]').fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: 'Войти', exact: true }).click()
  // After login we get redirected to "/"
  await page.waitForURL('/', { timeout: 10_000 })

  // 6. Admin link visible in navbar (desktop layout has md:flex)
  const adminLink = page.locator('a[href="/admin"]').first()
  await expect(adminLink, 'Admin link should be visible for admin user').toBeVisible({ timeout: 5_000 })

  // 7. Admin page actually loads
  await adminLink.click()
  await page.waitForURL('/admin', { timeout: 5_000 })
  await expect(page.getByRole('heading', { name: /панель|panel|админ/i })).toBeVisible()

  // 8. Sandbox tab is reachable (scope: tab buttons only)
  await page.getByRole('button', { name: 'Песочница', exact: true }).click()
  await expect(page.getByText(/системный|prompt/i).first()).toBeVisible()

  // 9. No JS errors during the run
  const fatal = consoleErrors.filter(
    (e) => !/HMR|favicon|webSocket|WebSocket|DevTools|409 \(Conflict\)|status of 409/i.test(e)
  )
  expect(fatal, `console errors: ${fatal.join('\n')}`).toEqual([])
})
