import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { lazy, Suspense, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChecksCopy, HeroCopy, StartsCopy } from './copy';
import { formatStat, HELD, OUTCOMES, STATS } from './content';
import { Device } from './Device';
import { hasWebGL } from './mode';
import { CssCard } from './PaymentCard';
import { MargaretScreen, type Stage } from './Screens';
import { LureLogSection, NumbersSection, OutcomePanel } from './Sections';

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function')
  gsap.registerPlugin(ScrollTrigger);

const CardScene = lazy(() => import('./CardScene'));

const CHAPTERS = ['Hero', 'A payment starts', 'AEGIS checks it'];

/** Where each timeline second lands in the story (timeline length 9). */
function snapshot(t: number) {
  const stage: Stage =
    t < 3.3 ? 'home' : t < 4.0 ? 'request' : t < 5.0 ? 'authorize' : t < 7.5 ? 'score' : 'decision';
  const reasons = Math.max(0, Math.min(3, Math.floor((t - 5.4) / 0.45) + 1));
  const chapter = t < 1.4 ? 0 : t < 3.8 ? 1 : 2;
  return { stage, reasons, chapter };
}

/** Labels anchored to the phone's right edge with leader lines, revealed per chapter. */
const CALLOUTS = [
  { label: 'Payment', value: 'pay_8f2k1q0zx3', top: '17%', at: 'start' },
  { label: 'PayPal order', value: 'intent AUTHORIZE', top: '35%', at: 'start' },
  { label: 'Card funds', value: 'Reserved, not sent', top: '53%', at: 'start' },
  { label: 'Risk engine v1', value: 'Score 35 / 70', top: '71%', at: 'check' },
] as const;

/** Desktop scroll story: one pinned stage scrubbed through three chapters, a horizontal outcomes reel, and scroll-built sections. */
export default function MotionStory() {
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const webgl = useMemo(hasWebGL, []);
  const [state, setState] = useState({ stage: 'home' as Stage, reasons: 0, chapter: 0 });

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const lenis = new Lenis({ lerp: 0.12, anchors: { offset: -64 } });
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      const phone = q('.story-phone')[0] as HTMLElement;
      const gaugeHost = phone;

      // Intro on load: hero lines rise, phone turns in from depth.
      gsap.from(q('.copy-0 .line-inner'), {
        yPercent: 105,
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out',
      });
      gsap.from(q('.copy-0 .hero-sub, .copy-0 .hero-cta, .copy-0 .hero-proof'), {
        opacity: 0,
        y: 16,
        duration: 0.8,
        delay: 0.35,
        stagger: 0.1,
      });
      gsap.from(phone, {
        rotationY: -42,
        rotationX: 18,
        z: -320,
        y: 80,
        opacity: 0,
        duration: 1.5,
        ease: 'power3.out',
      });

      const card = { v: 0 };
      const gauge = { v: 0 };
      gaugeHost.style.setProperty('--g', '0');
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: q('.story-stage')[0],
          start: 'top top',
          end: '+=3800',
          pin: true,
          scrub: 0.6,
          onUpdate: () => {
            const next = snapshot(tl.time());
            setState((s) =>
              s.stage === next.stage && s.reasons === next.reasons && s.chapter === next.chapter
                ? s
                : next,
            );
          },
        },
      });
      tl.set({}, {}, 9);
      // Camera: the phone turns to face you and the stage dollies in.
      tl.to(phone, { rotationY: -6, rotationX: 3, x: 0, duration: 3.5, ease: 'power1.inOut' }, 0.2);
      tl.to(
        phone,
        { rotationY: 0, rotationX: 0, scale: 1.06, duration: 3, ease: 'power1.inOut' },
        4,
      );
      tl.to(q('.layer-back'), { y: -120, duration: 9 }, 0);
      // Callouts stay pinned to the phone and appear with the chapter they explain.
      tl.fromTo(
        q('.callout-start'),
        { autoAlpha: 0, x: -10 },
        { autoAlpha: 1, x: 0, stagger: 0.25, duration: 0.4 },
        2.0,
      );
      tl.fromTo(
        q('.callout-check'),
        { autoAlpha: 0, x: -10 },
        { autoAlpha: 1, x: 0, duration: 0.4 },
        5.0,
      );
      // Chapter copy
      tl.to(q('.copy-0'), { autoAlpha: 0, y: -40, duration: 0.6 }, 1.0);
      tl.fromTo(q('.copy-1'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, 1.6);
      tl.from(
        q('.copy-1 .line-inner'),
        { yPercent: 105, stagger: 0.12, duration: 0.6, ease: 'power2.out' },
        1.6,
      );
      tl.from(q('.copy-1 p'), { opacity: 0, y: 16, duration: 0.5 }, 1.9);
      tl.to(q('.copy-1'), { autoAlpha: 0, y: -40, duration: 0.5 }, 3.6);
      tl.fromTo(q('.copy-2'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, 4.1);
      tl.from(
        q('.copy-2 .line-inner'),
        { yPercent: 105, stagger: 0.12, duration: 0.6, ease: 'power2.out' },
        4.1,
      );
      tl.from(q('.copy-2 li'), { opacity: 0, x: -12, stagger: 0.25, duration: 0.4 }, 4.5);
      // The card travels toward the phone.
      tl.to(
        card,
        {
          v: 1,
          duration: 1.8,
          ease: 'power1.inOut',
          onUpdate: () => {
            progress.current = card.v;
          },
        },
        // Starts only once the hero copy has faded, so the card never crosses the headline.
        1.7,
      );
      if (!webgl)
        tl.fromTo(
          q('.css-card'),
          { x: -380, y: 60, rotation: -12, opacity: 1, scale: 1 },
          { x: 120, y: -40, rotation: 0, scale: 0.55, duration: 2, ease: 'power1.inOut' },
          1.4,
        );
      if (!webgl) tl.to(q('.css-card'), { opacity: 0, duration: 0.2 }, 3.3);
      // Gauge fills with the real score.
      tl.to(
        gauge,
        {
          v: 1,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: () => {
            gaugeHost.style.setProperty('--g', String((gauge.v * HELD.score) / 100));
            const s = phone.querySelector('.story-score');
            if (s) s.textContent = String(Math.round(gauge.v * HELD.score));
          },
        },
        5.1,
      );

      // 04 · Horizontal outcomes reel
      const track = q('.outcome-track')[0] as HTMLElement;
      const reel = gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: q('.outcome-pin')[0],
          start: 'top top',
          end: () => `+=${(track.scrollWidth - window.innerWidth) * 1.1}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          snap: {
            snapTo: 1 / (OUTCOMES.length - 1),
            duration: { min: 0.3, max: 0.7 },
            delay: 0.15,
            ease: 'power2.inOut',
          },
        },
      });
      q('.outcome-slide').forEach((slide) => {
        const s = gsap.utils.selector(slide);
        gsap.fromTo(
          s('.outcome-phone'),
          { rotationY: 18 },
          {
            rotationY: -10,
            ease: 'none',
            scrollTrigger: {
              trigger: slide,
              containerAnimation: reel,
              start: 'left right',
              end: 'right left',
              scrub: true,
            },
          },
        );
        gsap.from(s('h3, ul li'), {
          opacity: 0,
          y: 20,
          stagger: 0.08,
          scrollTrigger: {
            trigger: slide,
            containerAnimation: reel,
            start: 'left 75%',
            end: 'left 35%',
            scrub: true,
          },
        });
      });
      gsap.fromTo(
        q('.priya-phone'),
        { x: 260, rotationY: -28, opacity: 0 },
        {
          x: 0,
          rotationY: -8,
          opacity: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: q('.outcome-held')[0],
            containerAnimation: reel,
            start: 'left 80%',
            end: 'left 15%',
            scrub: true,
          },
        },
      );
      gsap.fromTo(
        q('.void-card'),
        { x: -200, rotation: -8 },
        {
          x: 0,
          rotation: 4,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: q('.outcome-voided')[0],
            containerAnimation: reel,
            start: 'left 80%',
            end: 'left 30%',
            scrub: true,
          },
        },
      );
      gsap.fromTo(
        q('.void-stamp'),
        { scale: 1.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          scrollTrigger: {
            trigger: q('.outcome-voided')[0],
            containerAnimation: reel,
            start: 'left 35%',
            end: 'left 15%',
            scrub: true,
          },
        },
      );
      gsap.fromTo(
        q('.capture-event'),
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: q('.outcome-captured')[0],
            containerAnimation: reel,
            start: 'left 60%',
            end: 'left 20%',
            scrub: true,
          },
        },
      );

      // 05 · Lure Log rows assemble out of depth.
      gsap.from(q('.log-row'), {
        opacity: 0,
        y: 60,
        z: -200,
        rotationX: -55,
        transformOrigin: '50% 0%',
        stagger: 0.18,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: q('.log-stage')[0],
          start: 'top 85%',
          end: 'center 55%',
          scrub: 0.5,
        },
      });
      // Section headings reveal line by line.
      q('.reveal').forEach((h) => {
        gsap.from(h.querySelectorAll('.line-inner'), {
          yPercent: 105,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: h, start: 'top 85%' },
        });
      });
      // 06 · Count-ups
      q('.stat-value').forEach((node) => {
        const stat = STATS[Number(node.getAttribute('data-stat'))];
        const n = { v: 0 };
        node.textContent = formatStat(0, stat);
        gsap.to(n, {
          v: stat.value,
          duration: 1.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: node, start: 'top 90%', once: true },
          onUpdate: () => {
            node.textContent = formatStat(n.v, stat);
          },
        });
      });
    }, el);

    return () => {
      ctx.revert();
      gsap.ticker.remove(raf);
      lenis.destroy();
      // Never leave the next route with a locked or hidden page.
      const html = document.documentElement;
      html.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped', 'lenis-scrolling');
      for (const node of [html, document.body]) {
        node.style.removeProperty('overflow');
        node.style.removeProperty('opacity');
        node.style.removeProperty('visibility');
      }
    };
  }, [webgl]);

  return (
    <div ref={root} data-testid="story-motion">
      <section id="story" aria-label="How AEGIS handles a payment">
        <div className="story-stage relative h-screen overflow-hidden bg-gradient-to-b from-[var(--gray-25)] to-white">
          <div
            className="layer-back pointer-events-none absolute inset-0 story-grid"
            aria-hidden="true"
          />
          <div className="relative mx-auto grid h-full max-w-6xl grid-cols-[1fr_1.05fr] items-center gap-8 px-6 pt-16">
            <div className="relative z-10 h-[420px]">
              <div className="copy copy-0 absolute inset-0 flex flex-col justify-center">
                <HeroCopy />
              </div>
              <div className="copy copy-1 absolute inset-0 flex flex-col justify-center">
                <StartsCopy />
              </div>
              <div className="copy copy-2 absolute inset-0 flex flex-col justify-center">
                <ChecksCopy />
              </div>
            </div>
            <div className="scene relative h-full">
              {webgl ? (
                <Suspense fallback={null}>
                  <CardScene progress={progress} />
                </Suspense>
              ) : (
                <div className="css-card pointer-events-none absolute left-[10%] top-[52%]">
                  <CssCard />
                </div>
              )}
              {/* Phone sits left of centre so its callouts always have room on the right. */}
              <div className="absolute inset-0 flex items-center justify-center pr-[18%]">
                <div className="relative">
                  <Device label="Margaret’s AEGIS app" className="story-phone">
                    <MargaretScreen
                      stage={state.stage}
                      payment={HELD}
                      reasonsShown={state.reasons}
                    />
                  </Device>
                  <ul className="callouts pointer-events-none" aria-hidden="true">
                    {CALLOUTS.map((c) => (
                      <li
                        key={c.value}
                        className={`callout callout-${c.at}`}
                        style={{ top: c.top }}
                      >
                        <span className="callout-line" />
                        <span className="callout-body">
                          <span className="callout-label">{c.label}</span>
                          <span className="callout-value">{c.value}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <ol
            className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-6 text-[12px] text-[var(--gray-500)]"
            aria-hidden="true"
          >
            {CHAPTERS.map((c, i) => (
              <li key={c} className="flex items-center gap-2">
                <span
                  className={`h-1 w-8 rounded-full transition-colors ${i <= state.chapter ? 'bg-[var(--brand)]' : 'bg-[var(--gray-200)]'}`}
                />
                <span className={i === state.chapter ? 'text-[var(--gray-900)]' : ''}>{c}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="outcomes"
        aria-label="Three outcomes"
        className="border-t border-[var(--gray-200)]"
      >
        <div className="outcome-pin relative h-screen overflow-hidden bg-[var(--gray-25)]">
          <div className="outcome-track flex h-full w-max">
            {OUTCOMES.map((p, i) => (
              <div
                key={p.key}
                className={`outcome-slide outcome-${p.key} flex h-full w-screen items-center`}
              >
                <div className="mx-auto w-full max-w-6xl px-6 pt-16">
                  <OutcomePanel p={p} index={i} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LureLogSection />
      <NumbersSection />
    </div>
  );
}
