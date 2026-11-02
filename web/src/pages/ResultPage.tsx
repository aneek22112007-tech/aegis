import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPayment, type PaymentView } from '../api';
import { ReadAloud } from '../components/ReadAloud';
import { Avatar, primaryBtn, whenLabel } from '../senior/ui';
import { speak } from '../speech';
import { Icon } from '../ui/Icon';

export function ResultPage() {
  const { id } = useParams();
  const heading = useRef<HTMLHeadingElement>(null);
  const [payment, setPayment] = useState<PaymentView | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let gone = false;
    let timer = 0;
    async function load(paymentId: string) {
      try {
        const body = await getPayment(paymentId);
        if (gone) return;
        setPayment(body.payment);
        if (body.payment.outcome === 'waiting') {
          timer = window.setTimeout(() => void load(paymentId), 3000);
        }
      } catch (cause) {
        if (!gone) setError(cause instanceof Error ? cause.message : 'Please try that again.');
      }
    }
    void load(id);
    return () => {
      gone = true;
      window.clearTimeout(timer);
    };
  }, [id]);

  useEffect(() => {
    if (!payment?.message) return;
    speak(payment.message);
    heading.current?.focus();
  }, [payment?.message]);

  const tone = payment?.outcome === 'sent' ? 'ok' : payment?.outcome === 'stopped' ? 'bad' : 'warn';
  const icon =
    payment?.outcome === 'sent' ? 'check' : payment?.outcome === 'stopped' ? 'close' : 'clock';
  const title =
    payment?.outcome === 'sent'
      ? 'Sent'
      : payment?.outcome === 'stopped'
        ? 'Stopped'
        : payment
          ? 'Waiting for Priya'
          : 'Checking';

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:py-12">
      {error ? (
        <p
          role="alert"
          className="mb-5 rounded-2xl bg-[var(--danger)] px-5 py-4 font-semibold text-white"
        >
          {error}
        </p>
      ) : null}
      <section className="s-card overflow-hidden">
        <div className="flex flex-col items-center gap-4 px-6 pb-8 pt-10 text-center">
          <span className={`s-${tone} flex h-20 w-20 items-center justify-center rounded-full`}>
            <Icon name={icon} size={40} />
          </span>
          <p className="text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            {title}
          </p>
          <h1
            ref={heading}
            tabIndex={-1}
            className="text-[1.45rem] font-semibold leading-snug tracking-[-0.02em] outline-none"
            aria-live="polite"
          >
            {payment?.message || 'Checking this payment.'}
          </h1>
        </div>
        {payment ? (
          <>
            <dl className="divide-y divide-[var(--line)] border-t border-[var(--line)] text-[0.85rem]">
              <div className="flex items-center justify-between gap-4 px-6 py-4">
                <dt className="text-[var(--muted)]">To</dt>
                <dd className="flex items-center gap-3 font-semibold">
                  <Avatar name={payment.payeeName} size={36} />
                  {payment.payeeName}
                </dd>
              </div>
              <div className="flex justify-between gap-4 px-6 py-4">
                <dt className="text-[var(--muted)]">Amount</dt>
                <dd className="font-semibold tabular-nums">{payment.amount}</dd>
              </div>
              {payment.note ? (
                <div className="flex justify-between gap-4 px-6 py-4">
                  <dt className="text-[var(--muted)]">Note</dt>
                  <dd className="text-right font-semibold">{payment.note}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4 px-6 py-4">
                <dt className="text-[var(--muted)]">When</dt>
                <dd className="font-semibold">{whenLabel(payment.createdAt)}</dd>
              </div>
            </dl>
            {payment.outcome !== 'sent' && payment.reasons.length ? (
              <div className="border-t border-[var(--line)] px-6 py-5">
                <p className="text-[0.85rem] font-semibold">Why</p>
                <ul className="mt-2 flex flex-col gap-1.5 text-[0.8rem] text-[var(--muted)]">
                  {payment.reasons.slice(0, 3).map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {payment.outcome === 'waiting' ? (
              <p className="border-t border-[var(--line)] bg-[var(--bg)] px-6 py-4 text-[0.8rem]">
                The money is reserved, not sent. This page updates by itself when Priya answers.
              </p>
            ) : null}
          </>
        ) : null}
      </section>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Link className={`${primaryBtn} sm:flex-1`} to="/senior">
          Back home
        </Link>
        {payment ? <ReadAloud text={payment.message} /> : null}
      </div>
    </div>
  );
}
