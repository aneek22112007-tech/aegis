import { describe, expect, it } from 'vitest';
import { agoLabel, initials, statusOf, whenLabel } from './ui';

const now = new Date(2026, 10, 2, 14, 0);

describe('senior labels', () => {
  it('names payment status in plain words', () => {
    expect(statusOf('captured').label).toBe('Sent');
    expect(statusOf('held').label).toBe('Waiting for Priya');
    expect(statusOf('voided').label).toBe('Stopped');
  });

  it('dates recent payments relative to now and adds the year for older ones', () => {
    expect(whenLabel(new Date(2026, 10, 2, 9, 12).toISOString(), now)).toMatch(/^Today, 9:12/);
    expect(whenLabel(new Date(2026, 10, 1, 16, 5).toISOString(), now)).toMatch(/^Yesterday/);
    expect(whenLabel(new Date(2026, 9, 28).toISOString(), now)).toBe('Oct 28');
    expect(whenLabel(new Date(2025, 10, 22).toISOString(), now)).toBe('Nov 22, 2025');
  });

  it('says how long ago the last check was', () => {
    expect(agoLabel(new Date(2026, 10, 2, 13, 48).toISOString(), now)).toBe('12 minutes ago');
    expect(initials('City Utilities')).toBe('CU');
  });
});
