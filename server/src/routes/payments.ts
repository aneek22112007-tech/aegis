import { Router } from 'express';
import { z } from 'zod';
import { asyncRoute } from '../http/asyncRoute.js';
import { PayPalError } from '../paypal/errors.js';
import type { PaymentService } from '../payments/service.js';

const createBody = z.object({
  payeeName: z.string().trim().min(1).max(80),
  amount: z.coerce.number().positive().max(100_000),
  note: z.string().max(500).optional(),
  idempotencyKey: z.string().min(1).max(120).optional(),
});

export function createPaymentRouter(service: PaymentService): Router {
  const router = Router();

  router.post(
    '/create',
    asyncRoute(async (req, res) => {
      const body = createBody.parse(req.body);
      const headerKey = req.get('Idempotency-Key');
      const payment = await service.createPayment({
        ...body,
        idempotencyKey: headerKey || body.idempotencyKey,
      });
      res.status(201).json({ payment });
    }),
  );

  router.get(
    '/:id',
    asyncRoute(async (req, res) => {
      const payment = await service.getPayment(String(req.params.id));
      res.json({ payment });
    }),
  );

  router.post(
    '/:id/authorize',
    asyncRoute(async (req, res) => {
      const payment = await service.authorizePayment(String(req.params.id));
      res.json({ payment });
    }),
  );

  router.post(
    '/:id/approve',
    asyncRoute(async (req, res) => {
      const payment = await service.approve(String(req.params.id));
      res.json({ payment });
    }),
  );

  router.post(
    '/:id/deny',
    asyncRoute(async (req, res) => {
      const payment = await service.deny(String(req.params.id));
      res.json({ payment });
    }),
  );

  router.get(
    '/:id/report',
    asyncRoute(async (req, res) => {
      const body = await service.getReport(String(req.params.id));
      if (!body) {
        throw new PayPalError('There is no report for that payment.', 404, 'NO_REPORT', false);
      }
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(body);
    }),
  );

  return router;
}
