import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

type State = 'waiting' | 'approved' | 'denied';

/** A phone mock-up of the guardian's one-tap approval (interactive, no network). */
export function GuardianPhone() {
  const [state, setState] = useState<State>('waiting');
  return (
    <div className="relative mx-auto w-[290px]">
      <div
        className="absolute -inset-10 rounded-[4rem] bg-gradient-to-b from-amber-400/20 via-emerald-400/10 to-transparent blur-3xl"
        aria-hidden="true"
      />
      <div className="relative rounded-[2.8rem] border border-white/15 bg-gradient-to-b from-[#1a1f2b] to-[#0b0e15] p-3 shadow-2xl shadow-black/60">
        <div className="rounded-[2.2rem] bg-[#05070c] px-4 pb-6 pt-3">
          <div className="mx-auto mb-5 h-6 w-24 rounded-full bg-black" aria-hidden="true" />
          <p className="text-center text-xs text-white/40">AEGIS · Guardian</p>
          <p className="mt-1 text-center text-4xl font-light text-white">9:41</p>
          <AnimatePresence mode="wait">
            {state === 'waiting' ? (
              <motion.div
                key="alert"
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12 }}
                className="mt-6 rounded-2xl border border-amber-300/30 bg-amber-300/[0.07] p-4"
              >
                <p className="text-xs font-medium uppercase tracking-widest text-amber-200">
                  Needs you · score 42
                </p>
                <p className="mt-2 text-lg font-semibold text-white">$650.00 to Helen Brooks</p>
                <p className="mt-1 text-sm text-white/60">
                  Margaret has not paid this person before, and it is over her $500 limit for new
                  people.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setState('denied')}
                    className="rounded-xl border border-rose-400/50 py-2.5 font-medium text-rose-200 transition hover:bg-rose-400/10"
                  >
                    Deny
                  </button>
                  <button
                    type="button"
                    onClick={() => setState('approved')}
                    className="rounded-xl bg-emerald-400 py-2.5 font-semibold text-black transition hover:bg-emerald-300"
                  >
                    Approve
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center"
                role="status"
              >
                <p
                  className={`text-5xl ${state === 'approved' ? 'text-emerald-300' : 'text-rose-300'}`}
                  aria-hidden="true"
                >
                  {state === 'approved' ? '✓' : '✕'}
                </p>
                <p className="mt-2 font-semibold text-white">
                  {state === 'approved'
                    ? 'Captured. Margaret sees “Sent”.'
                    : 'Voided. No money moved.'}
                </p>
                <button
                  type="button"
                  className="mt-4 text-sm text-white/50 underline"
                  onClick={() => setState('waiting')}
                >
                  Replay
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="mt-6 rounded-2xl bg-white/[0.03] p-3 text-xs text-white/40">
            Unanswered holds auto-void after the timeout — silence never sends money.
          </div>
        </div>
      </div>
    </div>
  );
}
