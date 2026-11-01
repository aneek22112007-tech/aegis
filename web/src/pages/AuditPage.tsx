import {
  ClientSideRowModelModule,
  ModuleRegistry,
  RowStyleModule,
  themeQuartz,
  type ColDef,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useEffect, useMemo, useState } from 'react';
import { downloadText, getAudit, type AuditRow } from '../api';
import { filterAudit } from '../audit/filter';
import { RiskCell } from '../components/RiskCell';
import { KpiCard } from '../dashboard/KpiCard';
import { RiskChart } from '../dashboard/RiskChart';
import { riskSeries, summarize, usd } from '../dashboard/stats';

// Register only what the Lure Log uses instead of AllCommunityModule (smaller chunk).
ModuleRegistry.registerModules([ClientSideRowModelModule, RowStyleModule]);

const theme = themeQuartz.withParams({
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  fontSize: 15,
  backgroundColor: 'var(--d-panel)',
  foregroundColor: 'var(--d-ink)',
  borderColor: 'var(--d-line)',
  headerBackgroundColor: 'var(--d-panel-2)',
  oddRowBackgroundColor: 'var(--d-panel)',
  rowHoverColor: 'var(--d-panel-2)',
  accentColor: 'var(--d-brand)',
  wrapperBorderRadius: 16,
});

export function AuditPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('ALL');
  const [selected, setSelected] = useState<AuditRow | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    void getAudit()
      .then((body) => setRows(body.payments))
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : 'Please try that again.');
      });
  }, []);

  const visible = useMemo(() => filterAudit(rows, query, level), [rows, query, level]);
  const stats = useMemo(() => summarize(rows), [rows]);
  const series = useMemo(() => riskSeries(rows), [rows]);

  const columns = useMemo<ColDef<AuditRow>[]>(
    () => [
      {
        field: 'createdAt',
        headerName: 'When',
        flex: 1.2,
        valueFormatter: (params) => (params.value ? new Date(params.value).toLocaleString() : ''),
      },
      { field: 'payeeName', headerName: 'Payee', flex: 1.2 },
      { field: 'amount', headerName: 'Amount', flex: 0.8 },
      { field: 'level', headerName: 'Risk', flex: 0.7, cellRenderer: RiskCell },
      { field: 'decision', headerName: 'Decision', flex: 0.8 },
      { field: 'status', headerName: 'Status', flex: 0.8 },
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
      setError(cause instanceof Error ? cause.message : 'Please try that again.');
    }
  }

  const input =
    'min-h-11 rounded-xl border border-[var(--d-line)] bg-[var(--d-panel)] px-3 font-normal text-[var(--d-ink)]';

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--d-brand)]">Audit</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">Lure Log</h1>
          <p className="mt-2 text-[var(--d-muted)]">
            Every decision AEGIS made, newest first. Choose a row to read why.
          </p>
        </div>
        <button
          type="button"
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-black"
          style={{ background: 'var(--d-brand)' }}
          onClick={() => void save('/api/audit/export.csv', 'aegis-lure-log.csv')}
        >
          Download CSV
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Decisions" value={String(stats.total)} hint="logged with reasons" />
        <KpiCard label="Captured" value={usd(stats.sentCents)} tone="low" />
        <KpiCard label="Held" value={String(stats.held)} hint="awaiting guardian" tone="med" />
        <KpiCard
          label="Voided"
          value={usd(stats.protectedCents)}
          hint={`${stats.byLevel.HIGH} high-risk attempts`}
          tone="high"
        />
      </div>
      <div className="panel p-5">
        <h2 className="mb-3 font-semibold">Risk score timeline</h2>
        <RiskChart data={series} />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label
          className="flex flex-col gap-1 text-sm font-medium text-[var(--d-muted)]"
          htmlFor="audit-query"
        >
          Find a name or a note
          <input
            id="audit-query"
            className={input}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label
          className="flex flex-col gap-1 text-sm font-medium text-[var(--d-muted)]"
          htmlFor="audit-level"
        >
          Risk
          <select
            id="audit-level"
            className={input}
            value={level}
            onChange={(event) => setLevel(event.target.value)}
          >
            <option value="ALL">All</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </label>
      </div>
      {error ? (
        <p
          role="alert"
          className="rounded-xl px-4 py-3 font-semibold text-white"
          style={{ background: 'var(--d-high)' }}
        >
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="text-sm text-[var(--d-muted)]">
          {notice}
        </p>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="h-[420px] w-full" data-testid="lure-log-grid">
          <AgGridReact<AuditRow>
            theme={theme}
            rowData={visible}
            columnDefs={columns}
            getRowId={(params) => params.data.id}
            onRowClicked={(event) => setSelected(event.data ?? null)}
            overlayNoRowsTemplate="No decisions yet."
          />
        </div>
        <section aria-live="polite" className="panel p-6">
          {selected ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--d-muted)]">
                {selected.level ?? '—'} · score {selected.score ?? '—'} · {selected.status}
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                {selected.amount} to {selected.payeeName}
              </h2>
              {selected.note ? (
                <p className="mt-2 text-[var(--d-muted)]">“{selected.note}”</p>
              ) : null}
              {selected.reasons.length > 0 ? (
                <ul className="mt-4 space-y-2 text-sm">
                  {selected.reasons.map((reason) => (
                    <li key={reason} className="rounded-xl bg-[var(--d-panel-2)] px-3 py-2">
                      {reason}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3">No extra reasons were recorded.</p>
              )}
              {selected.level === 'HIGH' || selected.status === 'voided' ? (
                <button
                  type="button"
                  className="mt-5 w-full rounded-xl border px-5 py-3 font-semibold"
                  style={{ borderColor: 'var(--d-high)', color: 'var(--d-high)' }}
                  onClick={() =>
                    void save(
                      `/api/payments/${selected.id}/report`,
                      `aegis-report-${selected.id}.txt`,
                    )
                  }
                >
                  Download report
                </button>
              ) : null}
            </>
          ) : (
            <p className="text-[var(--d-muted)]">Choose a row to read the reasons.</p>
          )}
        </section>
      </div>
    </section>
  );
}
