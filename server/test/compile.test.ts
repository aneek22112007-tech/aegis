import { describe, expect, it, vi } from 'vitest';
import type { GrokClient } from '../src/grok/client.js';
import { compileMandateText } from '../src/mandate/compile.js';
import { MANDATE_TEXT } from '../src/seed/household.js';

const guardian = { name: 'Priya', contact: 'daughter' };

function grok(completeJson: GrokClient['completeJson']): GrokClient {
  return { completeJson };
}

describe('compileMandateText', () => {
  it('keeps a valid Grok policy', async () => {
    const policy = {
      maxNewPayee: 400,
      maxPerTxn: 900,
      dailyLimit: 1200,
      alwaysAllow: ['pharmacy'],
      alwaysBlock: [],
      scamKeywords: ['urgent'],
      quietHours: { start: '21:00', end: '06:00' },
      guardian,
      escalation: 'Call Priya.',
    };
    const compiled = await compileMandateText({
      text: MANDATE_TEXT,
      guardian,
      grok: grok(vi.fn(async () => policy)),
    });
    expect(compiled.source).toBe('grok');
    expect(compiled.policy.maxNewPayee).toBe(400);
    expect(compiled.summary).toContain('$400');
  });

  it('retries once when the first payload is invalid', async () => {
    const completeJson = vi
      .fn()
      .mockResolvedValueOnce({ maxNewPayee: 'nope' })
      .mockResolvedValueOnce({
        maxNewPayee: '750',
        maxPerTxn: 2000,
        dailyLimit: 2000,
        alwaysAllow: [],
        alwaysBlock: ['lottery'],
        scamKeywords: ['urgent', 'secret'],
        quietHours: { start: '22:00', end: '07:00' },
        guardian,
        escalation: 'Call Priya.',
      });
    const compiled = await compileMandateText({
      text: MANDATE_TEXT,
      guardian,
      grok: grok(completeJson),
    });
    expect(completeJson).toHaveBeenCalledTimes(2);
    expect(compiled.source).toBe('grok');
    expect(compiled.policy.maxNewPayee).toBe(750);
    expect(compiled.policy.alwaysBlock).toEqual(['lottery']);
  });

  it('falls back when Grok throws', async () => {
    const compiled = await compileMandateText({
      text: MANDATE_TEXT,
      guardian,
      grok: grok(async () => {
        throw new Error('Grok request failed (503)');
      }),
    });
    expect(compiled.source).toBe('fallback');
    expect(compiled.policy.maxNewPayee).toBe(500);
  });

  it('falls back when no Grok client is configured', async () => {
    const compiled = await compileMandateText({
      text: MANDATE_TEXT,
      guardian,
      grok: null,
    });
    expect(compiled.source).toBe('fallback');
    expect(compiled.policy.alwaysAllow).toContain('pharmacy');
  });
});
