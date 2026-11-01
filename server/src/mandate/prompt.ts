import type { GrokMessage } from '../grok/client.js';
import type { GuardianRef } from './schema.js';

function instructions(guardian: GuardianRef): string {
  return [
    "Convert a senior's own payment wishes into JSON.",
    'Do not invent a stricter limit than they wrote.',
    'Use dollars, not cents.',
    'If they did not name a single-payment cap, set maxPerTxn to 2000.',
    'If they did not name a daily cap, set dailyLimit to 2000.',
    'If they did not name quiet hours, use 22:00 to 07:00.',
    `The guardian is ${guardian.name} (${guardian.contact}).`,
    'Return only a JSON object with keys maxNewPayee, maxPerTxn, dailyLimit, alwaysAllow, alwaysBlock, scamKeywords, quietHours, guardian, and escalation.',
    'quietHours is {start, end}. guardian is {name, contact}.',
  ].join(' ');
}

export function compilePrompt(text: string, guardian: GuardianRef): GrokMessage {
  return {
    system: instructions(guardian),
    user: text,
  };
}

export function retryPrompt(text: string, guardian: GuardianRef, problem: string): GrokMessage {
  return {
    system: instructions(guardian),
    user: `The previous JSON failed validation: ${problem}\n\nWishes:\n${text}`,
  };
}
