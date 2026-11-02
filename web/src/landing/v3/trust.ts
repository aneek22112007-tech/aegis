/** The PayPal calls AEGIS makes, as they appear in server/src/paypal/liveClient.ts. */
export interface TrustStep {
  id: string;
  method: 'POST';
  path: string;
  label: string;
  when: string;
}

export const ORDER_STEPS: TrustStep[] = [
  {
    id: 'create',
    method: 'POST',
    path: '/v2/checkout/orders',
    label: 'Create order with intent AUTHORIZE',
    when: 'Margaret taps Send',
  },
  {
    id: 'authorize',
    method: 'POST',
    path: '/v2/checkout/orders/{id}/authorize',
    label: 'Place a hold on the funds',
    when: 'Before any check runs',
  },
  {
    id: 'capture',
    method: 'POST',
    path: '/v2/payments/authorizations/{id}/capture',
    label: 'Capture: the money moves',
    when: 'Low risk, or Priya approves',
  },
  {
    id: 'void',
    method: 'POST',
    path: '/v2/payments/authorizations/{id}/void',
    label: 'Void: the hold is released',
    when: 'High risk, or Priya denies',
  },
];

/** Headers PayPal sends with every webhook; AEGIS forwards them to verify-webhook-signature. */
export const WEBHOOK_HEADERS = [
  'PAYPAL-TRANSMISSION-ID',
  'PAYPAL-TRANSMISSION-TIME',
  'PAYPAL-TRANSMISSION-SIG',
  'PAYPAL-CERT-URL',
  'PAYPAL-AUTH-ALGO',
] as const;

export const VERIFY_PATH = '/v1/notifications/verify-webhook-signature';

/** What the webhook handler (server/src/paypal/webhooks.ts) answers in each case. */
export const WEBHOOK_OUTCOMES: [string, string][] = [
  ['Signature does not verify', '401, event ignored'],
  ['Event has no id', '400, event ignored'],
  ['Same event delivered twice', '200, processed once'],
  ['Verified and new', '200, payment updated'],
];
