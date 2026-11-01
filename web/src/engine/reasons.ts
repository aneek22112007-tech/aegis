import type { RiskDecision, RiskLevel } from './types.js';

export function decisionSentence(level: RiskLevel): string {
  if (level === 'LOW') return 'This looks like a normal payment.';
  if (level === 'MEDIUM') return 'This needs a second look before money moves.';
  return 'This matches the kind of payment you asked us to stop.';
}

export function explainDecision(decision: RiskDecision): string[] {
  return [decisionSentence(decision.level), ...decision.reasons];
}
