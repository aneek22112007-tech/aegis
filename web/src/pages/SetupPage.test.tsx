import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmPage } from './ConfirmPage';
import { SetupPage } from './SetupPage';

describe('SetupPage', () => {
  it('saves the rules and shows them back', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            mandate: {
              id: 'm1',
              version: 1,
              rawText: 'Never send more than $500 to a stranger.',
              summary: 'AEGIS will not send more than $500 to someone you have not paid before.',
              source: 'seed',
            },
          }),
      })),
    );
    render(
      <MemoryRouter initialEntries={['/setup']}>
        <Routes>
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/setup/confirm" element={<ConfirmPage />} />
        </Routes>
      </MemoryRouter>,
    );
    const field = await screen.findByLabelText('What should always be true?');
    expect((field as HTMLTextAreaElement).value).toMatch(/\$500/);
    fireEvent.click(screen.getByRole('button', { name: 'Save my rules' }));
    expect(await screen.findByText(/not send more than \$500/)).toBeTruthy();
  });
});
