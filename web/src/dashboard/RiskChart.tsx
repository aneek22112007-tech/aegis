import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DayVolume } from './stats';

const COLORS = { captured: '#3a8a5f', held: '#d9a441', voided: '#c8473d' };

function dayLabel(day: string): string {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/** Stacked daily payment volume by outcome. */
export function RiskChart({ data }: { data: DayVolume[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-1 text-center">
        <p className="text-[13px] font-medium">No payments in this period</p>
        <p className="text-xs text-[var(--gray-500)]">
          Payments appear here once Margaret sends one.
        </p>
      </div>
    );
  }
  const chart = (
    <BarChart
      width={640}
      height={224}
      data={data}
      margin={{ top: 8, right: 4, left: -8, bottom: 0 }}
      barCategoryGap="28%"
    >
      <CartesianGrid stroke="var(--gray-100)" vertical={false} />
      <XAxis
        dataKey="day"
        tickFormatter={dayLabel}
        stroke="var(--gray-500)"
        tickLine={false}
        axisLine={{ stroke: 'var(--gray-200)' }}
        fontSize={12}
      />
      <YAxis
        stroke="var(--gray-500)"
        tickLine={false}
        axisLine={false}
        fontSize={12}
        tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
      />
      <Tooltip
        cursor={{ fill: 'var(--gray-50)' }}
        labelFormatter={(label) => dayLabel(String(label))}
        formatter={(value, name) => [`$${Number(value).toLocaleString('en-US')}`, String(name)]}
        contentStyle={{
          background: '#fff',
          border: '1px solid var(--gray-200)',
          borderRadius: 6,
          fontSize: 12,
          boxShadow: 'var(--shadow-md)',
        }}
      />
      <Bar
        dataKey="captured"
        name="Captured"
        stackId="v"
        fill={COLORS.captured}
        isAnimationActive={false}
      />
      <Bar dataKey="held" name="Held" stackId="v" fill={COLORS.held} isAnimationActive={false} />
      <Bar
        dataKey="voided"
        name="Voided"
        stackId="v"
        fill={COLORS.voided}
        radius={[2, 2, 0, 0]}
        isAnimationActive={false}
      />
    </BarChart>
  );
  return (
    <div className="h-56 w-full" data-testid="risk-chart">
      {typeof ResizeObserver === 'undefined' ? (
        chart
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          {chart}
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function ChartLegend() {
  return (
    <div className="flex gap-4 text-xs text-[var(--gray-600)]">
      {(['captured', 'held', 'voided'] as const).map((key) => (
        <span key={key} className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-sm"
            style={{ background: COLORS[key] }}
            aria-hidden="true"
          />
          {key[0].toUpperCase() + key.slice(1)}
        </span>
      ))}
    </div>
  );
}
