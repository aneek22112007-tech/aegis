import { describe, expect, it } from 'vitest';
import { scamRule } from '../src/risk/rules/scam.js';
import { riskInput } from './riskFixture.js';

describe('scamRule', () => {
  it('scores the bail note and the officer name', () => {
    const hit = scamRule(
      riskInput({
        payeeName: 'Officer James',
        note: 'URGENT keep this secret, your grandson needs bail',
      }),
    );
    expect(hit.points).toBeGreaterThanOrEqual(48 + 18);
    expect(hit.reasons.join(' ')).toMatch(/official/i);
  });

  it('caps keyword points at 48 before impersonation', () => {
    const hit = scamRule(
      riskInput({
        payeeName: 'Sam',
        note: 'urgent secret bail grandson gift card wire transfer irs warrant arrest',
      }),
    );
    expect(hit.points).toBe(48);
  });

  it('does not flag an ordinary pharmacy note', () => {
    const hit = scamRule(
      riskInput({ payeeName: 'CVS Pharmacy', note: 'Prescription refill', payeeStatus: 'trusted' }),
    );
    expect(hit.points).toBe(0);
  });
});
