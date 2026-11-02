import { fireEvent, render, screen } from '@testing-library/react';
import { Trust } from './Trust';

describe('Trust', () => {
  it('skips capture for the scam payment by default', () => {
    const { container } = render(<Trust />);
    expect(container.querySelector('[data-step="capture"]')?.hasAttribute('data-skipped')).toBe(
      true,
    );
    expect(container.querySelector('[data-step="void"]')?.hasAttribute('data-skipped')).toBe(false);
  });

  it('switches to the captured path for the pharmacy payment', () => {
    const { container } = render(<Trust />);
    fireEvent.click(screen.getByRole('button', { name: /CVS Pharmacy/ }));
    expect(container.querySelector('[data-step="void"]')?.hasAttribute('data-skipped')).toBe(true);
    expect(screen.getByRole('button', { name: /CVS Pharmacy/ }).getAttribute('aria-pressed')).toBe(
      'true',
    );
  });

  it('lists the webhook verification fields', () => {
    render(<Trust />);
    const pre = screen.getByLabelText('Webhook verification request');
    expect(pre.textContent).toContain('transmission_sig: <PAYPAL-TRANSMISSION-SIG>');
    expect(pre.textContent).toContain('verification_status: "SUCCESS"');
  });
});
