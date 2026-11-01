import type { PaymentView } from '../api';

export type ScenarioId = 'pharmacy' | 'new-payee' | 'scam';

export type Scenario = {
  id: ScenarioId;
  payee: string;
  amount: string;
  note: string;
  tag: string;
  expect: string;
  tone: 'low' | 'medium' | 'high';
};

export const SCENARIOS: Scenario[] = [
  {
    id: 'pharmacy',
    payee: 'CVS Pharmacy',
    amount: '$48',
    note: 'Monthly prescription refill',
    tag: 'Trusted payee',
    expect: 'Captured automatically',
    tone: 'low',
  },
  {
    id: 'new-payee',
    payee: 'Helen Brooks',
    amount: '$650',
    note: 'Birthday gift',
    tag: 'New payee',
    expect: 'Held for Priya',
    tone: 'medium',
  },
  {
    id: 'scam',
    payee: 'Officer James',
    amount: '$1,900',
    note: 'Urgent and secret: grandson bail',
    tag: 'Scam pattern',
    expect: 'Voided before capture',
    tone: 'high',
  },
];

export type Phase = 'idle' | 'authorize' | 'score' | 'decide' | 'done' | 'error';

export const STEPS = [
  { key: 'authorize', label: 'Authorize', hint: 'PayPal order, intent AUTHORIZE' },
  { key: 'score', label: 'Risk score', hint: 'Checked against Margaret’s rules' },
  { key: 'decide', label: 'Decision', hint: 'Capture, hold, or void' },
] as const;

/** Index of the active step for a phase; 3 means every step is complete. */
export function stepIndex(phase: Phase): number {
  switch (phase) {
    case 'authorize':
      return 0;
    case 'score':
      return 1;
    case 'decide':
      return 2;
    case 'done':
      return 3;
    default:
      return -1;
  }
}

export type Verdict = {
  title: string;
  action: string;
  tone: 'low' | 'medium' | 'high';
};

/** Plain-language verdict for a payment, including a guardian's later decision. */
export function verdictFor(
  payment: PaymentView,
  guardian: 'approved' | 'denied' | null = null,
): Verdict {
  if (payment.outcome === 'waiting') {
    return { title: 'Held for Priya', action: 'Authorization held', tone: 'medium' };
  }
  if (payment.outcome === 'sent') {
    return {
      title: guardian === 'approved' ? 'Approved by Priya' : 'Captured',
      action: 'Funds captured',
      tone: 'low',
    };
  }
  return {
    title: guardian === 'denied' ? 'Denied by Priya' : 'Voided before capture',
    action: 'Authorization voided',
    tone: 'high',
  };
}

export function toneFor(score: number): 'low' | 'medium' | 'high' {
  if (score >= 70) return 'high';
  if (score >= 35) return 'medium';
  return 'low';
}

export const TONE_COLOR = { low: '#34f5b0', medium: '#ffc857', high: '#ff5c7a' } as const;
