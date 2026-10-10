import { useEffect, useState } from 'react';
import api, { parseError } from '../../api/client.js';
import useDebounce from '../../hooks/useDebounce.js';
import { useList } from '../../hooks/useList.js';
import { useToast } from '../../components/Toast.jsx';
import { Alert, Avatar, Button, Empty, Field, PageHeader, Pagination, Segmented, Skeleton, StarInput, Stars, fmtRating } from '../../components/ui.jsx';

const TABS = [{ value: 'all', label: 'All stores' }, { value: 'rated', label: 'Rated by me' }, { value: 'unrated', label: 'Not rated yet' }];
const SORTS = {
  'name-asc': ['name', 'asc', 'Name, A to Z'], 'name-desc': ['name', 'desc', 'Name, Z to A'],
  'rating-desc': ['rating', 'desc', 'Highest rated'], 'rating-asc': ['rating', 'asc', 'Lowest rated'],
  'address-asc': ['address', 'asc', 'Address, A to Z'],
};

function StoreCard({ store, onRate }) {
  const [saving, setSaving] = useState(false);
  const rate = async (value) => { setSaving(true); await onRate(store, value); setSaving(false); };
  return (
    <li className="shadow-card flex flex-col rounded-xl border border-line bg-surface p-5">
      <div className="flex items-start gap-3">
        <Avatar name={store.name} square size="h-11 w-11 text-base" />
        <div className="min-w-0"><h2 className="break-words text-lg font-semibold leading-snug">{store.name}</h2><p className="mt-0.5 break-words text-sm text-muted">{store.address}</p></div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Stars value={store.rating} size="text-xl" />
        {store.rating == null ? <span className="text-sm text-muted">No ratings yet</span> : <><span className="tabular font-semibold">{fmtRating(store.rating)}</span><span className="text-sm text-muted">({store.ratingCount} {store.ratingCount === 1 ? 'rating' : 'ratings'})</span></>}
      </div>
      <div className="mt-4 border-t border-line pt-4">
        <p className="mb-1.5 text-sm font-medium">{store.myRating ? `Your rating: ${store.myRating} out of 5` : 'Your rating'}</p>
        <StarInput value={store.myRating} onChange={rate} disabled={saving} label={`Rate ${store.name}`} />
        <p className="mt-1.5 text-xs text-muted">{store.myRating ? 'Select another star to change it.' : 'Select a star to submit your rating.'}</p>
      </div>
    </li>
  );
}

export default function StoreList() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('name-asc');
  const [rated, setRated] = useState('all');
  const [page, setPage] = useState(1);
  const q = useDebounce(search);
  useEffect(() => setPage(1), [q, sortKey, rated]);
  const [sortBy, order] = SORTS[sortKey];

  const { data, loading, error, mutate } = useList('/stores', { ...(q && { search: q }), sortBy, order, rated, page, pageSize: 8 });

  const onRate = async (store, value) => {
    try {
      const { data: u } = await api.put(`/stores/${store.id}/rating`, { value });
      mutate((d) => ({ ...d, items: d.items.map((s) => (s.id === u.storeId ? { ...s, myRating: u.myRating, rating: u.rating, ratingCount: u.ratingCount } : s)) }));
      toast.success(store.myRating ? `Updated to ${value} ${value === 1 ? 'star' : 'stars'} for ${store.name}` : `Rated ${store.name}: ${value} ${value === 1 ? 'star' : 'stars'}`);
    } catch (err) {
      toast.error(parseError(err).message);
    }
  };

  const filtered = !!q || rated !== 'all';
  return (
    <>
      <PageHeader title="Browse stores" subtitle="Rate any store from 1 to 5 stars. You can change your rating at any time." />
      <div className="mb-5 space-y-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_13rem]">
          <Field label="Search by name or address" type="search" icon="search" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Field label="Sort by" as="select" value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
            {Object.entries(SORTS).map(([k, [, , label]]) => <option key={k} value={k}>{label}</option>)}
          </Field>
        </div>
        <Segmented label="Show" options={TABS} value={rated} onChange={setRated} />
      </div>
      <Alert>{error}</Alert>
      {loading && !data ? (
        <div className="grid gap-4 md:grid-cols-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-60 rounded-xl" />)}</div>
      ) : data && !data.items.length ? (
        <Empty title={filtered ? 'No stores match' : 'No stores yet'} action={filtered && <Button variant="ghost" onClick={() => { setSearch(''); setRated('all'); }}>Clear filters</Button>}>
          {filtered ? 'Try a different name or address, or switch the filter.' : 'An administrator has not added any stores yet.'}
        </Empty>
      ) : data && (
        <>
          <ul className={`grid gap-4 transition-opacity md:grid-cols-2 ${loading ? 'opacity-60' : ''}`}>{data.items.map((s) => <StoreCard key={s.id} store={s} onRate={onRate} />)}</ul>
          <Pagination {...data} onPage={setPage} />
        </>
      )}
    </>
  );
}
