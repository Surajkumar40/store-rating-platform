import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import useTheme from '../hooks/useTheme.js';
import { Avatar, Badge, Icon } from './ui.jsx';

const NAV = {
  ADMIN: [['/admin', 'Dashboard', 'dashboard', true], ['/admin/users', 'Users', 'users'], ['/admin/stores', 'Stores', 'store'], ['/admin/users/new', 'Add user', 'plus'], ['/admin/stores/new', 'Add store', 'plus']],
  USER: [['/stores', 'Browse stores', 'store']],
  OWNER: [['/owner', 'My store', 'store']],
};

export function Logo({ className = '' }) {
  return (
    <span className={`flex items-center gap-2.5 font-display text-lg font-bold ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-on-brand"><Icon name="store" className="h-[18px] w-[18px]" /></span>
      Storefront
    </span>
  );
}

export function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme();
  return (
    <button type="button" onClick={toggle} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} className={`grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-muted hover:text-ink ${className}`}>
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="h-[18px] w-[18px]" />
    </button>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const link = ({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-brand-soft text-brand' : 'text-muted hover:bg-bg hover:text-ink'}`;

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-4">
      <Logo className="px-2 pt-1" />
      <nav aria-label="Main" className="flex flex-col gap-1">
        {NAV[user.role].map(([to, label, icon, end]) => (
          <NavLink key={to} to={to} end={end} className={link}><Icon name={icon} className="h-[18px] w-[18px]" />{label}</NavLink>
        ))}
      </nav>
      <div className="mt-auto space-y-3">
        <NavLink to="/password" className={link}><Icon name="key" className="h-[18px] w-[18px]" />Change password</NavLink>
        <div className="flex items-center gap-3 rounded-xl border border-line bg-bg/60 p-3">
          <Avatar name={user.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold" title={user.name}>{user.name}</p>
            <div className="mt-0.5"><Badge role={user.role} /></div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { logout(); navigate('/login'); }} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-muted hover:text-ink">
            <Icon name="logout" className="h-4 w-4" />Log out
          </button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-brand focus:px-3 focus:py-2 focus:text-on-brand">Skip to content</a>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <button onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} className="grid h-9 w-9 place-items-center rounded-lg border border-line"><Icon name="menu" /></button>
      </header>

      {open && <div className="fixed inset-0 z-40 bg-ink/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-line bg-surface transition-transform lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-auto lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-muted lg:hidden"><Icon name="x" className="h-4 w-4" /></button>
        {sidebar}
      </aside>

      <main id="content" className="min-w-0 px-4 py-6 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-5xl"><Outlet /></div>
      </main>
    </div>
  );
}
