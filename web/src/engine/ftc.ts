import { formatUsd } from './money.js';

export type FtcReportInput = {
  seniorName: string;
  guardianName: string;
  guardianContact: string;
  payeeName: string;
  amountCents: number;
  note: string;
  reasons: string[];
  createdAt: Date;
};

export function buildFtcReport(input: FtcReportInput): string {
  const when = input.createdAt.toISOString();
  const reasons = input.reasons.map((reason) => `- ${reason}`).join('\n');
  return [
    'DRAFT COMPLAINT FOR https://reportfraud.ftc.gov',
    '',
    `This is a draft for ${input.seniorName} to review with ${input.guardianName} (${input.guardianContact}).`,
    'AEGIS did not file it. No money was captured for this payment.',
    'Payments made directly inside the PayPal app are not included, because AEGIS never sees them.',
    '',
    '1. What happened',
    `On ${when}, a payment of ${formatUsd(input.amountCents)} was attempted to "${input.payeeName}".`,
    input.note ? `Note: ${input.note}` : 'No note was included.',
    '',
    '2. Why it was stopped',
    reasons || '- It did not match the payer’s rules.',
    '',
    '3. Money',
    'Status: VOIDED. The authorization was voided before capture.',
    '',
    '4. Who to contact',
    `${input.guardianName} (${input.guardianContact})`,
    '',
    '5. Suggested next steps',
    '- File this draft at https://reportfraud.ftc.gov if it still looks like a scam.',
    '- If anyone is in danger, contact local police.',
    '- Ask PayPal to watch the account for a matching request.',
    '',
  ].join('\n');
}
