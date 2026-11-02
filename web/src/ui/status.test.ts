import { describe, expect, it } from 'vitest';
import { riskChip, shortId, statusChip } from './status';

describe('status helpers', () => {
  it('maps statuses to semantic tones', () => {
    expect(statusChip('captured')).toEqual({ tone: 'ok', label: 'Captured' });
    expect(statusChip('held').tone).toBe('warn');
    expect(statusChip('voided').tone).toBe('bad');
    expect(statusChip(null).label).toBe('—');
  });

  it('maps risk levels', () => {
    expect(riskChip('HIGH').label).toBe('High');
    expect(riskChip('LOW').tone).toBe('ok');
  });

  it('shortens ids with a prefix', () => {
    expect(shortId('cmvyef2bd000j9f0abcdef12')).toBe('pay_f0abcdef12');
    expect(shortId('ORDER-1', 'ord')).toBe('ord_ORDER-1');
  });
});
