import { describe, expect, it, vi } from 'vitest';
import { createGrokClient } from '../src/grok/client.js';

describe('createGrokClient', () => {
  it('returns null when no API key is configured', () => {
    expect(
      createGrokClient({ apiKey: '', model: 'grok-4', baseUrl: 'https://api.x.ai/v1' }),
    ).toBeNull();
  });

  it('posts JSON mode to the xAI chat completions endpoint', async () => {
    let sentUrl = '';
    let sentInit: RequestInit | undefined;
    const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
      sentUrl = url;
      sentInit = init;
      return new Response(
        JSON.stringify({
          choices: [{ message: { content: JSON.stringify({ maxNewPayee: 500 }) } }],
        }),
        { status: 200 },
      );
    });
    const client = createGrokClient({
      apiKey: 'test-key',
      model: 'grok-4',
      baseUrl: 'https://api.x.ai/v1/',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const body = await client?.completeJson({ system: 'sys', user: 'hello' });
    expect(body).toEqual({ maxNewPayee: 500 });
    expect(sentUrl).toBe('https://api.x.ai/v1/chat/completions');
    const headers = new Headers(sentInit?.headers);
    expect(headers.get('Authorization')).toBe('Bearer test-key');
    const sent = JSON.parse(String(sentInit?.body));
    expect(sent.response_format).toEqual({ type: 'json_object' });
    expect(sent.model).toBe('grok-4');
  });

  it('fails without echoing the API key', async () => {
    const client = createGrokClient({
      apiKey: 'super-secret-key',
      model: 'grok-4',
      baseUrl: 'https://api.x.ai/v1',
      fetchImpl: (async () => new Response('nope', { status: 500 })) as typeof fetch,
    });
    await expect(client?.completeJson({ system: 'sys', user: 'hello' })).rejects.toThrow(
      'Grok request failed (500)',
    );
  });
});
