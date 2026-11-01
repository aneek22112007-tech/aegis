import type { AuditRow } from '../api';

export function filterAudit(rows: AuditRow[], query: string, level: string): AuditRow[] {
  const needle = query.trim().toLowerCase();
  return rows.filter((row) => {
    if (level !== 'ALL' && row.level !== level) return false;
    if (!needle) return true;
    return `${row.payeeName} ${row.note}`.toLowerCase().includes(needle);
  });
}
