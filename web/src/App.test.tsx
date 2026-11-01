import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => undefined)),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('introduces AEGIS', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /payments that follow your rules/i })).toBeTruthy();
  });
});
