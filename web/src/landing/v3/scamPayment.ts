import { evaluateRisk } from '../../engine/evaluate';
import { heuristicCompile } from '../../engine/heuristic';
import type { RiskDecision } from '../../engine/types';

export const GUARDIAN = { name: 'Priya', contact: 'daughter' };

export const SAMPLE_RULES =
  'Ask Priya before I send more than $500 to someone new. Never pay gift cards. No payments after 9pm.';

/** The "Officer James" payment from Margaret's day, scored by the real engine. */
export function scoreScamPayment(): RiskDecision {
  return evaluateRisk({
    amount: 1900,
    payeeName: 'James W.',
    note: 'urgent bank investigation, keep money safe',
    payeeStatus: 'unknown',
    recentPaymentCount: 1,
    recentPaymentTotal: 48,
    historyAmounts: [48, 62, 120, 35],
    now: new Date('2026-11-03T14:47:00'),
    policy: heuristicCompile(SAMPLE_RULES, GUARDIAN),
  });
}
