import { fireEvent, render, screen } from '@testing-library/react';
import { GuardianSide } from './GuardianSide';
import { scoreScamPayment } from './scamPayment';

describe('GuardianSide', () => {
  it('shows the score the engine gave the scam payment', () => {
    render(<GuardianSide />);
    const { score } = scoreScamPayment();
    expect(screen.getByText(new RegExp(`${score} · High`))).toBeTruthy();
  });

  it('voids the payment when Priya denies it', () => {
    render(<GuardianSide />);
    fireEvent.click(screen.getByRole('button', { name: 'Deny and void' }));
    expect(screen.getByRole('status').textContent).toContain('Voided');
  });

  it('warns after an approval and can reset', () => {
    render(<GuardianSide />);
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    expect(screen.getByRole('status').textContent).toContain('This one was a scam');
    fireEvent.click(screen.getByRole('button', { name: 'Show the alert again' }));
    expect(screen.getByRole('button', { name: 'Approve' })).toBeTruthy();
  });
});
