import { describe, expect, it } from 'vitest';
import { historyDriftRule, sampleStats } from '../src/risk/rules/historyDrift.js';
import { riskInput } from './riskFixture.js';

describe('historyDriftRule', () => {
  it('ignores a payee with fewer than five earlier payments', () => {
    expect(sampleStats([10, 20, 30, 40])).toBeNull();
    expect(
      historyDriftRule(riskInput({ historyAmounts: [10, 20, 30, 40], amount: 500 })).points,
    ).toBe(0);
  });

  it('penalizes an amount more than three standard deviations above the mean', () => {
    const history = [40, 42, 41, 39, 40, 43, 38, 41];
    const hit = historyDriftRule(riskInput({ historyAmounts: history, amount: 400 }));
    expect(hit.points).toBe(20);
  });

  it('does not penalize a usual pharmacy amount', () => {
    const history = [
      32, 36, 40, 42, 44, 45, 46, 47, 48, 48, 49, 50, 51, 52, 54, 55, 42, 38, 46, 50,
    ];
    expect(historyDriftRule(riskInput({ historyAmounts: history, amount: 48 })).points).toBe(0);
  });
});
