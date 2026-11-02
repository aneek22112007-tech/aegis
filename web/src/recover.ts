const FLAG = 'aegis-chunk-reload';

/** True for the errors a browser throws when a lazy chunk from an older deploy is gone. */
export function isChunkError(error: unknown): boolean {
  const text = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  return /dynamically imported module|Importing a module script failed|error loading dynamically|ChunkLoadError|Unable to preload CSS|Failed to fetch/i.test(
    text,
  );
}

/**
 * Reloads once to pick up the new deploy. Returns false if we already tried in the last
 * minute, so a truly broken deploy shows the error screen instead of looping.
 */
export function reloadOnce(win: Window = window): boolean {
  try {
    const last = Number(win.sessionStorage.getItem(FLAG) || 0);
    if (Date.now() - last < 60_000) return false;
    win.sessionStorage.setItem(FLAG, String(Date.now()));
  } catch {
    return false;
  }
  win.location.reload();
  return true;
}

/** Wires up the global recovery hooks. Call once before rendering. */
export function installRecovery(win: Window = window): void {
  // Vite fires this when a preload for a lazy route fails (old hashes after a redeploy).
  win.addEventListener('vite:preloadError', (event) => {
    if (reloadOnce(win)) event.preventDefault();
  });
  // A page restored from the back/forward cache can hold a half-torn-down tree; render fresh.
  win.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    const html = win.document.documentElement;
    if (!win.document.querySelector('.story-stage')) {
      html.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped');
    }
    for (const node of [html, win.document.body]) {
      node.style.removeProperty('overflow');
      node.style.removeProperty('opacity');
    }
    const root = win.document.getElementById('root');
    if (!root || root.childElementCount === 0) win.location.reload();
  });
}
