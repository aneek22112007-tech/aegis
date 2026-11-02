import type { ReactNode } from 'react';
import { Icon, type IconName } from '../ui/Icon';

/** Fixed avatar colours per person or business, so the same payee always looks the same. */
const AVATARS: Record<string, [string, string]> = {
  margaret: ['#d9e4f8', '#133a87'],
  priya: ['#fdead7', '#93370d'],
  'cvs pharmacy': ['#fee4e2', '#b42318'],
  'city utilities': ['#d1fadf', '#05603a'],
};
const FALLBACK: [string, string][] = [
  ['#e0eaff', '#2d31a6'],
  ['#f2f4f7', '#344054'],
  ['#fcf3c7', '#854a0e'],
];

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

export function Avatar({
  name,
  size = 48,
  icon,
}: {
  name: string;
  size?: number;
  icon?: IconName;
}) {
  const key = name.trim().toLowerCase();
  const [bg, fg] =
    AVATARS[key] ?? FALLBACK[[...key].reduce((n, c) => n + c.charCodeAt(0), 0) % FALLBACK.length];
  return (
    <span
      aria-hidden="true"
      className="s-avatar"
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.36 }}
    >
      {icon ? <Icon name={icon} size={size * 0.46} /> : initials(name)}
    </span>
  );
}

export type Tone = 'ok' | 'warn' | 'bad' | 'neutral';

export function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`s-chip s-${tone}`}>{children}</span>;
}

/** Plain-word status for a payment, from its stored status. */
export function statusOf(status: string): { label: string; tone: Tone } {
  if (status === 'captured') return { label: 'Sent', tone: 'ok' };
  if (status === 'held') return { label: 'Waiting for Priya', tone: 'warn' };
  if (status === 'voided') return { label: 'Stopped', tone: 'bad' };
  if (status === 'failed') return { label: 'Not sent', tone: 'bad' };
  return { label: 'Checking', tone: 'neutral' };
}

const DAY = 86_400_000;

/** "Today, 9:12 AM", "Yesterday, 4:05 PM", or "Oct 28". */
export function whenLabel(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (date.getTime() >= start.getTime()) return `Today, ${time}`;
  if (date.getTime() >= start.getTime() - DAY) return `Yesterday, ${time}`;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
  });
}

/** "just now", "12 minutes ago", "3 hours ago", "2 days ago". */
export function agoLabel(iso: string, now = new Date()): string {
  const minutes = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export function greeting(now = new Date()): string {
  const h = now.getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export function usd(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function PageTitle({
  title,
  lead,
  back,
}: {
  title: string;
  lead?: string;
  back?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      {back}
      <h1 className="text-[1.5rem] font-semibold leading-tight tracking-[-0.02em]">{title}</h1>
      {lead ? <p className="text-[0.9rem] text-[var(--muted)]">{lead}</p> : null}
    </div>
  );
}

export const primaryBtn =
  'inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-6 py-3 text-[0.9rem] font-semibold text-[var(--accent-ink)] no-underline hover:opacity-95 disabled:opacity-50';
export const secondaryBtn =
  'inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--card)] px-6 py-3 text-[0.9rem] font-semibold text-[var(--ink)] no-underline hover:bg-[var(--bg)]';
export const field =
  'min-h-14 w-full rounded-2xl border border-[var(--line)] bg-[var(--card)] px-4 text-[0.95rem] font-normal text-[var(--ink)] outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--accent)_18%,transparent)]';
