import { describe, expect, it } from 'vitest';
import { createDemoPayPalClient } from '../src/paypal/demoClient.js';

describe('demo PayPal client', () => {
  it('authorizes, captures, and voids without a network call', async () => {
    const paypal = createDemoPayPalClient();
    const order = await paypal.createOrder({
      amount: '48.00',
      currency: 'USD',
      description: 'CVS',
    });
    const authorization = await paypal.authorizeOrder(order.id);
    const capture = await paypal.captureAuthorization(authorization.authorizationId);
    const voided = await paypal.voidAuthorization(authorization.authorizationId);
    expect(order.id).toMatch(/^DEMO-ORDER-/);
    expect(authorization.authorizationId).toContain(order.id);
    expect(capture.status).toBe('COMPLETED');
    expect(voided.status).toBe('VOIDED');
    expect(paypal.mode).toBe('demo');
  });

  it('accepts only the demo webhook signature', async () => {
    const paypal = createDemoPayPalClient();
    const base = {
      transmissionId: 'id',
      transmissionTime: 'time',
      certUrl: 'https://example.test/cert',
      authAlgo: 'SHA256withRSA',
      webhookId: 'hook',
      event: { id: 'evt' },
    };
    expect(await paypal.verifyWebhook({ ...base, transmissionSig: 'demo-valid' })).toBe(true);
    expect(await paypal.verifyWebhook({ ...base, transmissionSig: 'nope' })).toBe(false);
  });
});
