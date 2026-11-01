import type { Payment, Payee, PrismaClient } from '@prisma/client';
import { recordAudit } from '../audit/logger.js';
import type { GuardianHub } from '../guardian/hub.js';
import type { GrokClient } from '../grok/client.js';
import { dollarsToCents, formatUsd } from '../lib/money.js';
import { getActiveMandate } from '../mandate/store.js';
import { normalizePayeeName } from '../payees/names.js';
import type { PayPalClient } from '../paypal/types.js';
import { PayPalError } from '../paypal/errors.js';
import { buildFtcReport } from '../reports/ftc.js';
import { evaluateRisk } from '../risk/evaluate.js';
import { rewriteDecision } from '../risk/rewrite.js';
import type { PayeeStatus, RiskDecision } from '../risk/types.js';
import { SENIOR_ID } from '../seed/household.js';
import { seniorMessage, type SeniorOutcome } from './copy.js';

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
  outcome: SeniorOutcome;
  message: string;
  paypalOrderId: string | null;
  createdAt: string;
};

export type PaymentServiceDeps = {
  prisma: PrismaClient;
  paypal: PayPalClient;
  grok: GrokClient | null;
  hub: GuardianHub;
  now: () => Date;
  holdTimeoutMs: number;
  seniorId?: string;
};

type PaymentWithPayee = Payment & { payee: Payee | null };

function parseReasons(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export function createPaymentService(deps: PaymentServiceDeps) {
  const seniorId = deps.seniorId ?? SENIOR_ID;

  async function guardianName(): Promise<string> {
    const guardian = await deps.prisma.guardian.findFirst({ where: { seniorId } });
    return guardian?.name || 'Priya';
  }

  async function present(payment: PaymentWithPayee): Promise<PaymentView> {
    const name = await guardianName();
    const copy = seniorMessage({
      status: payment.status,
      resolution: payment.resolution,
      payeeName: payment.payee?.displayName || 'that payee',
      amountCents: payment.amountCents,
      guardianName: name,
    });
    return {
      id: payment.id,
      payeeName: payment.payee?.displayName || 'Unknown',
      amountCents: payment.amountCents,
      amount: formatUsd(payment.amountCents),
      note: payment.note,
      status: payment.status,
      level: payment.riskLevel,
      score: payment.riskScore,
      decision: payment.decision,
      resolution: payment.resolution,
      reasons: parseReasons(payment.riskReasons),
      outcome: copy.outcome,
      message: copy.message,
      paypalOrderId: payment.paypalOrderId,
      createdAt: payment.createdAt.toISOString(),
    };
  }

  async function load(id: string): Promise<PaymentWithPayee> {
    const payment = await deps.prisma.payment.findUnique({
      where: { id },
      include: { payee: true },
    });
    if (!payment || payment.userId !== seniorId) {
      throw new PayPalError('We could not find that payment.', 404, 'NOT_FOUND', false);
    }
    return payment;
  }

  async function findOrCreatePayee(payeeName: string): Promise<Payee> {
    const normalizedName = normalizePayeeName(payeeName);
    const displayName = payeeName.trim().replace(/\s+/g, ' ');
    const existing = await deps.prisma.payee.findUnique({
      where: { userId_normalizedName: { userId: seniorId, normalizedName } },
    });
    if (existing) return existing;
    return deps.prisma.payee.create({
      data: { userId: seniorId, displayName, normalizedName, status: 'unknown' },
    });
  }

  async function decide(payment: PaymentWithPayee): Promise<RiskDecision> {
    const mandate = await getActiveMandate(deps.prisma, seniorId);
    if (!mandate) {
      throw new PayPalError('There are no rules saved yet.', 409, 'NO_MANDATE', false);
    }
    const since = new Date(deps.now().getTime() - 24 * 60 * 60 * 1000);
    const recent = await deps.prisma.payment.findMany({
      where: {
        userId: seniorId,
        id: { not: payment.id },
        createdAt: { gte: since },
        status: { in: ['captured', 'held'] },
      },
    });
    const history = payment.payeeId
      ? await deps.prisma.payment.findMany({
          where: { payeeId: payment.payeeId, id: { not: payment.id }, status: 'captured' },
          select: { amountCents: true },
        })
      : [];
    const status = (payment.payee?.status ?? 'unknown') as PayeeStatus;
    const decision = evaluateRisk({
      amount: payment.amountCents / 100,
      payeeName: payment.payee?.displayName ?? '',
      note: payment.note,
      payeeStatus: status === 'trusted' || status === 'blocked' ? status : 'unknown',
      recentPaymentCount: recent.length,
      recentPaymentTotal: recent.reduce((sum, row) => sum + row.amountCents, 0) / 100,
      historyAmounts: history.map((row) => row.amountCents / 100),
      now: deps.now(),
      policy: mandate.policy,
    });
    return rewriteDecision(decision, deps.grok);
  }

  async function blockAndReport(payment: PaymentWithPayee, reasons: string[]): Promise<void> {
    if (payment.payeeId) {
      await deps.prisma.payee.update({
        where: { id: payment.payeeId },
        data: { status: 'blocked' },
      });
    }
    const guardian = await deps.prisma.guardian.findFirst({ where: { seniorId } });
    const senior = await deps.prisma.user.findUnique({ where: { id: seniorId } });
    const body = buildFtcReport({
      seniorName: senior?.name || 'Margaret',
      guardianName: guardian?.name || 'Priya',
      guardianContact: guardian?.contact || 'daughter',
      payeeName: payment.payee?.displayName || 'Unknown',
      amountCents: payment.amountCents,
      note: payment.note,
      reasons,
      createdAt: deps.now(),
    });
    await deps.prisma.report.upsert({
      where: { paymentId: payment.id },
      update: { body },
      create: { paymentId: payment.id, body },
    });
    await recordAudit(deps.prisma, {
      userId: seniorId,
      paymentId: payment.id,
      eventType: 'report.drafted',
      actor: 'system',
      payload: { payee: payment.payee?.displayName },
    });
  }

  return {
    async createPayment(input: {
      payeeName: string;
      amount: number;
      note?: string;
      idempotencyKey?: string;
    }): Promise<PaymentView> {
      if (input.idempotencyKey) {
        const existing = await deps.prisma.payment.findUnique({
          where: { idempotencyKey: input.idempotencyKey },
          include: { payee: true },
        });
        if (existing) return present(existing);
      }
      const payee = await findOrCreatePayee(input.payeeName);
      const amountCents = dollarsToCents(input.amount);
      let orderId = '';
      try {
        const order = await deps.paypal.createOrder({
          amount: input.amount.toFixed(2),
          currency: 'USD',
          description: `Payment to ${payee.displayName}`,
        });
        orderId = order.id;
      } catch (error) {
        if (error instanceof PayPalError) throw error;
        throw new PayPalError(
          'PayPal could not start this payment. No money moved.',
          502,
          'ORDER_FAILED',
          true,
        );
      }
      const payment = await deps.prisma.payment.create({
        data: {
          userId: seniorId,
          payeeId: payee.id,
          amountCents,
          note: input.note?.trim() ?? '',
          status: 'created',
          paypalOrderId: orderId,
          idempotencyKey: input.idempotencyKey,
        },
        include: { payee: true },
      });
      await recordAudit(deps.prisma, {
        userId: seniorId,
        paymentId: payment.id,
        eventType: 'payment.created',
        actor: 'senior',
        payload: { payee: payee.displayName, amountCents },
      });
      return present(payment);
    },

    async authorizePayment(id: string): Promise<PaymentView> {
      const payment = await load(id);
      if (payment.status !== 'created') return present(payment);
      let authorizationId = payment.paypalAuthId ?? '';
      try {
        const authorization = await deps.paypal.authorizeOrder(payment.paypalOrderId || '');
        authorizationId = authorization.authorizationId;
      } catch (error) {
        await deps.prisma.payment.update({
          where: { id },
          data: { status: 'failed', resolution: 'rules' },
        });
        throw error;
      }
      await deps.prisma.payment.update({
        where: { id },
        data: { paypalAuthId: authorizationId, status: 'authorized' },
      });
      const fresh = await load(id);
      const decision = await decide(fresh);
      return this.applyDecision(id, decision, authorizationId);
    },

    async applyDecision(
      id: string,
      decision: RiskDecision,
      authorizationId: string,
    ): Promise<PaymentView> {
      const reasons = JSON.stringify(decision.reasons);
      const base = {
        riskScore: decision.score,
        riskLevel: decision.level,
        riskReasons: reasons,
        decision: decision.decision,
        paypalAuthId: authorizationId,
      };
      if (decision.decision === 'capture') {
        try {
          const capture = await deps.paypal.captureAuthorization(authorizationId);
          const saved = await deps.prisma.payment.update({
            where: { id },
            data: {
              ...base,
              status: 'captured',
              resolution: 'sent',
              paypalCaptureId: capture.captureId,
            },
            include: { payee: true },
          });
          await recordAudit(deps.prisma, {
            userId: seniorId,
            paymentId: id,
            eventType: 'payment.captured',
            actor: 'system',
            payload: { score: decision.score, level: decision.level },
          });
          return present(saved);
        } catch (error) {
          await deps.prisma.payment.update({
            where: { id },
            data: { ...base, status: 'failed', resolution: 'rules' },
          });
          throw error;
        }
      }
      if (decision.decision === 'hold') {
        const holdExpiresAt = new Date(deps.now().getTime() + deps.holdTimeoutMs);
        const saved = await deps.prisma.payment.update({
          where: { id },
          data: { ...base, status: 'held', resolution: 'waiting', holdExpiresAt },
          include: { payee: true },
        });
        const view = await present(saved);
        deps.hub.publish({
          type: 'alert',
          alert: {
            paymentId: saved.id,
            payeeName: view.payeeName,
            amount: view.amount,
            amountCents: saved.amountCents,
            note: saved.note,
            reasons: decision.reasons,
            score: decision.score,
            level: decision.level,
            createdAt: saved.createdAt.toISOString(),
          },
        });
        await recordAudit(deps.prisma, {
          userId: seniorId,
          paymentId: id,
          eventType: 'payment.held',
          actor: 'system',
          payload: { score: decision.score, reasons: decision.reasons },
        });
        return view;
      }
      let voided = true;
      try {
        await deps.paypal.voidAuthorization(authorizationId);
      } catch (error) {
        voided = false;
        await recordAudit(deps.prisma, {
          userId: seniorId,
          paymentId: id,
          eventType: 'payment.void_failed',
          actor: 'system',
          payload: { message: error instanceof Error ? error.message : 'void failed' },
        });
      }
      const saved = await deps.prisma.payment.update({
        where: { id },
        data: {
          ...base,
          status: voided ? 'voided' : 'failed',
          resolution: 'rules',
          decision: 'void',
        },
        include: { payee: true },
      });
      if (decision.level === 'HIGH') await blockAndReport(saved, decision.reasons);
      await recordAudit(deps.prisma, {
        userId: seniorId,
        paymentId: id,
        eventType: 'payment.voided',
        actor: 'system',
        payload: { score: decision.score, level: decision.level },
      });
      if (!voided) {
        throw new PayPalError(
          'We stopped this here, but PayPal did not confirm the void.',
          502,
          'VOID_FAILED',
          true,
        );
      }
      return present(saved);
    },

    async approve(id: string): Promise<PaymentView> {
      const payment = await load(id);
      if (payment.status !== 'held' || !payment.paypalAuthId) {
        throw new PayPalError('That payment is not waiting for an answer.', 409, 'NOT_HELD', false);
      }
      const capture = await deps.paypal.captureAuthorization(payment.paypalAuthId);
      const saved = await deps.prisma.payment.update({
        where: { id },
        data: {
          status: 'captured',
          resolution: 'sent',
          paypalCaptureId: capture.captureId,
          decision: 'capture',
        },
        include: { payee: true },
      });
      const view = await present(saved);
      deps.hub.publish({ type: 'resolved', paymentId: id, outcome: 'sent', message: view.message });
      await recordAudit(deps.prisma, {
        userId: seniorId,
        paymentId: id,
        eventType: 'guardian.approved',
        actor: 'guardian',
        payload: { payee: view.payeeName },
      });
      return view;
    },

    async deny(id: string): Promise<PaymentView> {
      const payment = await load(id);
      if (payment.status !== 'held' || !payment.paypalAuthId) {
        throw new PayPalError('That payment is not waiting for an answer.', 409, 'NOT_HELD', false);
      }
      await deps.paypal.voidAuthorization(payment.paypalAuthId);
      const saved = await deps.prisma.payment.update({
        where: { id },
        data: { status: 'voided', resolution: 'guardian', decision: 'void' },
        include: { payee: true },
      });
      const view = await present(saved);
      deps.hub.publish({
        type: 'resolved',
        paymentId: id,
        outcome: 'stopped',
        message: view.message,
      });
      await recordAudit(deps.prisma, {
        userId: seniorId,
        paymentId: id,
        eventType: 'guardian.denied',
        actor: 'guardian',
        payload: { payee: view.payeeName },
      });
      return view;
    },

    async voidExpiredHolds(): Promise<number> {
      const now = deps.now();
      const expired = await deps.prisma.payment.findMany({
        where: { status: 'held', holdExpiresAt: { lt: now } },
        include: { payee: true },
      });
      for (const payment of expired) {
        if (payment.paypalAuthId) {
          try {
            await deps.paypal.voidAuthorization(payment.paypalAuthId);
          } catch (error) {
            await recordAudit(deps.prisma, {
              userId: seniorId,
              paymentId: payment.id,
              eventType: 'payment.void_failed',
              actor: 'system',
              payload: { message: error instanceof Error ? error.message : 'void failed' },
            });
            continue;
          }
        }
        await deps.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'voided', resolution: 'timeout', decision: 'void' },
        });
        const view = await present({
          ...payment,
          status: 'voided',
          resolution: 'timeout',
          decision: 'void',
        });
        deps.hub.publish({
          type: 'resolved',
          paymentId: payment.id,
          outcome: 'stopped',
          message: view.message,
        });
        await recordAudit(deps.prisma, {
          userId: seniorId,
          paymentId: payment.id,
          eventType: 'hold.expired',
          actor: 'system',
          payload: {},
        });
      }
      return expired.length;
    },

    async listHeld(): Promise<PaymentView[]> {
      const rows = await deps.prisma.payment.findMany({
        where: { userId: seniorId, status: 'held' },
        include: { payee: true },
        orderBy: { createdAt: 'desc' },
      });
      const views: PaymentView[] = [];
      for (const row of rows) views.push(await present(row));
      return views;
    },

    async getPayment(id: string): Promise<PaymentView> {
      return present(await load(id));
    },

    async getReport(id: string): Promise<string | null> {
      const report = await deps.prisma.report.findUnique({ where: { paymentId: id } });
      return report?.body ?? null;
    },
  };
}

export type PaymentService = ReturnType<typeof createPaymentService>;
