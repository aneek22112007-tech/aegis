import {
  ClientSideRowModelModule,
  ModuleRegistry,
  PaginationModule,
  RowStyleModule,
  themeQuartz,
  type ColDef,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { downloadText, getAudit, type AuditRow } from '../api';
import { filterAudit } from '../audit/filter';
import { RiskCell, StatusCell } from '../components/RiskCell';
import { PaymentDrawer } from '../dashboard/PaymentDrawer';
import { summarize, usd } from '../dashboard/stats';
import { Icon } from '../ui/Icon';
import { formatDateTime, shortId } from '../ui/status';

// Register only what the Lure Log uses instead of AllCommunityModule (smaller chunk).
ModuleRegistry.registerModules([ClientSideRowModelModule, RowStyleModule, PaginationModule]);

// Quartz, tuned to the AEGIS system: 13px type, 40px rows, 1px grey borders, brand accent.
const theme = themeQuartz.withParams({
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  fontSize: 13,
  headerFontSize: 12,
  headerFontWeight: 500,
  headerTextColor: '#6b7486',
  backgroundColor: '#ffffff',
  foregroundColor: '#101828',
  borderColor: '#eceff3',
  headerBackgroundColor: '#fafbfc',
  rowHoverColor: '#fafbfc',
  selectedRowBackgroundColor: '#eef3fc',
  accentColor: '#1849a9',
  wrapperBorder: false,
  wrapperBorderRadius: 0,
  rowHeight: 44,
  headerHeight: 36,
  spacing: 6,
  cellHorizontalPadding: 16,
});

const STATUSES = ['ALL', 'captured', 'held', 'voided'] as const;

export function AuditPage() {
  const [params] = useSearchParams();
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(() => params.get('q') ?? '');
  const [level, setLevel] = useState('ALL');
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('ALL');
  const [selected, setSelected] = useState<AuditRow | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    void getAudit()
      .then((body) => setRows(body.payments))
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : 'Could not load the Lure Log.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = params.get('q');
    if (q !== null) setQuery(q);
  }, [params]);

  const visible = useMemo(
    () =>
      filterAudit(rows, query, level).filter((row) => status === 'ALL' || row.status === status),
    [rows, query, level, status],
  );
  const stats = useMemo(() => summarize(rows), [rows]);

  const columns = useMemo<ColDef<AuditRow>[]>(
    () => [
      {
        field: 'createdAt',
        headerName: 'Date',
        width: 150,
        valueFormatter: (p) => (p.value ? formatDateTime(p.value) : ''),
      },
      {
        field: 'payeeName',
        headerName: 'Payee',
        flex: 1.2,
        minWidth: 140,
        cellClass: 'font-medium',
      },
      {
        field: 'note',
        headerName: 'Note',
        flex: 1.4,
        minWidth: 160,
        cellClass: 'text-[var(--gray-500)]',
      },
      {
        field: 'amount',
        headerName: 'Amount',
        width: 120,
        type: 'rightAligned',
        cellClass: 'tabular-nums font-medium',
      },
      { field: 'level', headerName: 'Risk', width: 120, cellRenderer: RiskCell },
      { field: 'status', headerName: 'Status', width: 120, cellRenderer: StatusCell },
      {
        field: 'id',
        headerName: 'Payment ID',
        width: 160,
        valueFormatter: (p) => (p.value ? shortId(p.value) : ''),
        cellClass: 'mono text-[var(--gray-500)]',
      },
    ],
    [],
  );

  async function save(path: string, filename: string) {
    setError('');
    try {
      await downloadText(path, filename);
      setNotice(`Saved ${filename}`);
    } catch (cause) {
      setNotice('');
      setError(cause instanceof Error ? cause.message : 'Download failed. Try again.');
    }
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Lure Log</h1>
          <p className="text-[13px] text-[var(--gray-500)]">
            Every payment AEGIS checked, with the reasons behind each decision.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => void save('/api/audit/export.csv', 'aegis-lure-log.csv')}
        >
          <Icon name="download" />
          Download CSV
        </button>
      </div>

      <dl className="flex flex-wrap gap-x-8 gap-y-2 text-[13px]">
        <div>
          <dt className="text-[var(--gray-500)]">Payments</dt>
          <dd className="font-semibold tabular-nums">{stats.total}</dd>
        </div>
        <div>
          <dt className="text-[var(--gray-500)]">Captured</dt>
          <dd className="font-semibold tabular-nums">{usd(stats.sentCents)}</dd>
        </div>
        <div>
          <dt className="text-[var(--gray-500)]">Held</dt>
          <dd className="font-semibold tabular-nums">{stats.held}</dd>
        </div>
        <div>
          <dt className="text-[var(--gray-500)]">Voided</dt>
          <dd className="font-semibold tabular-nums">{usd(stats.protectedCents)}</dd>
        </div>
      </dl>

      {error ? (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-md border border-[#f4c7c2] bg-[var(--bad-bg)] px-3 py-2 text-[13px] text-[var(--bad)]"
        >
          <Icon name="alert" />
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="text-[13px] text-[var(--gray-500)]">
          {notice}
        </p>
      ) : null}

      <div className="panel overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--gray-200)] px-4 py-3">
          <div className="relative">
            <Icon
              name="search"
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--gray-500)]"
            />
            <input
              id="audit-query"
              aria-label="Find a name or a note"
              placeholder="Filter by payee, note, or ID"
              className="input w-64 pl-8"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <label
            className="flex items-center gap-2 text-[13px] text-[var(--gray-600)]"
            htmlFor="audit-level"
          >
            Risk
            <select
              id="audit-level"
              className="input"
              value={level}
              onChange={(event) => setLevel(event.target.value)}
            >
              <option value="ALL">All</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </label>
          <div
            role="group"
            aria-label="Status"
            className="flex rounded-md border border-[var(--gray-200)] p-0.5"
          >
            {STATUSES.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={status === value}
                onClick={() => setStatus(value)}
                className={`h-7 rounded px-2.5 text-[13px] font-medium ${
                  status === value
                    ? 'bg-[var(--gray-100)] text-[var(--gray-900)]'
                    : 'text-[var(--gray-500)] hover:text-[var(--gray-900)]'
                }`}
              >
                {value === 'ALL' ? 'All' : value[0].toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>
          <span className="ml-auto text-xs text-[var(--gray-500)]">
            {loading ? 'Loading…' : `${visible.length} of ${rows.length}`}
          </span>
        </div>
        <div className="h-[520px] w-full" data-testid="lure-log-grid">
          <AgGridReact<AuditRow>
            theme={theme}
            rowData={visible}
            columnDefs={columns}
            getRowId={(p) => p.data.id}
            onRowClicked={(event) => setSelected(event.data ?? null)}
            pagination
            paginationPageSize={20}
            paginationPageSizeSelector={false}
            loading={loading}
            overlayNoRowsTemplate="No payments match these filters."
          />
        </div>
      </div>

      {selected ? (
        <PaymentDrawer
          payment={selected}
          onClose={() => setSelected(null)}
          actions={
            selected.level === 'HIGH' || selected.status === 'voided' ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  void save(
                    `/api/payments/${selected.id}/report`,
                    `aegis-report-${selected.id}.txt`,
                  )
                }
              >
                <Icon name="download" />
                Download report
              </button>
            ) : null
          }
        />
      ) : null}
    </section>
  );
}
