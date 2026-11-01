import type { ICellRendererParams } from 'ag-grid-community';
import type { AuditRow } from '../api';

export function RiskCell(props: ICellRendererParams<AuditRow, string | null>) {
  const level = props.value ?? '';
  const colour =
    level === 'HIGH' ? 'var(--danger)' : level === 'MEDIUM' ? 'var(--warn)' : 'var(--accent)';
  return (
    <span style={{ color: colour, fontWeight: 700 }} data-level={level || 'NONE'}>
      {level || '—'}
    </span>
  );
}
