import { createContext, useCallback, useContext, useState } from 'react';
import { Icon } from './ui.jsx';

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t.slice(-3), { id, message, type }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ success: (m) => push(m, 'success'), error: (m) => push(m, 'error') }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="animate-toast shadow-card pointer-events-auto flex max-w-md items-center gap-3 rounded-xl border border-line bg-surface py-3 pl-4 pr-3 text-sm">
            <Icon name={t.type === 'error' ? 'alert' : 'check'} className={`h-5 w-5 shrink-0 ${t.type === 'error' ? 'text-danger' : 'text-ok'}`} />
            <span>{t.message}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="rounded p-1 text-muted hover:text-ink"><Icon name="x" className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
