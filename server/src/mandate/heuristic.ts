import type { GuardianRef, MandatePolicy } from './schema.js';

const BASE_SCAM_KEYWORDS = [
  'urgent',
  'secret',
  'bail',
  'grandson',
  'gift card',
  'wire',
  'irs',
  'warrant',
];

const SAFE_DEFAULTS = {
  maxNewPayee: 500,
  maxPerTxn: 2000,
  dailyLimit: 2000,
  quietHours: { start: '22:00', end: '07:00' },
  escalation: 'Ask the guardian before the money moves.',
};

function parseMoney(text: string): number[] {
  return [...text.matchAll(/\$\s*([0-9][0-9,]*(?:\.\d{1,2})?)/g)].map((match) =>
    Number(match[1].replace(/,/g, '')),
  );
}

function parseList(text: string, verb: 'allow' | 'block'): string[] {
  const match = text.match(new RegExp(`always ${verb}\\s+([^.]+)`, 'i'));
  if (!match?.[1]) return [];
  return match[1]
    .split(/\s+and\s+|,\s*/i)
    .map((part) => part.replace(/^(?:my|the|our)\s+/i, '').trim())
    .filter((part) => part.length > 1 && !/^(?:it|them|that)$/i.test(part));
}

function to24h(hour: string, minute: string | undefined, meridiem: string): string {
  let h = Number(hour) % 12;
  if (meridiem.toLowerCase() === 'pm') h += 12;
  return `${String(h).padStart(2, '0')}:${minute ?? '00'}`;
}

const TIME = String.raw`(\d{1,2})(?::(\d{2}))?\s*(am|pm)`;

/** Reads "after 9pm" / "before 7am" / "between 9pm and 7am" into quiet hours. */
export function parseQuietHours(text: string): { start: string; end: string } {
  const between = new RegExp(`between\\s+${TIME}\\s+and\\s+${TIME}`, 'i').exec(text);
  if (between) {
    return {
      start: to24h(between[1], between[2], between[3]),
      end: to24h(between[4], between[5], between[6]),
    };
  }
  const after = new RegExp(`(?:after|past)\\s+${TIME}`, 'i').exec(text);
  const before = new RegExp(`before\\s+${TIME}`, 'i').exec(text);
  return {
    start: after ? to24h(after[1], after[2], after[3]) : SAFE_DEFAULTS.quietHours.start,
    end: before ? to24h(before[1], before[2], before[3]) : SAFE_DEFAULTS.quietHours.end,
  };
}

export function heuristicCompile(text: string, guardian: GuardianRef): MandatePolicy {
  const amounts = parseMoney(text).filter((amount) => Number.isFinite(amount) && amount > 0);
  const lower = text.toLowerCase();
  const newPayeeAmount = /haven'?t paid|have not paid|someone new|anyone new|anyone i/.test(lower)
    ? amounts[0]
    : undefined;
  const keywords = new Set(BASE_SCAM_KEYWORDS);
  for (const keyword of BASE_SCAM_KEYWORDS) {
    if (lower.includes(keyword)) keywords.add(keyword);
  }

  return {
    maxNewPayee: newPayeeAmount ?? amounts[0] ?? SAFE_DEFAULTS.maxNewPayee,
    maxPerTxn: SAFE_DEFAULTS.maxPerTxn,
    dailyLimit: SAFE_DEFAULTS.dailyLimit,
    alwaysAllow: parseList(text, 'allow'),
    alwaysBlock: parseList(text, 'block'),
    scamKeywords: [...keywords],
    quietHours: parseQuietHours(text),
    guardian,
    escalation: /call my|tell my|ask my/.test(lower)
      ? `Call ${guardian.name} before the money moves.`
      : SAFE_DEFAULTS.escalation,
  };
}
