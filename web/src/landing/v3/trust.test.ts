import liveClient from '../../../../server/src/paypal/liveClient.ts?raw';
import webhooks from '../../../../server/src/routes/webhooks.ts?raw';
import { ORDER_STEPS, VERIFY_PATH, WEBHOOK_HEADERS } from './trust';

/** Keeps the landing page honest: every endpoint we show must exist in the server client. */
describe('trust section copy', () => {
  it.each(ORDER_STEPS.map((s) => [s.id, s.path]))('%s path is called by the server', (_, path) => {
    const pattern = path.replace('{id}', '${');
    expect(liveClient).toContain(pattern.split('${')[0]);
  });

  it('creates orders with intent AUTHORIZE', () => {
    expect(liveClient).toMatch(/intent:\s*'AUTHORIZE'/);
  });

  it('verifies webhooks through the documented endpoint', () => {
    expect(liveClient).toContain(VERIFY_PATH);
  });

  it.each(WEBHOOK_HEADERS.map((h) => [h]))('reads the %s header', (header) => {
    expect(webhooks.toLowerCase()).toContain(`'${header.toLowerCase()}'`);
  });
});
