import './v3.css';
import { useEffect, useRef, useState } from 'react';
import { DayPhone } from './DayPhone';
import { MARGARETS_DAY } from './day';

/** Scroll timeline of one day in Margaret's life, from a normal payment to a voided scam. */
export function MargaretsDay() {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof IntersectionObserver === 'undefined') return;
    const items = Array.from(list.querySelectorAll<HTMLElement>('[data-step]'));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="day-grid">
      <div className="day-phone-wrap">
        <DayPhone event={MARGARETS_DAY[active]} />
      </div>
      <ol ref={listRef} className="day-list">
        {MARGARETS_DAY.map((event, i) => (
          <li
            key={event.id}
            className="day-item"
            data-tone={event.tone}
            data-step={i}
            aria-current={i === active ? 'step' : undefined}
          >
            <time className="day-time" dateTime={event.iso}>{event.time}</time>
            <div>
              <h3 className="day-title">{event.title}</h3>
              <p className="day-detail">{event.detail}</p>
              <p className="day-inline-notice" data-tone={event.tone}>
                {event.notice}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
