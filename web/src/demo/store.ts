import type { RiskLevel } from '../engine/types';

export type DemoPayment = {
  id: string;
  payeeName: string;
  amountCents: number;
  note: string;
  status: 'created' | 'held' | 'captured' | 'voided' | 'failed';
  level: RiskLevel | null;
  score: number | null;
  decision: 'capture' | 'hold' | 'void' | null;
  resolution: string | null;
  reasons: string[];
  paypalOrderId: string;
  authorizationId: string | null;
  createdAt: string;
};

export type DemoPayee = { id: string; name: string; status: 'trusted' | 'blocked' | 'unknown' };

export type DemoState = {
  payments: DemoPayment[];
  payees: DemoPayee[];
  history: Record<string, number[]>;
  mandateText: string;
  mandateVersion: number;
};

export const MANDATE_TEXT =
  "Never send more than $500 to anyone I haven't paid before. Always allow my pharmacy and my utility company. If someone says it's urgent and secret, block it and call my daughter.";

const KEY = 'aegis-demo-state-v1';

const DAY = 86_400_000;

/** Past bills already paid, dated relative to now so nothing ever shows in the future. */
export function seedPayments(now = Date.now()): DemoPayment[] {
  const at = (daysAgo: number, hour: number, minute: number) => {
    const d = new Date(now - daysAgo * DAY);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };
  const paid = (
    id: string,
    payeeName: string,
    amountCents: number,
    note: string,
    createdAt: string,
  ): DemoPayment => ({
    id,
    payeeName,
    amountCents,
    note,
    status: 'captured',
    level: 'LOW',
    score: 8,
    decision: 'capture',
    resolution: null,
    reasons: ['This payee is trusted.', 'The amount is in the usual range.'],
    paypalOrderId: `DEMO-${id.toUpperCase()}`,
    authorizationId: `DEMO-AUTH-${id.toUpperCase()}`,
    createdAt,
  });
  return [
    paid('pay_seed_cvs2', 'CVS Pharmacy', 4600, 'Prescription refill', at(3, 10, 24)),
    paid('pay_seed_city', 'City Utilities', 9200, 'Monthly utility bill', at(8, 9, 5)),
    paid('pay_seed_cvs1', 'CVS Pharmacy', 4800, 'Prescription refill', at(17, 15, 40)),
  ];
}

export function seedState(): DemoState {
  return {
    payments: seedPayments(),
    payees: [
      { id: 'payee_cvs', name: 'CVS Pharmacy', status: 'trusted' },
      { id: 'payee_city', name: 'City Utilities', status: 'trusted' },
    ],
    history: {
      'cvs pharmacy': [
        32, 36, 40, 42, 44, 45, 46, 47, 48, 48, 49, 50, 51, 52, 54, 55, 42, 38, 46, 50,
      ],
      'city utilities': [
        88, 92, 90, 95, 86, 100, 84, 91, 89, 93, 87, 96, 90, 85, 94, 88, 91, 97, 86, 90,
      ],
    },
    mandateText: MANDATE_TEXT,
    mandateVersion: 1,
  };
}

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function loadState(): DemoState {
  const raw = storage()?.getItem(KEY);
  if (!raw) return seedState();
  try {
    return { ...seedState(), ...(JSON.parse(raw) as Partial<DemoState>) };
  } catch {
    return seedState();
  }
}

export function saveState(state: DemoState): void {
  storage()?.setItem(KEY, JSON.stringify(state));
}

export function resetState(): DemoState {
  const fresh = seedState();
  saveState(fresh);
  return fresh;
}
