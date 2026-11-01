import { defineConfig, devices } from '@playwright/test';

const serverPort = process.env.PORT || '8787';
const webOrigin = process.env.WEB_ORIGIN || 'http://127.0.0.1:5173';

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: webOrigin,
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'npm run dev -w server',
      url: `http://127.0.0.1:${serverPort}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...process.env,
        PORT: serverPort,
        DATABASE_URL: 'file:./e2e.db',
        PAYPAL_CLIENT_ID: '',
        PAYPAL_CLIENT_SECRET: '',
        XAI_API_KEY: '',
      },
    },
    {
      command: 'npm run dev -w web -- --host 127.0.0.1 --port 5173',
      url: webOrigin,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
