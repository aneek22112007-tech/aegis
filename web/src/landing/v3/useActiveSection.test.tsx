import { act, render } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { useActiveSection } from './useActiveSection';

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;
let trigger: Callback = () => {};

class FakeObserver {
  constructor(cb: Callback) {
    trigger = cb;
  }
  observe() {}
  disconnect() {}
}

function Probe() {
  const active = useActiveSection(['one', 'two']);
  return (
    <>
      <section id="one" />
      <section id="two" />
      <output>{active ?? 'none'}</output>
    </>
  );
}

afterEach(() => vi.unstubAllGlobals());

describe('useActiveSection', () => {
  it('reports the section that scrolls into view', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    const { container } = render(<Probe />);
    expect(container.querySelector('output')?.textContent).toBe('none');
    act(() => trigger([{ isIntersecting: true, target: document.getElementById('two')! }]));
    expect(container.querySelector('output')?.textContent).toBe('two');
  });

  it('does nothing without IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const { container } = render(<Probe />);
    expect(container.querySelector('output')?.textContent).toBe('none');
  });
});
