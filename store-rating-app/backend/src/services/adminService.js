const prisma = require('../config/prisma');
const { ApiError } = require('../middleware/errorHandler');
const { createUser, publicUser } = require('./authService');
const { averagesFor, round, sortRows, contains, paginate, pageMeta } = require('./ratingUtils');

async function stats() {
  const [users, stores, ratings, avg, roleRows, distRows, recent, topRows] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.rating.count(),
    prisma.rating.aggregate({ _avg: { value: true } }),
    prisma.user.groupBy({ by: ['role'], _count: { role: true } }),
    prisma.rating.groupBy({ by: ['value'], _count: { value: true } }),
    prisma.rating.findMany({
      orderBy: { updatedAt: 'desc' }, take: 6,
      include: { user: { select: { name: true } }, store: { select: { name: true } } },
    }),
    prisma.rating.groupBy({
      by: ['storeId'], _avg: { value: true }, _count: { value: true },
      orderBy: [{ _avg: { value: 'desc' } }, { _count: { value: 'desc' } }], take: 5,
    }),
  ]);
  const names = await prisma.store.findMany({ where: { id: { in: topRows.map((r) => r.storeId) } }, select: { id: true, name: true } });
  const nameOf = new Map(names.map((n) => [n.id, n.name]));
  const roles = { ADMIN: 0, USER: 0, OWNER: 0 };
  roleRows.forEach((r) => { roles[r.role] = r._count.role; });
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  distRows.forEach((r) => { distribution[r.value] = r._count.value; });
  return {
    totalUsers: users, totalStores: stores, totalRatings: ratings,
    averageRating: round(avg._avg.value ?? null),
    roles, distribution,
    topStores: topRows.map((r) => ({ id: r.storeId, name: nameOf.get(r.storeId), rating: round(r._avg.value), ratingCount: r._count.value })),
    recentRatings: recent.map((r) => ({ id: r.id, user: r.user.name, store: r.store.name, value: r.value, at: r.updatedAt })),
  };
}

async function addUser(data) {
  return publicUser(await createUser(data));
}

async function listUsers({ name, email, address, role, sortBy, order, page, pageSize }) {
  const where = {
    ...(name && { name: contains(name) }),
    ...(email && { email: contains(email) }),
    ...(address && { address: contains(address) }),
    ...(role && { role }),
  };
  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: [{ [sortBy]: order }, { id: 'asc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: { id: true, name: true, email: true, address: true, role: true },
    }),
  ]);
  return { items, ...pageMeta(total, page, pageSize) };
}

async function getUser(id) {
  const user = await prisma.user.findUnique({ where: { id }, include: { store: true } });
  if (!user) throw new ApiError(404, 'User not found');
  const result = publicUser(user);
  if (user.role === 'OWNER') {
    const avg = user.store ? (await averagesFor([user.store.id])).get(user.store.id) : null;
    result.store = user.store ? { id: user.store.id, name: user.store.name } : null;
    result.rating = round(avg?.avg ?? null);
  }
  return result;
}

async function addStore({ name, email, address, ownerId }) {
  if (await prisma.store.findUnique({ where: { email } })) {
    throw new ApiError(409, 'Store email is already registered', { email: 'Store email is already registered' });
  }
  if (ownerId) {
    const owner = await prisma.user.findUnique({ where: { id: ownerId }, include: { store: true } });
    if (!owner || owner.role !== 'OWNER') throw new ApiError(400, 'Validation failed', { ownerId: 'Selected user is not a store owner' });
    if (owner.store) throw new ApiError(409, 'This owner already has a store', { ownerId: 'This owner already has a store' });
  }
  return prisma.store.create({ data: { name, email, address, ownerId: ownerId || null } });
}

async function listStores({ name, email, address, sortBy, order, page, pageSize }) {
  const stores = await prisma.store.findMany({
    where: {
      ...(name && { name: contains(name) }),
      ...(email && { email: contains(email) }),
      ...(address && { address: contains(address) }),
    },
    select: { id: true, name: true, email: true, address: true },
  });
  const avgs = await averagesFor(stores.map((s) => s.id));
  const rows = stores.map((s) => ({ ...s, rating: round(avgs.get(s.id)?.avg ?? null) }));
  return paginate(sortRows(rows, sortBy, order), page, pageSize);
}

// Owners who don't have a store yet (for the "Add store" dropdown).
async function availableOwners() {
  return prisma.user.findMany({
    where: { role: 'OWNER', store: null },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  });
}

module.exports = { stats, addUser, listUsers, getUser, addStore, listStores, availableOwners };
