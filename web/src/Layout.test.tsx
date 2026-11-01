import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Layout } from './Layout';

describe('Layout', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => undefined)),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('turns on high contrast', () => {
    render(
      <MemoryRouter>
        <Layout>
          <p>Home</p>
        </Layout>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /high contrast/i }));
    expect(document.documentElement.classList.contains('contrast')).toBe(true);
    expect(screen.getByRole('link', { name: 'Skip to content' })).toBeTruthy();
  });

  it('says the payment server is not running when health fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('missing', { status: 404 })),
    );
    render(
      <MemoryRouter>
        <Layout>
          <p>Home</p>
        </Layout>
      </MemoryRouter>,
    );
    expect((await screen.findByRole('status')).textContent).toMatch(
      /payment server is not running/i,
    );
  });
});
