import { describe, expect, it } from 'vitest';
import { summarizePolicy } from '../src/mandate/summary.js';
import type { MandatePolicy } from '../src/mandate/schema.js';

const policy: MandatePolicy = {
  maxNewPayee: 500,
  maxPerTxn: 2000,
  dailyLimit: 2000,
  alwaysAllow: ['pharmacy', 'utility company'],
  alwaysBlock: [],
  scamKeywords: ['urgent', 'secret', 'bail', 'grandson'],
  quietHours: { start: '22:00', end: '07:00' },
  guardian: { name: 'Priya', contact: 'daughter' },
  escalation: 'Call Priya before the money moves.',
};

describe('summarizePolicy', () => {
  it('names the new-payee limit and the guardian', () => {
    const summary = summarizePolicy(policy);
    expect(summary).toContain('$500');
    expect(summary).toContain('Priya');
    expect(summary).toContain('pharmacy');
    expect(summary).toContain('22:00');
  });
});
