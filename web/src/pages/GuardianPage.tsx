import { useEffect, useState } from 'react';
import { approvePayment, denyPayment, getAlerts, type PaymentView } from '../api';
import { AlertCard } from '../components/AlertCard';
import { playAlert, unlockSound } from '../sound';

export function GuardianPage() {
  const [alerts, setAlerts] = useState<PaymentView[]>([]);
  const [status, setStatus] = useState('Checking for payments that need you.');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    let gone = false;
    void getAlerts()
      .then((body) => {
        if (gone) return;
        setAlerts(body.alerts);
        setStatus(
          body.alerts.length === 0
            ? 'Nothing is waiting. Margaret is all set.'
            : `${body.alerts.length} payment${body.alerts.length === 1 ? '' : 's'} need a decision.`,
        );
      })
      .catch((cause: unknown) => {
        if (!gone) setError(cause instanceof Error ? cause.message : 'Please try that again.');
      });

    const source = new EventSource('/api/guardian/events');
    source.onmessage = (event) => {
      const data = JSON.parse(String(event.data)) as {
        type?: string;
        alert?: {
          paymentId: string;
          payeeName: string;
          amount: string;
          amountCents: number;
          note: string;
          reasons: string[];
          score: number;
          level: string;
          createdAt: string;
        };
        paymentId?: string;
        message?: string;
      };
      if (data.type === 'alert' && data.alert) {
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
      }
      if (data.type === 'resolved' && data.paymentId) {
        setAlerts((current) => current.filter((item) => item.id !== data.paymentId));
        if (data.message) setStatus(data.message);
      }
    };
    source.onerror = () => {
      setError('The live connection dropped. This page will keep trying.');
    };
    return () => {
      gone = true;
      source.close();
    };
  }, []);

  async function decide(id: string, action: 'approve' | 'deny') {
    setBusyId(id);
    setError('');
    try {
      const body = action === 'approve' ? await approvePayment(id) : await denyPayment(id);
      setAlerts((current) => current.filter((item) => item.id !== id));
      setStatus(body.payment.message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Please try that again.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-5 px-6 py-8">
      <p className="text-base font-bold tracking-wide text-[var(--accent)]">Guardian</p>
      <h1 className="text-4xl font-bold">Priya, a payment may need you.</h1>
      <p aria-live="polite" role="status">
        {status}
      </p>
      <button
        type="button"
        className="min-h-14 w-fit rounded-xl border-4 border-[var(--ink)] px-5 py-3 font-bold"
        aria-pressed={soundOn}
        onClick={() => {
          unlockSound();
          setSoundOn(true);
          playAlert();
        }}
      >
        {soundOn ? 'Alert sound is on' : 'Turn on alert sound'}
      </button>
      {error ? (
        <p role="alert" className="rounded-xl bg-[var(--danger)] px-4 py-3 font-bold text-white">
          {error}
        </p>
      ) : null}
      {alerts.length === 0 ? <p>No payments are waiting.</p> : null}
      {alerts.map((alert) => (
        <AlertCard
          key={alert.id}
          id={alert.id}
          payeeName={alert.payeeName}
          amount={alert.amount}
          note={alert.note}
          reasons={alert.reasons}
          busy={busyId === alert.id}
          onApprove={() => void decide(alert.id, 'approve')}
          onDeny={() => void decide(alert.id, 'deny')}
        />
      ))}
    </section>
  );
}
