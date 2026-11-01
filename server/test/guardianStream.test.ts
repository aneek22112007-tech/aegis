import type { AddressInfo } from 'node:net';
import { afterAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { createPrisma } from '../src/db.js';
import { createHub } from '../src/guardian/hub.js';

const prisma = createPrisma(process.env.DATABASE_URL || 'file:./test.db');

afterAll(async () => {
  await prisma.$disconnect();
});

describe('guardian event stream', () => {
  it('delivers one alert to a subscriber', async () => {
    const hub = createHub();
    const app = createApp({ prisma, grok: null, hub, now: () => new Date(2026, 5, 2, 12, 0, 0) });
    const server = app.listen(0);
    const address = server.address() as AddressInfo;
    const controller = new AbortController();
    try {
      const response = await fetch(`http://127.0.0.1:${address.port}/api/guardian/events`, {
        signal: controller.signal,
      });
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/event-stream');
      const reader = response.body?.getReader();
      if (!reader) throw new Error('missing stream');
      const decoder = new TextDecoder();
      const opened = decoder.decode((await reader.read()).value);
      expect(opened).toContain('event: ready');
      hub.publish({
        type: 'alert',
        alert: {
          paymentId: 'pay_1',
          payeeName: 'Helen Brooks',
          amount: '$650.00',
          amountCents: 65000,
          note: 'Birthday gift',
          reasons: ['This person is new.'],
          score: 42,
          level: 'MEDIUM',
          createdAt: '2026-06-02T12:00:00.000Z',
        },
      });
      const delivered = decoder.decode((await reader.read()).value);
      expect(delivered).toContain('Helen Brooks');
      expect(delivered).toContain('"type":"alert"');
      controller.abort();
    } finally {
      controller.abort();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
