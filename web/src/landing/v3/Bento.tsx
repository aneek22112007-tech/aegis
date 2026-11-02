import './bento.css';

type Size = 'hero' | 'wide' | 'one';

function Cell({
  size = 'one',
  title,
  copy,
  children,
}: {
  size?: Size;
  title: string;
  copy: string;
  children: React.ReactNode;
}) {
  return (
    <article className="bento-cell" data-size={size}>
      <div>
        <h3>{title}</h3>
        <p className="bento-copy">{copy}</p>
      </div>
      <div className="bento-art" aria-hidden="true">
        {children}
      </div>
    </article>
  );
}

/** Feature grid. Each cell pairs one sentence with a small piece of real AEGIS UI. */
export function Bento() {
  return <div className="bento" />;
}

export { Cell as BentoCell };
