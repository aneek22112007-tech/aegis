import { matchesList } from '../match.js';
import type { RiskInput, RuleHit } from '../types.js';

export function listRule(input: RiskInput, scamPoints: number): RuleHit {
  if (input.payeeStatus === 'blocked' || matchesList(input.payeeName, input.policy.alwaysBlock)) {
    return {
      id: 'lists',
      points: 100,
      force: 'HIGH',
      reasons: ['This payee is on your do-not-pay list.'],
    };
  }
  const allowed =
    input.payeeStatus === 'trusted' &&
    matchesList(input.payeeName, input.policy.alwaysAllow) &&
    scamPoints === 0 &&
    input.amount <= input.policy.maxPerTxn;
  if (allowed) {
    return {
      id: 'lists',
      points: 0,
      cap: 15,
      reasons: ['This is one of the payees you always allow.'],
    };
  }
  return { id: 'lists', points: 0, reasons: [] };
}
