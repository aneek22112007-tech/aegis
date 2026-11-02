import './guardian.css';
import { scoreScamPayment } from './scamPayment';

/** Priya's phone: the held payment, why it was held, and her two choices. */
function AlertCard() {
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
      <div className="g-actions">
        <button type="button" className="btn">
          Approve
        </button>
        <button type="button" className="btn btn-primary">
          Deny and void
        </button>
      </div>
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
