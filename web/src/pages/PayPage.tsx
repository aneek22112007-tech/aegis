import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authorizePayment, createPayment, getPublicConfig, type PublicConfig } from '../api';
import { PayPalCheckout } from '../components/PayPalCheckout';

export function PayPage() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [payeeName, setPayeeName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getPublicConfig()
      .then(setConfig)
      .catch(() => setConfig({ paypalClientId: '', paypalEnv: 'sandbox', demoMode: true }));
  }, []);

  const dollars = Number(amount);
  const ready = payeeName.trim().length > 0 && Number.isFinite(dollars) && dollars > 0;
  const showPayPal = Boolean(config && !config.demoMode && config.paypalClientId);

  function finish(id: string) {
    navigate(`/senior/result/${id}`);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!ready || showPayPal) return;
    setBusy(true);
    setError('');
    try {
      const created = await createPayment({
        payeeName: payeeName.trim(),
        amount: dollars,
        note: note.trim(),
        idempotencyKey: crypto.randomUUID(),
      });
      const authorized = await authorizePayment(created.payment.id);
      finish(authorized.payment.id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Please try that again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-8 sm:px-6">
      <h1 className="text-4xl font-bold">Send money</h1>
      <p>Tell us who, how much, and why. We check your rules before anything is sent.</p>
      <form className="flex flex-col gap-4" onSubmit={(event) => void onSubmit(event)}>
        <label className="flex flex-col gap-2 font-bold" htmlFor="payee">
          Who are you paying?
          <input
            id="payee"
            name="payee"
            className="min-h-14 rounded-xl border-4 border-[var(--line)] bg-[var(--card)] px-4 font-normal"
            value={payeeName}
            autoComplete="organization"
            onChange={(event) => setPayeeName(event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2 font-bold" htmlFor="amount">
          How much?
          <input
            id="amount"
            name="amount"
            className="min-h-14 rounded-xl border-4 border-[var(--line)] bg-[var(--card)] px-4 font-normal"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2 font-bold" htmlFor="note">
          Note, if you have one
          <textarea
            id="note"
            name="note"
            className="min-h-28 rounded-xl border-4 border-[var(--line)] bg-[var(--card)] px-4 py-3 font-normal"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>
        {error ? (
          <p role="alert" className="rounded-xl bg-[var(--danger)] px-4 py-3 font-bold text-white">
            {error}
          </p>
        ) : null}
        {showPayPal && config ? (
          <PayPalCheckout
            clientId={config.paypalClientId}
            payeeName={payeeName.trim()}
            amount={dollars}
            note={note.trim()}
            onDone={(payment) => finish(payment.id)}
            onError={setError}
          />
        ) : (
          <button
            type="submit"
            className="min-h-14 rounded-xl bg-[var(--accent)] px-5 py-3 font-bold text-[var(--accent-ink)] disabled:opacity-60"
            disabled={!ready || busy || !config}
          >
            {busy ? 'Checking…' : 'Check and send'}
          </button>
        )}
      </form>
      <p>
        Payments made directly in the PayPal app are not checked. Send the money from this page.
      </p>
    </section>
  );
}
