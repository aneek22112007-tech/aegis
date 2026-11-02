import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMandate } from '../api';
import { ReadAloud } from '../components/ReadAloud';

export function ConfirmPage() {
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    void getMandate()
      .then((body) => setSummary(body.mandate?.summary || 'Your rules are saved.'))
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : 'Please try that again.');
      });
  }, []);

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-8 sm:px-6">
      <h1 className="text-4xl font-bold">These are your rules.</h1>
      {error ? (
        <p role="alert" className="rounded-xl bg-[var(--danger)] px-4 py-3 font-bold text-white">
          {error}
        </p>
      ) : null}
      <p aria-live="polite">{summary || 'Loading your rules.'}</p>
      {summary ? <ReadAloud text={summary} /> : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[var(--accent)] px-5 py-3 text-center font-bold text-[var(--accent-ink)]"
          to="/"
        >
          Yes, use these rules
        </Link>
        <Link
          className="inline-flex min-h-14 items-center justify-center rounded-xl border-2 border-[var(--ink)] px-5 py-3 text-center font-bold"
          to="/setup"
        >
          Change them
        </Link>
      </div>
    </section>
  );
}
