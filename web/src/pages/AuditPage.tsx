import { AllCommunityModule, ModuleRegistry, themeQuartz, type ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useEffect, useMemo, useState } from 'react';
import { downloadText, getAudit, type AuditRow } from '../api';
import { filterAudit } from '../audit/filter';
import { RiskCell } from '../components/RiskCell';

ModuleRegistry.registerModules([AllCommunityModule]);

const theme = themeQuartz.withParams({
  fontFamily: 'Atkinson Hyperlegible, Segoe UI, sans-serif',
  fontSize: 18,
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

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 sm:px-6">
      <h1 className="text-4xl font-bold">Lure Log</h1>
      <p>Every decision AEGIS made, newest first. Choose a row to read why.</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <label className="flex flex-col gap-1 font-bold" htmlFor="audit-query">
          Find a name or a note
          <input
            id="audit-query"
            className="min-h-14 rounded-xl border-4 border-[var(--line)] bg-[var(--card)] px-4 font-normal"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 font-bold" htmlFor="audit-level">
          Risk
          <select
            id="audit-level"
            className="min-h-14 rounded-xl border-4 border-[var(--line)] bg-[var(--card)] px-4 font-normal"
            value={level}
            onChange={(event) => setLevel(event.target.value)}
          >
            <option value="ALL">All</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </label>
        <button
          type="button"
          className="min-h-14 self-end rounded-xl border-4 border-[var(--ink)] px-5 py-3 font-bold"
          onClick={() => void save('/api/audit/export.csv', 'aegis-lure-log.csv')}
        >
          Download CSV
        </button>
      </div>
      {error ? (
        <p role="alert" className="rounded-xl bg-[var(--danger)] px-4 py-3 font-bold text-white">
          {error}
        </p>
      ) : null}
      {notice ? <p role="status">{notice}</p> : null}
      <div className="h-[32rem] w-full" data-testid="lure-log-grid">
        <AgGridReact<AuditRow>
          theme={theme}
          rowData={visible}
          columnDefs={columns}
          getRowId={(params) => params.data.id}
          onRowClicked={(event) => setSelected(event.data ?? null)}
          overlayNoRowsTemplate="No decisions yet."
        />
      </div>
      <section
        aria-live="polite"
        className="rounded-2xl border-4 border-[var(--line)] bg-[var(--card)] p-5"
      >
        {selected ? (
          <>
            <h2 className="text-3xl font-bold">
              {selected.amount} to {selected.payeeName}
            </h2>
            {selected.note ? <p className="mt-2">{selected.note}</p> : null}
            {selected.reasons.length > 0 ? (
              <ul className="mt-3 list-disc pl-6">
                {selected.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-3">No extra reasons were recorded.</p>
            )}
            {selected.level === 'HIGH' || selected.status === 'voided' ? (
              <button
                type="button"
                className="mt-4 min-h-14 rounded-xl bg-[var(--accent)] px-5 py-3 font-bold text-[var(--accent-ink)]"
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
          <p>Choose a row to read the reasons.</p>
        )}
      </section>
    </section>
  );
}
