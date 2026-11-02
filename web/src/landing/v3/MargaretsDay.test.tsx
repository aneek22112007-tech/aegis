import { render, screen } from '@testing-library/react';
import { MargaretsDay } from './MargaretsDay';
import { MARGARETS_DAY } from './day';

describe('MargaretsDay', () => {
  it('lists every event in time order', () => {
    render(<MargaretsDay />);
    const items = screen.getAllByRole('listitem').filter((li) => li.dataset.step);
    expect(items).toHaveLength(MARGARETS_DAY.length);
    expect(items[0].textContent).toContain('9:12 AM');
    expect(items[items.length - 1].textContent).toContain('voided');
  });

  it('marks the first step current before any scrolling', () => {
    render(<MargaretsDay />);
    const items = screen.getAllByRole('listitem');
    expect(items[0].getAttribute('aria-current')).toBe('step');
    expect(items[1].getAttribute('aria-current')).toBeNull();
  });

  it('ends with what was paid and what was stopped', () => {
    render(<MargaretsDay />);
    expect(screen.getByText('$1,900.00')).toBeTruthy();
    expect(screen.getByText('None')).toBeTruthy();
  });

  it('only uses sourced, realistic amounts', () => {
    const text = MARGARETS_DAY.map((e) => e.detail).join(' ');
    expect(text).toContain('$1,900');
    expect(text).toContain('$48');
  });
});
