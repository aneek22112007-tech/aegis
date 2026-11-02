import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PayPage } from './PayPage';

function json(body: unknown) {
  return { ok: true, status: 200, text: async () => JSON.stringify(body) };
}

const payment = {
  id: 'pay_1',
  payeeName: 'CVS Pharmacy',
  amountCents: 4800,
  amount: '$48.00',
  note: 'Prescription refill',
  status: 'captured',
  level: 'LOW',
  score: 8,
  decision: 'capture',
  resolution: 'sent',
  reasons: [],
  outcome: 'sent',
  message: 'Sent. $48.00 is on its way to CVS Pharmacy.',
  paypalOrderId: 'DEMO-ORDER-1',
  createdAt: '2026-06-02T06:30:00.000Z',
};

describe('PayPage', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo) => {
        const url = String(input);
        if (url.includes('/public-config')) {
          return json({ paypalClientId: '', paypalEnv: 'sandbox', demoMode: true });
        }
        if (url.includes('/household')) {
          return json({
            senior: null,
            guardian: null,
            mandate: null,
            payees: [{ id: 'p1', name: 'CVS Pharmacy', status: 'trusted' }],
          });
        }
        if (url.endsWith('/authorize')) return json({ payment });
        return json({ payment });
      }),
    );
  });

  it('checks a payment and opens the result', async () => {
    render(
      <MemoryRouter initialEntries={['/senior/pay']}>
        <Routes>
          <Route path="/senior/pay" element={<PayPage />} />
          <Route path="/senior/result/:id" element={<p>Arrived</p>} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText('Who are you paying?'), {
      target: { value: 'CVS Pharmacy' },
    });
    fireEvent.change(screen.getByLabelText('How much?'), { target: { value: '48' } });
    fireEvent.click(screen.getByRole('button', { name: /Review payment/ }));
    expect(screen.getByText('$48.00')).toBeTruthy();
    expect(screen.getByText('to CVS Pharmacy')).toBeTruthy();
    fireEvent.click(await screen.findByRole('button', { name: 'Check and send' }));
    expect(await screen.findByText('Arrived', {}, { timeout: 4000 })).toBeTruthy();
  });

  it('fills the payee from a trusted chip and keeps review disabled until an amount is set', async () => {
    render(
      <MemoryRouter initialEntries={['/senior/pay']}>
        <Routes>
          <Route path="/senior/pay" element={<PayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(await screen.findByRole('button', { name: /CVS Pharmacy/ }));
    expect((screen.getByLabelText('Who are you paying?') as HTMLInputElement).value).toBe(
      'CVS Pharmacy',
    );
    expect(
      (screen.getByRole('button', { name: /Review payment/ }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });
});
