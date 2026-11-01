import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEMO_MODE, runDemo } from '../api';
import { resetState } from '../demo/store';

const scenarios = [
  {
    id: 'pharmacy' as const,
    label: 'Pay CVS Pharmacy $48',
    detail: 'A refill at the pharmacy Margaret already trusts. This should go through.',
  },
  {
    id: 'new-payee' as const,
    label: 'Pay Helen Brooks $650',
    detail: 'A new person, over the usual limit. Priya is asked before it is sent.',
  },
  {
    id: 'scam' as const,
    label: 'Pay Officer James $1,900',
    detail: 'A bail message that says urgent and secret. This should be stopped.',
  },
];

export function DemoPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  async function start(id: (typeof scenarios)[number]['id']) {
    setBusy(id);
    setError('');
    try {
      const body = await runDemo(id);
      navigate(`/senior/result/${body.payment.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Please try that again.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-8 sm:px-6">
      <h1 className="text-4xl font-bold">Try three payments</h1>
      <p>
        These run through the same checks as a real payment. With no PayPal login on this machine,
        AEGIS uses a practice merchant and no money moves.
      </p>
      {DEMO_MODE ? (
        <p className="rounded-2xl border-4 border-[var(--line)] bg-[var(--card)] p-4">
          This copy runs entirely in your browser. Open the{' '}
          <a
            className="underline"
            href={`${import.meta.env.BASE_URL}guardian`}
            target="_blank"
            rel="noreferrer"
          >
            guardian page
          </a>{' '}
          in another tab to watch alerts arrive live.{' '}
          <button
            type="button"
            className="font-bold underline"
            onClick={() => {
              resetState();
              setError('');
            }}
          >
            Start over
          </button>
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="rounded-xl bg-[var(--danger)] px-4 py-3 font-bold text-white">
          {error}
        </p>
      ) : null}
      <div className="flex flex-col gap-4">
        {scenarios.map((scenario) => (
          <article
            key={scenario.id}
            className="rounded-2xl border-4 border-[var(--line)] bg-[var(--card)] p-5"
          >
            <p>{scenario.detail}</p>
            <button
              type="button"
              className="mt-4 min-h-14 w-full rounded-xl bg-[var(--accent)] px-5 py-3 font-bold text-[var(--accent-ink)] disabled:opacity-60 sm:w-auto"
              disabled={busy !== null}
              onClick={() => void start(scenario.id)}
            >
              {busy === scenario.id ? 'Checking…' : scenario.label}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
