import type { PrismaClient } from '@prisma/client';

export async function recordAudit(
  prisma: PrismaClient,
  event: {
    userId?: string | null;
    paymentId?: string | null;
    eventType: string;
    actor: string;
    payload: unknown;
  },
): Promise<void> {
  await prisma.auditEvent.create({
    data: {
      userId: event.userId ?? null,
      paymentId: event.paymentId ?? null,
      eventType: event.eventType,
      actor: event.actor,
      payload: JSON.stringify(event.payload ?? {}),
    },
  });
}
