const prisma = require('../config/prisma');
const { ApiError } = require('../middleware/errorHandler');
const { averagesFor, round, sortRows, contains, paginate } = require('./ratingUtils');

async function listForUser(userId, { search, name, address, sortBy, order, rated, page, pageSize }) {
  const filters = [];
  if (search) filters.push({ OR: [{ name: contains(search) }, { address: contains(search) }] });
  if (name) filters.push({ name: contains(name) });
  if (address) filters.push({ address: contains(address) });
  if (rated === 'rated') filters.push({ ratings: { some: { userId } } });
  if (rated === 'unrated') filters.push({ ratings: { none: { userId } } });

  const stores = await prisma.store.findMany({ where: { AND: filters }, select: { id: true, name: true, address: true } });
  const ids = stores.map((s) => s.id);
  const [avgs, mine] = await Promise.all([
    averagesFor(ids),
    prisma.rating.findMany({ where: { userId, storeId: { in: ids } }, select: { storeId: true, value: true } }),
  ]);
  const mineMap = new Map(mine.map((r) => [r.storeId, r.value]));
  const rows = stores.map((s) => ({
    ...s,
    rating: round(avgs.get(s.id)?.avg ?? null),
    ratingCount: avgs.get(s.id)?.count ?? 0,
    myRating: mineMap.get(s.id) ?? null,
  }));
  return paginate(sortRows(rows, sortBy, order), page, pageSize);
}

// One rating per (user, store): upsert makes "submit" and "modify" the same operation.
async function rateStore(userId, storeId, value) {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) throw new ApiError(404, 'Store not found');
  await prisma.rating.upsert({
    where: { userId_storeId: { userId, storeId } },
    create: { userId, storeId, value },
    update: { value },
  });
  const avg = (await averagesFor([storeId])).get(storeId);
  return { storeId, myRating: value, rating: round(avg?.avg ?? null), ratingCount: avg?.count ?? 0 };
}

async function ownerDashboard(ownerId) {
  const store = await prisma.store.findUnique({ where: { ownerId } });
  if (!store) return { store: null, averageRating: null, ratingCount: 0, raters: [] };
  const ratings = await prisma.rating.findMany({
    where: { storeId: store.id },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { updatedAt: 'desc' },
  });
  const avg = ratings.length ? ratings.reduce((s, r) => s + r.value, 0) / ratings.length : null;
  return {
    store: { id: store.id, name: store.name, address: store.address },
    averageRating: round(avg),
    ratingCount: ratings.length,
    raters: ratings.map((r) => ({ userId: r.user.id, name: r.user.name, email: r.user.email, value: r.value, ratedAt: r.updatedAt })),
  };
}

module.exports = { listForUser, rateStore, ownerDashboard };
