import type { MandatePolicy } from '../mandate/schema.js';

export type PayeeStatus = 'trusted' | 'blocked' | 'unknown';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type Decision = 'capture' | 'hold' | 'void';

export type RiskInput = {
  amount: number;
  payeeName: string;
  note: string;
  payeeStatus: PayeeStatus;
  recentPaymentCount: number;
  recentPaymentTotal: number;
  historyAmounts: number[];
  now: Date;
  policy: MandatePolicy;
};

export type RuleHit = {
  id: string;
  points: number;
  reasons: string[];
  force?: RiskLevel;
  cap?: number;
};

export type RiskDecision = {
  score: number;
  level: RiskLevel;
  decision: Decision;
  reasons: string[];
  hits: RuleHit[];
};
