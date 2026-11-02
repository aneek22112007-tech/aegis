import type { RiskInput, RuleHit } from '../types.js';

export function newPayeeRule(input: RiskInput): RuleHit {
  if (input.payeeStatus === 'trusted') {
    return { id: 'new-payee', points: 0, reasons: [] };
  }
  const reasons = ['You have not paid this person before.'];
  let points = 24;
  if (input.amount > input.policy.maxNewPayee) {
    points += 18;
    reasons.push(
      `That is over your $${input.policy.maxNewPayee.toLocaleString('en-US')} limit for someone you have not paid before.`,
    );
  }
  return { id: 'new-payee', points, reasons };
}
