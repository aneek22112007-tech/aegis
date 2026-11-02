import { describe, expect, it } from 'vitest';
import { heuristicCompile } from '../engine/heuristic';
import { summarizePolicy } from '../engine/summary';
import {
  applyOverrides,
  EMPTY_OVERRIDES,
  loadOverrides,
  OVERRIDES_KEY,
  saveOverrides,
} from './overrides';

const base = heuristicCompile(
  'Never send more than $500 to someone new. Always allow my pharmacy.',
  {
    name: 'Priya',
    contact: 'daughter',
  },
);

describe('rule overrides', () => {
  it('applies edits and switches to the policy', () => {
    const p = applyOverrides(base, {
      ...EMPTY_OVERRIDES,
      newPayeeLimit: 250,
      off: ['allow', 'quiet'],
    });
    expect(p.maxNewPayee).toBe(250);
    expect(p.alwaysAllow).toEqual([]);
    expect(p.quietHours.start).toBe(p.quietHours.end);
    expect(summarizePolicy(p)).not.toMatch(/Quiet hours/);
  });

  it('drops a turned-off limit from the summary', () => {
    const p = applyOverrides(base, { ...EMPTY_OVERRIDES, removed: ['newPayee'] });
    expect(summarizePolicy(p)).not.toMatch(/someone you have not paid before/);
  });

  it('round-trips through storage and ignores bad data', () => {
    localStorage.clear();
    saveOverrides({ ...EMPTY_OVERRIDES, off: ['scam'] });
    expect(loadOverrides().off).toEqual(['scam']);
    localStorage.setItem(OVERRIDES_KEY, '{"off":["nope"]}');
    expect(loadOverrides()).toEqual(EMPTY_OVERRIDES);
  });
});
