import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RiskCell } from './RiskCell';

describe('RiskCell', () => {
  it('marks a high risk in the danger colour', () => {
    render(
      <RiskCell
        {...({
          value: 'HIGH',
        } as Parameters<typeof RiskCell>[0])}
      />,
    );
    expect(screen.getByText('HIGH').getAttribute('data-level')).toBe('HIGH');
  });
});
