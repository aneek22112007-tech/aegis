import { z } from 'zod';
import type { MandatePolicy } from '../engine/schema';

/** Rule switches and edits made on the rules page. Stored next to the demo data. */
export const RULE_IDS = ['newPayee', 'allow', 'scam', 'limits', 'quiet'] as const;
export type RuleId = (typeof RULE_IDS)[number];

const schema = z.object({
  off: z.array(z.enum(RULE_IDS)).default([]),
  removed: z.array(z.enum(RULE_IDS)).default([]),
  newPayeeLimit: z.number().positive().optional(),
  perPaymentLimit: z.number().positive().optional(),
  removedAllow: z.array(z.string()).default([]),
  editedAt: z.string().optional(),
});
export type RuleOverrides = z.infer<typeof schema>;

export const OVERRIDES_KEY = 'aegis-rule-overrides-v1';
export const EMPTY_OVERRIDES: RuleOverrides = { off: [], removed: [], removedAllow: [] };
const NO_LIMIT = 1_000_000_000;

export function loadOverrides(): RuleOverrides {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    if (!raw) return { ...EMPTY_OVERRIDES };
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : { ...EMPTY_OVERRIDES };
  } catch {
    return { ...EMPTY_OVERRIDES };
  }
}

export function saveOverrides(value: RuleOverrides, now = new Date()): RuleOverrides {
  const next = { ...value, editedAt: now.toISOString() };
  try {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(next));
  } catch {
    // Private browsing can refuse storage; the page still works for this visit.
  }
  return next;
}

export function isActive(o: RuleOverrides, id: RuleId) {
  return !o.off.includes(id) && !o.removed.includes(id);
}

/** The policy the engine should use once the page's switches and edits are applied. */
export function applyOverrides(policy: MandatePolicy, o: RuleOverrides): MandatePolicy {
  const next: MandatePolicy = { ...policy, quietHours: { ...policy.quietHours } };
  if (o.newPayeeLimit) next.maxNewPayee = o.newPayeeLimit;
  if (o.perPaymentLimit) next.maxPerTxn = o.perPaymentLimit;
  next.alwaysAllow = policy.alwaysAllow.filter(
    (entry) => !o.removedAllow.some((r) => r.toLowerCase() === entry.toLowerCase()),
  );
  if (!isActive(o, 'newPayee')) next.maxNewPayee = NO_LIMIT;
  if (!isActive(o, 'allow')) next.alwaysAllow = [];
  if (!isActive(o, 'scam')) next.scamKeywords = [];
  if (!isActive(o, 'limits')) {
    next.maxPerTxn = NO_LIMIT;
    next.dailyLimit = NO_LIMIT;
  }
  if (!isActive(o, 'quiet')) next.quietHours = { start: '00:00', end: '00:00' };
  return next;
}
