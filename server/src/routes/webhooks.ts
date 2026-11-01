import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { asyncRoute } from '../http/asyncRoute.js';
import { handlePayPalWebhook } from '../paypal/webhooks.js';
import type { PayPalClient } from '../paypal/types.js';

export function createWebhookRouter(deps: {
  prisma: PrismaClient;
  paypal: PayPalClient;
  webhookId: string;
}): Router {
  const router = Router();
  router.post(
    '/',
    asyncRoute(async (req, res) => {
      const result = await handlePayPalWebhook({
        prisma: deps.prisma,
        paypal: deps.paypal,
        event: req.body,
        verify: {
          transmissionId: req.get('paypal-transmission-id') ?? '',
          transmissionTime: req.get('paypal-transmission-time') ?? '',
          certUrl: req.get('paypal-cert-url') ?? '',
          authAlgo: req.get('paypal-auth-algo') ?? '',
          transmissionSig: req.get('paypal-transmission-sig') ?? '',
          webhookId: deps.webhookId,
          event: req.body,
        },
      });
      res
        .status(result.status)
        .json({ ok: result.status === 200, duplicate: Boolean(result.duplicate) });
    }),
  );
  return router;
}
