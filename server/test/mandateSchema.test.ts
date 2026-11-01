import { describe, expect, it } from 'vitest';
import { MandatePolicySchema, normalizeRawPolicy } from '../src/mandate/schema.js';

const valid = {
  maxNewPayee: 500,
  maxPerTxn: 2000,
  dailyLimit: 2000,
  alwaysAllow: ['pharmacy'],
  alwaysBlock: [],
  scamKeywords: ['urgent', 'secret'],
  quietHours: { start: '22:00', end: '07:00' },
  guardian: { name: 'Priya', contact: 'daughter' },
  escalation: 'Call Priya before the money moves.',
};

describe('MandatePolicySchema', () => {
  it('accepts a complete policy', () => {
    expect(MandatePolicySchema.parse(valid).maxNewPayee).toBe(500);
  });

  it('rejects a negative new-payee limit', () => {
    const parsed = MandatePolicySchema.safeParse({ ...valid, maxNewPayee: -1 });
    expect(parsed.success).toBe(false);
  });

  it('rejects a quiet-hours value that is not a clock time', () => {
    const parsed = MandatePolicySchema.safeParse({
      ...valid,
      quietHours: { start: '10pm', end: '07:00' },
    });
    expect(parsed.success).toBe(false);
  });

  it('coerces dollar strings before validation', () => {
    const normalized = normalizeRawPolicy({ ...valid, maxNewPayee: '$1,250' });
    expect(MandatePolicySchema.parse(normalized).maxNewPayee).toBe(1250);
  });
});
