export type PaymentView = {
  id: string;
  payeeName: string;
  amountCents: number;
  amount: string;
  note: string;
  status: string;
  level: string | null;
  score: number | null;
  decision: string | null;
  resolution: string | null;
  reasons: string[];
  outcome: 'sent' | 'waiting' | 'stopped';
  message: string;
  paypalOrderId: string | null;
  createdAt: string;
};

export type AuditRow = {
  id: string;
  payeeName: string;
  amount: string;
  amountCents: number;
  note: string;
  score: number | null;
  level: string | null;
  decision: string | null;
  status: string;
  resolution: string | null;
  reasons: string[];
  createdAt: string;
};

export type Household = {
  senior: { id: string; name: string } | null;
  guardian: { id: string; name: string; contact: string; relationship: string } | null;
  mandate: {
    id: string;
    version: number;
    rawText: string;
    summary: string;
    source: string;
  } | null;
  payees: { id: string; name: string; status: string }[];
};

export type PublicConfig = {
  paypalClientId: string;
  paypalEnv: string;
  demoMode: boolean;
};

type ErrorBody = { message?: string };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ErrorBody;
    throw new Error(body.message || 'Please try that again.');
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function getHousehold(): Promise<Household> {
  return request('/api/household');
}

export function getPublicConfig(): Promise<PublicConfig> {
  return request('/api/public-config');
}

export function getMandate(): Promise<{ mandate: Household['mandate'] }> {
  return request('/api/mandate');
}

export function compileMandate(
  text: string,
): Promise<{ mandate: NonNullable<Household['mandate']> }> {
  return request('/api/mandate/compile', { method: 'POST', body: JSON.stringify({ text }) });
}

export function createPayment(input: {
  payeeName: string;
  amount: number;
  note: string;
  idempotencyKey: string;
}): Promise<{ payment: PaymentView }> {
  return request('/api/payments/create', {
    method: 'POST',
    body: JSON.stringify(input),
    headers: { 'Idempotency-Key': input.idempotencyKey },
  });
}

export function authorizePayment(id: string): Promise<{ payment: PaymentView }> {
  return request(`/api/payments/${id}/authorize`, { method: 'POST' });
}

export function getPayment(id: string): Promise<{ payment: PaymentView }> {
  return request(`/api/payments/${id}`);
}

export function approvePayment(id: string): Promise<{ payment: PaymentView }> {
  return request(`/api/payments/${id}/approve`, { method: 'POST' });
}

export function denyPayment(id: string): Promise<{ payment: PaymentView }> {
  return request(`/api/payments/${id}/deny`, { method: 'POST' });
}

export function getAlerts(): Promise<{ alerts: PaymentView[] }> {
  return request('/api/guardian/alerts');
}

export function getAudit(): Promise<{ payments: AuditRow[] }> {
  return request('/api/audit');
}

export function runDemo(
  scenario: 'pharmacy' | 'new-payee' | 'scam',
): Promise<{ payment: PaymentView }> {
  return request(`/api/demo/scenarios/${scenario}`, { method: 'POST' });
}

export async function downloadText(path: string, filename: string): Promise<void> {
  const response = await fetch(path);
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ErrorBody;
    throw new Error(body.message || 'That file is not ready.');
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
