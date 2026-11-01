import { describe, expect, it } from 'vitest';
import { velocityRule } from '../src/risk/rules/velocity.js';
import { riskInput } from './riskFixture.js';

describe('velocityRule', () => {
  it('stays quiet for one or two payments', () => {
    expect(velocityRule(riskInput({ recentPaymentCount: 2 })).points).toBe(0);
  });

  it('adds a mid penalty at three payments in a day', () => {
    expect(velocityRule(riskInput({ recentPaymentCount: 3 })).points).toBe(10);
  });

  it('adds a high penalty at five payments in a day', () => {
    expect(velocityRule(riskInput({ recentPaymentCount: 5 })).points).toBe(20);
  });
});
