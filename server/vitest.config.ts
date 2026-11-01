import path from 'node:path';
import { defineConfig } from 'vitest/config';

const databaseUrl = `file:${path.resolve(import.meta.dirname, 'prisma/test.db')}`;

export default defineConfig({
  test: {
    environment: 'node',
    fileParallelism: false,
    globalSetup: './test/globalSetup.ts',
    setupFiles: ['./test/setup.ts'],
    env: {
      DATABASE_URL: databaseUrl,
      PAYPAL_ENV: 'sandbox',
      PAYPAL_CLIENT_ID: '',
      PAYPAL_CLIENT_SECRET: '',
      XAI_API_KEY: '',
      XAI_MODEL: 'grok-4',
      PORT: '8787',
      WEB_ORIGIN: 'http://localhost:5173',
      HOLD_TIMEOUT_MS: '900000',
    },
  },
});
