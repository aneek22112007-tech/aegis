import { describe, expect, it, vi } from 'vitest';
import { isChunkError, reloadOnce } from './recover';

describe('chunk recovery', () => {
  it('recognises stale chunk errors', () => {
    expect(isChunkError(new TypeError('Failed to fetch dynamically imported module: /a.js'))).toBe(true);
    expect(isChunkError(new Error('Cannot read properties of null'))).toBe(false);
  });
  it('reloads only once per minute', () => {
    sessionStorage.clear();
    const reload = vi.fn();
    const win = { sessionStorage, location: { reload } } as unknown as Window;
    expect(reloadOnce(win)).toBe(true);
    expect(reloadOnce(win)).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
