import { heuristicCompile, parseQuietHours } from './heuristic';

const G = { name: 'Priya', contact: 'daughter' };

describe('parseQuietHours', () => {
  it('reads "after 9pm" as the start', () => {
    expect(parseQuietHours('No payments after 9pm.')).toEqual({ start: '21:00', end: '07:00' });
  });

  it('reads "before 8:30am" as the end', () => {
    expect(parseQuietHours('Nothing before 8:30 am')).toEqual({ start: '22:00', end: '08:30' });
  });

  it('reads a between range', () => {
    expect(parseQuietHours('Hold payments between 10pm and 6am')).toEqual({
      start: '22:00',
      end: '06:00',
    });
  });

  it('keeps safe defaults when no time is given', () => {
    expect(parseQuietHours('Ask Priya before big payments')).toEqual({
      start: '22:00',
      end: '07:00',
    });
  });

  it('handles 12am and 12pm', () => {
    expect(parseQuietHours('after 12am')).toEqual({ start: '00:00', end: '07:00' });
    expect(parseQuietHours('after 12pm').start).toBe('12:00');
  });

  it('is used by heuristicCompile', () => {
    expect(heuristicCompile('No payments after 9pm', G).quietHours.start).toBe('21:00');
  });
});
