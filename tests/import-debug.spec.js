import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const TEST_EMAIL = 'rekundzmitry@gmail.com';
const TEST_PASSWORD = '111111';

test('debug import flow step by step', async ({ page }) => {
  page.on('response', async response => {
    if (response.url().includes('/api/import')) {
      const status = response.status();
      let body;
      try { body = await response.json(); } catch { body = 'non-json'; }
      console.log(`IMPORT API ${status}:`, JSON.stringify(body));
    }
  });

  page.on('console', msg => console.log(`BROWSER [${msg.type()}]:`, msg.text()));

  // Login
  await page.goto('/auth');
  await page.locator('input[type="email"]').fill(TEST_EMAIL);
  await page.locator('input[type="password"]').fill(TEST_PASSWORD);
  await page.locator('button:has-text("Войти")').click();
  await page.waitForURL(url => !url.pathname.includes('/auth'), { timeout: 10000 });
  await page.waitForTimeout(3000);

  // Create a test backup file with conjugation cards
  const testBackup = {
    meta: { version: 1, app: 'languageme', exportedAt: new Date().toISOString(), email: TEST_EMAIL },
    srsCards: [],
    themeProgress: [],
    mnemonics: [],
    conjugationCards: {
      'conj:parler:pr:0': { ease: 2.5, interval: 1, reps: 2, due: Date.now() - 10000, lastReviewed: Date.now() - 86400000 },
      'conj:parler:pr:1': { ease: 2.6, interval: 3, reps: 3, due: Date.now() + 86400000, lastReviewed: Date.now() - 86400000 },
      'conj:aimer:pr:0': { ease: 2.5, interval: 1, reps: 1, due: Date.now() - 10000, lastReviewed: Date.now() - 86400000 },
    },
  };
  const tmpFile = '/tmp/test-backup.json';
  fs.writeFileSync(tmpFile, JSON.stringify(testBackup));

  // Directly set the file on the hidden input to avoid filechooser issues
  const fileInput = page.locator('input[type="file"][accept=".json"]').first();
  await fileInput.setInputFiles(tmpFile);

  // Wait for import to process
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tests/screenshots/import-result.png' });

  // Check toast
  const toastExists = await page.locator('.fixed.bottom-4').isVisible().catch(() => false);
  if (toastExists) {
    const toastText = await page.locator('.fixed.bottom-4').textContent();
    console.log('Toast:', toastText);
  } else {
    console.log('No toast visible');
  }

  // Check localStorage
  const result = await page.evaluate(() => {
    const raw = localStorage.getItem('lm_progress');
    const p = raw ? JSON.parse(raw) : {};
    return {
      conjugationCardsCount: Object.keys(p.conjugationCards || {}).length,
      conjugationCards: p.conjugationCards || {},
    };
  });
  console.log('After import - conjugation cards:', result.conjugationCardsCount);
  console.log('Keys:', Object.keys(result.conjugationCards));

  // Check training page
  await page.goto('/training');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'tests/screenshots/training-after-import.png', fullPage: true });
  const trainingText = await page.locator('body').innerText();
  console.log('Training:', trainingText.substring(0, 400));
});
