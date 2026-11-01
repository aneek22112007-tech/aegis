import { lazy, Suspense, useEffect, useState } from 'react';
import { StaticShield } from './StaticShield';
import { hasWebGL, prefersReducedMotion } from './webgl';

const ShieldScene = lazy(() => import('./ShieldScene'));

/** Lazy-loads the three.js scene only when WebGL works and motion is welcome. */
export function HeroCanvas() {
  const [mode, setMode] = useState<'pending' | '3d' | 'static'>('pending');

  useEffect(() => {
    setMode(hasWebGL() && !prefersReducedMotion() ? '3d' : 'static');
  }, []);

  if (mode !== '3d') return <StaticShield />;
  return (
    <Suspense fallback={<StaticShield />}>
      <ShieldScene />
    </Suspense>
  );
}
