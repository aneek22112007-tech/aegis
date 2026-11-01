import { describe, expect, it } from 'vitest';
import { centsToDollars, dollarsToCents, formatUsd } from '../src/lib/money.js';

describe('money', () => {
  it('converts dollars to cents without float drift', () => {
    expect(dollarsToCents(48)).toBe(4800);
    expect(dollarsToCents(19.99)).toBe(1999);
    expect(centsToDollars(190000)).toBe(1900);
  });

  it('formats cents as US dollars', () => {
    expect(formatUsd(4800)).toBe('$48.00');
    expect(formatUsd(190000)).toBe('$1,900.00');
  });
});
