import { Link } from 'react-router-dom';
import { useList, useQueryState } from '../../hooks/useList.js';
import DataTable from '../../components/DataTable.jsx';
import { Alert, Avatar, Badge, Button, Field, LinkButton, PageHeader, Pagination, Segmented } from '../../components/ui.jsx';

const ROLE_TABS = [{ value: '', label: 'All' }, { value: 'ADMIN', label: 'Admins' }, { value: 'USER', label: 'Normal users' }, { value: 'OWNER', label: 'Store owners' }];

export default function Users() {
  const q = useQueryState({ name: '', email: '', address: '', role: '' }, { key: 'name', dir: 'asc' });
  const { data, loading, error } = useList('/admin/users', q.params);

  const columns = [
    { key: 'name', label: 'Name', sortable: true, render: (r) => (
      <Link to={`/admin/users/${r.id}`} className="flex items-center gap-3 font-medium hover:text-brand"><Avatar name={r.name} /><span className="max-w-[16rem] truncate" title={r.name}>{r.name}</span></Link>
    ) },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true, render: (r) => <span className="line-clamp-1 max-w-[14rem]" title={r.address}>{r.address}</span> },
    { key: 'role', label: 'Role', sortable: true, render: (r) => <Badge role={r.role} /> },
  ];

  return (
    <>
      <PageHeader title="Users" subtitle="Everyone with an account on the platform."><LinkButton to="/admin/users/new">Add user</LinkButton></PageHeader>
      <div className="mb-4 space-y-3">
        <Segmented label="Filter by role" options={ROLE_TABS} value={q.filters.role} onChange={(v) => q.setFilter('role', v)} />
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Name" icon="search" value={q.filters.name} onChange={(e) => q.setFilter('name', e.target.value)} />
          <Field label="Email" icon="search" value={q.filters.email} onChange={(e) => q.setFilter('email', e.target.value)} />
          <Field label="Address" icon="search" value={q.filters.address} onChange={(e) => q.setFilter('address', e.target.value)} />
        </div>
      </div>
      <Alert>{error}</Alert>
      <DataTable columns={columns} rows={data?.items ?? []} sort={q.sort} onSort={q.setSortKey} loading={loading && !data} reloading={loading && !!data}
        emptyTitle={q.active ? 'No users match these filters' : 'No users yet'} emptyText={q.active ? 'Try a shorter search or clear the filters.' : 'Add the first user to get started.'}
        emptyAction={q.active ? <Button variant="ghost" onClick={q.reset}>Clear filters</Button> : <LinkButton to="/admin/users/new">Add user</LinkButton>} />
      {data && <Pagination {...data} onPage={q.setPage} />}
    </>
  );
}
