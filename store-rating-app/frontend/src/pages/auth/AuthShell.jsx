import { Logo, ThemeToggle } from '../../components/Layout.jsx';
import { Stars } from '../../components/ui.jsx';

// Striped shop awning with scalloped edge: the one decorative flourish of the brand.
function Awning() {
  const n = 26;
  return (
    <svg viewBox={`0 0 ${n * 10} 16`} className="block w-full" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <path key={i} d={`M${i * 10} 0h10v8a5 5 0 0 1-10 0z`} fill={i % 2 ? 'var(--on-brand)' : 'color-mix(in srgb, var(--on-brand) 22%, var(--brand))'} />
      ))}
    </svg>
  );
}

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col overflow-hidden bg-brand text-on-brand lg:flex">
        <Awning />
        <div className="flex flex-1 flex-col justify-center px-14 pb-10 pt-4">
          <h2 className="max-w-lg text-4xl font-bold leading-[1.08] xl:text-5xl">Your neighbourhood, rated by the people who shop there.</h2>
          <p className="mt-5 max-w-sm text-lg opacity-80">Find a store, give it one to five stars, and change your mind whenever you like.</p>
          <div className="mt-10 max-w-sm rounded-2xl bg-surface p-5 text-ink shadow-2xl" aria-hidden="true">
            <p className="font-display text-lg font-semibold">Example store</p>
            <p className="text-sm text-muted">12 Market Street</p>
            <div className="mt-3 flex items-center gap-2"><Stars value={4.6} size="text-xl" /><span className="font-semibold">4.6</span><span className="text-sm text-muted">(128 ratings)</span></div>
            <div className="mt-3 space-y-1.5">
              {[88, 24, 9, 4, 3].map((w, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted"><span className="w-2">{5 - i}</span><span className="h-2 flex-1 overflow-hidden rounded-full bg-bg"><span className="block h-full rounded-full bg-brand" style={{ width: `${w}%` }} /></span></div>
              ))}
            </div>
          </div>
        </div>
      </aside>
      <main className="relative flex items-center justify-center px-5 py-12">
        <div className="absolute right-4 top-4"><ThemeToggle /></div>
        <div className="w-full max-w-md">
          <Logo className="mb-8 lg:hidden" />
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mb-7 mt-1.5 text-muted">{subtitle}</p>
          {children}
          <p className="mt-7 text-sm text-muted">{footer}</p>
        </div>
      </main>
    </div>
  );
}
