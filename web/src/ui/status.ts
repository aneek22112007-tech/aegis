/** Map payment status and risk level to the semantic chip styles and plain labels. */
export type ChipTone = 'ok' | 'warn' | 'bad' | 'neutral' | 'brand';

export function statusChip(status: string | null | undefined): { tone: ChipTone; label: string } {
  switch (status) {
    case 'captured':
      return { tone: 'ok', label: 'Captured' };
    case 'held':
      return { tone: 'warn', label: 'Held' };
    case 'voided':
      return { tone: 'bad', label: 'Voided' };
    case 'failed':
      return { tone: 'bad', label: 'Failed' };
    case 'authorized':
      return { tone: 'brand', label: 'Authorized' };
    case 'created':
    case 'pending':
      return { tone: 'neutral', label: 'Pending' };
    default:
      return { tone: 'neutral', label: status ? status[0].toUpperCase() + status.slice(1) : '—' };
  }
}

export function riskChip(level: string | null | undefined): { tone: ChipTone; label: string } {
  if (level === 'HIGH') return { tone: 'bad', label: 'High' };
  if (level === 'MEDIUM') return { tone: 'warn', label: 'Medium' };
  if (level === 'LOW') return { tone: 'ok', label: 'Low' };
  return { tone: 'neutral', label: '—' };
}

/** Short, stable display id like Stripe's `pi_…` prefixes. */
export function shortId(id: string, prefix = 'pay'): string {
  const tail = id.replace(/^[a-z]+_/, '').slice(-10);
  return `${prefix}_${tail}`;
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
