import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  approvePayment,
  denyPayment,
  getAlerts,
  getAudit,
  subscribeGuardian,
  type AuditRow,
  type PaymentView,
} from '../api';
import { AlertCard } from '../components/AlertCard';
import { KpiCard } from '../dashboard/KpiCard';
import { PaymentDrawer } from '../dashboard/PaymentDrawer';
import { PaymentsTable } from '../dashboard/PaymentsTable';
import { ChartLegend, RiskChart } from '../dashboard/RiskChart';
import { dailyVolume, summarize, usd } from '../dashboard/stats';
import { Icon } from '../ui/Icon';
import { playAlert, unlockSound } from '../sound';

export function GuardianPage() {
  const [alerts, setAlerts] = useState<PaymentView[]>([]);
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [status, setStatus] = useState('Checking for payments to review…');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AuditRow | null>(null);

  const refreshAudit = useCallback(() => {
    void getAudit()
      .then((body) => setRows(Array.isArray(body?.payments) ? body.payments : []))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let gone = false;
    refreshAudit();
    void getAlerts()
      .then((body) => {
        if (gone) return;
        setAlerts(body.alerts);
        const waiting = body.alerts.length;
        setStatus(
          waiting === 0
            ? 'Nothing needs your review.'
            : waiting === 1
              ? '1 payment needs your review.'
              : `${waiting} payments need your review.`,
        );
      })
      .catch((cause: unknown) => {
        if (!gone) setError(cause instanceof Error ? cause.message : 'Please try that again.');
      });

    const stop = subscribeGuardian(
      (data) => {
        if (data.type === 'alert') {
          const incoming = data.alert;
          setAlerts((current) => {
            if (current.some((item) => item.id === incoming.paymentId)) return current;
            return [
              {
                id: incoming.paymentId,
                payeeName: incoming.payeeName,
                amount: incoming.amount,
                amountCents: incoming.amountCents,
                note: incoming.note,
                reasons: incoming.reasons,
                score: incoming.score,
                level: incoming.level,
                status: 'held',
                decision: 'hold',
                resolution: 'waiting',
                outcome: 'waiting',
                message: '',
                paypalOrderId: null,
                createdAt: incoming.createdAt,
              },
              ...current,
            ];
          });
          playAlert();
          setStatus(`New: ${incoming.amount} to ${incoming.payeeName} needs review.`);
          refreshAudit();
        }
        if (data.type === 'resolved') {
          setAlerts((current) => current.filter((item) => item.id !== data.paymentId));
          if (data.message) setStatus(data.message);
          refreshAudit();
        }
      },
      () => setError('Live updates paused. Reconnecting…'),
    );
    return () => {
      gone = true;
      stop();
    };
  }, [refreshAudit]);

  async function decide(id: string, action: 'approve' | 'deny') {
    setBusyId(id);
    setError('');
    try {
      const body = action === 'approve' ? await approvePayment(id) : await denyPayment(id);
      setAlerts((current) => current.filter((item) => item.id !== id));
      setStatus(body.payment.message);
      refreshAudit();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Please try that again.');
    } finally {
      setBusyId(null);
    }
  }

  const stats = useMemo(() => summarize(rows), [rows]);
  const volume = useMemo(() => dailyVolume(rows), [rows]);
  const recent = rows.slice(0, 8);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Overview</h1>
          <p aria-live="polite" role="status" className="text-[13px] text-[var(--gray-500)]">
            {status}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          aria-pressed={soundOn}
          onClick={() => {
            unlockSound();
            setSoundOn(true);
            playAlert();
          }}
        >
          <Icon name="volume" />
          {soundOn ? 'Alert sound on' : 'Turn on alert sound'}
        </button>
      </div>

      {error ? (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-md border border-[#f4c7c2] bg-[var(--bad-bg)] px-3 py-2 text-[13px] text-[var(--bad)]"
        >
          <Icon name="alert" />
          {error}
        </p>
      ) : null}

      <div className="panel grid grid-cols-2 gap-px overflow-hidden bg-[var(--gray-200)] lg:grid-cols-4">
        <KpiCard label="Sent" value={usd(stats.sentCents)} hint="Captured payments" tone="low" />
        <KpiCard
          label="Waiting for review"
          value={String(alerts.length)}
          hint="Held authorizations"
          tone="med"
        />
        <KpiCard
          label="Stopped"
          value={usd(stats.protectedCents)}
          hint="Voided before capture"
          tone="high"
        />
        <KpiCard
          label="Average risk score"
          value={String(stats.averageScore)}
          hint={`Across ${stats.total} payments`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section id="approvals" aria-labelledby="approvals-title" className="panel scroll-mt-20">
          <div className="flex items-center justify-between border-b border-[var(--gray-200)] px-5 py-3">
            <h2 id="approvals-title" className="text-[15px] font-semibold">
              Approvals
            </h2>
            <span className="chip chip-neutral">{alerts.length} open</span>
          </div>
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center gap-1 px-5 py-10 text-center">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--gray-100)] text-[var(--gray-500)]">
                <Icon name="inbox" />
              </span>
              <p className="mt-2 text-[13px] font-medium">No payments are waiting.</p>
              <p className="text-xs text-[var(--gray-500)]">
                Held payments show up here in real time.{' '}
                <Link className="text-[var(--brand)] hover:underline" to="/demo">
                  Send a test payment
                </Link>
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--gray-200)]">
              {alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  id={alert.id}
                  payeeName={alert.payeeName}
                  amount={alert.amount}
                  note={alert.note}
                  reasons={alert.reasons}
                  score={alert.score}
                  level={alert.level}
                  createdAt={alert.createdAt}
                  busy={busyId === alert.id}
                  onApprove={() => void decide(alert.id, 'approve')}
                  onDeny={() => void decide(alert.id, 'deny')}
                />
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="volume-title" className="panel">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--gray-200)] px-5 py-3">
            <h2 id="volume-title" className="text-[15px] font-semibold">
              Payment volume
            </h2>
            <ChartLegend />
          </div>
          <div className="px-3 pb-3 pt-4">
            <RiskChart data={volume} />
          </div>
        </section>
      </div>

      <section aria-labelledby="recent-title" className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--gray-200)] px-5 py-3">
          <h2 id="recent-title" className="text-[15px] font-semibold">
            Recent payments
          </h2>
          <Link to="/audit" className="text-[13px] font-medium text-[var(--brand)] hover:underline">
            View all
          </Link>
        </div>
        <PaymentsTable rows={recent} loading={loading} onSelect={setSelected} />
      </section>

      {selected ? <PaymentDrawer payment={selected} onClose={() => setSelected(null)} /> : null}
    </section>
  );
}
