import { describe, expect, it } from 'vitest';
import { heuristicCompile, parseQuietHours } from '../src/mandate/heuristic.js';
import { MANDATE_TEXT } from '../src/seed/household.js';

const guardian = { name: 'Priya', contact: 'daughter' };

describe('heuristicCompile', () => {
  it('reads Margaret’s $500 rule, pharmacy, utility, and the call to her daughter', () => {
    const policy = heuristicCompile(MANDATE_TEXT, guardian);
    expect(policy.maxNewPayee).toBe(500);
    expect(policy.maxPerTxn).toBe(2000);
    expect(policy.alwaysAllow).toEqual(['pharmacy', 'utility company']);
    expect(policy.scamKeywords).toEqual(expect.arrayContaining(['urgent', 'secret', 'bail']));
    expect(policy.guardian).toEqual(guardian);
    expect(policy.escalation).toContain('Priya');
  });

  it('keeps the safe defaults when the text names no amount', () => {
    const policy = heuristicCompile('Please be careful with my money.', guardian);
    expect(policy.maxNewPayee).toBe(500);
    expect(policy.quietHours).toEqual({ start: '22:00', end: '07:00' });
  });
});

describe('parseQuietHours (server)', () => {
  it('matches the browser engine for "after 9pm"', () => {
    expect(parseQuietHours('No payments after 9pm.')).toEqual({ start: '21:00', end: '07:00' });
  });

  it('reads a between range', () => {
    expect(parseQuietHours('between 10pm and 6am')).toEqual({ start: '22:00', end: '06:00' });
  });
});
