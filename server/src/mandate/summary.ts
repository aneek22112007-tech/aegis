import type { MandatePolicy } from './schema.js';

function money(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
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
    `Quiet hours are ${policy.quietHours.start} to ${policy.quietHours.end}.`,
    `If AEGIS is unsure, it asks ${policy.guardian.name} (${policy.guardian.contact}) before any money moves. ${policy.escalation}`,
  );
  return sentences.join(' ');
}
