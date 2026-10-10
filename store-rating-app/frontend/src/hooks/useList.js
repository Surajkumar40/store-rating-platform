import { useEffect, useState } from 'react';
import api from '../api/client.js';
import useDebounce from './useDebounce.js';

const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== '' && v != null));

// Filters + sort + page state for a paginated list. Text filters are debounced.
export function useQueryState(initialFilters, initialSort, pageSize = 10) {
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(1);
  const debounced = useDebounce(filters);
  return {
    filters, sort, page, setPage,
    setFilter: (k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); },
    setSortKey: (key, dir) => { setSort((s) => (dir ? { key, dir } : s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })); setPage(1); },
    reset: () => { setFilters(initialFilters); setPage(1); },
    active: Object.entries(filters).some(([k, v]) => v && v !== initialFilters[k]),
    params: { ...clean(debounced), sortBy: sort.key, order: sort.dir, page, pageSize },
  };
}

// Fetches `url` whenever params change. Keeps the previous data on screen while reloading.
export function useList(url, params = {}) {
  const key = JSON.stringify(params);
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let off = false;
    setState((s) => ({ ...s, loading: true }));
    api.get(url, { params: JSON.parse(key) })
      .then((r) => !off && setState({ data: r.data, loading: false, error: '' }))
      .catch(() => !off && setState((s) => ({ ...s, loading: false, error: 'Could not load data. Check your connection and try again.' })));
    return () => { off = true; };
  }, [url, key, tick]);
  return { ...state, reload: () => setTick((t) => t + 1), mutate: (fn) => setState((s) => ({ ...s, data: fn(s.data) })) };
}
