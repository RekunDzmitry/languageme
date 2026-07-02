import { chromium } from 'playwright';

const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage();
page.on('pageerror', err => errors.push({ url: page.url(), msg: 'PAGEERROR: ' + err.message }));
page.on('console', msg => {
  if (msg.type() === 'error') {
    const text = msg.text();
    if (text.includes('Failed to load resource')) return; // 4xx API noise
    errors.push({ url: page.url(), msg: 'CONSOLE: ' + text });
  }
});

// Login
await page.goto('http://localhost:5173/auth');
await page.locator('input[type="email"]').fill('rekundzmitry@gmail.com');
await page.locator('input[type="password"]').fill('111111');
await page.locator('button:has-text("Войти")').click();
await page.waitForURL(url => !url.pathname.includes('/auth'), { timeout: 10000 });

const routes = ['/', '/themes', '/cards', '/training', '/learn', '/email'];
for (const route of routes) {
  try {
    await page.goto('http://localhost:5173' + route, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const visible = await page.locator('body').textContent();
    const hasError = /ReferenceError|TypeError|не найден|Something went wrong/i.test(visible);
    console.log(`${route}: ${hasError ? '❌ ERROR' : '✓ ok'} (${visible.length} chars)`);
    if (hasError) {
      console.log('  ', visible.substring(0, 200).replace(/\s+/g, ' '));
    }
  } catch (e) {
    console.log(`${route}: ❌ navigation failed: ${e.message}`);
  }
}

console.log('\nAll errors:');
errors.forEach(e => console.log(`  [${e.url}] ${e.msg.substring(0, 200)}`));

await browser.close();
