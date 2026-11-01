import { heuristicCompile } from '../mandate/heuristic.js';
import { MANDATE_TEXT } from '../seed/household.js';
import type { RiskInput } from './types.js';

const guardian = { name: 'Priya', contact: 'daughter' };

export const DEMO_POLICY = heuristicCompile(MANDATE_TEXT, guardian);

const noon = new Date(2026, 5, 2, 12, 0, 0);

const PHARMACY_HISTORY = [
  32, 36, 40, 42, 44, 45, 46, 47, 48, 48, 49, 50, 51, 52, 54, 55, 42, 38, 46, 50,
];

export const pharmacyCase: RiskInput = {
  amount: 48,
  payeeName: 'CVS Pharmacy',
  note: 'Prescription refill',
  payeeStatus: 'trusted',
  recentPaymentCount: 0,
  recentPaymentTotal: 0,
  historyAmounts: PHARMACY_HISTORY,
  now: noon,
  policy: DEMO_POLICY,
};

export const newPayeeCase: RiskInput = {
  amount: 650,
  payeeName: 'Helen Brooks',
  note: 'Birthday gift',
  payeeStatus: 'unknown',
  recentPaymentCount: 0,
  recentPaymentTotal: 0,
  historyAmounts: [],
  now: noon,
  policy: DEMO_POLICY,
};

export const scamCase: RiskInput = {
  amount: 1900,
  payeeName: 'Officer James',
  note: 'URGENT keep this secret, your grandson needs bail',
  payeeStatus: 'unknown',
  recentPaymentCount: 0,
  recentPaymentTotal: 0,
  historyAmounts: [],
  now: noon,
  policy: DEMO_POLICY,
};
