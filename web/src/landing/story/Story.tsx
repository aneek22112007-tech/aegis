import { lazy, Suspense, useEffect, useState } from 'react';
import { readMode } from './mode';
import { StaticStory } from './StaticStory';
import './story.css';

// GSAP, Lenis and the scroll timeline only download for large screens with motion allowed.
const MotionStory = lazy(() => import('./MotionStory'));

/** Picks the scroll story or the stacked version once, before paint, and follows reduced-motion changes. */
export function Story() {
  const [mode, setMode] = useState(readMode);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq?.addEventListener) return;
    const on = () => setMode(readMode());
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  if (mode !== 'motion') return <StaticStory />;
  return (
    <Suspense fallback={<div className="min-h-[100svh]" aria-hidden="true" />}>
      <MotionStory />
    </Suspense>
  );
}
