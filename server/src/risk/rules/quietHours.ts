import type { RiskInput, RuleHit } from '../types.js';

export function isQuietHour(now: Date, start: string, end: string): boolean {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  if (startMinutes === endMinutes) return false;
  if (startMinutes < endMinutes) {
    return minutes >= startMinutes && minutes < endMinutes;
  }
  return minutes >= startMinutes || minutes < endMinutes;
}

export function quietHoursRule(input: RiskInput): RuleHit {
  const { start, end } = input.policy.quietHours;
  if (!isQuietHour(input.now, start, end)) {
    return { id: 'quiet-hours', points: 0, reasons: [] };
  }
  return {
    id: 'quiet-hours',
    points: 12,
    reasons: [`This is during quiet hours (${start} to ${end}).`],
  };
}
