import type { PayPalClient } from './types.js';

export function createDemoPayPalClient(): PayPalClient {
  let sequence = 0;
  return {
    mode: 'demo',
    async createOrder() {
      sequence += 1;
      return { id: `DEMO-ORDER-${sequence}` };
    },
    async authorizeOrder(orderId) {
      return { authorizationId: `DEMO-AUTH-${orderId}`, status: 'CREATED' };
    },
    async captureAuthorization(authorizationId) {
      return { captureId: `DEMO-CAP-${authorizationId}`, status: 'COMPLETED' };
    },
    async voidAuthorization() {
      return { status: 'VOIDED' };
    },
    async verifyWebhook(input) {
      return input.transmissionSig === 'demo-valid' && input.event !== null;
    },
  };
}
