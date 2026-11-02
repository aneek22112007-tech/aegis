import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { DEMO_MODE } from './api';
import { Avatar } from './senior/ui';
import { Icon, type IconName } from './ui/Icon';
import { Logo } from './ui/Logo';

const TABS: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/senior', label: 'Home', icon: 'home', end: true },
  { to: '/senior/pay', label: 'Send money', icon: 'send' },
  { to: '/setup', label: 'My rules', icon: 'shield' },
];

function useHtmlFlag(className: string, storageKey: string) {
  const [on, setOn] = useState(() => localStorage.getItem(storageKey) === '1');
  useEffect(() => {
    document.documentElement.classList.toggle(className, on);
    localStorage.setItem(storageKey, on ? '1' : '0');
  }, [on, className, storageKey]);
  return [on, setOn] as const;
}

function Toggle({
  label,
  hint,
  on,
  onChange,
}: {
  label: string;
  hint: string;
  on: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onChange}
      className="flex min-h-14 w-full items-center justify-between gap-4 rounded-xl px-3 py-2 text-left hover:bg-[var(--bg)]"
    >
      <span>
        <span className="block text-[0.85rem] font-semibold">{label}</span>
        <span className="block text-[0.7rem] text-[var(--muted)]">{hint}</span>
      </span>
      <span
        aria-hidden="true"
        className={`relative h-7 w-12 flex-none rounded-full transition-colors ${on ? 'bg-[var(--accent)]' : 'bg-[var(--line)]'}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-[var(--card)] transition-[left] ${on ? 'left-6' : 'left-1'}`}
        />
      </span>
    </button>
  );
}

function DisplayMenu() {
  const [open, setOpen] = useState(false);
  const [contrast, setContrast] = useHtmlFlag('contrast', 'aegis-contrast');
  const [large, setLarge] = useHtmlFlag('large', 'aegis-large-text');
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDown = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open]);
  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-label="Display settings"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-xl px-3 text-[0.75rem] font-semibold text-[var(--muted)] no-underline hover:bg-[var(--bg)] hover:text-[var(--ink)] aria-expanded:bg-[var(--bg)] aria-expanded:text-[var(--ink)]"
      >
        <Icon name="sliders" size={18} />
        <span className="hidden sm:inline">Display</span>
      </button>
      {open ? (
        <div
          role="group"
          aria-label="Display settings"
          className="s-card absolute right-0 top-12 z-30 w-[18rem] p-2 shadow-lg"
        >
          <Toggle
            label="Larger text"
            hint="Makes every word bigger"
            on={large}
            onChange={() => setLarge((v) => !v)}
          />
          <Toggle
            label="High contrast"
            hint="White on black, yellow buttons"
            on={contrast}
            onChange={() => setContrast((v) => !v)}
          />
        </div>
      ) : null}
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [offline, setOffline] = useState(false);

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
    <div className="senior-app min-h-screen pb-24 lg:pb-0">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--card)]">
        <div className="mx-auto flex h-[4.2rem] max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link to="/senior" aria-label="AEGIS home" className="no-underline">
            <Logo size={26} withText={false} />
            <span className="sr-only">AEGIS</span>
          </Link>
          <span
            aria-hidden="true"
            className="-ml-2 text-[0.85rem] font-semibold tracking-[-0.01em]"
          >
            AEGIS
          </span>
          <nav aria-label="Sections" className="ml-6 hidden h-full items-stretch gap-6 lg:flex">
            {TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className="s-tab inline-flex items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-1 text-[0.75rem] font-semibold text-[var(--muted)] no-underline hover:text-[var(--ink)]"
              >
                <Icon name={tab.icon} size={18} />
                {tab.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/guardian"
              className="hidden h-11 items-center gap-2 whitespace-nowrap rounded-xl px-3 text-[0.75rem] font-semibold text-[var(--muted)] no-underline hover:bg-[var(--bg)] hover:text-[var(--ink)] xl:inline-flex"
            >
              <Icon name="eye" size={18} />
              Priya&rsquo;s view
            </Link>
            <DisplayMenu />
            <span className="flex items-center gap-2 pl-1" title="Signed in as Margaret">
              <Avatar name="Margaret" size={44} />
              <span className="sr-only">Signed in as Margaret</span>
            </span>
          </div>
        </div>
      </header>
      {DEMO_MODE ? (
        <div className="border-b border-[var(--line)] bg-[var(--bg)]">
          <p className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 px-4 py-2 text-[0.7rem] text-[var(--muted)] sm:px-6">
            <span className="s-chip s-neutral">Test mode</span>
            <span className="sm:hidden">Test money only.</span>
            <span className="hidden sm:inline">
              PayPal sandbox with test money. Nothing real is sent.
            </span>
            <Link
              to="/demo"
              className="hidden font-semibold text-[var(--accent)] no-underline sm:inline"
            >
              Open the demo controls
            </Link>
          </p>
        </div>
      ) : null}
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
      <nav
        aria-label="Tabs"
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-[var(--line)] bg-[var(--card)] pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {[...TABS, { to: '/guardian', label: 'Priya', icon: 'user' as IconName }].map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={'end' in tab ? tab.end : false}
            className="s-btab flex min-h-[4.2rem] flex-col items-center justify-center gap-1 text-[0.62rem] font-semibold text-[var(--muted)] no-underline"
          >
            <Icon name={tab.icon} size={24} />
            {tab.label}
            <span aria-hidden="true" className="s-btab-dot h-1 w-1 rounded-full" />
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
