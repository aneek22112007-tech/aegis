import type { DayEvent } from './day';

/** Lock-screen style preview of what Margaret sees at the current step. */
export function DayPhone({ event }: { event: DayEvent }) {
  return (
    <div className="day-phone" aria-hidden="true">
      <div className="day-phone-screen">
        <p className="day-phone-clock">{event.time.replace(/ (AM|PM)/, '')}</p>
        <p className="day-phone-date">Tuesday</p>
        <div key={event.id} className="day-notice" data-tone={event.tone}>
          <p className="day-notice-app">AEGIS · now</p>
          <p className="day-notice-text">{event.notice}</p>
        </div>
      </div>
    </div>
  );
}
