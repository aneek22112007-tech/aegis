import { describe, expect, it } from 'vitest';
import { aggregate } from '../src/risk/aggregate.js';
import { decisionFor, levelFor } from '../src/risk/level.js';

describe('score thresholds', () => {
  it('maps the edges of low, medium, and high', () => {
    expect(levelFor(0)).toBe('LOW');
    expect(levelFor(34)).toBe('LOW');
    expect(levelFor(35)).toBe('MEDIUM');
    expect(levelFor(69)).toBe('MEDIUM');
    expect(levelFor(70)).toBe('HIGH');
    expect(decisionFor('LOW')).toBe('capture');
    expect(decisionFor('MEDIUM')).toBe('hold');
    expect(decisionFor('HIGH')).toBe('void');
  });

  it('clamps the total at 100 and honors an allow cap', () => {
    const capped = aggregate([
      { id: 'a', points: 50, reasons: ['one'] },
      { id: 'b', points: 0, reasons: [], cap: 15 },
    ]);
    expect(capped.score).toBe(15);
    expect(capped.level).toBe('LOW');
  });

  it('lets an always-block hit force a void', () => {
    const forced = aggregate([
      { id: 'lists', points: 100, reasons: ['blocked'], force: 'HIGH' },
      { id: 'amount', points: 0, reasons: [] },
    ]);
    expect(forced.score).toBe(100);
    expect(forced.decision).toBe('void');
  });
});
