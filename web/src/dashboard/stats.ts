import type { AuditRow } from '../api';

export type DashboardStats = {
  total: number;
  sentCents: number;
  protectedCents: number;
  held: number;
  averageScore: number;
  byLevel: { LOW: number; MEDIUM: number; HIGH: number };
};

/** Summarise real audit rows into KPI numbers. */
export function summarize(rows: AuditRow[]): DashboardStats {
  const scored = rows.filter((row) => row.score !== null);
  const byLevel = { LOW: 0, MEDIUM: 0, HIGH: 0 };
  for (const row of rows) {
    if (row.level === 'LOW' || row.level === 'MEDIUM' || row.level === 'HIGH')
      byLevel[row.level] += 1;
  }
  return {
    total: rows.length,
    sentCents: rows
      .filter((row) => row.status === 'captured')
      .reduce((sum, row) => sum + row.amountCents, 0),
    protectedCents: rows
      .filter((row) => row.status === 'voided')
      .reduce((sum, row) => sum + row.amountCents, 0),
    held: rows.filter((row) => row.status === 'held').length,
    averageScore: scored.length
      ? Math.round(scored.reduce((sum, row) => sum + (row.score ?? 0), 0) / scored.length)
      : 0,
    byLevel,
  };
}

export type RiskPoint = { label: string; score: number; payee: string; level: string };

/** Oldest-first series for the risk-over-time chart. */
export function riskSeries(rows: AuditRow[]): RiskPoint[] {
  return rows
    .filter((row) => row.score !== null)
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((row) => ({
      label: new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      score: row.score ?? 0,
      payee: row.payeeName,
      level: row.level ?? '',
    }));
}

export function usd(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}
