import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { RiskPoint } from './stats';

/** Risk score over time with the MEDIUM (35) and HIGH (70) thresholds. */
export function RiskChart({ data }: { data: RiskPoint[] }) {
  if (data.length === 0) {
    return (
      <p className="flex h-56 items-center justify-center text-sm text-[var(--d-muted)]">
        No decisions yet — run the demo to see risk over time.
      </p>
    );
  }
  const chart = (
    <AreaChart
      width={640}
      height={224}
      data={data}
      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
    >
      <defs>
        <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--d-high)" stopOpacity={0.45} />
          <stop offset="60%" stopColor="var(--d-med)" stopOpacity={0.15} />
          <stop offset="100%" stopColor="var(--d-low)" stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <CartesianGrid stroke="var(--d-line)" vertical={false} />
      <XAxis
        dataKey="label"
        stroke="var(--d-muted)"
        tickLine={false}
        axisLine={false}
        fontSize={12}
      />
      <YAxis
        domain={[0, 100]}
        stroke="var(--d-muted)"
        tickLine={false}
        axisLine={false}
        fontSize={12}
      />
      <ReferenceLine y={70} stroke="var(--d-high)" strokeDasharray="4 4" />
      <ReferenceLine y={35} stroke="var(--d-med)" strokeDasharray="4 4" />
      <Tooltip
        contentStyle={{
          background: 'var(--d-panel)',
          border: '1px solid var(--d-line)',
          borderRadius: 12,
          color: 'var(--d-ink)',
        }}
        formatter={(value, _name, item) => [
          `${String(value)} · ${(item.payload as RiskPoint).payee}`,
          'Risk',
        ]}
      />
      <Area
        type="monotone"
        dataKey="score"
        stroke="var(--d-brand)"
        strokeWidth={2.5}
        fill="url(#riskFill)"
        isAnimationActive
      />
    </AreaChart>
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
