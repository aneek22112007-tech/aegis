import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.js';
import { createLivePayPalClient } from '../src/paypal/liveClient.js';

describe('live PayPal client', () => {
  it('creates an order with intent AUTHORIZE', async () => {
    const calls: Array<{ url: string; body: string }> = [];
    const fetchImpl = (async (url: string, init?: RequestInit) => {
      calls.push({ url, body: String(init?.body ?? '') });
      if (url.endsWith('/v1/oauth2/token')) {
        return new Response(JSON.stringify({ access_token: 'tok', expires_in: 300 }), {
          status: 200,
        });
      }
      return new Response(JSON.stringify({ id: 'ORDER-1', status: 'CREATED' }), { status: 201 });
    }) as typeof fetch;

    const config = loadConfig({
      PAYPAL_CLIENT_ID: 'client',
      PAYPAL_CLIENT_SECRET: 'secret',
      PAYPAL_ENV: 'sandbox',
    });
    const paypal = createLivePayPalClient(config, fetchImpl);
    const order = await paypal.createOrder({
      amount: '48.00',
      currency: 'USD',
      description: 'CVS Pharmacy',
    });
    expect(order.id).toBe('ORDER-1');
    const create = calls.find((call) => call.url.endsWith('/v2/checkout/orders'));
    expect(JSON.parse(create?.body ?? '{}').intent).toBe('AUTHORIZE');
    expect(calls[0]?.body).toBe('grant_type=client_credentials');
  });
});
