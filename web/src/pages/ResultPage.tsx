import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPayment, type PaymentView } from '../api';
import { ReadAloud } from '../components/ReadAloud';
import { speak } from '../speech';

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

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-8 sm:px-6">
      {error ? (
        <p role="alert" className="rounded-xl bg-[var(--danger)] px-4 py-3 font-bold text-white">
          {error}
        </p>
      ) : null}
      <h1 ref={heading} tabIndex={-1} className="text-4xl font-bold" aria-live="polite">
        {payment?.message || 'Checking this payment.'}
      </h1>
      {payment ? (
        <>
          <p>
            {payment.payeeName}. {payment.amount}.
          </p>
          <ReadAloud text={payment.message} />
        </>
      ) : null}
      <Link
        className="inline-flex min-h-14 w-full items-center justify-center rounded-xl border-4 border-[var(--ink)] px-5 py-3 text-center font-bold sm:w-auto"
        to="/senior"
      >
        Back home
      </Link>
    </section>
  );
}
