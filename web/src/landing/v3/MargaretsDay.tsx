import './v3.css';
import { MARGARETS_DAY } from './day';

/** Scroll timeline of one day in Margaret's life, from a normal payment to a voided scam. */
export function MargaretsDay() {
  return (
    <ol className="day-list">
      {MARGARETS_DAY.map((event) => (
        <li key={event.id} className="day-item" data-tone={event.tone}>
          <time className="day-time">{event.time}</time>
          <div>
            <h3 className="day-title">{event.title}</h3>
            <p className="day-detail">{event.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
