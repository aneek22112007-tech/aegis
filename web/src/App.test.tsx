import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from './App';

beforeAll(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  );
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('reduce'),
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    onchange: null,
    dispatchEvent: () => false,
  }));
});

describe('App', () => {
  it('opens on the landing page with the static shield under reduced motion', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole('heading', { level: 1, name: /enforced before money moves/i }),
    ).toBeTruthy();
    expect(await screen.findByTestId('static-shield')).toBeTruthy();
    expect(screen.getAllByRole('link', { name: /demo/i }).length).toBeGreaterThan(0);
  });

  it('keeps the senior home at /senior', async () => {
    render(
      <MemoryRouter initialEntries={['/senior']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { level: 1, name: /Margaret/ })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Protected by your rules' })).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Quick actions' })).toBeTruthy();
  });
});
