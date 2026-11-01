import type { RiskInput, RuleHit } from '../types.js';

const BUILTIN_KEYWORDS = [
  'urgent',
  'secret',
  'bail',
  'grandson',
  'gift card',
  'wire transfer',
  'irs',
  'warrant',
  'arrest',
];

const IMPERSONATION = /\b(officer|sergeant|deputy|lieutenant|irs|fbi|police|agent)\b/i;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function keywordHit(haystack: string, keyword: string): boolean {
  const needle = keyword.trim().toLowerCase();
  if (!needle) return false;
  if (needle.includes(' ')) return haystack.toLowerCase().includes(needle);
  return new RegExp(`\\b${escapeRegExp(needle)}\\b`, 'i').test(haystack);
}

export function scamRule(input: RiskInput): RuleHit {
  const haystack = `${input.payeeName} ${input.note}`;
  const keywords = [...new Set([...input.policy.scamKeywords, ...BUILTIN_KEYWORDS])];
  const hits = keywords.filter((keyword) => keywordHit(haystack, keyword));
  const reasons = hits.map(
    (keyword) => `The message uses "${keyword}", which your rules treat as a warning.`,
  );
  let points = Math.min(48, hits.length * 16);
  if (IMPERSONATION.test(input.payeeName)) {
    points += 18;
    reasons.push('This name looks like someone pretending to be an official.');
  }
  return { id: 'scam', points, reasons };
}
