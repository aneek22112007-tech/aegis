import './trust.css';
import { useState } from 'react';
import { ORDER_STEPS } from './trust';

type Outcome = 'capture' | 'void';

/** The Orders v2 path: create, authorize, then capture or void. */
function OrderFlow() {
  const [outcome, setOutcome] = useState<Outcome>('void');
  const skipped: Outcome = outcome === 'capture' ? 'void' : 'capture';
  return (
    <>
      <div className="trust-toggle" role="group" aria-label="Show the path for">
        <button
          type="button"
          aria-pressed={outcome === 'capture'}
          onClick={() => setOutcome('capture')}
        >
          CVS Pharmacy, $48
        </button>
        <button type="button" aria-pressed={outcome === 'void'} onClick={() => setOutcome('void')}>
          “Officer James”, $1,900
        </button>
      </div>
      <ol className="trust-flow">
        {ORDER_STEPS.map((step, i) => (
          <li
            key={step.id}
            className="trust-step"
            data-step={step.id}
            data-skipped={step.id === skipped || undefined}
          >
            <span className="trust-index">{i + 1}</span>
            <div className="min-w-0">
              <p className="trust-label">{step.label}</p>
              <code className="trust-code">
                <span className="trust-method">{step.method}</span> {step.path}
              </code>
              <p className="trust-when">{step.when}</p>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

export function Trust() {
  return (
    <div className="trust-grid">
      <div className="trust-panel">
        <h3 className="trust-title">Money waits on a hold, not in our hands</h3>
        <p className="trust-copy">
          AEGIS uses PayPal Orders v2 with intent AUTHORIZE. Funds are held, checked, and then
          either captured or voided. A stopped payment never needs a refund.
        </p>
        <OrderFlow />
      </div>
    </div>
  );
}
