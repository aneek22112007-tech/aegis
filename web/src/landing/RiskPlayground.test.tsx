import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RiskPlayground, scorePlayground } from './RiskPlayground';

const noon = new Date(2026, 5, 2, 12, 0, 0);

describe('RiskPlayground', () => {
  it('scores the three demo payments with the real engine', () => {
    expect(scorePlayground({ payee: 'CVS Pharmacy', amount: 48, note: 'Prescription refill', status: 'trusted', now: noon }).level).toBe('LOW');
    expect(scorePlayground({ payee: 'Helen Brooks', amount: 650, note: 'Birthday gift', status: 'unknown', now: noon }).level).toBe('MEDIUM');
    expect(
      scorePlayground({ payee: 'Officer James', amount: 1900, note: 'URGENT keep this secret, your grandson needs bail', status: 'unknown', now: noon }).level,
    ).toBe('HIGH');
  });

  it('starts on the scam example and shows it would be voided', () => {
    render(<RiskPlayground now={noon} />);
    expect(screen.getByTestId('risk-result').textContent).toContain('Voided before capture');
    expect(screen.getByText(/grandson/, { selector: 'li' })).toBeTruthy();
  });

  it('re-scores live as the visitor picks a preset or edits the note', () => {
    render(<RiskPlayground now={noon} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pharmacy refill' }));
    expect(screen.getByTestId('risk-result').textContent).toContain('Captured silently');
    fireEvent.change(screen.getByLabelText('Payment note'), { target: { value: 'URGENT and secret: buy a gift card' } });
    expect(screen.getByTestId('risk-result').textContent).not.toContain('Captured silently');
  });

  it('asks for input when the amount is empty', () => {
    render(<RiskPlayground now={noon} />);
    fireEvent.change(screen.getByLabelText('Amount (USD)'), { target: { value: '' } });
    expect(screen.getByText(/Enter a payee and an amount/)).toBeTruthy();
  });
});
