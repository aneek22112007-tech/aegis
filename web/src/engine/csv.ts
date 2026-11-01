export type CsvRow = {
  createdAt: Date;
  payeeName: string;
  amount: string;
  score: number | null;
  level: string | null;
  decision: string | null;
  status: string;
  note: string;
};

function cell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function toCsv(rows: CsvRow[]): string {
  const header = ['when', 'payee', 'amount', 'score', 'level', 'decision', 'status', 'note'];
  const lines = rows.map((row) =>
    [
      row.createdAt.toISOString(),
      row.payeeName,
      row.amount,
      row.score === null ? '' : String(row.score),
      row.level ?? '',
      row.decision ?? '',
      row.status,
      row.note,
    ]
      .map(cell)
      .join(','),
  );
  return [header.join(','), ...lines].join('\n') + '\n';
}
