import { describe, expect, it, vi } from 'vitest';
import { createTokenCache } from '../src/paypal/tokenCache.js';

describe('token cache', () => {
  it('reuses a token until it is close to expiry', async () => {
    let now = 1_000;
    const cache = createTokenCache(() => now);
    const factory = vi.fn(async () => ({ accessToken: 'abc', expiresIn: 120 }));
    expect(await cache.get(factory)).toBe('abc');
    now += 30_000;
    expect(await cache.get(factory)).toBe('abc');
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('refreshes after the skew window', async () => {
    let now = 1_000;
    const cache = createTokenCache(() => now);
    const factory = vi
      .fn()
      .mockResolvedValueOnce({ accessToken: 'abc', expiresIn: 120 })
      .mockResolvedValueOnce({ accessToken: 'next', expiresIn: 120 });
    await cache.get(factory);
    now += 70_000;
    expect(await cache.get(factory)).toBe('next');
    expect(factory).toHaveBeenCalledTimes(2);
  });
});
