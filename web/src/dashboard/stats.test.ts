import { describe, expect, it } from 'vitest';
import type { AuditRow } from '../api';
import { riskSeries, summarize, usd } from './stats';

function row(partial: Partial<AuditRow>): AuditRow {
  return {
    id: 'r',
    payeeName: 'X',
    amount: '$1.00',
    amountCents: 100,
    note: '',
    score: 10,
    level: 'LOW',
    decision: 'capture',
    status: 'captured',
    resolution: null,
    reasons: [],
    createdAt: '2026-06-02T10:00:00.000Z',
    ...partial,
  };
}

describe('dashboard stats', () => {
  const rows = [
    row({ id: 'a', amountCents: 4800, score: 8, createdAt: '2026-06-02T12:00:00.000Z' }),
    row({
      id: 'b',
      amountCents: 65000,
      score: 42,
      level: 'MEDIUM',
      status: 'held',
      createdAt: '2026-06-02T09:00:00.000Z',
    }),
    row({
      id: 'c',
      amountCents: 190000,
      score: 100,
      level: 'HIGH',
      status: 'voided',
      createdAt: '2026-06-02T11:00:00.000Z',
    }),
  ];

  it('totals captured, voided and held payments', () => {
    const stats = summarize(rows);
    expect(stats.sentCents).toBe(4800);
    expect(stats.protectedCents).toBe(190000);
    expect(stats.held).toBe(1);
    expect(stats.averageScore).toBe(50);
    expect(stats.byLevel).toEqual({ LOW: 1, MEDIUM: 1, HIGH: 1 });
  });

  it('orders the risk series oldest first', () => {
    expect(riskSeries(rows).map((point) => point.score)).toEqual([42, 100, 8]);
  });

  it('handles an empty log and formats dollars', () => {
    expect(summarize([]).averageScore).toBe(0);
    expect(usd(190000)).toBe('$1,900.00');
  });
});
