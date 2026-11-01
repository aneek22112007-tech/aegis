import { aggregate } from './aggregate.js';
import { amountRule } from './rules/amount.js';
import { historyDriftRule } from './rules/historyDrift.js';
import { listRule } from './rules/lists.js';
import { newPayeeRule } from './rules/newPayee.js';
import { quietHoursRule } from './rules/quietHours.js';
import { scamRule } from './rules/scam.js';
import { velocityRule } from './rules/velocity.js';
import type { RiskDecision, RiskInput } from './types.js';

export function evaluateRisk(input: RiskInput): RiskDecision {
  const scam = scamRule(input);
  return aggregate([
    amountRule(input),
    newPayeeRule(input),
    velocityRule(input),
    historyDriftRule(input),
    quietHoursRule(input),
    scam,
    listRule(input, scam.points),
  ]);
}
