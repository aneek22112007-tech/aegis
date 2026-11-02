import './trust.css';
import { useState } from 'react';
import { Icon, type IconName } from '../../ui/Icon';
import { ORDER_STEPS, VERIFY_PATH, WEBHOOK_HEADERS, WEBHOOK_OUTCOMES } from './trust';

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

/** How an incoming PayPal webhook is checked before AEGIS believes it. */
function WebhookCheck() {
  return (
    <div className="trust-panel">
      <h3 className="trust-title">Webhooks are verified before they count</h3>
      <p className="trust-copy">
        PayPal signs every event. AEGIS passes the signature headers back to PayPal and ignores
        anything that does not come back as SUCCESS.
      </p>
      <pre className="trust-pre" aria-label="Webhook verification request">
        <span className="trust-method">POST</span> {VERIFY_PATH}
        {'\n'}
        {WEBHOOK_HEADERS.map(
          (h) => `\n  ${h.toLowerCase().replace('paypal-', '').replace(/-/g, '_')}: <${h}>`,
        ).join('')}
        {'\n  webhook_id: <configured id>\n  webhook_event: <raw body>\n\n'}
        <span className="trust-ok">→ verification_status: "SUCCESS"</span>
      </pre>
      <dl className="trust-outcomes">
        {WEBHOOK_OUTCOMES.map(([when, result]) => (
          <div key={when}>
            <dt>{when}</dt>
            <dd>{result}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const FACTS: [IconName, string, string][] = [
  ['lock', 'No card data', 'Cards stay with PayPal. AEGIS never sees or stores a card number.'],
  [
    'file',
    'Every decision on file',
    'Scores are saved with their reasons and the rules that produced them.',
  ],
  [
    'eye',
    'Open source',
    'The rule engine and server are public, so anyone can check how it decides.',
  ],
];

function Facts() {
  return (
    <ul className="trust-facts">
      {FACTS.map(([icon, title, body]) => (
        <li key={title}>
          <Icon name={icon} className="text-[var(--brand)]" />
          <div>
            <p className="trust-label">{title}</p>
            <p className="trust-when">{body}</p>
          </div>
        </li>
      ))}
    </ul>
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
      <WebhookCheck />
      <Facts />
    </div>
  );
}
