import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  authorizePayment,
  createPayment,
  getHousehold,
  getPublicConfig,
  type PublicConfig,
} from '../api';
import { PayPalCheckout } from '../components/PayPalCheckout';
import { Avatar, field, PageTitle, primaryBtn, secondaryBtn, usd } from '../senior/ui';
import { Icon } from '../ui/Icon';

type Step = 'details' | 'review';

export function PayPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [trusted, setTrusted] = useState<string[]>([]);
  const [payeeName, setPayeeName] = useState(() => params.get('payee') ?? '');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [step, setStep] = useState<Step>('details');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getPublicConfig()
      .then(setConfig)
      .catch(() => setConfig({ paypalClientId: '', paypalEnv: 'sandbox', demoMode: true }));
    void getHousehold()
      .then((h) => setTrusted(h.payees.filter((p) => p.status === 'trusted').map((p) => p.name)))
      .catch(() => setTrusted([]));
  }, []);

  const dollars = Number(amount);
  const ready = payeeName.trim().length > 0 && Number.isFinite(dollars) && dollars > 0;
  const showPayPal = Boolean(config && !config.demoMode && config.paypalClientId);
  const isTrusted = trusted.some((t) => t.toLowerCase() === payeeName.trim().toLowerCase());

  function finish(id: string) {
    navigate(`/senior/result/${id}`);
  }

  function toReview(event: FormEvent) {
    event.preventDefault();
    if (!ready) return;
    setError('');
    setStep('review');
    window.scrollTo({ top: 0 });
  }

  async function send() {
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

  const errorBox = error ? (
    <p role="alert" className="rounded-2xl bg-[var(--danger)] px-5 py-4 font-semibold text-white">
      {error}
    </p>
  ) : null;

  const side = (
    <aside className="s-card h-fit p-5 text-[0.8rem] leading-relaxed" aria-label="How this works">
      <p className="flex items-center gap-2 text-[0.9rem] font-semibold">
        <Icon name="shield" size={22} />
        Checked before it is sent
      </p>
      <ol className="mt-3 flex flex-col gap-2 text-[var(--muted)]">
        <li>1. PayPal reserves the money. Nothing leaves yet.</li>
        <li>2. AEGIS checks your rules.</li>
        <li>3. It is sent, waits for Priya, or is stopped.</li>
      </ol>
    </aside>
  );

  if (step === 'review') {
    return (
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_22rem] lg:py-10">
        <section className="flex flex-col gap-5">
          <PageTitle
            back={
              <button
                type="button"
                onClick={() => setStep('details')}
                className="inline-flex min-h-12 w-fit items-center gap-2 text-[0.8rem] font-semibold text-[var(--accent)]"
              >
                <Icon name="arrowLeft" size={20} />
                Change details
              </button>
            }
            title="Check this payment"
            lead="Look it over. Nothing is sent until you press the button."
          />
          <div className="s-card overflow-hidden">
            <div className="flex flex-col items-center gap-3 border-b border-[var(--line)] px-6 py-8 text-center">
              <Avatar name={payeeName.trim()} size={72} />
              <p className="text-[0.85rem] text-[var(--muted)]">You are sending</p>
              <p className="text-[2.6rem] font-semibold leading-none tracking-[-0.03em] tabular-nums">
                {usd(Math.round(dollars * 100))}
              </p>
              <p className="text-[0.95rem] font-semibold">to {payeeName.trim()}</p>
            </div>
            <dl className="divide-y divide-[var(--line)] text-[0.85rem]">
              <div className="flex justify-between gap-4 px-6 py-4">
                <dt className="text-[var(--muted)]">From</dt>
                <dd className="font-semibold">PayPal sandbox account</dd>
              </div>
              <div className="flex justify-between gap-4 px-6 py-4">
                <dt className="text-[var(--muted)]">Note</dt>
                <dd className="text-right font-semibold">{note.trim() || 'None'}</dd>
              </div>
              <div className="flex justify-between gap-4 px-6 py-4">
                <dt className="text-[var(--muted)]">Payee</dt>
                <dd className="font-semibold">
                  {isTrusted ? 'On your trusted list' : 'New to you'}
                </dd>
              </div>
            </dl>
          </div>
          {errorBox}
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
              type="button"
              className={primaryBtn}
              disabled={busy || !config}
              onClick={() => void send()}
            >
              {busy ? 'Checking…' : 'Check and send'}
            </button>
          )}
          <p className="text-[0.75rem] text-[var(--muted)]">
            Payments made directly in the PayPal app are not checked. Send the money from here.
          </p>
        </section>
        {side}
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_22rem] lg:py-10">
      <section className="flex flex-col gap-5">
        <PageTitle title="Send money" lead="Choose who, how much, and why." />
        <form className="flex flex-col gap-6" onSubmit={toReview}>
          <div className="s-card flex flex-col gap-4 p-5">
            <label className="text-[0.9rem] font-semibold" htmlFor="payee">
              Who are you paying?
            </label>
            {trusted.length ? (
              <div className="flex flex-wrap gap-3" role="group" aria-label="Your trusted payees">
                {trusted.map((name) => {
                  const on = payeeName.trim().toLowerCase() === name.toLowerCase();
                  return (
                    <button
                      key={name}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setPayeeName(name)}
                      className={`flex min-h-14 items-center gap-3 rounded-full border py-1.5 pl-1.5 pr-5 text-[0.8rem] font-semibold ${on ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_8%,var(--card))] text-[var(--accent)]' : 'border-[var(--line)] bg-[var(--card)]'}`}
                    >
                      <Avatar name={name} size={44} />
                      {name}
                      {on ? <Icon name="check" size={18} /> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
            <input
              id="payee"
              name="payee"
              className={field}
              placeholder="Or type a name"
              value={payeeName}
              autoComplete="organization"
              onChange={(event) => setPayeeName(event.target.value)}
            />
          </div>

          <div className="s-card flex flex-col items-center gap-2 px-5 py-8">
            <label className="text-[0.9rem] font-semibold" htmlFor="amount">
              How much?
            </label>
            <div className="flex items-baseline justify-center gap-1">
              <span aria-hidden="true" className="text-[2.2rem] font-semibold text-[var(--muted)]">
                $
              </span>
              <input
                id="amount"
                name="amount"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(event) => setAmount(event.target.value.replace(/[^0-9.]/g, ''))}
                className="w-[7ch] bg-transparent text-center text-[3rem] font-semibold tracking-[-0.03em] text-[var(--ink)] tabular-nums outline-none placeholder:text-[var(--line)]"
              />
            </div>
            <p className="text-[0.72rem] text-[var(--muted)]">US dollars</p>
          </div>

          <div className="s-card flex flex-col gap-3 p-5">
            <label className="text-[0.9rem] font-semibold" htmlFor="note">
              What is it for? <span className="font-normal text-[var(--muted)]">(optional)</span>
            </label>
            <input
              id="note"
              name="note"
              className={field}
              placeholder="For example: birthday gift"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
          {errorBox}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" className={`${primaryBtn} sm:min-w-[14rem]`} disabled={!ready}>
              Review payment
              <Icon name="arrowRight" size={20} />
            </button>
            <button type="button" className={secondaryBtn} onClick={() => navigate('/senior')}>
              Cancel
            </button>
          </div>
        </form>
      </section>
      {side}
    </div>
  );
}
