import { describe, expect, it } from 'vitest';
import { newPayeeRule } from '../src/risk/rules/newPayee.js';
import { riskInput } from './riskFixture.js';

describe('newPayeeRule', () => {
  it('does not penalize a trusted payee', () => {
    expect(newPayeeRule(riskInput({ payeeStatus: 'trusted', amount: 900 })).points).toBe(0);
  });

  it('penalizes a new payee over the $500 wish', () => {
    const hit = newPayeeRule(riskInput({ amount: 650 }));
    expect(hit.points).toBe(42);
    expect(hit.reasons.join(' ')).toContain('$500');
  });

  it('uses only the base penalty when the new payee is under the limit', () => {
    expect(newPayeeRule(riskInput({ amount: 80 })).points).toBe(24);
  });
});
