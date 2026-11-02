import { render, screen } from '@testing-library/react';
import { Bento } from './Bento';

describe('Bento', () => {
  it('renders one flagship cell and six supporting cells', () => {
    const { container } = render(<Bento />);
    expect(container.querySelectorAll('[data-size="hero"]')).toHaveLength(1);
    expect(container.querySelectorAll('.bento-cell')).toHaveLength(7);
  });

  it('shows rules the engine actually compiled', () => {
    render(<Bento />);
    expect(screen.getByText(/not send more than \$500/)).toBeTruthy();
  });

  it('scores the scam payment as high risk', () => {
    render(<Bento />);
    expect(screen.getByText('HIGH')).toBeTruthy();
  });

  it('hides decorative art from screen readers', () => {
    const { container } = render(<Bento />);
    container.querySelectorAll('.bento-art').forEach((art) => {
      expect(art.getAttribute('aria-hidden')).toBe('true');
    });
  });
});
