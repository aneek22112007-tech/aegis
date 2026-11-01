import { describe, expect, it, vi } from 'vitest';
import type { GrokClient } from '../src/grok/client.js';
import { evaluateRisk } from '../src/risk/evaluate.js';
import { explainDecision } from '../src/risk/reasons.js';
import { rewriteDecision } from '../src/risk/rewrite.js';
import { newPayeeCase } from '../src/risk/demoCases.js';

describe('reason rewrite', () => {
  it('replaces wording and keeps the score, level, and decision', async () => {
    const decision = evaluateRisk(newPayeeCase);
    const grok: GrokClient = {
      completeJson: vi.fn(async () => ({
        reasons: decision.reasons.map((reason) => `Plain: ${reason}`),
      })),
    };
    const rewritten = await rewriteDecision(decision, grok);
    expect(rewritten.score).toBe(decision.score);
    expect(rewritten.level).toBe(decision.level);
    expect(rewritten.decision).toBe(decision.decision);
    expect(rewritten.reasons[0]).toMatch(/^Plain:/);
    expect(explainDecision(rewritten)[0]).toMatch(/second look/i);
  });

  it('keeps the original reasons when the model returns a different count', async () => {
    const decision = evaluateRisk(newPayeeCase);
    const grok: GrokClient = { completeJson: async () => ({ reasons: ['only one'] }) };
    const rewritten = await rewriteDecision(decision, grok);
    expect(rewritten).toEqual(decision);
  });

  it('keeps the original reasons when the model throws', async () => {
    const decision = evaluateRisk(newPayeeCase);
    const grok: GrokClient = {
      completeJson: async () => {
        throw new Error('Grok request failed (500)');
      },
    };
    expect(await rewriteDecision(decision, grok)).toEqual(decision);
  });
});
