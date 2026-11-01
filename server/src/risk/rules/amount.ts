import type { RiskInput, RuleHit } from '../types.js';

export function amountRule(input: RiskInput): RuleHit {
  const reasons: string[] = [];
  let points = 0;
  if (input.amount > input.policy.maxPerTxn) {
    points += 40;
    reasons.push(
      `This is more than the most you wanted to send in one payment ($${input.policy.maxPerTxn}).`,
    );
  } else if (input.amount > input.policy.maxPerTxn * 0.8) {
    points += 12;
    reasons.push('This is close to the most you wanted to send at once.');
  }
  if (input.recentPaymentTotal + input.amount > input.policy.dailyLimit) {
    points += 22;
    reasons.push(`This would pass your $${input.policy.dailyLimit} limit for the day.`);
  }
  return { id: 'amount', points, reasons };
}
