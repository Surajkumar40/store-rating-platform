import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';

/* ---------- Icons (24px, stroke) ---------- */
const ICONS = {
  dashboard: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  store: 'M3 9l1.5-5h15L21 9M3 9v1a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0V9M5 13v8h14v-8M10 21v-5h4v5',
  star: 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z',
  plus: 'M12 5v14M5 12h14',
  key: 'M21 2l-9.6 9.6M15.5 7.5l3 3L22 7l-3-3M7.5 21a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  menu: 'M3 6h18M3 12h18M3 18h18',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  left: 'M15 18l-6-6 6-6',
  right: 'M9 18l6-6-6-6',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  eyeOff: 'M17.9 17.9A10.9 10.9 0 0 1 12 20C5 20 1 12 1 12a18.5 18.5 0 0 1 5.1-5.9M9.9 4.2A9.1 9.1 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2M14.1 14.1a3 3 0 1 1-4.2-4.2M1 1l22 22',
  check: 'M20 6L9 17l-5-5',
  x: 'M18 6L6 18M6 6l12 12',
  alert: 'M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  sortUp: 'M12 19V5M5 12l7-7 7 7',
  sortDown: 'M12 5v14M19 12l-7 7-7-7',
  inbox: 'M22 12h-6l-2 3h-4l-2-3H2M5.5 5h13l3.5 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z',
};

export function Icon({ name, className = 'h-5 w-5', ...rest }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" {...rest}>
      <path d={ICONS[name]} />
    </svg>
  );
}

/* ---------- Buttons ---------- */
const VARIANTS = {
  primary: 'bg-brand text-on-brand hover:bg-brand-strong shadow-sm',
  soft: 'bg-brand-soft text-brand hover:bg-brand-soft/70',
  ghost: 'border border-line bg-surface hover:bg-bg',
  danger: 'bg-danger-soft text-danger hover:opacity-80',
};
export const btnClass = (variant = 'primary', size = 'md') =>
  `inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${
    size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2.5 text-sm'
  } ${VARIANTS[variant]}`;

export function Button({ children, variant, size, loading, className = '', ...props }) {
  return (
    <button disabled={loading || props.disabled} className={`${btnClass(variant, size)} ${className}`} {...props}>
      {loading ? 'Please wait…' : children}
    </button>
  );
}
export function LinkButton({ to, variant, size, className = '', children }) {
  return <Link to={to} className={`${btnClass(variant, size)} ${className}`}>{children}</Link>;
}

/* ---------- Form field ---------- */
export function Field({ label, error, hint, as: Tag = 'input', icon, max, className = '', children, ...props }) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPw = props.type === 'password';
  const len = typeof props.value === 'string' ? props.value.length : 0;
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium">{label}</label>
        {max && <span className={`tabular text-xs ${len > max ? 'text-danger' : 'text-muted'}`}>{len}/{max}</span>}
      </div>
      <div className="relative">
        {icon && <Icon name={icon} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />}
        <Tag
          id={id}
          {...props}
          type={Tag === 'input' ? (isPw && show ? 'text' : props.type) : undefined}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`w-full rounded-lg border bg-surface px-3 py-2.5 text-sm placeholder:text-muted/70 transition-colors focus:ring-2 focus:ring-brand/25 ${icon ? 'pl-9' : ''} ${isPw ? 'pr-10' : ''} ${error ? 'border-danger' : 'border-line hover:border-muted/60 focus:border-brand'}`}
        >
          {children}
        </Tag>
        {isPw && (
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted hover:text-ink">
            <Icon name={show ? 'eyeOff' : 'eye'} className="h-4 w-4" />
          </button>
        )}
      </div>
      {error ? <p id={`${id}-err`} role="alert" className="mt-1.5 text-xs text-danger">{error}</p>
        : hint ? <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

/* Live checklist for the password rules (8-16 chars, uppercase, special). */
export function PasswordRules({ value = '' }) {
  const rules = [
    ['8 to 16 characters', value.length >= 8 && value.length <= 16],
    ['One uppercase letter', /[A-Z]/.test(value)],
    ['One special character', /[^A-Za-z0-9]/.test(value)],
  ];
  return (
    <ul className="mt-2 space-y-1" aria-label="Password requirements">
      {rules.map(([label, ok]) => (
        <li key={label} className={`flex items-center gap-2 text-xs ${ok ? 'text-ok' : 'text-muted'}`}>
          <Icon name={ok ? 'check' : 'x'} className="h-3.5 w-3.5" />
          {label}
        </li>
      ))}
    </ul>
  );
}

/* ---------- Feedback ---------- */
export function Alert({ type = 'error', children }) {
  if (!children) return null;
  const color = type === 'error' ? 'bg-danger-soft text-danger' : 'bg-ok-soft text-ok';
  return (
    <div role={type === 'error' ? 'alert' : 'status'} className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm ${color}`}>
      <Icon name={type === 'error' ? 'alert' : 'check'} className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export const Skeleton = ({ className = 'h-4 w-full' }) => <div className={`animate-pulse rounded bg-line ${className}`} />;

export function Empty({ title, children, action }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-surface px-6 py-14 text-center">
      <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-brand-soft text-brand"><Icon name="inbox" /></div>
      <p className="font-display text-lg font-semibold">{title}</p>
      {children && <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ---------- Layout bits ---------- */
export function PageHeader({ title, subtitle, children }) {
  useEffect(() => { document.title = `${title} · Storefront`; }, [title]);
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export const Card = ({ children, className = '' }) => <section className={`shadow-card rounded-xl border border-line bg-surface p-5 ${className}`}>{children}</section>;

export function StatCard({ icon, label, value, children }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-soft text-brand"><Icon name={icon} className="h-[18px] w-[18px]" /></span>
      </div>
      <p className="tabular mt-2 font-display text-4xl font-bold">{value}</p>
      {children && <div className="mt-1 text-xs text-muted">{children}</div>}
    </Card>
  );
}

const ROLE_STYLE = { ADMIN: 'bg-brand-soft text-brand', OWNER: 'bg-ok-soft text-ok', USER: 'bg-bg text-muted border border-line' };
export const ROLE_LABEL = { ADMIN: 'Admin', USER: 'Normal user', OWNER: 'Store owner' };
export const Badge = ({ role }) => <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_STYLE[role]}`}>{ROLE_LABEL[role]}</span>;

export function Avatar({ name = '?', size = 'h-9 w-9 text-sm', square }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const hue = [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
  return (
    <span className={`grid shrink-0 place-items-center font-semibold ${square ? 'rounded-xl' : 'rounded-full'} ${size}`} style={{ background: `hsl(${hue} 60% 50% / .16)`, color: `hsl(${hue} 60% 50%)` }} aria-hidden="true">
      {initials}
    </span>
  );
}

/* ---------- Ratings ---------- */
// Read-only stars with fractional fill (4.5 shows a half star).
export function Stars({ value, size = 'text-base' }) {
  const pct = Math.max(0, Math.min(100, ((value || 0) / 5) * 100));
  return (
    <span className={`relative inline-block whitespace-nowrap leading-none tracking-tight ${size}`} role="img" aria-label={value ? `${value} out of 5 stars` : 'No ratings yet'}>
      <span className="text-muted/35" aria-hidden="true">★★★★★</span>
      <span className="absolute inset-y-0 left-0 overflow-hidden whitespace-nowrap text-star" style={{ width: `${pct}%` }} aria-hidden="true">★★★★★</span>
    </span>
  );
}
export const fmtRating = (r) => (r == null ? '–' : r.toFixed(1));

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];
export function StarInput({ value, onChange, disabled, label }) {
  const [hover, setHover] = useState(0);
  const [popped, setPopped] = useState(0);
  const shown = hover || value || 0;
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={label} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? 's' : ''}`}
          disabled={disabled}
          onClick={() => { setPopped(n); onChange(n); }}
          onMouseEnter={() => setHover(n)} onFocus={() => setHover(n)} onBlur={() => setHover(0)}
          className="rounded p-0.5 transition-transform hover:scale-110 disabled:opacity-60"
        >
          <Icon name="star" className={`h-7 w-7 ${n <= shown ? 'fill-star text-star' : 'text-muted/45'} ${popped === n && value === n ? 'animate-pop' : ''}`} />
        </button>
      ))}
      <span className="ml-2 min-w-[5.5rem] text-sm text-muted" aria-live="polite">{shown ? LABELS[shown] : 'Not rated'}</span>
    </div>
  );
}

/* ---------- Navigation helpers ---------- */
export function Segmented({ options, value, onChange, label }) {
  return (
    <div role="group" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-xl border border-line bg-surface p-1">
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${value === o.value ? 'bg-brand text-on-brand' : 'text-muted hover:text-ink'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Pagination({ page, totalPages, total, pageSize, onPage }) {
  if (!total) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <nav className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm" aria-label="Pagination">
      <p className="text-muted"><span className="tabular">Showing {from}–{to} of {total}</span></p>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><Icon name="left" className="h-4 w-4" />Prev</Button>
        <span className="tabular px-1 text-muted">Page {page} of {totalPages}</span>
        <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => onPage(page + 1)} aria-label="Next page">Next<Icon name="right" className="h-4 w-4" /></Button>
      </div>
    </nav>
  );
}

/* Horizontal bar chart: counts = { 1: n, ..., 5: n } */
export function DistributionBars({ counts }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const max = Math.max(1, ...Object.values(counts));
  return (
    <ul className="space-y-2" aria-label="Rating distribution">
      {[5, 4, 3, 2, 1].map((n) => (
        <li key={n} className="flex items-center gap-3 text-sm">
          <span className="tabular flex w-8 items-center gap-0.5 text-muted">{n}<Icon name="star" className="h-3.5 w-3.5 fill-star text-star" /></span>
          <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-bg">
            <span className="block h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${(counts[n] / max) * 100}%` }} />
          </span>
          <span className="tabular w-16 text-right text-muted">{counts[n]}{total ? ` · ${Math.round((counts[n] / total) * 100)}%` : ''}</span>
        </li>
      ))}
    </ul>
  );
}
