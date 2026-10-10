import { Link } from 'react-router-dom';
import { useList } from '../../hooks/useList.js';
import { timeAgo } from '../../utils/format.js';
import { Alert, Avatar, Card, DistributionBars, Empty, Icon, LinkButton, PageHeader, Skeleton, StatCard, Stars, fmtRating } from '../../components/ui.jsx';

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

export default function Dashboard() {
  const { data: s, loading, error } = useList('/admin/stats');

  return (
    <>
      <PageHeader title="Dashboard" subtitle="How the platform is doing right now.">
        <LinkButton to="/admin/stores/new" variant="ghost"><Icon name="plus" className="h-4 w-4" />Add store</LinkButton>
        <LinkButton to="/admin/users/new"><Icon name="plus" className="h-4 w-4" />Add user</LinkButton>
      </PageHeader>
      <Alert>{error}</Alert>
      {loading && !s ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      ) : s && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon="users" label="Total users" value={s.totalUsers}>{plural(s.roles.USER, 'user')} · {plural(s.roles.OWNER, 'owner')} · {plural(s.roles.ADMIN, 'admin')}</StatCard>
            <StatCard icon="store" label="Total stores" value={s.totalStores}>Registered on the platform</StatCard>
            <StatCard icon="star" label="Ratings submitted" value={s.totalRatings}>Across all stores</StatCard>
            <StatCard icon="star" label="Average rating" value={fmtRating(s.averageRating)}><Stars value={s.averageRating} /></StatCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h2 className="mb-4 text-lg font-semibold">Rating distribution</h2>
              {s.totalRatings ? <DistributionBars counts={s.distribution} /> : <p className="py-6 text-center text-sm text-muted">No ratings yet. They will appear here as users rate stores.</p>}
            </Card>
            <Card>
              <h2 className="mb-4 text-lg font-semibold">Top rated stores</h2>
              {s.topStores.length ? (
                <ol className="space-y-3">
                  {s.topStores.map((t, i) => (
                    <li key={t.id} className="flex items-center gap-3">
                      <span className="tabular w-5 text-sm font-semibold text-muted">{i + 1}</span>
                      <Avatar name={t.name} square />
                      <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{t.name}</p><p className="text-xs text-muted">{t.ratingCount} {t.ratingCount === 1 ? 'rating' : 'ratings'}</p></div>
                      <span className="flex items-center gap-2 text-sm font-semibold"><Stars value={t.rating} />{fmtRating(t.rating)}</span>
                    </li>
                  ))}
                </ol>
              ) : <p className="py-6 text-center text-sm text-muted">No rated stores yet.</p>}
            </Card>
          </div>

          <Card>
            <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Recent ratings</h2><Link to="/admin/stores" className="text-sm font-medium text-brand hover:underline">View stores</Link></div>
            {s.recentRatings.length ? (
              <ul className="divide-y divide-line">
                {s.recentRatings.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center gap-3 py-3">
                    <Avatar name={r.user} />
                    <p className="min-w-0 flex-1 text-sm"><span className="font-medium">{r.user}</span> rated <span className="font-medium">{r.store}</span></p>
                    <Stars value={r.value} /><span className="w-24 text-right text-xs text-muted">{timeAgo(r.at)}</span>
                  </li>
                ))}
              </ul>
            ) : <Empty title="No activity yet">Ratings from users will show up here.</Empty>}
          </Card>
        </div>
      )}
    </>
  );
}
