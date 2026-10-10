import { Link, useParams } from 'react-router-dom';
import { useList } from '../../hooks/useList.js';
import { Alert, Avatar, Badge, Card, Icon, PageHeader, Skeleton, Stars, fmtRating } from '../../components/ui.jsx';

export default function UserDetail() {
  const { id } = useParams();
  const { data: u, loading, error } = useList(`/admin/users/${id}`);
  const rows = u && [
    ['Email', u.email], ['Address', u.address],
    ...(u.role === 'OWNER' ? [
      ['Store', u.store ? u.store.name : 'No store assigned yet'],
      ['Store rating', u.rating == null ? 'No ratings yet' : <span className="flex items-center gap-2"><Stars value={u.rating} size="text-lg" /><b>{fmtRating(u.rating)}</b></span>],
    ] : []),
  ];
  return (
    <>
      <PageHeader title="User details"><Link to="/admin/users" className="flex items-center gap-1 text-sm font-medium text-brand hover:underline"><Icon name="left" className="h-4 w-4" />All users</Link></PageHeader>
      {error && <Alert>This user could not be loaded. They may have been removed.</Alert>}
      {loading && !u && <Skeleton className="h-56 max-w-2xl rounded-xl" />}
      {u && (
        <Card className="max-w-2xl">
          <div className="flex items-center gap-4 border-b border-line pb-5">
            <Avatar name={u.name} size="h-14 w-14 text-lg" />
            <div className="min-w-0"><h2 className="break-words text-xl font-semibold">{u.name}</h2><div className="mt-1"><Badge role={u.role} /></div></div>
          </div>
          <dl className="divide-y divide-line">
            {rows.map(([k, v]) => (
              <div key={k} className="grid gap-1 py-3.5 sm:grid-cols-[9rem_1fr]">
                <dt className="text-sm text-muted">{k}</dt><dd className="break-words text-sm">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      )}
    </>
  );
}
