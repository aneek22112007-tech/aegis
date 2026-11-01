import { Link } from 'react-router-dom';

const action =
  'inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-[var(--accent)] px-5 py-3 text-center font-bold text-[var(--accent-ink)] sm:w-auto';

export function HomePage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-8 sm:px-6">
      <p className="text-base font-bold tracking-wide text-[var(--accent)]">AEGIS</p>
      <h1 className="text-4xl font-bold">Payments that follow your rules.</h1>
      <p>Hello, Margaret. Send money here and AEGIS checks it against your own wishes.</p>
      <p>
        Payments made directly in the PayPal app are not seen by AEGIS. Use the button below so your
        rules apply.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link className={action} to="/senior/pay">
          Send money
        </Link>
        <Link className={action} to="/setup">
          My rules
        </Link>
        <Link className={action} to="/demo">
          Try the demo
        </Link>
      </div>
    </section>
  );
}
