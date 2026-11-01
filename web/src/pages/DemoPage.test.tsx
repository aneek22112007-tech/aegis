import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { DemoPage } from './DemoPage';

describe('DemoPage', () => {
  it('starts the pharmacy scenario', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        status: 201,
        text: async () =>
          JSON.stringify({
            payment: {
              id: 'pay_demo',
              outcome: 'sent',
              message: 'Sent. $48.00 is on its way to CVS Pharmacy.',
            },
          }),
      })),
    );
    render(
      <MemoryRouter initialEntries={['/demo']}>
        <Routes>
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/senior/result/:id" element={<p>Arrived</p>} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Pay CVS Pharmacy $48' }));
    expect(await screen.findByText('Arrived')).toBeTruthy();
  });
});
