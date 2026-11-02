import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMandate } from '../api';
import { ReadAloud } from '../components/ReadAloud';
import { primaryBtn, secondaryBtn } from '../senior/ui';
import { Icon } from '../ui/Icon';

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
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:py-12">
      <section className="s-card flex flex-col gap-5 p-6">
        <span className="s-ok flex h-16 w-16 items-center justify-center rounded-full">
          <Icon name="shield" size={32} />
        </span>
        <h1 className="text-[1.45rem] font-semibold tracking-[-0.02em]">These are your rules.</h1>
        {error ? (
          <p
            role="alert"
            className="rounded-2xl bg-[var(--danger)] px-5 py-4 font-semibold text-white"
          >
            {error}
          </p>
        ) : null}
        <p aria-live="polite" className="text-[0.95rem] leading-relaxed">
          {summary || 'Loading your rules.'}
        </p>
        {summary ? <ReadAloud text={summary} /> : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link className={`${primaryBtn} sm:flex-1`} to="/senior">
            Yes, use these rules
          </Link>
          <Link className={`${secondaryBtn} sm:flex-1`} to="/setup">
            Change them
          </Link>
        </div>
      </section>
    </div>
  );
}
