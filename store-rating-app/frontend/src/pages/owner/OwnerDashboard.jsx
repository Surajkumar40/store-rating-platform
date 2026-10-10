import { useMemo, useState } from 'react';
import { useList } from '../../hooks/useList.js';
import { downloadCsv, fmtDate } from '../../utils/format.js';
import DataTable from '../../components/DataTable.jsx';
import { Alert, Avatar, Button, Card, DistributionBars, Empty, Field, Icon, PageHeader, Pagination, Skeleton, StatCard, Stars } from '../../components/ui.jsx';

const PAGE = 8;

export default function OwnerDashboard() {
  const { data, loading, error } = useList('/owner/dashboard');
  const [sort, setSort] = useState({ key: 'ratedAt', dir: 'desc' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const raters = data?.raters ?? [];
  const counts = useMemo(() => raters.reduce((c, r) => ({ ...c, [r.value]: c[r.value] + 1 }), { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }), [raters]);
  const rows = useMemo(() => {
    const t = search.trim().toLowerCase();
    const dir = sort.dir === 'asc' ? 1 : -1;
    return raters
      .filter((r) => !t || r.name.toLowerCase().includes(t) || r.email.toLowerCase().includes(t))
      .sort((a, b) => {
        const x = a[sort.key], y = b[sort.key];
        return (typeof x === 'string' && sort.key !== 'ratedAt' ? x.localeCompare(y) : x < y ? -1 : x > y ? 1 : 0) * dir;
      });
  }, [raters, sort, search]);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE));
  const current = Math.min(page, totalPages);

  const toggleSort = (key) => { setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })); setPage(1); };
  const columns = [
    { key: 'name', label: 'Name', sortable: true, render: (r) => <span className="flex items-center gap-3 font-medium"><Avatar name={r.name} /><span className="max-w-[14rem] truncate">{r.name}</span></span> },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'value', label: 'Rating', sortable: true, render: (r) => <span className="flex items-center gap-2"><Stars value={r.value} /><span className="tabular font-semibold">{r.value}</span></span> },
    { key: 'ratedAt', label: 'Rated on', sortable: true, render: (r) => fmtDate(r.ratedAt) },
  ];

  if (error) return <Alert>{error}</Alert>;
  if (loading && !data) return <div className="space-y-4"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-40 rounded-xl" /><Skeleton className="h-64 rounded-xl" /></div>;
  if (!data.store) {
    return (<><PageHeader title="My store" /><Empty title="No store is linked to your account yet">Ask an administrator to assign a store to you. Ratings will appear here once it is linked.</Empty></>);
  }

  const latest = raters.length ? raters.reduce((a, b) => (a.ratedAt > b.ratedAt ? a : b)).ratedAt : null;
  return (
    <>
      <PageHeader title={data.store.name} subtitle={data.store.address} />
      <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <StatCard icon="star" label="Average rating" value={data.averageRating == null ? '–' : data.averageRating.toFixed(1)}><Stars value={data.averageRating} size="text-lg" /></StatCard>
          <StatCard icon="users" label="Total ratings" value={data.ratingCount}>{latest ? `Latest on ${fmtDate(latest)}` : 'Waiting for the first rating'}</StatCard>
        </div>
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Rating breakdown</h2>
          {data.ratingCount ? <DistributionBars counts={counts} /> : <p className="py-8 text-center text-sm text-muted">No ratings yet. The breakdown appears after the first one.</p>}
        </Card>
      </div>

      <div className="mb-3 mt-8 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-xl font-semibold">Who rated your store</h2>
        <div className="flex items-end gap-2">
          <Field className="w-56" label="Search raters" type="search" icon="search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <Button variant="ghost" disabled={!raters.length} onClick={() => downloadCsv('ratings.csv', ['Name', 'Email', 'Rating', 'Rated on'], rows.map((r) => [r.name, r.email, r.value, fmtDate(r.ratedAt)]))}>
            <Icon name="download" className="h-4 w-4" />Export CSV
          </Button>
        </div>
      </div>
      <DataTable columns={columns} rows={rows.slice((current - 1) * PAGE, current * PAGE)} sort={sort} onSort={toggleSort} rowKey="userId"
        emptyTitle={search ? 'No raters match your search' : 'No ratings yet'} emptyText={search ? 'Try a different name or email.' : 'Customers who rate your store will be listed here.'} />
      <Pagination page={current} totalPages={totalPages} total={rows.length} pageSize={PAGE} onPage={setPage} />
    </>
  );
}
