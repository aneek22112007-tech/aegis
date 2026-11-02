import './guardian.css';

const REASONS = [
  'You have not paid this person before.',
  'That is over your $500 limit for someone new.',
  'The note says “urgent” and “keep it safe”.',
];

/** Priya's phone: the held payment, why it was held, and her two choices. */
function AlertCard() {
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
        <strong>70 · High</strong>
      </div>
      <ul className="g-reasons">
        {REASONS.map((r) => (
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
