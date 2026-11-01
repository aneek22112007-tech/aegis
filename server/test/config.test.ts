import { describe, expect, it } from 'vitest';
import { isPayPalConfigured, loadConfig } from '../src/config.js';

describe('loadConfig', () => {
  it('uses safe defaults when the environment is empty', () => {
    const config = loadConfig({});
    expect(config.port).toBe(8787);
    expect(config.paypal.env).toBe('sandbox');
    expect(config.xai.baseUrl).toBe('https://api.x.ai/v1');
    expect(config.xai.model).toBe('grok-4');
    expect(isPayPalConfigured(config)).toBe(false);
  });

  it('rejects a negative hold timeout', () => {
    expect(() => loadConfig({ HOLD_TIMEOUT_MS: '-5' })).toThrow(/HOLD_TIMEOUT_MS/);
  });

  it('treats live as the only non-sandbox PayPal environment', () => {
    expect(loadConfig({ PAYPAL_ENV: 'live' }).paypal.env).toBe('live');
    expect(loadConfig({ PAYPAL_ENV: 'sandbox' }).paypal.env).toBe('sandbox');
  });
});
