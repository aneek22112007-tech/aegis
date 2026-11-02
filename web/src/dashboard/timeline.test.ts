import { describe, expect, it } from 'vitest';
import { buildTimeline } from './timeline';

const base = { level: 'LOW', score: 8, resolution: null, createdAt: '2026-11-01T10:00:00Z' };

describe('buildTimeline', () => {
  it('ends in capture for a low-risk payment', () => {
    const steps = buildTimeline({ ...base, status: 'captured' });
    expect(steps.map((s) => s.key)).toEqual(['created', 'authorized', 'scored', 'captured']);
  });

  it('shows a held payment as the current step', () => {
    const steps = buildTimeline({ ...base, level: 'MEDIUM', score: 54, status: 'held' });
    expect(steps.at(-1)).toMatchObject({ key: 'held', state: 'current' });
  });

  it('records a guardian denial before the void', () => {
    const steps = buildTimeline({ ...base, status: 'voided', resolution: 'guardian' });
    expect(steps.slice(-2).map((s) => s.key)).toEqual(['denied', 'voided']);
  });
});
