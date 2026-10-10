import { useList, useQueryState } from '../../hooks/useList.js';
import DataTable from '../../components/DataTable.jsx';
import { Alert, Avatar, Button, Field, LinkButton, PageHeader, Pagination, Stars, fmtRating } from '../../components/ui.jsx';

export default function Stores() {
  const q = useQueryState({ name: '', email: '', address: '' }, { key: 'name', dir: 'asc' });
  const { data, loading, error } = useList('/admin/stores', q.params);

  const columns = [
    { key: 'name', label: 'Name', sortable: true, render: (r) => <span className="flex items-center gap-3 font-medium"><Avatar name={r.name} square /><span className="max-w-[16rem] truncate" title={r.name}>{r.name}</span></span> },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true, render: (r) => <span className="line-clamp-1 max-w-[14rem]" title={r.address}>{r.address}</span> },
    { key: 'rating', label: 'Rating', sortable: true, render: (r) => r.rating == null ? <span className="text-muted">No ratings yet</span> : <span className="flex items-center gap-2"><Stars value={r.rating} /><span className="tabular font-semibold">{fmtRating(r.rating)}</span></span> },
  ];

  return (
    <>
      <PageHeader title="Stores" subtitle="Every store, with its current average rating."><LinkButton to="/admin/stores/new">Add store</LinkButton></PageHeader>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Field label="Name" icon="search" value={q.filters.name} onChange={(e) => q.setFilter('name', e.target.value)} />
        <Field label="Email" icon="search" value={q.filters.email} onChange={(e) => q.setFilter('email', e.target.value)} />
        <Field label="Address" icon="search" value={q.filters.address} onChange={(e) => q.setFilter('address', e.target.value)} />
      </div>
      <Alert>{error}</Alert>
      <DataTable columns={columns} rows={data?.items ?? []} sort={q.sort} onSort={q.setSortKey} loading={loading && !data} reloading={loading && !!data}
        emptyTitle={q.active ? 'No stores match these filters' : 'No stores yet'} emptyText={q.active ? 'Try a shorter search or clear the filters.' : 'Add a store so users can start rating it.'}
        emptyAction={q.active ? <Button variant="ghost" onClick={q.reset}>Clear filters</Button> : <LinkButton to="/admin/stores/new">Add store</LinkButton>} />
      {data && <Pagination {...data} onPage={q.setPage} />}
    </>
  );
}
