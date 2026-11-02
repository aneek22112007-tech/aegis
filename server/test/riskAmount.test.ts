import { describe, expect, it } from 'vitest';
import { amountRule } from '../src/risk/rules/amount.js';
import { riskInput } from './riskFixture.js';

describe('amountRule', () => {
  it('adds a heavy penalty above the single-payment limit', () => {
    const hit = amountRule(riskInput({ amount: 2500, recentPaymentTotal: 0 }));
    expect(hit.points).toBe(62);
    expect(hit.reasons.join(' ')).toContain('$2,000');
  });

  it('adds a smaller penalty near the single-payment limit', () => {
    expect(amountRule(riskInput({ amount: 1700 })).points).toBe(12);
  });

  it('adds nothing for an ordinary amount inside the daily limit', () => {
    expect(amountRule(riskInput({ amount: 48 })).points).toBe(0);
  });

  it('penalizes a payment that would break the daily limit', () => {
    const hit = amountRule(riskInput({ amount: 300, recentPaymentTotal: 1800 }));
    expect(hit.points).toBe(22);
  });
});
