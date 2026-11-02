import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DemoPage } from './DemoPage';

function payment(outcome: string, message: string) {
  return {
    id: 'pay_demo',
    payeeName: 'Helen Brooks',
    amount: '$650.00',
    amountCents: 65000,
    note: 'Birthday gift',
    status: outcome,
    level: 'MEDIUM',
    score: 64,
    decision: null,
    resolution: null,
    reasons: ['You have not paid this person before.'],
    outcome,
    message,
    paypalOrderId: 'ORDER-123',
    createdAt: new Date().toISOString(),
  };
}

function respond(body: unknown) {
  return { ok: true, status: 200, text: async () => JSON.stringify(body) };
}

describe('DemoPage', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      onchange: null,
      dispatchEvent: () => false,
    }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it('runs the pipeline and lets the guardian approve the held payment', async () => {
    const fetchMock = vi.fn(async (url: string) =>
      String(url).includes('/approve')
        ? respond({ payment: payment('sent', 'Sent. $650.00 is on its way to Helen Brooks.') })
        : respond({ payment: payment('waiting', 'Waiting. We asked Priya.') }),
    );
    vi.stubGlobal('fetch', fetchMock);
    render(
      <MemoryRouter>
        <DemoPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Run Helen Brooks $650' }));
    expect(await screen.findByText('Risk 64 · Medium')).toBeTruthy();
    expect(await screen.findByText('guardian.alert.created')).toBeTruthy();
    expect(await screen.findByText('You have not paid this person before.')).toBeTruthy();
    expect((await screen.findByRole('status')).textContent).toContain('Held for Priya');
    expect(screen.getAllByText('ORDER-123').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    expect(await screen.findByText('Approved by Priya')).toBeTruthy();
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/approve'))).toBe(true);
  });

  it('shows the error when a run fails and resets on Start over', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server down' }),
        text: async () => JSON.stringify({ message: 'Server down' }),
      })),
    );
    render(
      <MemoryRouter>
        <DemoPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Run CVS Pharmacy $48' }));
    expect((await screen.findByRole('alert')).textContent).toContain('Server down');
    fireEvent.click(screen.getByRole('button', { name: 'Start over' }));
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByText(/Choose a scenario/)).toBeTruthy();
  });
});
