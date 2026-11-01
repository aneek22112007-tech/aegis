import type { RiskInput, RuleHit } from '../types.js';

export function sampleStats(values: number[]): { mean: number; stdev: number } | null {
  if (values.length < 5) return null;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);
  return { mean, stdev: Math.sqrt(variance) };
}

export function historyDriftRule(input: RiskInput): RuleHit {
  const stats = sampleStats(input.historyAmounts);
  if (!stats) return { id: 'history', points: 0, reasons: [] };
  if (stats.stdev < 0.01) {
    if (input.amount > stats.mean * 3) {
      return {
        id: 'history',
        points: 15,
        reasons: ['This is much larger than the usual amount for this payee.'],
      };
    }
    return { id: 'history', points: 0, reasons: [] };
  }
  const z = (input.amount - stats.mean) / stats.stdev;
  if (z >= 3) {
    return {
      id: 'history',
      points: 20,
      reasons: ['This is far above what you usually pay this payee.'],
    };
  }
  if (z >= 2) {
    return {
      id: 'history',
      points: 10,
      reasons: ['This is higher than what you usually pay this payee.'],
    };
  }
  return { id: 'history', points: 0, reasons: [] };
}
