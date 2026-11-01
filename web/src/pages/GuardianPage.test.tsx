import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GuardianPage } from './GuardianPage';

const held = {
  id: 'pay_1',
  payeeName: 'Helen Brooks',
  amountCents: 65000,
  amount: '$650.00',
  note: 'Birthday gift',
  status: 'held',
  level: 'MEDIUM',
  score: 42,
  decision: 'hold',
  resolution: 'waiting',
  reasons: ['This person is new.'],
  outcome: 'waiting',
  message: 'Waiting. We asked Priya to take a look before this goes out.',
  paypalOrderId: 'DEMO-ORDER-1',
  createdAt: '2026-06-02T06:30:00.000Z',
};

class FakeEventSource {
  static current: FakeEventSource | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public url: string) {
    FakeEventSource.current = this;
  }
  close() {}
}

function json(body: unknown) {
  return {
    ok: true,
    status: 200,
    text: async () => JSON.stringify(body),
  };
}

describe('GuardianPage', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    FakeEventSource.current = null;
    vi.stubGlobal('EventSource', FakeEventSource);
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('approves a payment that is waiting', async () => {
    fetchMock.mockImplementation(async (input: RequestInfo) => {
      const url = String(input);
      if (url.endsWith('/approve')) {
        return json({
          payment: {
            ...held,
            outcome: 'sent',
            message: 'Sent. $650.00 is on its way to Helen Brooks.',
          },
        });
      }
      return json({ alerts: [held] });
    });
    render(<GuardianPage />);
    expect(await screen.findByRole('heading', { name: /Helen Brooks/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    expect(await screen.findByText(/on its way to Helen Brooks/)).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/payments/pay_1/approve',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('adds a card when a live alert arrives', async () => {
    fetchMock.mockResolvedValue(json({ alerts: [] }));
    render(<GuardianPage />);
    expect(await screen.findByText('No payments are waiting.')).toBeTruthy();
    await act(async () => {
      FakeEventSource.current?.onmessage?.({
        data: JSON.stringify({
          type: 'alert',
          alert: {
            paymentId: 'pay_9',
            payeeName: 'Officer James',
            amount: '$1,900.00',
            amountCents: 190000,
            note: 'URGENT keep this secret, your grandson needs bail',
            reasons: ['This note looks like a scam.'],
            score: 100,
            level: 'HIGH',
            createdAt: '2026-06-02T06:30:00.000Z',
          },
        }),
      });
    });
    expect(await screen.findByRole('heading', { name: /Officer James/ })).toBeTruthy();
  });
});
