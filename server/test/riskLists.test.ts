import { describe, expect, it } from 'vitest';
import { matchesList } from '../src/risk/match.js';
import { listRule } from '../src/risk/rules/lists.js';
import { riskInput } from './riskFixture.js';

describe('allow and block lists', () => {
  it('matches the pharmacy and the utility company by everyday words', () => {
    expect(matchesList('CVS Pharmacy', ['pharmacy'])).toBe(true);
    expect(matchesList('City Utilities', ['utility company'])).toBe(true);
    expect(matchesList('Helen Brooks', ['pharmacy', 'utility company'])).toBe(false);
  });

  it('forces a blocked payee to high', () => {
    const hit = listRule(riskInput({ payeeStatus: 'blocked', payeeName: 'Officer James' }), 0);
    expect(hit.force).toBe('HIGH');
  });

  it('caps a trusted allowed payee when the note is clean', () => {
    const hit = listRule(
      riskInput({ payeeStatus: 'trusted', payeeName: 'CVS Pharmacy', amount: 48 }),
      0,
    );
    expect(hit.cap).toBe(15);
  });

  it('does not cap an allowed payee when the note looks like a scam', () => {
    const hit = listRule(
      riskInput({ payeeStatus: 'trusted', payeeName: 'CVS Pharmacy', amount: 48 }),
      32,
    );
    expect(hit.cap).toBeUndefined();
  });
});
