import { z } from 'zod';
import type { GrokClient } from '../grok/client.js';
import type { RiskDecision } from './types.js';

const rewrittenSchema = z.object({
  reasons: z.array(z.string().trim().min(1)),
});

export async function rewriteDecision(
  decision: RiskDecision,
  grok: GrokClient | null,
): Promise<RiskDecision> {
  if (!grok || decision.reasons.length === 0) return decision;
  try {
    const raw = await grok.completeJson({
      system:
        'Rewrite each reason as one short, calm sentence for an older adult. Do not add reasons. Do not decide whether the payment is allowed. Return JSON {"reasons": string[]} with the same number of items in the same order.',
      user: JSON.stringify({ reasons: decision.reasons }),
    });
    const parsed = rewrittenSchema.safeParse(raw);
    if (!parsed.success || parsed.data.reasons.length !== decision.reasons.length) {
      return decision;
    }
    return { ...decision, reasons: parsed.data.reasons };
  } catch {
    return decision;
  }
}
