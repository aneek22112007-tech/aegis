import './trust.css';
import { ORDER_STEPS } from './trust';

/** The Orders v2 path: create, authorize, then capture or void. */
function OrderFlow() {
  return (
    <ol className="trust-flow">
      {ORDER_STEPS.map((step, i) => (
        <li key={step.id} className="trust-step" data-step={step.id}>
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
  );
}

export function Trust() {
  return (
    <div className="trust-grid">
      <div className="trust-panel">
        <h3 className="trust-title">Money waits on a hold, not in our hands</h3>
        <p className="trust-copy">
          AEGIS uses PayPal Orders v2 with intent AUTHORIZE. Funds are held, checked, and then either
          captured or voided. A stopped payment never needs a refund.
        </p>
        <OrderFlow />
      </div>
    </div>
  );
}
