export type TimelineInput = {
  status: string;
  level: string | null;
  score: number | null;
  resolution: string | null;
  createdAt: string;
};

export type TimelineStep = {
  key: string;
  label: string;
  detail: string;
  state: 'done' | 'current' | 'failed';
};

/** Build the Authorized → Scored → outcome timeline shown in the payment drawer. */
export function buildTimeline(row: TimelineInput): TimelineStep[] {
  const steps: TimelineStep[] = [
    {
      key: 'created',
      label: 'Payment created',
      detail: 'Margaret started the payment',
      state: 'done',
    },
    {
      key: 'authorized',
      label: 'Authorized',
      detail: 'PayPal order with intent AUTHORIZE. Funds reserved, not moved.',
      state: 'done',
    },
  ];
  if (row.score !== null) {
    steps.push({
      key: 'scored',
      label: `Scored ${row.score} · ${(row.level ?? '').toLowerCase() || 'unrated'}`,
      detail: 'Checked against Margaret’s rules and payment history',
      state: 'done',
    });
  }
  const byGuardian = row.resolution === 'guardian';
  if (row.status === 'held') {
    steps.push({
      key: 'held',
      label: 'Held for guardian',
      detail: 'Waiting for Priya to approve or deny',
      state: 'current',
    });
  } else if (row.status === 'captured') {
    if (byGuardian) {
      steps.push({
        key: 'approved',
        label: 'Approved by Priya',
        detail: 'Guardian decision',
        state: 'done',
      });
    }
    steps.push({
      key: 'captured',
      label: 'Captured',
      detail: 'Funds sent to the payee',
      state: 'done',
    });
  } else if (row.status === 'voided') {
    if (byGuardian) {
      steps.push({
        key: 'denied',
        label: 'Denied by Priya',
        detail: 'Guardian decision',
        state: 'failed',
      });
    }
    steps.push({
      key: 'voided',
      label: 'Authorization voided',
      detail: 'Released before capture. No money moved.',
      state: 'failed',
    });
  } else if (row.status === 'failed') {
    steps.push({
      key: 'failed',
      label: 'Failed',
      detail: 'PayPal did not complete the step',
      state: 'failed',
    });
  }
  return steps;
}
