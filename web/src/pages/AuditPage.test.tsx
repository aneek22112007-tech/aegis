import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { AuditRow } from '../api';
import { AuditPage } from './AuditPage';

vi.mock('ag-grid-react', () => ({
  AgGridReact: ({
    rowData,
    onRowClicked,
  }: {
    rowData: AuditRow[];
    onRowClicked?: (event: { data: AuditRow }) => void;
  }) => (
    <div>
      {rowData.map((row) => (
        <button key={row.id} type="button" onClick={() => onRowClicked?.({ data: row })}>
          {row.payeeName}
        </button>
      ))}
    </div>
  ),
}));

const rows: AuditRow[] = [
  {
    id: 'pay_low',
    payeeName: 'CVS Pharmacy',
    amount: '$48.00',
    amountCents: 4800,
    note: 'Prescription refill',
    score: 8,
    level: 'LOW',
    decision: 'capture',
    status: 'captured',
    resolution: 'sent',
    reasons: ['Trusted payee.'],
    createdAt: '2026-06-02T06:30:00.000Z',
  },
  {
    id: 'pay_high',
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

describe('AuditPage', () => {
  it('filters rows, shows reasons, and downloads the report', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo) => {
        const url = String(input);
        if (url.includes('/export.csv')) {
          return {
            ok: true,
            status: 200,
            blob: async () => new Blob(['when,payee\n']),
            json: async () => ({}),
          };
        }
        if (url.includes('/report')) {
          return {
            ok: true,
            status: 200,
            blob: async () => new Blob(['VOIDED']),
            json: async () => ({}),
          };
        }
        return {
          ok: true,
          status: 200,
          text: async () => JSON.stringify({ payments: rows }),
          json: async () => ({ payments: rows }),
        };
      }),
    );
    vi.stubGlobal('URL', {
      createObjectURL: () => 'blob:report',
      revokeObjectURL: () => undefined,
    });
    HTMLAnchorElement.prototype.click = () => undefined;
    render(
      <MemoryRouter>
        <AuditPage />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('button', { name: 'CVS Pharmacy' })).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Risk'), { target: { value: 'HIGH' } });
    expect(screen.queryByRole('button', { name: 'CVS Pharmacy' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Officer James' }));
    expect(screen.getByText('This note looks like a scam.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Download report' }));
    expect(await screen.findByText('Saved aegis-report-pay_high.txt')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));
    expect(await screen.findByText('Saved aegis-lure-log.csv')).toBeTruthy();
  });
});
