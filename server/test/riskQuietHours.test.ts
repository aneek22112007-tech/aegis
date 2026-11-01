import { describe, expect, it } from 'vitest';
import { isQuietHour, quietHoursRule } from '../src/risk/rules/quietHours.js';
import { riskInput } from './riskFixture.js';

describe('quietHoursRule', () => {
  it('treats an overnight window as quiet late at night and early in the morning', () => {
    expect(isQuietHour(new Date(2026, 5, 2, 23, 15), '22:00', '07:00')).toBe(true);
    expect(isQuietHour(new Date(2026, 5, 2, 6, 30), '22:00', '07:00')).toBe(true);
    expect(isQuietHour(new Date(2026, 5, 2, 12, 0), '22:00', '07:00')).toBe(false);
  });

  it('adds points only inside the window', () => {
    const night = quietHoursRule(riskInput({ now: new Date(2026, 5, 2, 23, 0) }));
    const noon = quietHoursRule(riskInput({ now: new Date(2026, 5, 2, 12, 0) }));
    expect(night.points).toBe(12);
    expect(noon.points).toBe(0);
  });
});
