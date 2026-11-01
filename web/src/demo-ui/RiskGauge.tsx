import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { TONE_COLOR, toneFor } from './scenarios';

const R = 52;
const ARC = Math.PI * R;

/** Half-circle gauge that counts up to the engine's 0-100 score. */
export function RiskGauge({ score }: { score: number | null }) {
  const reduce = useReducedMotion();
  const value = useMotionValue(0);
  const offset = useTransform(value, (v) => ARC * (1 - v / 100));
  const [shown, setShown] = useState(0);
  const target = score ?? 0;
  const color = TONE_COLOR[toneFor(target)];

  useEffect(() => {
    if (reduce) {
      value.set(target);
      setShown(target);
      return;
    }
    const controls = animate(value, target, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [target, reduce, value]);

  return (
    <div className="relative mx-auto w-40" role="img" aria-label={`Risk score ${target} of 100`}>
      <svg viewBox="0 0 128 72" className="w-full">
        <path
          d={`M12 64a${R} ${R} 0 0 1 104 0`}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <motion.path
          d={`M12 64a${R} ${R} 0 0 1 104 0`}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={ARC}
          style={{ strokeDashoffset: offset, filter: `drop-shadow(0 0 6px ${color}88)` }}
        />
      </svg>
      <p
        className="absolute inset-x-0 bottom-0 text-center text-3xl font-semibold tabular-nums"
        style={{ color }}
      >
        {score === null ? '–' : shown}
      </p>
    </div>
  );
}
