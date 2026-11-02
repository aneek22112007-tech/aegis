import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { chooseMode } from './mode';
import { Story } from './Story';

function stubMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduce && query.includes('reduce'),
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    onchange: null,
    dispatchEvent: () => false,
  }));
}

afterEach(() => vi.unstubAllGlobals());

describe('story mode', () => {
  it('uses the stacked story for reduced motion at any width', () => {
    expect(chooseMode({ reduce: true, width: 1920 })).toBe('static');
  });

  it('uses the stacked story on phones and tablets', () => {
    expect(chooseMode({ reduce: false, width: 390 })).toBe('static');
    expect(chooseMode({ reduce: false, width: 1023 })).toBe('static');
  });

  it('uses the scroll story on large screens with motion allowed', () => {
    expect(chooseMode({ reduce: false, width: 1440 })).toBe('motion');
  });
});

describe('Story reduced-motion fallback', () => {
  it('renders every chapter as plain sections with no canvas or pinned stage', () => {
    stubMotion(true);
    const { container } = render(
      <MemoryRouter>
        <Story />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('story-static')).toBeTruthy();
    expect(screen.queryByTestId('story-motion')).toBeNull();
    expect(container.querySelector('canvas')).toBeNull();
    expect(container.querySelector('.story-stage')).toBeNull();
    expect(
      screen.getByRole('heading', { level: 1, name: /enforced before money moves/i }),
    ).toBeTruthy();
    expect(screen.getByRole('heading', { name: /Margaret pays someone new/ })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /Scored against her rules/ })).toBeTruthy();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
    expect(screen.getByRole('table', { name: 'Lure Log sample' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Read the FTC report/ })).toBeTruthy();
  });

  it('shows final figures without count-up animation', () => {
    stubMotion(true);
    render(
      <MemoryRouter>
        <Story />
      </MemoryRouter>,
    );
    expect(screen.getByText('$3B')).toBeTruthy();
    expect(screen.getByText('$2,000')).toBeTruthy();
    expect(screen.getByText('$119.5B')).toBeTruthy();
  });

  it('shows the real engine reasons on the scored phone screen', () => {
    stubMotion(true);
    render(
      <MemoryRouter>
        <Story />
      </MemoryRouter>,
    );
    expect(screen.getByRole('img', { name: /Risk score \d+ of 100/ })).toBeTruthy();
  });
});
