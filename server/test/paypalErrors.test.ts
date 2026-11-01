import { describe, expect, it } from 'vitest';
import { mapPayPalFailure } from '../src/paypal/errors.js';

describe('mapPayPalFailure', () => {
  it('maps a declined instrument to a calm message', () => {
    const error = mapPayPalFailure(422, { details: [{ issue: 'INSTRUMENT_DECLINED' }] });
    expect(error.code).toBe('INSTRUMENT_DECLINED');
    expect(error.message).toMatch(/declined/i);
    expect(error.retryable).toBe(false);
  });

  it('treats PayPal outages as retryable', () => {
    const error = mapPayPalFailure(503, { name: 'INTERNAL_SERVER_ERROR' });
    expect(error.retryable).toBe(true);
    expect(error.message).toMatch(/no money was sent/i);
  });
});
