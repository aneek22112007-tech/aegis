import type { MandatePolicy } from './schema.js';

function money(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** "21:00" -> "9 PM", "08:30" -> "8:30 AM". */
export function clock(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h < 12 ? 'AM' : 'PM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hour}:${String(m).padStart(2, '0')} ${suffix}` : `${hour} ${suffix}`;
}

export function summarizePolicy(policy: MandatePolicy): string {
  const sentences = [
    `AEGIS will not send more than ${money(policy.maxNewPayee)} to someone you have not paid before.`,
    `No single payment can be more than ${money(policy.maxPerTxn)}, and a day stops at ${money(policy.dailyLimit)}.`,
  ];
  if (policy.alwaysAllow.length > 0) {
    sentences.push(`Always allowed: ${policy.alwaysAllow.join(', ')}.`);
  }
  if (policy.alwaysBlock.length > 0) {
    sentences.push(`Always blocked: ${policy.alwaysBlock.join(', ')}.`);
  }
  if (policy.scamKeywords.length > 0) {
    sentences.push(
      `Words such as ${policy.scamKeywords.slice(0, 4).join(', ')} make AEGIS stop and check.`,
    );
  }
  sentences.push(
    `Quiet hours are ${clock(policy.quietHours.start)} to ${clock(policy.quietHours.end)}.`,
    `If AEGIS is unsure, it asks ${policy.guardian.name} (${policy.guardian.contact}) before any money moves. ${policy.escalation}`,
  );
  return sentences.join(' ');
}
