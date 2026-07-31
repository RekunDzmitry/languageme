import { test, expect } from '@playwright/test'
import { API_URL, registerUser, authenticatePage, createUserCard } from './helpers/env.js'

// Regression tests for the defects found reviewing the
// user-authored-cards branch (b8da0db). Every test in this file is
// expected to FAIL against b8da0db — each one pins a specific defect
// so the fix has something to turn green.
//
// Run against an isolated stack so the default 5173/3000 pair stays
// free for other work:
//   docker compose -p lmreview -f docker-compose.review.yml up -d
//   PW_BASE_URL=http://localhost:5273 PW_API_URL=http://localhost:3100 \
//     npx playwright test tests/review-findings.spec.js

// ---------------------------------------------------------------------------
// Finding 1 — migration 025 made srs_card.target_lang NOT NULL, but
// routes/migrate.js:30 and routes/import.js:91 still INSERT without it.
// Every localStorage import now dies on a not-null violation.
// ---------------------------------------------------------------------------

test('finding 1: POST /api/migrate/import still works after srs_card.target_lang became NOT NULL', async ({ request }) => {
  const { accessToken } = await registerUser(request, 'f1-migrate')

  const res = await request.post(`${API_URL}/api/migrate/import`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: {
      srsCards: {
        fr_001: { ease: 2.5, interval: 1, reps: 2, due: Date.now(), lastReviewed: Date.now() },
      },
      themeProgress: {},
      userMnemonics: {},
      stats: {},
    },
  })

  expect(
    res.status(),
    `import returned ${res.status()}: ${await res.text()}`,
  ).toBe(200)

  // And the row must actually be readable back, with target_lang
  // derived from the fr_ prefix (otherwise /api/study/cards, which
  // now filters on target_lang, silently returns nothing).
  const cards = await request.get(`${API_URL}/api/study/cards?target=fr`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  expect(cards.ok()).toBe(true)
  const rows = await cards.json()
  expect(
    rows.map((r) => r.vocab_id),
    'imported card must be visible to /api/study/cards',
  ).toContain('fr_001')
})

// ---------------------------------------------------------------------------
// Finding 2 — LearnPage builds its study pool from static VOCAB only. It
// never reads `userVocab`, so a user-authored card is unreachable from
// /learn, which is the primary study entry point for the Polish packs.
//
// Scoped to the pack catch-all theme so the assertion is deterministic:
// that theme has no seed vocab, so the session queue is exactly the set
// of user cards filed under it.
// ---------------------------------------------------------------------------

test('finding 2: a user-authored card is reachable from /learn', async ({ page, request }) => {
  const tokens = await registerUser(request, 'f2-learn')
  const card = await createUserCard(request, tokens.accessToken, {
    targetLang: 'pl',
    target: 'niespodzianka',
    translation: 'СЮРПРИЗ-F2',
    themeId: 'pl-a1-a2_other',
  })
  expect(card.themeId).toBe('pl-a1-a2_other')

  await authenticatePage(page, tokens)
  await page.goto('/learn/pl-a1-a2_other')
  await page.waitForLoadState('networkidle')

  // The flashcard front shows the native-language translation.
  await expect(
    page.getByText('СЮРПРИЗ-F2', { exact: false }),
    'user card should be in the /learn queue, but LearnPage never reads userVocab',
  ).toBeVisible({ timeout: 10000 })
})

// ---------------------------------------------------------------------------
// Finding 3 — CardsPage scopes user cards with
// `activeThemeIds + <pack>_other + LEGACY_OTHER_THEME_IDS[lang]`
// (CardsPage.jsx:85-89), but StudyPage only adds `<pack>_other`
// (StudyPage.jsx:41) and LearnPage adds neither. A card created between
// migrations 025 and 026 — filed under the legacy `pl_other` — is
// therefore listed forever on /cards but has no study route at all.
//
// This stays red even after finding 2 is fixed: adding `<pack>_other`
// to the study scope does not pick up `pl_other`.
// ---------------------------------------------------------------------------

test('finding 3: a legacy pl_other card is listed on /cards AND reachable from study', async ({ page, request }) => {
  const tokens = await registerUser(request, 'f3-legacy')
  const card = await createUserCard(request, tokens.accessToken, {
    targetLang: 'pl',
    target: 'przedawniony',
    translation: 'УСТАРЕВШИЙ-F3',
    themeId: 'pl_other',
  })
  expect(card.themeId, 'card must be filed under the legacy catch-all').toBe('pl_other')

  await authenticatePage(page, tokens)

  // Half one: it shows up in the card list. This half passes today.
  await page.goto('/cards')
  await page.waitForLoadState('networkidle')
  await expect(
    page.getByText('УСТАРЕВШИЙ-F3', { exact: false }).first(),
    'legacy card should be listed on /cards',
  ).toBeVisible({ timeout: 10000 })

  // Half two: the active pack's study session must be able to reach it.
  // This half fails — the legacy id is absent from every study scope.
  await page.goto('/learn/pl-a1-a2_other')
  await page.waitForLoadState('networkidle')
  await expect(
    page.getByText('УСТАРЕВШИЙ-F3', { exact: false }),
    'legacy card is visible on /cards but unreachable from any study route',
  ).toBeVisible({ timeout: 10000 })
})

// ---------------------------------------------------------------------------
// Finding 4 — routes/userCards.js:24-37 `resolveThemeId` runs its query
// on `pool` while POST / and PATCH /:id already hold a checked-out
// `client` inside an open transaction. Each in-flight request therefore
// needs TWO connections. Once concurrency reaches the pool size (pg
// defaults to max: 10 and server/src/db/pool.js sets no override), every
// request holds one connection and waits for a second that can never be
// freed — a self-deadlock that hangs until the client times out.
// ---------------------------------------------------------------------------

test('finding 4: concurrent card creation does not deadlock on the connection pool', async ({ request }) => {
  const { accessToken } = await registerUser(request, 'f4-pool')

  // Comfortably above pg's default pool max of 10.
  const CONCURRENCY = 16

  const results = await Promise.all(
    Array.from({ length: CONCURRENCY }, (_, i) =>
      request.post(`${API_URL}/api/user-cards`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: {
          targetLang: 'pl',
          target: `rownolegly-${i}`,
          translation: `ПАРАЛЛЕЛЬНО-${i}`,
          themeId: 'pl-a1-a2_other',
        },
        timeout: 15000,
      }).then(
        (r) => r.status(),
        (err) => `threw: ${err.message.split('\n')[0]}`,
      ),
    ),
  )

  expect(
    results.filter((s) => s !== 201).length,
    `non-201 results: ${JSON.stringify(results)}`,
  ).toBe(0)
})
