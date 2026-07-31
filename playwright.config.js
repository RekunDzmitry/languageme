import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    // Overridable so the suite can run against an isolated stack
    // (see docker-compose.review.yml) without stopping whatever is
    // already bound to the default 5173/3000 pair.
    baseURL: process.env.PW_BASE_URL || 'http://localhost:5173',
    headless: true,
    screenshot: 'on',
  },
});
