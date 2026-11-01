import { Reveal } from './Reveal';

export const FTC_SOURCE =
  'https://www.ftc.gov/news-events/news/press-releases/2026/10/ftc-issues-annual-report-congress-agencys-actions-protect-older-adults';

const STATS = [
  { value: '~$3B', label: 'fraud losses reported by adults 60+ in 2025' },
  { value: '~5×', label: 'increase in those reported losses since 2020' },
  { value: '$2,000', label: 'median reported loss for people 80 and over' },
];

export function StatsBand() {
  return (
    <section id="problem" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-rose-300/80">
          The problem
        </p>
        <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
          Every alert today fires <span className="text-rose-300">after</span> the money is gone.
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-white/60">
          Bank alerts, family dashboards and platform fraud engines all watch money leave. None of
          them know what <em>this</em> person asked for — and none act before the payment is
          captured.
        </p>
      </Reveal>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.1}>
            <div className="h-full rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-7">
              <p className="bg-gradient-to-r from-rose-200 to-amber-200 bg-clip-text text-5xl font-semibold text-transparent">
                {stat.value}
              </p>
              <p className="mt-3 text-white/65">{stat.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-5 text-sm text-white/40">
        Source:{' '}
        <a
          className="underline decoration-white/30 hover:text-white"
          href={FTC_SOURCE}
          target="_blank"
          rel="noreferrer"
        >
          FTC, Protecting Older Consumers 2025–2026 (Consumer Sentinel Network data), Oct 2026
        </a>
        . Reported figures only; most fraud is never reported.
      </p>
    </section>
  );
}
