import { Link } from 'react-router-dom';

function Row({ to, title, body }: { to: string; title: string; body: string }) {
  return (
    <li>
      <Link
        to={to}
        className="flex min-h-16 items-center justify-between gap-4 px-5 py-4 no-underline hover:bg-[var(--bg)]"
      >
        <span>
          <span className="block font-bold">{title}</span>
          <span className="block text-[0.8rem] text-[var(--muted)]">{body}</span>
        </span>
        <span aria-hidden="true" className="text-[var(--muted)]">
          ›
        </span>
      </Link>
    </li>
  );
}

export function HomePage() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-8 sm:px-6">
      <p className="text-[0.8rem] text-[var(--muted)]">Good morning, Margaret</p>
      <h1 className="text-[1.6rem] font-bold leading-tight">Payments that follow your rules.</h1>

      <div className="senior-card p-5">
        <p className="flex items-center gap-2 text-[0.8rem] font-bold text-[var(--accent)]">
          <span aria-hidden="true" className="inline-block h-3 w-3 rounded-full bg-[#12703f]" />
          Your rules are on
        </p>
        <p className="mt-2">
          AEGIS checks every payment you send here. Anything unusual waits for Priya before money
          leaves your account.
        </p>
        <Link
          to="/senior/pay"
          className="mt-4 inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-[var(--accent)] px-5 py-3 font-bold text-[var(--accent-ink)] no-underline"
        >
          Send money
        </Link>
      </div>

      <ul className="senior-card divide-y-2 divide-[var(--line)] overflow-hidden">
        <Row to="/setup" title="My rules" body="Limits, trusted people and your guardian" />
        <Row to="/demo" title="Try the demo" body="See how a payment is checked" />
      </ul>

      <p className="text-[0.8rem] text-[var(--muted)]">
        Payments made directly in the PayPal app are not seen by AEGIS. Use Send money so your rules
        apply.
      </p>
    </section>
  );
}
