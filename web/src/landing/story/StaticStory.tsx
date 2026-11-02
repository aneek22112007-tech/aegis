import { ChecksCopy, HeroCopy, StartsCopy } from './copy';
import { HELD, OUTCOMES } from './content';
import { Device } from './Device';
import { CssCard } from './PaymentCard';
import { MargaretScreen } from './Screens';
import { LureLogSection, NumbersSection, OutcomePanel } from './Sections';

/** Reduced-motion and small-screen story: the same chapters as plain stacked sections, no scrubbing or WebGL. */
export function StaticStory() {
  return (
    <div data-testid="story-static">
      <section id="story" className="bg-gradient-to-b from-[var(--gray-25)] to-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 pb-20 pt-14 lg:grid-cols-2">
          <div>
            <HeroCopy />
          </div>
          <div className="flex justify-center">
            <Device label="Margaret’s AEGIS app home screen" testId="static-shield">
              <MargaretScreen stage="home" payment={HELD} />
            </Device>
          </div>
        </div>
      </section>
      <section aria-label="A payment starts" className="border-t border-[var(--gray-200)] bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-2">
          <div>
            <StartsCopy />
          </div>
          <div className="flex items-center justify-center gap-6">
            <div className="hidden sm:block">
              <CssCard />
            </div>
            <Device
              label={`Margaret confirms ${HELD.amount} to ${HELD.payee}`}
              className="device-sm"
            >
              <MargaretScreen stage="request" payment={HELD} />
            </Device>
          </div>
        </div>
      </section>
      <section
        aria-label="AEGIS checks it"
        className="border-t border-[var(--gray-200)] bg-[var(--gray-25)]"
      >
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-2">
          <div>
            <ChecksCopy />
          </div>
          <div className="flex justify-center">
            <Device label={`Risk score ${HELD.score} of 100 with reasons`}>
              <MargaretScreen stage="score" payment={HELD} />
            </Device>
          </div>
        </div>
      </section>
      <section
        id="outcomes"
        aria-label="Three outcomes"
        className="border-t border-[var(--gray-200)] bg-white"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-20 px-6 py-20">
          {OUTCOMES.map((p, i) => (
            <OutcomePanel key={p.key} p={p} index={i} />
          ))}
        </div>
      </section>
      <LureLogSection />
      <NumbersSection />
    </div>
  );
}
