import { describe, expect, it } from 'vitest';
import type { AuditRow } from '../api';
import { filterAudit } from './filter';

const rows: AuditRow[] = [
  {
    id: '1',
    payeeName: 'CVS Pharmacy',
    amount: '$48.00',
    amountCents: 4800,
    note: 'Prescription refill',
    score: 8,
    level: 'LOW',
    decision: 'capture',
    status: 'captured',
    resolution: 'sent',
    reasons: [],
    createdAt: '2026-06-02T06:30:00.000Z',
  },
  {
    id: '2',
    payeeName: 'Officer James',
    amount: '$1,900.00',
    amountCents: 190000,
    note: 'URGENT keep this secret',
    score: 100,
    level: 'HIGH',
    decision: 'void',
    status: 'voided',
    resolution: 'rules',
    reasons: ['This note looks like a scam.'],
    createdAt: '2026-06-02T06:31:00.000Z',
  },
];

describe('filterAudit', () => {
  it('keeps a level and a payee search together', () => {
    expect(filterAudit(rows, 'officer', 'HIGH').map((row) => row.id)).toEqual(['2']);
    expect(filterAudit(rows, 'pharmacy', 'HIGH')).toEqual([]);
    expect(filterAudit(rows, 'secret', 'ALL').map((row) => row.payeeName)).toEqual([
      'Officer James',
    ]);
  });
});
