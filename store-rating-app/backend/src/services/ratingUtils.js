const prisma = require('../config/prisma');

// Returns Map(storeId -> { avg, count }) computed in the database.
async function averagesFor(storeIds) {
  const rows = await prisma.rating.groupBy({
    by: ['storeId'],
    where: storeIds ? { storeId: { in: storeIds } } : undefined,
    _avg: { value: true },
    _count: { value: true },
  });
  return new Map(rows.map((r) => [r.storeId, { avg: r._avg.value, count: r._count.value }]));
}

const round = (n) => (n == null ? null : Math.round(n * 10) / 10);

// Sorts rows; empty values (e.g. stores with no rating yet) always go last, in either direction.
function sortRows(rows, sortBy, order) {
  const dir = order === 'desc' ? -1 : 1;
  return rows.sort((a, b) => {
    const x = a[sortBy], y = b[sortBy];
    if (x == null && y == null) return a.id - b.id;
    if (x == null) return 1;
    if (y == null) return -1;
    const c = typeof x === 'string' ? x.localeCompare(y, undefined, { sensitivity: 'base' }) : x - y;
    return c !== 0 ? c * dir : a.id - b.id; // id tie-break keeps pages stable

  });
}

const pageMeta = (total, page, pageSize) => ({ total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
const paginate = (rows, page, pageSize) => ({ items: rows.slice((page - 1) * pageSize, page * pageSize), ...pageMeta(rows.length, page, pageSize) });

const contains = (v) => ({ contains: v, mode: 'insensitive' });

module.exports = { averagesFor, round, sortRows, contains, paginate, pageMeta };
