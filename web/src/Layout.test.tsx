import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Layout } from './Layout';

describe('Layout', () => {
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
});
