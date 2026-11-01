import type { AppConfig } from '../config.js';
import { mapPayPalFailure } from './errors.js';
import { createTokenCache } from './tokenCache.js';
import type { PayPalClient } from './types.js';

type PayPalJson = Record<string, unknown>;

function apiBase(env: AppConfig['paypal']['env']): string {
  return env === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}

function readAuthorizationId(body: PayPalJson): string {
  const units = body.purchase_units;
  if (!Array.isArray(units)) return '';
  const payments = (units[0] as PayPalJson | undefined)?.payments as PayPalJson | undefined;
  const authorizations = payments?.authorizations;
  if (!Array.isArray(authorizations)) return '';
  const id = (authorizations[0] as PayPalJson | undefined)?.id;
  return typeof id === 'string' ? id : '';
}

export function createLivePayPalClient(
  config: AppConfig,
  fetchImpl: typeof fetch = fetch,
): PayPalClient {
  const base = apiBase(config.paypal.env);
  const cache = createTokenCache();
  const credentials = Buffer.from(
    `${config.paypal.clientId}:${config.paypal.clientSecret}`,
  ).toString('base64');

  async function token(): Promise<string> {
    return cache.get(async () => {
      const response = await fetchImpl(`${base}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });
      const body = (await response.json().catch(() => ({}))) as PayPalJson;
      if (!response.ok) throw mapPayPalFailure(response.status, body);
      const accessToken = body.access_token;
      const expiresIn = body.expires_in;
      if (typeof accessToken !== 'string' || typeof expiresIn !== 'number') {
        throw mapPayPalFailure(502, { name: 'AUTHENTICATION_FAILURE' });
      }
      return { accessToken, expiresIn };
    });
  }

  async function paypalFetch(path: string, init: RequestInit): Promise<PayPalJson> {
    const accessToken = await token();
    const response = await fetchImpl(`${base}${path}`, {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const body = (await response.json().catch(() => ({}))) as PayPalJson;
    if (!response.ok) throw mapPayPalFailure(response.status, body);
    return body;
  }

  return {
    mode: 'live',
    async createOrder(input) {
      const body = await paypalFetch('/v2/checkout/orders', {
        method: 'POST',
        body: JSON.stringify({
          intent: 'AUTHORIZE',
          purchase_units: [
            {
              description: input.description,
              amount: { currency_code: input.currency, value: input.amount },
            },
          ],
        }),
      });
      if (typeof body.id !== 'string') throw mapPayPalFailure(502, body);
      return { id: body.id };
    },
    async authorizeOrder(orderId) {
      const body = await paypalFetch(`/v2/checkout/orders/${orderId}/authorize`, {
        method: 'POST',
      });
      const authorizationId = readAuthorizationId(body);
      if (!authorizationId) throw mapPayPalFailure(502, body);
      return { authorizationId, status: 'CREATED' };
    },
    async captureAuthorization(authorizationId) {
      const body = await paypalFetch(`/v2/payments/authorizations/${authorizationId}/capture`, {
        method: 'POST',
        body: JSON.stringify({ final_capture: true }),
      });
      if (typeof body.id !== 'string') throw mapPayPalFailure(502, body);
      return {
        captureId: body.id,
        status: typeof body.status === 'string' ? body.status : 'COMPLETED',
      };
    },
    async voidAuthorization(authorizationId) {
      await paypalFetch(`/v2/payments/authorizations/${authorizationId}/void`, { method: 'POST' });
      return { status: 'VOIDED' };
    },
    async verifyWebhook(input) {
      const body = await paypalFetch('/v1/notifications/verify-webhook-signature', {
        method: 'POST',
        body: JSON.stringify({
          transmission_id: input.transmissionId,
          transmission_time: input.transmissionTime,
          cert_url: input.certUrl,
          auth_algo: input.authAlgo,
          transmission_sig: input.transmissionSig,
          webhook_id: input.webhookId || config.paypal.webhookId,
          webhook_event: input.event,
        }),
      });
      return body.verification_status === 'SUCCESS';
    },
  };
}
