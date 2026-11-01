import { describe, expect, it } from 'vitest';
import { normalizePayeeName } from '../src/payees/names.js';

describe('normalizePayeeName', () => {
  it('trims, collapses whitespace, and lowercases', () => {
    expect(normalizePayeeName('  CVS   Pharmacy ')).toBe('cvs pharmacy');
  });
});
