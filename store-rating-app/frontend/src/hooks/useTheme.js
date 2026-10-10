import { useState } from 'react';

export default function useTheme() {
  const [theme, setTheme] = useState(document.documentElement.dataset.theme || 'light');
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('sr_theme', next); } catch { /* storage may be blocked */ }
    setTheme(next);
  };
  return { theme, toggle };
}
