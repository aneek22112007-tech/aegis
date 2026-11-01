import { motion } from 'framer-motion';
import { Reveal } from './Reveal';

const STEPS = [
  {
    n: '01',
    title: 'Authorize',
    body: 'Margaret pays through AEGIS. We create a PayPal Orders v2 order with intent=AUTHORIZE — funds are reserved, nothing is captured yet.',
    tag: 'POST /v2/checkout/orders',
    color: '#7c8cff',
  },
  {
    n: '02',
    title: 'Score',
    body: 'Her own plain-English rules, compiled by Grok, are checked: new payee, limits, velocity, drift from her history, quiet hours, scam language.',
    tag: 'score 0–100 · reasons',
    color: '#38e8c6',
  },
  {
    n: '03',
    title: 'Capture · Hold · Void',
    body: 'Low risk captures silently. Medium holds and asks her guardian in one tap. High voids the authorization before a cent moves.',
    tag: 'capture | hold | void',
    color: '#ff6b81',
  },
];

const OUTCOMES = [
  { label: 'LOW', action: 'capture', color: '#34f5b0' },
  { label: 'MEDIUM', action: 'hold → guardian', color: '#ffc65c' },
  { label: 'HIGH', action: 'void + block', color: '#ff4d6a' },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-emerald-300/80">
          How it works
        </p>
        <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
          Consent, enforced in the gap between authorize and capture.
        </h2>
      </Reveal>
      <div className="relative mt-14 grid gap-5 md:grid-cols-3">
        <motion.div
          aria-hidden="true"
          className="absolute left-0 right-0 top-12 hidden h-px origin-left bg-gradient-to-r from-indigo-400 via-emerald-300 to-rose-400 md:block"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
        />
        {STEPS.map((step, i) => (
          <Reveal key={step.n} delay={0.15 + i * 0.2}>
            <article className="relative h-full rounded-3xl border border-white/10 bg-[#0a0f1a]/80 p-7 backdrop-blur">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-black"
                style={{ background: step.color, boxShadow: `0 0 30px ${step.color}66` }}
              >
                {step.n}
              </span>
              <h3 className="mt-6 text-2xl font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-white/60">{step.body}</p>
              <code className="mt-5 inline-block rounded-lg bg-white/5 px-2.5 py-1 font-mono text-xs text-white/70">
                {step.tag}
              </code>
            </article>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.3}>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {OUTCOMES.map((o) => (
            <div
              key={o.label}
              className="flex items-center justify-between rounded-2xl border border-white/10 px-5 py-4"
            >
              <span className="font-mono text-sm" style={{ color: o.color }}>
                {o.label}
              </span>
              <span className="text-white/70">{o.action}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
