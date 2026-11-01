import type { GrokClient } from '../grok/client.js';
import { heuristicCompile } from './heuristic.js';
import { compilePrompt, retryPrompt } from './prompt.js';
import {
  MandatePolicySchema,
  normalizeRawPolicy,
  type GuardianRef,
  type MandatePolicy,
} from './schema.js';
import { summarizePolicy } from './summary.js';

export type CompiledMandate = {
  policy: MandatePolicy;
  summary: string;
  source: 'grok' | 'fallback';
};

function readPolicy(value: unknown): MandatePolicy | null {
  const parsed = MandatePolicySchema.safeParse(normalizeRawPolicy(value));
  return parsed.success ? parsed.data : null;
}

function pack(policy: MandatePolicy, source: CompiledMandate['source']): CompiledMandate {
  return { policy, summary: summarizePolicy(policy), source };
}

export async function compileMandateText(input: {
  text: string;
  guardian: GuardianRef;
  grok: GrokClient | null;
}): Promise<CompiledMandate> {
  if (input.grok) {
    try {
      const first = readPolicy(
        await input.grok.completeJson(compilePrompt(input.text, input.guardian)),
      );
      if (first) return pack(first, 'grok');
      const second = readPolicy(
        await input.grok.completeJson(
          retryPrompt(input.text, input.guardian, 'The JSON did not match the mandate schema.'),
        ),
      );
      if (second) return pack(second, 'grok');
    } catch {
      return pack(heuristicCompile(input.text, input.guardian), 'fallback');
    }
  }
  return pack(heuristicCompile(input.text, input.guardian), 'fallback');
}
