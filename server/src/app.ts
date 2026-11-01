import type { PrismaClient } from '@prisma/client';
import cors from 'cors';
import express from 'express';
import { isPayPalConfigured, loadConfig } from './config.js';
import { createGrokClient, type GrokClient } from './grok/client.js';
import type { GuardianHub } from './guardian/hub.js';
import { createHub } from './guardian/hub.js';
import { errorHandler } from './http/errors.js';
import { createPaymentService, type PaymentService } from './payments/service.js';
import { createPayPalClient } from './paypal/factory.js';
import type { PayPalClient } from './paypal/types.js';
import { createAuditRouter } from './routes/audit.js';
import { createDemoRouter } from './routes/demo.js';
import { createHouseholdRouter } from './routes/household.js';
import { createMandateRouter } from './routes/mandate.js';
import { createPaymentRouter } from './routes/payments.js';
import { createWebhookRouter } from './routes/webhooks.js';

export type AppDeps = {
  prisma: PrismaClient;
  grok?: GrokClient | null;
  paypal?: PayPalClient;
  hub?: GuardianHub;
  now?: () => Date;
  holdTimeoutMs?: number;
  service?: PaymentService;
};

export function createApp(deps?: AppDeps) {
  const config = loadConfig();
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: config.webOrigin }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'aegis' });
  });

  if (deps?.prisma) {
    const paypal = deps.paypal ?? createPayPalClient(config);
    const hub = deps.hub ?? createHub();
    const grok =
      deps.grok === undefined
        ? createGrokClient({
            apiKey: config.xai.apiKey,
            model: config.xai.model,
            baseUrl: config.xai.baseUrl,
          })
        : deps.grok;
    const service =
      deps.service ??
      createPaymentService({
        prisma: deps.prisma,
        paypal,
        grok,
        hub,
        now: deps.now ?? (() => new Date()),
        holdTimeoutMs: deps.holdTimeoutMs ?? config.holdTimeoutMs,
      });

    app.get('/api/public-config', (_req, res) => {
      res.json({
        paypalClientId: config.paypal.clientId,
        paypalEnv: config.paypal.env,
        demoMode: paypal.mode === 'demo' || !isPayPalConfigured(config),
      });
    });
    app.use('/api/mandate', createMandateRouter({ prisma: deps.prisma, grok }));
    app.use('/api/household', createHouseholdRouter(deps.prisma));
    app.use('/api/payments', createPaymentRouter(service));
    app.use('/api/demo', createDemoRouter(service));
    app.use('/api/audit', createAuditRouter(deps.prisma));
    app.use(
      '/api/webhooks/paypal',
      createWebhookRouter({
        prisma: deps.prisma,
        paypal,
        webhookId: config.paypal.webhookId,
      }),
    );
  }

  app.use(errorHandler);
  return app;
}
