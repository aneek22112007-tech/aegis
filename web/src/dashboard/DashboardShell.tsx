import { useEffect, useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { DEMO_MODE } from '../api';
import { ShieldMark } from '../landing/ShieldMark';
import './theme.css';

const LINKS = [
  { to: '/guardian', label: 'Guardian', icon: '◎' },
  { to: '/audit', label: 'Lure Log', icon: '≣' },
  { to: '/setup', label: 'Rules', icon: '✎' },
  { to: '/demo', label: 'Demo', icon: '▶' },
  { to: '/senior', label: 'Margaret’s view', icon: '♡' },
];

function useDarkMode(): [boolean, (value: boolean) => void] {
  const [dark, setDark] = useState(() => {
    const saved =
      typeof localStorage === 'undefined' ? null : localStorage.getItem('aegis-dash-theme');
    return saved ? saved === 'dark' : true;
  });
  useEffect(() => {
    localStorage.setItem('aegis-dash-theme', dark ? 'dark' : 'light');
  }, [dark]);
  return [dark, setDark];
}

/** Premium fintech shell for the guardian-facing pages (dark/light). */
export function DashboardShell({ children }: { children: ReactNode }) {
  const [dark, setDark] = useDarkMode();
  return (
    <div className={`dash ${dark ? 'dark' : ''} min-h-screen`}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="mx-auto flex max-w-[1400px] flex-col md:flex-row">
        <aside className="flex shrink-0 flex-row items-center gap-2 overflow-x-auto border-b border-[var(--d-line)] px-4 py-3 md:sticky md:top-0 md:h-screen md:w-60 md:flex-col md:items-stretch md:border-b-0 md:border-r md:px-4 md:py-6">
          <NavLink
            to="/"
            className="mr-4 flex items-center gap-2 px-2 text-lg font-semibold md:mb-8 md:mr-0"
          >
            <ShieldMark /> AEGIS
          </NavLink>
          <nav aria-label="Dashboard" className="flex flex-row gap-1 md:flex-col">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2 text-sm transition ${
                    isActive
                      ? 'bg-[var(--d-panel-2)] font-semibold text-[var(--d-ink)]'
                      : 'text-[var(--d-muted)] hover:bg-[var(--d-panel-2)] hover:text-[var(--d-ink)]'
                  }`
                }
              >
                <span aria-hidden="true" className="w-4 text-center">
                  {link.icon}
                </span>
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 md:ml-0 md:mt-auto md:flex-col md:items-stretch">
            {DEMO_MODE ? (
              <p className="hidden rounded-xl border border-[var(--d-line)] px-3 py-2 text-xs text-[var(--d-muted)] md:block">
                Demo mode: practice merchant in your browser. No money moves.
              </p>
            ) : null}
            <button
              type="button"
              aria-pressed={dark}
              onClick={() => setDark(!dark)}
              className="rounded-xl border border-[var(--d-line)] px-3 py-2 text-sm text-[var(--d-muted)] hover:text-[var(--d-ink)]"
            >
              {dark ? '☾ Dark' : '☀ Light'}
            </button>
          </div>
        </aside>
        <main id="main" className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
