import type { RiskInput, RuleHit } from '../types.js';

export function velocityRule(input: RiskInput): RuleHit {
  let points = 0;
  const reasons: string[] = [];
  if (input.recentPaymentCount >= 5) {
    points += 20;
    reasons.push('There have already been several payments in the last day.');
  } else if (input.recentPaymentCount >= 3) {
    points += 10;
    reasons.push('Payments today are coming faster than usual.');
  }
  return { id: 'velocity', points, reasons };
}
