import './guardian.css';
import { useState } from 'react';
import { scoreScamPayment } from './scamPayment';

type Choice = 'approved' | 'denied' | null;

/** Priya's phone: the held payment, why it was held, and her two choices. */
function AlertCard() {
  const [choice, setChoice] = useState<Choice>(null);
  const decision = scoreScamPayment();
  const level = decision.level.charAt(0) + decision.level.slice(1).toLowerCase();
  return (
    <div className="g-card">
      <div className="g-card-head">
        <span className="g-badge">Held · needs you</span>
        <span className="g-time">2:47 PM</span>
      </div>
      <p className="g-amount">$1,900.00</p>
      <p className="g-who">
        Margaret → <strong>James W.</strong> (new payee)
      </p>
      <div className="g-score">
        <span>Risk score</span>
        <strong>
          {decision.score} · {level}
        </strong>
      </div>
      <ul className="g-reasons">
        {decision.reasons.slice(0, 3).map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      {choice === null ? (
        <div className="g-actions">
          <button type="button" className="btn" onClick={() => setChoice('approved')}>
            Approve
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setChoice('denied')}>
            Deny and void
          </button>
        </div>
      ) : (
        <div className="g-result" data-choice={choice} role="status">
          <p className="g-result-title">
            {choice === 'denied'
              ? 'Voided. No money left Margaret’s account.'
              : 'Approved. The payment was captured.'}
          </p>
          <p className="g-result-sub">
            {choice === 'denied'
              ? 'Margaret’s screen now says the payment was stopped and her money is safe.'
              : 'In real life, call Margaret first. This one was a scam.'}
          </p>
          <button type="button" className="g-reset" onClick={() => setChoice(null)}>
            Show the alert again
          </button>
        </div>
      )}
    </div>
  );
}

const POINTS: [string, string][] = [
  [
    'She hears in seconds',
    'Held payments are pushed to Priya’s dashboard over a live event stream, no refresh needed.',
  ],
  [
    'She sees why',
    'The amount, the payee, the score and every reason, in the same words Margaret was shown.',
  ],
  [
    'She decides once',
    'Approve captures the authorization. Deny voids it. Either way Margaret’s screen updates.',
  ],
  [
    'Margaret stays in charge',
    'Trusted people and normal amounts never wait for Priya. AEGIS only asks when something looks wrong.',
  ],
];

function Points() {
  return (
    <ol className="g-points">
      {POINTS.map(([title, body], i) => (
        <li key={title}>
          <span className="g-num">{String(i + 1).padStart(2, '0')}</span>
          <div>
            <h3 className="g-point-title">{title}</h3>
            <p className="g-point-body">{body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function GuardianSide() {
  return (
    <div className="g-grid">
      <Points />
      <AlertCard />
    </div>
  );
}
