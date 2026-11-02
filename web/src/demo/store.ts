import { z } from 'zod';
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

/** Bump when the stored shape changes; anything else in storage is replaced with a fresh seed. */
export const SCHEMA_VERSION = 2;
export const KEY = 'aegis-demo-state';
const LEGACY_KEYS = ['aegis-demo-state-v1'];

const paymentSchema = z.object({
  id: z.string(),
  payeeName: z.string(),
  amountCents: z.number().int().nonnegative(),
  note: z.string(),
  status: z.enum(['created', 'held', 'captured', 'voided', 'failed']),
  level: z.enum(['LOW', 'MEDIUM', 'HIGH']).nullable(),
  score: z.number().nullable(),
  decision: z.enum(['capture', 'hold', 'void']).nullable(),
  resolution: z.string().nullable(),
  reasons: z.array(z.string()),
  paypalOrderId: z.string(),
  authorizationId: z.string().nullable(),
  createdAt: z.string().refine((v) => !Number.isNaN(Date.parse(v))),
});

const stateSchema = z.object({
  payments: z.array(paymentSchema),
  payees: z.array(
    z.object({ id: z.string(), name: z.string(), status: z.enum(['trusted', 'blocked', 'unknown']) }),
  ),
  history: z.record(z.array(z.number())),
  mandateText: z.string().min(1),
  mandateVersion: z.number().int().positive(),
});

const storedSchema = z.object({ version: z.literal(SCHEMA_VERSION), state: stateSchema });

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

/** Reads demo data; old, broken or foreign data is dropped and replaced with a fresh seed. */
export function loadState(): DemoState {
  const store = storage();
  if (!store) return seedState();
  try {
    for (const legacy of LEGACY_KEYS) store.removeItem(legacy);
  } catch {
    /* storage may be read-only */
  }
  let raw: string | null = null;
  try {
    raw = store.getItem(KEY);
  } catch {
    return seedState();
  }
  if (!raw) return resetState();
  try {
    const parsed = storedSchema.safeParse(JSON.parse(raw));
    if (parsed.success) return parsed.data.state as DemoState;
  } catch {
    /* fall through to a fresh seed */
  }
  return resetState();
}

export function saveState(state: DemoState): void {
  try {
    storage()?.setItem(KEY, JSON.stringify({ version: SCHEMA_VERSION, state }));
  } catch {
    /* private mode or full storage: keep working in memory */
  }
}

/** Removes every demo key, used by the error screen. */
export function clearDemoStorage(): void {
  try {
    for (const k of [KEY, ...LEGACY_KEYS]) storage()?.removeItem(k);
  } catch {
    /* ignore */
  }
}

export function resetState(): DemoState {
  const fresh = seedState();
  saveState(fresh);
  return fresh;
}
