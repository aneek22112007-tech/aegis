import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AlertCard } from './AlertCard';

describe('AlertCard', () => {
  it('shows the payee, the note, and both decisions', () => {
    const onApprove = vi.fn();
    const onDeny = vi.fn();
    render(
      <AlertCard
        id="pay_1"
        payeeName="Helen Brooks"
        amount="$650.00"
        note="Birthday gift"
        reasons={['This person is new.']}
        busy={false}
        onApprove={onApprove}
        onDeny={onDeny}
      />,
    );
    expect(screen.getByRole('heading', { name: /\$650\.00 to Helen Brooks/ })).toBeTruthy();
    expect(screen.getByText('Birthday gift')).toBeTruthy();
    expect(screen.getByText('This person is new.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    fireEvent.click(screen.getByRole('button', { name: 'Deny' }));
    expect(onApprove).toHaveBeenCalledOnce();
    expect(onDeny).toHaveBeenCalledOnce();
  });
});
