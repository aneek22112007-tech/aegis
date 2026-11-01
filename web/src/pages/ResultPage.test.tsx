import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ResultPage } from './ResultPage';

describe('ResultPage', () => {
  it('shows the plain-language result', async () => {
    vi.stubGlobal('speechSynthesis', { speak: vi.fn(), cancel: vi.fn() });
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class {
        lang = '';
        rate = 1;
        constructor(public text: string) {}
      },
    );
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            payment: {
              id: 'pay_1',
              payeeName: 'CVS Pharmacy',
              amount: '$48.00',
              amountCents: 4800,
              note: '',
              status: 'captured',
              level: 'LOW',
              score: 8,
              decision: 'capture',
              resolution: 'sent',
              reasons: [],
              outcome: 'sent',
              message: 'Sent. $48.00 is on its way to CVS Pharmacy.',
              paypalOrderId: null,
              createdAt: '2026-06-02T06:30:00.000Z',
            },
          }),
      })),
    );
    render(
      <MemoryRouter initialEntries={['/senior/result/pay_1']}>
        <Routes>
          <Route path="/senior/result/:id" element={<ResultPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { name: /on its way to CVS Pharmacy/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Read this aloud' })).toBeTruthy();
  });
});
