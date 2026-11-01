export type AppConfig = {
  port: number;
  webOrigin: string;
  databaseUrl: string;
  holdTimeoutMs: number;
  paypal: {
    clientId: string;
    clientSecret: string;
    webhookId: string;
    env: 'sandbox' | 'live';
  };
  xai: {
    apiKey: string;
    model: string;
    baseUrl: string;
  };
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const paypalEnv = env.PAYPAL_ENV === 'live' ? 'live' : 'sandbox';
  return {
    port: readNumber(env.PORT, 8787, 'PORT'),
    webOrigin: env.WEB_ORIGIN || 'http://localhost:5173',
    databaseUrl: env.DATABASE_URL || 'file:./dev.db',
    holdTimeoutMs: readNumber(env.HOLD_TIMEOUT_MS, 15 * 60 * 1000, 'HOLD_TIMEOUT_MS'),
    paypal: {
      clientId: env.PAYPAL_CLIENT_ID || '',
      clientSecret: env.PAYPAL_CLIENT_SECRET || '',
      webhookId: env.PAYPAL_WEBHOOK_ID || '',
      env: paypalEnv,
    },
    xai: {
      apiKey: env.XAI_API_KEY || '',
      model: env.XAI_MODEL || 'grok-4',
      baseUrl: 'https://api.x.ai/v1',
    },
  };
}

function readNumber(raw: string | undefined, fallback: number, name: string): number {
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a non-negative number`);
  }
  return value;
}

export function isPayPalConfigured(config: AppConfig): boolean {
  return Boolean(config.paypal.clientId && config.paypal.clientSecret);
}
