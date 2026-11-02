import { render } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { useReveal } from './useReveal';

function Box() {
  const ref = useReveal<HTMLDivElement>();
  return <div ref={ref} data-testid="box" />;
}

afterEach(() => vi.unstubAllGlobals());

describe('useReveal', () => {
  it('shows content at once when reduced motion is preferred', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const { getByTestId } = render(<Box />);
    expect(getByTestId('box').dataset.revealed).toBe('true');
    expect(getByTestId('box').dataset.reveal).toBeUndefined();
  });

  it('waits for the observer when motion is allowed', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    let fire: (entries: { isIntersecting: boolean }[]) => void = () => {};
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: typeof fire) {
          fire = cb;
        }
        observe() {}
        disconnect() {}
      },
    );
    const { getByTestId } = render(<Box />);
    expect(getByTestId('box').dataset.reveal).toBe('pending');
    fire([{ isIntersecting: true }]);
    expect(getByTestId('box').dataset.revealed).toBe('true');
  });
});
