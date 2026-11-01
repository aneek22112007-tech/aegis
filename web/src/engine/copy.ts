import { formatUsd } from './money.js';

export type SeniorOutcome = 'sent' | 'waiting' | 'stopped';

export function seniorMessage(input: {
  status: string;
  resolution: string | null;
  payeeName: string;
  amountCents: number;
  guardianName: string;
}): { outcome: SeniorOutcome; message: string } {
  const amount = formatUsd(input.amountCents);
  if (input.status === 'captured') {
    return { outcome: 'sent', message: `Sent. ${amount} is on its way to ${input.payeeName}.` };
  }
  if (input.status === 'held') {
    return {
      outcome: 'waiting',
      message: `Waiting. We asked ${input.guardianName} to take a look before this goes out.`,
    };
  }
  if (input.resolution === 'guardian') {
    return { outcome: 'stopped', message: `Stopped. ${input.guardianName} said not to send this.` };
  }
  if (input.resolution === 'timeout') {
    return {
      outcome: 'stopped',
      message: `Stopped. ${input.guardianName} did not answer in time, so we did not send it.`,
    };
  }
  if (input.status === 'failed') {
    return {
      outcome: 'stopped',
      message: 'Stopped. PayPal did not accept this payment. No money moved.',
    };
  }
  return {
    outcome: 'stopped',
    message: `Stopped. We did not send this. It did not match your rules.`,
  };
}
