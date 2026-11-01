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
import { RiskChart } from '../dashboard/RiskChart';
import { riskSeries, summarize, usd } from '../dashboard/stats';
import { playAlert, unlockSound } from '../sound';

export function GuardianPage() {
  const [alerts, setAlerts] = useState<PaymentView[]>([]);
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [status, setStatus] = useState('Checking for payments that need you.');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(false);

  const refreshAudit = useCallback(() => {
    void getAudit()
      .then((body) => setRows(Array.isArray(body?.payments) ? body.payments : []))
      .catch(() => undefined);
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
            ? 'Nothing is waiting. Margaret is all set.'
            : waiting === 1
              ? '1 payment needs a decision.'
              : `${waiting} payments need a decision.`,
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
          setStatus(`${incoming.payeeName} is waiting for you.`);
          refreshAudit();
        }
        if (data.type === 'resolved') {
          setAlerts((current) => current.filter((item) => item.id !== data.paymentId));
          if (data.message) setStatus(data.message);
          refreshAudit();
        }
      },
      () => setError('The live connection dropped. This page will keep trying.'),
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
  const series = useMemo(() => riskSeries(rows), [rows]);
  const recent = rows.slice(0, 5);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--d-brand)]">Guardian · Margaret’s account</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
            Priya, a payment may need you.
          </h1>
          <p aria-live="polite" role="status" className="mt-2 text-[var(--d-muted)]">
            {status}
          </p>
        </div>
        <button
          type="button"
          className="rounded-xl border border-[var(--d-line)] px-4 py-2 text-sm font-medium hover:bg-[var(--d-panel-2)]"
          aria-pressed={soundOn}
          onClick={() => {
            unlockSound();
            setSoundOn(true);
            playAlert();
          }}
        >
          {soundOn ? '🔔 Alert sound is on' : '🔕 Turn on alert sound'}
        </button>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-xl px-4 py-3 font-semibold text-white"
          style={{ background: 'var(--d-high)' }}
        >
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Protected"
          value={usd(stats.protectedCents)}
          hint="voided before capture"
          tone="high"
        />
        <KpiCard
          label="Sent safely"
          value={usd(stats.sentCents)}
          hint="captured payments"
          tone="low"
        />
        <KpiCard
          label="Waiting"
          value={String(alerts.length)}
          hint="held for your decision"
          tone="med"
        />
        <KpiCard
          label="Average risk"
          value={String(stats.averageScore)}
          hint={`${stats.total} decisions logged`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Needs a decision</h2>
          {alerts.length === 0 ? (
            <div className="panel flex flex-col items-center gap-2 p-10 text-center">
              <span className="text-4xl" aria-hidden="true">
                🛡️
              </span>
              <p className="font-semibold">No payments are waiting.</p>
              <p className="text-sm text-[var(--d-muted)]">
                Try the{' '}
                <Link className="underline" to="/demo">
                  demo
                </Link>{' '}
                — the $650 payment lands here live.
              </p>
            </div>
          ) : null}
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
              busy={busyId === alert.id}
              onApprove={() => void decide(alert.id, 'approve')}
              onDeny={() => void decide(alert.id, 'deny')}
            />
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <div className="panel p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Risk over time</h2>
              <span className="text-xs text-[var(--d-muted)]">thresholds 35 · 70</span>
            </div>
            <RiskChart data={series} />
            <div className="mt-3 flex gap-4 text-xs text-[var(--d-muted)]">
              <span>
                <b style={{ color: 'var(--d-low)' }}>{stats.byLevel.LOW}</b> low
              </span>
              <span>
                <b style={{ color: 'var(--d-med)' }}>{stats.byLevel.MEDIUM}</b> medium
              </span>
              <span>
                <b style={{ color: 'var(--d-high)' }}>{stats.byLevel.HIGH}</b> high
              </span>
            </div>
          </div>
          <div className="panel p-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">Recent activity</h2>
              <Link to="/audit" className="text-sm text-[var(--d-brand)]">
                Lure Log →
              </Link>
            </div>
            {recent.length === 0 ? (
              <p className="text-sm text-[var(--d-muted)]">Nothing yet.</p>
            ) : null}
            <ul className="divide-y divide-[var(--d-line)]">
              {recent.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{row.payeeName}</span>
                    <span className="text-xs text-[var(--d-muted)]">
                      {new Date(row.createdAt).toLocaleString()}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block font-mono">{row.amount}</span>
                    <span
                      className="text-xs font-semibold uppercase"
                      style={{
                        color:
                          row.level === 'HIGH'
                            ? 'var(--d-high)'
                            : row.level === 'MEDIUM'
                              ? 'var(--d-med)'
                              : 'var(--d-low)',
                      }}
                    >
                      {row.status}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
