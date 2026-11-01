import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('introduces AEGIS', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /payments that follow your rules/i })).toBeTruthy();
  });
});
