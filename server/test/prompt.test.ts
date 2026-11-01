import { describe, expect, it } from 'vitest';
import { compilePrompt, retryPrompt } from '../src/mandate/prompt.js';

const guardian = { name: 'Priya', contact: 'daughter' };

describe('mandate prompts', () => {
  it('asks Grok for the mandate keys and names the guardian', () => {
    const prompt = compilePrompt('Never send more than $500.', guardian);
    expect(prompt.system).toContain('maxNewPayee');
    expect(prompt.system).toContain('Priya');
    expect(prompt.user).toContain('$500');
  });

  it('includes the validation problem on a retry', () => {
    const prompt = retryPrompt('Be careful.', guardian, 'maxNewPayee is missing');
    expect(prompt.user).toContain('maxNewPayee is missing');
    expect(prompt.user).toContain('Be careful.');
  });
});
