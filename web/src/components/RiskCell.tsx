import type { ICellRendererParams } from 'ag-grid-community';
import type { AuditRow } from '../api';

export function RiskCell(props: ICellRendererParams<AuditRow, string | null>) {
  const level = props.value ?? '';
  const colour =
    level === 'HIGH'
      ? 'var(--d-high, var(--danger))'
      : level === 'MEDIUM'
        ? 'var(--d-med, var(--warn))'
        : 'var(--d-low, var(--accent))';
  return (
    <span
      style={{
        color: colour,
        fontWeight: 700,
        border: `1px solid ${colour}`,
        borderRadius: 999,
        padding: '2px 10px',
        fontSize: 12,
        letterSpacing: '0.04em',
      }}
      data-level={level || 'NONE'}
    >
      {level || '—'}
    </span>
  );
}
