import { describe, expect, it } from 'vitest';
import type { PaymentView } from '../api';
import { SCENARIOS, stepIndex, toneFor, verdictFor } from './scenarios';

const base = { outcome: 'sent' } as PaymentView;

describe('demo scenarios', () => {
  it('lists the three demo cases in order of risk', () => {
    expect(SCENARIOS.map((s) => s.tone)).toEqual(['low', 'medium', 'high']);
  });

  it('maps phases to pipeline steps', () => {
    expect(stepIndex('idle')).toBe(-1);
    expect(stepIndex('authorize')).toBe(0);
    expect(stepIndex('done')).toBe(3);
  });

  it('uses the engine thresholds for tone', () => {
    expect(toneFor(34)).toBe('low');
    expect(toneFor(35)).toBe('medium');
    expect(toneFor(70)).toBe('high');
  });

  it('describes each verdict, including the guardian decision', () => {
    expect(verdictFor(base).title).toBe('Captured');
    expect(verdictFor({ ...base, outcome: 'waiting' }).tone).toBe('medium');
    expect(verdictFor(base, 'approved').title).toBe('Approved by Priya');
    expect(verdictFor({ ...base, outcome: 'stopped' }, 'denied').title).toBe('Denied by Priya');
    expect(verdictFor({ ...base, outcome: 'stopped' }).action).toBe('Authorization voided');
  });
});
