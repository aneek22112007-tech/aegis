import { DEMO_POLICY } from '../src/risk/demoCases.js';
import type { RiskInput } from '../src/risk/types.js';

export function riskInput(overrides: Partial<RiskInput> = {}): RiskInput {
  return {
    amount: 40,
    payeeName: 'Helen Brooks',
    note: '',
    payeeStatus: 'unknown',
    recentPaymentCount: 0,
    recentPaymentTotal: 0,
    historyAmounts: [],
    now: new Date(2026, 5, 2, 12, 0, 0),
    policy: DEMO_POLICY,
    ...overrides,
  };
}
