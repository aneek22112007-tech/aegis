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

export function GuardianSide() {
  return (
    <div className="g-grid">
      <AlertCard />
    </div>
  );
}
