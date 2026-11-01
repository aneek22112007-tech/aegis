export type PayPalOrder = { id: string };

export type PayPalAuthorization = {
  authorizationId: string;
  status: string;
};

export type PayPalCapture = {
  captureId: string;
  status: string;
};

export type PayPalVoid = { status: string };

export type WebhookVerifyInput = {
  transmissionId: string;
  transmissionTime: string;
  certUrl: string;
  authAlgo: string;
  transmissionSig: string;
  webhookId: string;
  event: unknown;
};

export type PayPalClient = {
  readonly mode: 'demo' | 'live';
  createOrder(input: {
    amount: string;
    currency: string;
    description: string;
  }): Promise<PayPalOrder>;
  authorizeOrder(orderId: string): Promise<PayPalAuthorization>;
  captureAuthorization(authorizationId: string): Promise<PayPalCapture>;
  voidAuthorization(authorizationId: string): Promise<PayPalVoid>;
  verifyWebhook(input: WebhookVerifyInput): Promise<boolean>;
};
