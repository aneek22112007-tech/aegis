import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadOverrides } from '../rules/overrides';
import { SetupPage } from './SetupPage';

const RAW =
  "Never send more than $500 to anyone I haven't paid before. Always allow my pharmacy and my utility company. If someone says it's urgent and secret, block it and call my daughter.";

function mockApi() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          mandate: { id: 'm1', version: 1, rawText: RAW, summary: 'Saved.', source: 'seed' },
        }),
    })),
  );
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/setup']}>
      <SetupPage />
    </MemoryRouter>,
  );
}

describe('SetupPage', () => {
  beforeEach(() => {
    localStorage.clear();
    mockApi();
  });

  it('shows what AEGIS understood as rule cards', async () => {
    renderPage();
    await screen.findByDisplayValue(/\$500/);
    expect(
      screen.getByText(/Payments over \$500 to someone you have not paid before/),
    ).toBeTruthy();
    expect(screen.getByText('pharmacy')).toBeTruthy();
    expect(screen.getByText('utility company')).toBeTruthy();
    expect(screen.getByText('All changes saved')).toBeTruthy();
  });

  it('inserts an example sentence and marks the page unsaved', async () => {
    renderPage();
    const field = (await screen.findByLabelText(
      'What should always be true?',
    )) as HTMLTextAreaElement;
    fireEvent.click(screen.getByRole('button', { name: /Never send more than \$1,000/ }));
    expect(field.value).toMatch(/\$1,000 in one payment/);
    expect(screen.getByText('Unsaved changes')).toBeTruthy();
  });

  it('toggles, edits and saves rules to demo storage with a toast', async () => {
    renderPage();
    await screen.findByDisplayValue(/\$500/);
    fireEvent.click(screen.getByRole('switch', { name: 'Quiet hours: on' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Limit for someone new' }), {
      target: { value: '300' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Stop always allowing utility company' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save my rules' }));
    const toast = await screen.findByRole('status');
    expect(within(toast).getByText('Rules saved')).toBeTruthy();
    const saved = loadOverrides();
    expect(saved.off).toContain('quiet');
    expect(saved.newPayeeLimit).toBe(300);
    expect(saved.removedAllow).toContain('utility company');
    expect(saved.editedAt).toBeTruthy();
  });

  it('tests a payment against the rules', async () => {
    renderPage();
    await screen.findByDisplayValue(/\$500/);
    expect(screen.getByText('Would be stopped')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'CVS Pharmacy' }));
    expect(screen.getByText('Would be sent')).toBeTruthy();
  });
});
