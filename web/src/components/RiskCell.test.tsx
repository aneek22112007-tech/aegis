import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RiskCell, StatusCell } from './RiskCell';

describe('RiskCell', () => {
  it('shows the score with a high-risk chip', () => {
    render(
      <RiskCell
        {...({ value: 'HIGH', data: { score: 100 } } as unknown as Parameters<typeof RiskCell>[0])}
      />,
    );
    const chip = screen.getByText('100 High');
    expect(chip.getAttribute('data-level')).toBe('HIGH');
    expect(chip.className).toContain('chip-bad');
  });

  it('labels a voided status', () => {
    render(<StatusCell {...({ value: 'voided' } as Parameters<typeof StatusCell>[0])} />);
    expect(screen.getByText('Voided').className).toContain('chip-bad');
  });
});
