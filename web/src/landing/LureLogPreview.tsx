import { useMemo } from 'react';
import { scorePlayground } from './RiskPlayground';

const ROWS = [
  {
    time: '09:12',
    payee: 'CVS Pharmacy',
    amount: 48,
    note: 'Prescription refill',
    status: 'trusted' as const,
  },
  {
    time: '11:40',
    payee: 'City Utilities',
    amount: 91,
    note: 'Monthly bill',
    status: 'trusted' as const,
  },
  {
    time: '14:05',
    payee: 'Helen Brooks',
    amount: 650,
    note: 'Birthday gift',
    status: 'unknown' as const,
  },
  {
    time: '16:58',
    payee: 'Officer James',
    amount: 1900,
    note: 'URGENT keep this secret, your grandson needs bail',
    status: 'unknown' as const,
  },
];

const COLOR = { LOW: '#34f5b0', MEDIUM: '#ffc65c', HIGH: '#ff4d6a' } as const;
const ACTION = { capture: 'CAPTURED', hold: 'HELD', void: 'VOIDED' } as const;

/** Preview of the Lure Log; every row is scored live by the real engine. */
export function LureLogPreview() {
  const rows = useMemo(() => {
    const noon = new Date();
    noon.setHours(12, 0, 0, 0);
    return ROWS.map((row) => ({ ...row, result: scorePlayground({ ...row, now: noon }) }));
  }, []);
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#080c15]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-white/15" />
          <span className="h-3 w-3 rounded-full bg-white/15" />
          <span className="h-3 w-3 rounded-full bg-white/15" />
        </div>
        <p className="font-mono text-xs text-white/40">lure-log · AG Grid</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-white/40">
            <tr>
              <th className="px-5 py-3 font-medium">Time</th>
              <th className="px-5 py-3 font-medium">Payee</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Score</th>
              <th className="px-5 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.payee}
                className="border-t border-white/5 text-white/80 transition hover:bg-white/[0.03]"
              >
                <td className="px-5 py-3 font-mono text-white/50">{row.time}</td>
                <td className="px-5 py-3">{row.payee}</td>
                <td className="px-5 py-3 font-mono">${row.amount.toLocaleString('en-US')}.00</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${row.result.score}%`,
                          background: COLOR[row.result.level],
                        }}
                      />
                    </span>
                    <span className="font-mono text-xs">{row.result.score}</span>
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span
                    className="rounded-full px-2.5 py-1 font-mono text-xs"
                    style={{
                      color: COLOR[row.result.level],
                      background: `${COLOR[row.result.level]}1a`,
                    }}
                  >
                    {ACTION[row.result.decision]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-white/10 px-5 py-3 text-xs text-white/40">
        Every voided payment exports as an FTC-style draft report with its full timeline and PayPal
        IDs.
      </p>
    </div>
  );
}
