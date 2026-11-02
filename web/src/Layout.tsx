import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { DEMO_MODE } from './api';
import { Logo } from './ui/Logo';

export function Layout({ children }: { children: ReactNode }) {
  const [contrast, setContrast] = useState(() => localStorage.getItem('aegis-contrast') === '1');
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('contrast', contrast);
    localStorage.setItem('aegis-contrast', contrast ? '1' : '0');
  }, [contrast]);

  useEffect(() => {
    // The browser demo has no payment server to check.
    if (DEMO_MODE) return;
    let cancel = false;
    fetch('/api/health', { headers: { Accept: 'application/json' } })
      .then((response) => {
        if (!cancel && !response.ok) setOffline(true);
      })
      .catch(() => {
        if (!cancel) setOffline(true);
      });
    return () => {
      cancel = true;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="border-b-2 border-[var(--line)] bg-[var(--card)]">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center gap-4 px-4 py-3 sm:px-6">
          <Link to="/senior" aria-label="AEGIS home" className="no-underline">
            <Logo />
          </Link>
          <button
            type="button"
            className="ml-auto min-h-12 rounded-xl border-2 border-[var(--line)] bg-[var(--card)] px-4 py-2 text-[0.8rem] font-bold"
            aria-pressed={contrast}
            onClick={() => setContrast((value) => !value)}
          >
            High contrast
          </button>
        </div>
        <nav
          aria-label="Sections"
          className="mx-auto flex max-w-2xl flex-wrap gap-x-5 gap-y-1 px-4 pb-3 text-[0.8rem] font-bold sm:px-6"
        >
          <Link to="/senior">Home</Link>
          <Link to="/senior/pay">Send money</Link>
          <Link to="/setup">My rules</Link>
          <Link to="/guardian">Guardian</Link>
          <Link to="/demo">Demo</Link>
        </nav>
      </header>
      {offline ? (
        <p role="status" className="border-b-2 border-[var(--warn)] bg-[var(--card)] px-6 py-4">
          This site shows the screens only. The payment server is not running, so money cannot be
          sent from here. On your computer, run npm install and npm run dev, then open{' '}
          <a className="font-bold underline" href="http://localhost:5173/demo">
            http://localhost:5173/demo
          </a>
          .
        </p>
      ) : null}
      <main id="main">{children}</main>
    </div>
  );
}
