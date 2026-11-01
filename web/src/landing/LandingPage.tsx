import { MotionConfig, motion, useScroll, useSpring } from 'framer-motion';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldMark } from './ShieldMark';
import { GuardianPhone } from './GuardianPhone';
import { HeroCanvas } from './HeroCanvas';
import { HowItWorks } from './HowItWorks';
import { LureLogPreview } from './LureLogPreview';
import { Reveal } from './Reveal';
import { RiskPlayground } from './RiskPlayground';
import { StatsBand } from './StatsBand';
import { TechBento } from './TechBento';

function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-30">
      <div className="mx-auto mt-4 flex max-w-6xl items-center gap-6 rounded-2xl border border-white/10 bg-[#04060c]/60 px-5 py-3 backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-wide text-white">
          <ShieldMark /> AEGIS
        </Link>
        <nav aria-label="Landing" className="hidden gap-6 text-sm text-white/60 md:flex">
          <a href="#problem" className="hover:text-white">
            Problem
          </a>
          <a href="#how" className="hover:text-white">
            How it works
          </a>
          <a href="#try" className="hover:text-white">
            Try it
          </a>
          <a href="#guardian" className="hover:text-white">
            Guardian
          </a>
          <a href="#tech" className="hover:text-white">
            Tech
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm">
          <Link to="/guardian" className="hidden text-white/70 hover:text-white sm:inline">
            Dashboard
          </Link>
          <Link
            to="/demo"
            className="rounded-xl bg-white px-4 py-2 font-semibold text-black transition hover:bg-emerald-200"
          >
            Live demo
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <div className="absolute inset-0 md:left-[30%]">
        <HeroCanvas />
      </div>
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#04060c] via-[#04060c]/80 to-transparent md:via-[#04060c]/40"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#04060c] to-transparent"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-6 pb-20 pt-32">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-200"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" /> AI consent
          proxy for PayPal
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.02] tracking-tight text-white md:text-7xl"
        >
          Their wishes.{' '}
          <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-indigo-300 bg-clip-text text-transparent">
            Enforced before money moves.
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mt-6 max-w-xl text-lg text-white/65"
        >
          AEGIS turns an older adult’s own plain-English rules into a live policy and checks every
          PayPal payment against it — capturing the pharmacy, asking the daughter, voiding the scam.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-9 flex flex-wrap gap-3"
        >
          <Link
            to="/demo"
            className="rounded-2xl bg-gradient-to-r from-emerald-300 to-teal-300 px-6 py-3.5 font-semibold text-black shadow-[0_0_40px_rgba(52,245,176,0.35)] transition hover:scale-[1.02]"
          >
            Run the live demo
          </Link>
          <a
            href="#try"
            className="rounded-2xl border border-white/15 px-6 py-3.5 font-medium text-white transition hover:bg-white/5"
          >
            Try the risk engine
          </a>
        </motion.div>
        <div className="mt-14 flex flex-wrap gap-3 text-sm">
          {[
            { t: 'CVS Pharmacy · $48', s: 'Captured', c: 'text-emerald-300 border-emerald-300/30' },
            {
              t: 'Helen Brooks · $650',
              s: 'Held for Priya',
              c: 'text-amber-200 border-amber-300/30',
            },
            {
              t: 'Officer James · $1,900',
              s: 'Voided before capture',
              c: 'text-rose-300 border-rose-300/30',
            },
          ].map((chip, i) => (
            <motion.div
              key={chip.t}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.15 }}
              className={`rounded-2xl border bg-black/40 px-4 py-2.5 backdrop-blur ${chip.c}`}
            >
              <span className="text-white/80">{chip.t}</span> · {chip.s}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingPage() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.fontSize;
    root.style.fontSize = '16px';
    document.title = 'AEGIS — consent enforced before money moves';
    return () => {
      root.style.fontSize = previous;
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="landing min-h-screen bg-[#04060c] font-[Inter,ui-sans-serif,system-ui] text-white antialiased">
        <motion.div
          className="fixed inset-x-0 top-0 z-40 h-0.5 origin-left bg-gradient-to-r from-emerald-300 to-indigo-400"
          style={{ scaleX: progress }}
          aria-hidden="true"
        />
        <Nav />
        <main id="main">
          <Hero />
          <StatsBand />
          <HowItWorks />
          <section id="try" className="mx-auto max-w-6xl px-6 py-24">
            <Reveal>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-teal-300/80">
                Try it
              </p>
              <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
                Type a payment. Watch Margaret’s rules decide.
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-white/60">
                This runs the exact risk engine the server uses — the same rules, weights and
                thresholds — right in your browser.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="mt-10">
              <RiskPlayground />
            </Reveal>
          </section>
          <section
            id="guardian"
            className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-24 md:grid-cols-2"
          >
            <Reveal>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-amber-200/80">
                Guardian
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">
                Help without taking away independence.
              </h2>
              <p className="mt-4 text-lg text-white/60">
                Priya only hears from AEGIS when a payment is unusual. One tap captures it; one tap
                voids it. Margaret’s screen updates live — “Sent”, or “Stopped, we told your
                daughter.”
              </p>
              <ul className="mt-6 space-y-3 text-white/70">
                <li>• Plain-language reasons, never a black-box score</li>
                <li>• Holds auto-void if nobody answers</li>
                <li>• Large-type, read-aloud senior screens</li>
              </ul>
            </Reveal>
            <Reveal delay={0.15}>
              <GuardianPhone />
            </Reveal>
          </section>
          <section className="mx-auto max-w-6xl px-6 py-24">
            <Reveal>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-rose-300/80">
                Lure Log
              </p>
              <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
                Every decision, with its reasons. Evidence ready.
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="mt-10">
              <LureLogPreview />
            </Reveal>
          </section>
          <TechBento />
          <section className="px-6 pb-28 pt-10">
            <Reveal>
              <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-emerald-400/15 via-[#0a1020] to-indigo-500/20 px-8 py-16 text-center">
                <ShieldMark className="mx-auto h-14 w-14" />
                <h2 className="mt-6 text-4xl font-semibold tracking-tight text-white md:text-5xl">
                  See a scam get voided in 30 seconds.
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-white/60">
                  Three real flows — trusted, held, stopped — through the same authorize → score →
                  capture/void pipeline.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link
                    to="/demo"
                    className="rounded-2xl bg-white px-6 py-3.5 font-semibold text-black transition hover:bg-emerald-200"
                  >
                    Open the demo
                  </Link>
                  <Link
                    to="/senior"
                    className="rounded-2xl border border-white/20 px-6 py-3.5 font-medium text-white transition hover:bg-white/5"
                  >
                    Margaret’s view
                  </Link>
                  <Link
                    to="/audit"
                    className="rounded-2xl border border-white/20 px-6 py-3.5 font-medium text-white transition hover:bg-white/5"
                  >
                    Lure Log
                  </Link>
                </div>
              </div>
            </Reveal>
          </section>
        </main>
        <footer className="border-t border-white/10 px-6 py-10 text-sm text-white/40">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
            <p className="flex items-center gap-2">
              <ShieldMark className="h-5 w-5" /> AEGIS — hackathon prototype. PayPal sandbox only;
              no real money.
            </p>
            <a
              href="https://github.com/aneek22112007-tech/aegis"
              className="hover:text-white"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}

export default LandingPage;
