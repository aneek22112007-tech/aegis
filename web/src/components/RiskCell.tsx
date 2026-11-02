import type { ICellRendererParams } from 'ag-grid-community';
import type { AuditRow } from '../api';
import { riskChip, statusChip } from '../ui/status';

export function RiskCell(props: ICellRendererParams<AuditRow, string | null>) {
  const level = props.value ?? '';
  const chip = riskChip(level);
  return (
    <span className={`chip chip-${chip.tone}`} data-level={level || 'NONE'}>
      {props.data?.score ?? '—'} {chip.label}
    </span>
  );
}

export function StatusCell(props: ICellRendererParams<AuditRow, string>) {
  const chip = statusChip(props.value);
  return <span className={`chip chip-${chip.tone}`}>{chip.label}</span>;
}
