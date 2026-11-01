import type { PrismaClient } from '@prisma/client';
import { recordAudit } from '../audit/logger.js';
import type { PayPalClient, WebhookVerifyInput } from './types.js';

type PayPalEvent = {
  id?: string;
  event_type?: string;
  resource?: {
    id?: string;
    supplementary_data?: { related_ids?: { order_id?: string; authorization_id?: string } };
  };
};

function relatedOrderId(event: PayPalEvent): string {
  return event.resource?.supplementary_data?.related_ids?.order_id ?? '';
}

export async function handlePayPalWebhook(input: {
  prisma: PrismaClient;
  paypal: PayPalClient;
  verify: WebhookVerifyInput;
  event: PayPalEvent;
}): Promise<{ status: number; duplicate?: boolean }> {
  const verified = await input.paypal.verifyWebhook(input.verify);
  if (!verified) return { status: 401 };
  const eventId = input.event.id;
  const eventType = input.event.event_type || 'unknown';
  if (!eventId) return { status: 400 };
  const existing = await input.prisma.webhookEvent.findUnique({ where: { id: eventId } });
  if (existing) return { status: 200, duplicate: true };
  await input.prisma.webhookEvent.create({
    data: { id: eventId, eventType, payload: JSON.stringify(input.event) },
  });

  const resourceId = input.event.resource?.id ?? '';
  const orderId = relatedOrderId(input.event);
  if (eventType === 'AUTHORIZATION.CREATED' || eventType === 'PAYMENT.AUTHORIZATION.CREATED') {
    const payment = orderId
      ? await input.prisma.payment.findFirst({ where: { paypalOrderId: orderId } })
      : null;
    if (payment && resourceId) {
      await input.prisma.payment.update({
        where: { id: payment.id },
        data: { paypalAuthId: payment.paypalAuthId || resourceId },
      });
    }
  }
  if (eventType === 'AUTHORIZATION.VOIDED' || eventType === 'PAYMENT.AUTHORIZATION.VOIDED') {
    const payment = await input.prisma.payment.findFirst({ where: { paypalAuthId: resourceId } });
    if (payment && payment.status !== 'captured' && payment.status !== 'voided') {
      await input.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'voided', resolution: payment.resolution ?? 'rules', decision: 'void' },
      });
    }
  }
  if (eventType === 'CAPTURE.COMPLETED' || eventType === 'PAYMENT.CAPTURE.COMPLETED') {
    const authId = input.event.resource?.supplementary_data?.related_ids?.authorization_id;
    const payment = authId
      ? await input.prisma.payment.findFirst({ where: { paypalAuthId: authId } })
      : await input.prisma.payment.findFirst({ where: { paypalOrderId: orderId } });
    if (payment && payment.status !== 'voided' && payment.status !== 'captured') {
      await input.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'captured',
          resolution: 'sent',
          paypalCaptureId: resourceId,
          decision: 'capture',
        },
      });
    }
  }
  await recordAudit(input.prisma, {
    paymentId: undefined,
    eventType: 'webhook.received',
    actor: 'webhook',
    payload: { id: eventId, type: eventType },
  });
  return { status: 200 };
}
