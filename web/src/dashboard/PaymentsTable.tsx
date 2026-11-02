import type { AuditRow } from '../api';
import { Chip } from '../ui/Chip';
import { formatDateTime, riskChip, shortId, statusChip } from '../ui/status';

/** Dense payments table with status chips; the payee cell is the keyboard target. */
export function PaymentsTable({
  rows,
  loading = false,
  onSelect,
}: {
  rows: AuditRow[];
  loading?: boolean;
  onSelect: (row: AuditRow) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="table min-w-[640px] text-[13px]">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Payee</th>
            <th scope="col" className="!text-right">
              Amount
            </th>
            <th scope="col">Risk</th>
            <th scope="col">Status</th>
            <th scope="col">Payment ID</th>
          </tr>
        </thead>
        <tbody>
          {loading && rows.length === 0
            ? [0, 1, 2].map((i) => (
                <tr key={i}>
                  {[0, 1, 2, 3, 4, 5].map((j) => (
                    <td key={j}>
                      <span className="skeleton block h-3 w-20" />
                    </td>
                  ))}
                </tr>
              ))
            : null}
          {!loading && rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-[var(--gray-500)]">
                No payments yet.
              </td>
            </tr>
          ) : null}
          {rows.map((row) => {
            const status = statusChip(row.status);
            const risk = riskChip(row.level);
            return (
              <tr key={row.id} className="clickable" onClick={() => onSelect(row)}>
                <td className="whitespace-nowrap text-[var(--gray-600)]">
                  {formatDateTime(row.createdAt)}
                </td>
                <td>
                  <button
                    type="button"
                    className="font-medium hover:text-[var(--brand)]"
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelect(row);
                    }}
                  >
                    {row.payeeName}
                  </button>
                  {row.note ? (
                    <span className="block max-w-[240px] truncate text-xs text-[var(--gray-500)]">
                      {row.note}
                    </span>
                  ) : null}
                </td>
                <td className="text-right font-medium tabular-nums">{row.amount}</td>
                <td>
                  <Chip tone={risk.tone}>
                    {row.score ?? '—'} {risk.label}
                  </Chip>
                </td>
                <td>
                  <Chip tone={status.tone}>{status.label}</Chip>
                </td>
                <td className="mono text-[var(--gray-500)]">{shortId(row.id)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
