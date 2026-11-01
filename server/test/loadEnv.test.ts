import { describe, expect, it } from 'vitest';
import { parseEnv } from '../src/loadEnv.js';

describe('parseEnv', () => {
  it('reads quoted values and skips comments', () => {
    const parsed = parseEnv('# secret\nXAI_MODEL="grok-4"\nPORT=8787\n\n');
    expect(parsed).toEqual({ XAI_MODEL: 'grok-4', PORT: '8787' });
  });

  it('does not treat a bare comment as a key', () => {
    expect(parseEnv('# PAYPAL_CLIENT_SECRET=hidden')).toEqual({});
  });
});
