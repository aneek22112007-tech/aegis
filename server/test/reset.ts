import type { PrismaClient } from '@prisma/client';

export async function resetDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.webhookEvent.deleteMany();
  await prisma.report.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.payee.deleteMany();
  await prisma.mandate.deleteMany();
  await prisma.guardian.deleteMany();
  await prisma.user.deleteMany();
}
