import './bento.css';
import {
  AuthorizeArt,
  RulesArt,
  ScoreArt,
  LureLogArt,
  ReadAloudArt,
  QuietHoursArt,
  TrustedArt,
} from './bentoTiles';

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
  return (
    <div className="bento">
      <Cell
        size="hero"
        title="Rules in plain words"
        copy="Priya types what she wants. The engine turns it into limits it can enforce, and reads them back."
      >
        <RulesArt />
      </Cell>
      <Cell
        size="wide"
        title="Authorize, then capture"
        copy="Every payment starts as a PayPal authorization. Risky ones are voided, so there is nothing to refund."
      >
        <AuthorizeArt />
      </Cell>
      <Cell
        size="one"
        title="A score you can read"
        copy="Every decision lists the reasons behind it, in plain English."
      >
        <ScoreArt />
      </Cell>
      <Cell
        size="one"
        title="The Lure Log"
        copy="Each stopped payment is filed under the trick that was used, ready to report to the FTC."
      >
        <LureLogArt />
      </Cell>
      <Cell
        size="one"
        title="Read aloud"
        copy="Large type and a read-aloud button on every screen Margaret sees."
      >
        <ReadAloudArt />
      </Cell>
      <Cell
        size="wide"
        title="Quiet hours"
        copy="Scammers call late. Payments outside the hours Priya sets are held until someone is awake."
      >
        <QuietHoursArt />
      </Cell>
      <Cell
        size="one"
        title="Trusted people"
        copy="Payees on Margaret's list with normal amounts never wait for anyone."
      >
        <TrustedArt />
      </Cell>
    </div>
  );
}

export { Cell as BentoCell };
