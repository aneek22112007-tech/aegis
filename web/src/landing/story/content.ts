import { scorePlayground } from '../RiskPlayground';

export const FTC_SOURCE =
  'https://www.ftc.gov/news-events/news/press-releases/2026/10/ftc-issues-annual-report-congress-agencys-actions-protect-older-adults';

// Scored once with the real engine at a fixed daytime hour, so quiet-hours rules never vary the copy.
const NOON = new Date(2026, 5, 2, 12, 0, 0);

export type Outcome = 'captured' | 'held' | 'voided';

export type StoryPayment = {
  key: Outcome;
  payee: string;
  amount: string;
  note: string;
  score: number;
  level: string;
  reasons: string[];
};

function score(payee: string, amount: number, note: string, trusted: boolean, key: Outcome) {
  const r = scorePlayground({
    payee,
    amount,
    note,
    status: trusted ? 'trusted' : 'unknown',
    now: NOON,
  });
  return {
    key,
    payee,
    amount: `$${amount.toLocaleString('en-US')}`,
    note,
    score: r.score,
    level: r.level,
    reasons: r.reasons,
  } satisfies StoryPayment;
}

export const PHARMACY = score('CVS Pharmacy', 48, 'Prescription refill', true, 'captured');
export const HELD = score('Helen Brooks', 650, 'Birthday gift', false, 'held');
export const SCAM = score(
  'Officer James',
  1900,
  'URGENT keep this secret, your grandson needs bail',
  false,
  'voided',
);
export const OUTCOMES = [PHARMACY, HELD, SCAM];

export const LOG_ROWS = [
  ['Oct 31, 09:12', 'CVS Pharmacy', '$48.00', 'ok', 'Low', 'Captured', 'pay_3k9q2m7d1a'],
  ['Oct 31, 14:40', 'Helen Brooks', '$650.00', 'warn', 'Medium', 'Held', 'pay_8f2k1q0zx3'],
  ['Oct 31, 15:02', 'Helen Brooks', '$650.00', 'ok', 'Medium', 'Captured', 'pay_8f2k1q0zx3'],
  ['Nov 1, 23:05', 'Officer James', '$1,900.00', 'bad', 'High', 'Voided', 'pay_m1z7r4c8pe'],
  ['Nov 2, 08:30', 'City Utilities', '$92.00', 'ok', 'Low', 'Captured', 'pay_q0d5t2w9hn'],
] as const;

/** Figures from the FTC's Protecting Older Consumers 2025–2026 report (released October 2026). */
export const STATS = [
  {
    value: 3,
    prefix: '$',
    suffix: 'B',
    decimals: 0,
    label: 'fraud losses reported by adults 60+ in 2025',
  },
  {
    value: 5,
    prefix: '',
    suffix: '×',
    decimals: 0,
    label: 'the reported losses in 2020 (about $600M)',
  },
  {
    value: 2000,
    prefix: '$',
    suffix: '',
    decimals: 0,
    label: 'median reported loss for people 80 and over',
  },
  {
    value: 119.5,
    prefix: '$',
    suffix: 'B',
    decimals: 1,
    label: 'upper FTC estimate of the full cost (from $13.3B), counting unreported fraud',
  },
] as const;

export function formatStat(v: number, s: (typeof STATS)[number]) {
  return `${s.prefix}${v.toLocaleString('en-US', { minimumFractionDigits: s.decimals, maximumFractionDigits: s.decimals })}${s.suffix}`;
}
