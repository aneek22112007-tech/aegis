import { fireEvent, render, screen } from '@testing-library/react';
import { MoneyFlow } from './MoneyFlow';

describe('MoneyFlow', () => {
  it('switches scenario from the tabs', () => {
    render(<MoneyFlow />);
    const tab = screen.getByRole('tab', { name: /Officer James/ });
    fireEvent.click(tab);
    expect(tab.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText(/Score 100 · High/)).toBeTruthy();
  });
});
