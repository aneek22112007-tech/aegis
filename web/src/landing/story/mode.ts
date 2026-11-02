export type StoryMode = 'motion' | 'static';

export const MOTION_MIN_WIDTH = 1024;

/** Full scroll story only on large screens with motion allowed; everyone else gets stacked sections. */
export function chooseMode({ reduce, width }: { reduce: boolean; width: number }): StoryMode {
  if (reduce) return 'static';
  return width >= MOTION_MIN_WIDTH ? 'motion' : 'static';
}

export function readMode(): StoryMode {
  if (typeof window === 'undefined') return 'static';
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  return chooseMode({ reduce, width: window.innerWidth });
}

export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
