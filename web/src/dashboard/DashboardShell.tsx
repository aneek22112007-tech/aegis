import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { DEMO_MODE } from '../api';
import { Icon, type IconName } from '../ui/Icon';
import { Logo } from '../ui/Logo';
import { useProductType } from '../ui/useProductType';
import './theme.css';

const NAV: { to: string; label: string; icon: IconName }[] = [
  { to: '/guardian', label: 'Overview', icon: 'home' },
  { to: '/audit', label: 'Lure Log', icon: 'list' },
  { to: '/setup', label: 'Rules', icon: 'sliders' },
];

const MORE: { to: string; label: string; icon: IconName }[] = [
  { to: '/demo', label: 'Sandbox', icon: 'flask' },
  { to: '/senior', label: 'Margaret’s app', icon: 'user' },
];

const TITLES: Record<string, string> = {
  '/guardian': 'Overview',
  '/audit': 'Lure Log',
};

/** Admin shell for the guardian: sidebar, top bar with search, test-mode notice. */
export function DashboardShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const title = TITLES[location.pathname] ?? 'Dashboard';

  useProductType();
  function search(event: FormEvent) {
    event.preventDefault();
    navigate(`/audit?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="ui dash">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {DEMO_MODE ? (
        <div className="flex h-8 items-center justify-center gap-2 bg-[#b54708] px-4 text-xs font-medium text-white">
          Test mode. Payments use a practice merchant in your browser and no money moves.
        </div>
      ) : null}
      <div className="flex">
        <aside
          className={`${menuOpen ? 'flex' : 'hidden'} fixed inset-y-0 left-0 z-30 w-60 flex-col border-r border-[var(--gray-200)] bg-[var(--gray-0)] md:sticky md:top-0 md:flex md:h-screen`}
        >
          <div className="flex h-14 items-center px-4">
            <Link to="/" aria-label="AEGIS home">
              <Logo />
            </Link>
          </div>
          <div className="px-3">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md border border-[var(--gray-200)] px-2 py-1.5 text-left hover:bg-[var(--gray-50)]"
              aria-label="Account: Margaret’s household"
            >
              <span className="grid h-6 w-6 place-items-center rounded bg-[var(--brand-50)] text-xs font-semibold text-[var(--brand)]">
                M
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium">Margaret’s household</span>
                <span className="block text-xs text-[var(--gray-500)]">Guardian access</span>
              </span>
              <Icon name="chevronDown" className="text-[var(--gray-500)]" />
            </button>
          </div>
          <nav aria-label="Dashboard" className="mt-4 flex flex-col gap-0.5 px-3">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon name={item.icon} />
                {item.label}
              </NavLink>
            ))}
            <p className="mb-1 mt-5 px-2 text-xs font-medium text-[var(--gray-500)]">Tools</p>
            {MORE.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon name={item.icon} />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto border-t border-[var(--gray-200)] p-3 text-xs text-[var(--gray-500)]">
            Risk engine v1 · thresholds 35 / 70
          </div>
        </aside>
        {menuOpen ? (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-20 bg-black/20 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
        ) : null}

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-[var(--gray-200)] bg-[var(--gray-0)] px-4 md:px-8">
            <button
              type="button"
              className="btn btn-secondary md:hidden"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <Icon name="list" />
            </button>
            <form
              role="search"
              onSubmit={search}
              className="relative hidden max-w-sm flex-1 sm:block"
            >
              <Icon
                name="search"
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--gray-500)]"
              />
              <input
                aria-label="Search payments"
                placeholder="Search payee, note, or ID"
                className="input w-full"
                style={{ paddingLeft: 32 }}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </form>
            <div className="ml-auto flex items-center gap-1">
              {DEMO_MODE ? <span className="chip chip-warn mr-2">Test mode</span> : null}
              <Link to="/guardian#approvals" className="btn" aria-label="Notifications">
                <Icon name="bell" />
              </Link>
              <span
                className="ml-1 grid h-8 w-8 place-items-center rounded-full bg-[var(--gray-100)] text-xs font-semibold text-[var(--gray-700)]"
                title="Priya, guardian"
                aria-label="Signed in as Priya, guardian"
                role="img"
              >
                PR
              </span>
            </div>
          </header>
          <main id="main" className="mx-auto max-w-[1200px] px-4 py-6 md:px-8">
            <nav
              aria-label="Breadcrumb"
              className="mb-1 flex items-center gap-1 text-xs text-[var(--gray-500)]"
            >
              <span>Margaret’s household</span>
              <Icon name="chevronRight" size={12} />
              <span className="text-[var(--gray-700)]">{title}</span>
            </nav>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
