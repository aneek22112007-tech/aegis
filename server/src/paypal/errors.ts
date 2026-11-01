export class PayPalError extends Error {
  readonly status: number;
  readonly code: string;
  readonly retryable: boolean;

  constructor(message: string, status: number, code: string, retryable: boolean) {
    super(message);
    this.name = 'PayPalError';
    this.status = status;
    this.code = code;
    this.retryable = retryable;
  }
}

const FRIENDLY: Record<string, string> = {
  INSTRUMENT_DECLINED: 'The bank declined this payment. No money moved.',
  ORDER_NOT_APPROVED: 'This payment has not been approved yet.',
  ORDER_ALREADY_CAPTURED: 'This payment was already sent.',
  AUTHORIZATION_ALREADY_CAPTURED: 'This payment was already sent.',
  AUTHORIZATION_VOIDED: 'This payment was already stopped.',
  INVALID_RESOURCE_ID: 'PayPal could not find that payment.',
  AUTHENTICATION_FAILURE: 'PayPal did not accept the app login.',
};

function readCode(body: unknown): string {
  if (!body || typeof body !== 'object') return 'PAYPAL_ERROR';
  const record = body as { name?: unknown; details?: Array<{ issue?: unknown }> };
  const issue = record.details?.find((detail) => typeof detail.issue === 'string')?.issue;
  if (typeof issue === 'string' && issue) return issue;
  if (typeof record.name === 'string' && record.name) return record.name;
  return 'PAYPAL_ERROR';
}

export function mapPayPalFailure(status: number, body: unknown): PayPalError {
  const code = readCode(body);
  const message = FRIENDLY[code] ?? 'PayPal could not complete that step. No money was sent.';
  const retryable = status === 429 || status >= 500;
  return new PayPalError(message, status, code, retryable);
}
