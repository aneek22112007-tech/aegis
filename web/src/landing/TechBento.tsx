import { Reveal } from './Reveal';

const ITEMS = [
  {
    title: 'PayPal Orders v2',
    body: 'intent=AUTHORIZE, then capture or void. Webhooks verified with verify-webhook-signature and applied idempotently.',
    span: 'md:col-span-2',
    accent: '#7c8cff',
  },
  {
    title: 'xAI Grok',
    body: 'Compiles plain-English wishes into a validated policy and rewrites reasons kindly. It never decides the outcome.',
    span: '',
    accent: '#38e8c6',
  },
  {
    title: 'Deterministic engine',
    body: 'Seven explainable rules, 0–100 score, fixed thresholds. Same code runs on the server and in this page.',
    span: '',
    accent: '#34f5b0',
  },
  {
    title: 'Live guardian loop',
    body: 'Server-Sent Events push holds to the guardian. Silence auto-voids.',
    span: '',
    accent: '#ffc65c',
  },
  {
    title: 'AG Grid Lure Log',
    body: 'Every decision, its reasons and PayPal IDs — filterable, exportable to CSV and FTC-style reports.',
    span: '',
    accent: '#ff6b81',
  },
];

export function TechBento() {
  return (
    <section id="tech" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-indigo-300/80">
          Under the hood
        </p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">
          AI that explains. Rails that decide.
        </h2>
      </Reveal>
      <div className="mt-12 grid gap-4 md:grid-cols-4">
        {ITEMS.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.06} className={item.span}>
            <article className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition hover:border-white/25">
              <div
                className="absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-20 blur-3xl transition group-hover:opacity-40"
                style={{ background: item.accent }}
                aria-hidden="true"
              />
              <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-white/60">{item.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <p className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 text-sm text-white/55">
          Honest scope: AEGIS protects payments made{' '}
          <strong className="text-white/80">through AEGIS</strong>. Payments sent directly inside
          the PayPal app cannot be intercepted — there is no public API for that.
        </p>
      </Reveal>
    </section>
  );
}
