export type GrokMessage = {
  system: string;
  user: string;
};

export type GrokClient = {
  completeJson: (message: GrokMessage) => Promise<unknown>;
};

export type GrokClientOptions = {
  apiKey: string;
  model: string;
  baseUrl: string;
  fetchImpl?: typeof fetch;
};

export function createGrokClient(options: GrokClientOptions): GrokClient | null {
  if (!options.apiKey) return null;
  const fetchImpl = options.fetchImpl ?? fetch;
  const baseUrl = options.baseUrl.replace(/\/$/, '');

  return {
    async completeJson(message) {
      const response = await fetchImpl(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options.model,
          temperature: 0,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: message.system },
            { role: 'user', content: message.user },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Grok request failed (${response.status})`);
      }

      const body = (await response.json()) as {
        choices?: Array<{ message?: { content?: unknown } }>;
      };
      const content = body.choices?.[0]?.message?.content;
      if (typeof content !== 'string' || !content.trim()) {
        throw new Error('Grok returned no JSON message');
      }
      try {
        return JSON.parse(content) as unknown;
      } catch {
        throw new Error('Grok returned invalid JSON');
      }
    },
  };
}
