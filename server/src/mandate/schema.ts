import { z } from 'zod';

const clockTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use a 24-hour time like 22:00');

export const MandatePolicySchema = z.object({
  maxNewPayee: z.number().positive().max(1_000_000),
  maxPerTxn: z.number().positive().max(1_000_000),
  dailyLimit: z.number().positive().max(1_000_000),
  alwaysAllow: z.array(z.string().trim().min(1).max(80)).max(50),
  alwaysBlock: z.array(z.string().trim().min(1).max(80)).max(50),
  scamKeywords: z.array(z.string().trim().min(2).max(40)).max(80),
  quietHours: z.object({
    start: clockTime,
    end: clockTime,
  }),
  guardian: z.object({
    name: z.string().trim().min(1).max(80),
    contact: z.string().trim().min(1).max(120),
  }),
  escalation: z.string().trim().min(1).max(400),
});

export type MandatePolicy = z.infer<typeof MandatePolicySchema>;

export type GuardianRef = MandatePolicy['guardian'];

export function normalizeRawPolicy(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  const record = { ...(value as Record<string, unknown>) };
  for (const key of ['maxNewPayee', 'maxPerTxn', 'dailyLimit'] as const) {
    const raw = record[key];
    if (typeof raw === 'string' && raw.trim()) {
      const parsed = Number(raw.replace(/[$,]/g, ''));
      if (Number.isFinite(parsed)) record[key] = parsed;
    }
  }
  return record;
}
