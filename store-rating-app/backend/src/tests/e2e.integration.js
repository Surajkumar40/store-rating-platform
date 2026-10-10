// Full-flow test against a REAL database. Run with: npm run test:e2e
// Creates its own records (unique suffix) and removes them at the end.
process.env.NODE_ENV = 'test';
const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('../app');
const prisma = require('../config/prisma');

const sfx = Date.now().toString().slice(-8);
const PW = 'Passw0rd!';
const server = http.createServer(app);
let base;
const S = {}; // shared state across ordered tests

async function api(method, path, { body, token } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  });
  return { status: res.status, data: await res.json().catch(() => null) };
}
const person = (tag) => ({ name: `Test ${tag} Person Number ${sfx}`, email: `${tag}.${sfx}@test.com`, address: `${tag} street`, password: PW });

test.before(() => new Promise((r) => server.listen(0, () => { base = `http://localhost:${server.address().port}/api`; r(); })));
test.after(async () => {
  await prisma.store.deleteMany({ where: { email: { endsWith: `${sfx}@test.com` } } });
  await prisma.user.deleteMany({ where: { email: { endsWith: `${sfx}@test.com` } } });
  await prisma.$disconnect();
  server.close();
});

test('admin logs in; wrong password is rejected', async () => {
  assert.equal((await api('POST', '/auth/login', { body: { email: 'admin@example.com', password: 'Wrong@123' } })).status, 401);
  const r = await api('POST', '/auth/login', { body: { email: 'ADMIN@example.com', password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345' } });
  assert.equal(r.status, 200);
  S.admin = r.data.token;
});

test('admin creates owner, store, and a second admin', async () => {
  let r = await api('POST', '/admin/users', { token: S.admin, body: { ...person('owner'), role: 'OWNER' } });
  assert.equal(r.status, 201); S.ownerId = r.data.id;
  assert.equal((await api('POST', '/admin/users', { token: S.admin, body: { ...person('owner'), role: 'OWNER' } })).status, 409, 'duplicate email');
  assert.equal((await api('POST', '/admin/users', { token: S.admin, body: { ...person('admin2'), role: 'ADMIN' } })).status, 201);

  const store = { name: `Store Alpha Supermarket ${sfx}`, email: `store.${sfx}@test.com`, address: 'Market Road 1' };
  r = await api('POST', '/admin/stores', { token: S.admin, body: { ...store, ownerId: S.ownerId } });
  assert.equal(r.status, 201); S.storeId = r.data.id;
  assert.equal((await api('POST', '/admin/stores', { token: S.admin, body: { ...store, email: `s2.${sfx}@test.com`, ownerId: S.ownerId } })).status, 409, 'owner already has a store');
  assert.equal((await api('POST', '/admin/stores', { token: S.admin, body: { ...store, email: `s3.${sfx}@test.com`, ownerId: 1 } })).status, 400, 'ownerId must be an OWNER');
  r = await api('POST', '/admin/stores', { token: S.admin, body: { name: `Store Beta Bakery Shop ${sfx}`, email: `store2.${sfx}@test.com`, address: 'Baker Lane 2' } });
  assert.equal(r.status, 201); S.store2 = r.data.id;
});

test('signup creates only normal users; role cannot be injected', async () => {
  const r = await api('POST', '/auth/signup', { body: { ...person('user1'), role: 'ADMIN' } });
  assert.equal(r.status, 201);
  assert.equal(r.data.user.role, 'USER');
  S.u1 = r.data.token;
  assert.equal((await api('POST', '/auth/signup', { body: person('user1') })).status, 409);
  S.u2 = (await api('POST', '/auth/signup', { body: person('user2') })).data.token;
});

test('users rate stores; modify updates instead of duplicating', async () => {
  let r = await api('PUT', `/stores/${S.storeId}/rating`, { token: S.u1, body: { value: 5 } });
  assert.equal(r.status, 200); assert.equal(r.data.rating, 5);
  r = await api('PUT', `/stores/${S.storeId}/rating`, { token: S.u2, body: { value: 2 } });
  assert.equal(r.data.rating, 3.5); assert.equal(r.data.ratingCount, 2);
  r = await api('PUT', `/stores/${S.storeId}/rating`, { token: S.u2, body: { value: 4 } }); // modify
  assert.equal(r.data.rating, 4.5); assert.equal(r.data.ratingCount, 2);
  assert.equal(await prisma.rating.count({ where: { storeId: S.storeId } }), 2);
  assert.equal((await api('PUT', `/stores/${S.storeId}/rating`, { token: S.u1, body: { value: 6 } })).status, 400);
  assert.equal((await api('PUT', '/stores/99999999/rating', { token: S.u1, body: { value: 3 } })).status, 404);
});

test('DB rejects out-of-range ratings even if the API were bypassed', async () => {
  await assert.rejects(prisma.$executeRawUnsafe(`INSERT INTO ratings (user_id, store_id, value, updated_at) VALUES (1, ${S.storeId}, 9, now())`));
});

test('user store list: search, my rating, overall rating, sorting, rated filter, paging', async () => {
  let r = await api('GET', `/stores?search=${sfx}`, { token: S.u2 });
  assert.equal(r.data.items.length, 2); assert.equal(r.data.total, 2); assert.equal(r.data.totalPages, 1);
  const alpha = r.data.items.find((s) => s.id === S.storeId);
  assert.equal(alpha.myRating, 4); assert.equal(alpha.rating, 4.5);
  assert.equal(r.data.items.find((s) => s.id === S.store2).myRating, null);
  r = await api('GET', `/stores?search=${encodeURIComponent('baker lane')}`, { token: S.u1 }); // by address, case-insensitive
  assert.deepEqual(r.data.items.map((s) => s.id), [S.store2]);
  r = await api('GET', `/stores?search=${sfx}&sortBy=rating&order=desc`, { token: S.u1 });
  assert.deepEqual(r.data.items.map((s) => s.id), [S.storeId, S.store2]);
  r = await api('GET', `/stores?search=${sfx}&sortBy=name&order=desc`, { token: S.u1 });
  assert.deepEqual(r.data.items.map((s) => s.id), [S.store2, S.storeId]);
  r = await api('GET', `/stores?search=${sfx}&rated=rated`, { token: S.u2 });
  assert.deepEqual(r.data.items.map((s) => s.id), [S.storeId]);
  r = await api('GET', `/stores?search=${sfx}&rated=unrated`, { token: S.u2 });
  assert.deepEqual(r.data.items.map((s) => s.id), [S.store2]);
  r = await api('GET', `/stores?search=${sfx}&pageSize=1&page=2&sortBy=name`, { token: S.u1 });
  assert.equal(r.data.items.length, 1); assert.equal(r.data.items[0].id, S.store2);
  assert.equal(r.data.total, 2); assert.equal(r.data.totalPages, 2);
  r = await api('GET', `/stores?search=${sfx}&pageSize=1&page=3`, { token: S.u1 });
  assert.equal(r.data.items.length, 0);
});

test('owner dashboard shows average and raters; non-owners blocked', async () => {
  S.owner = (await api('POST', '/auth/login', { body: { email: `owner.${sfx}@test.com`, password: PW } })).data.token;
  const r = await api('GET', '/owner/dashboard', { token: S.owner });
  assert.equal(r.status, 200);
  assert.equal(r.data.averageRating, 4.5); assert.equal(r.data.raters.length, 2);
  assert.ok(r.data.raters.every((x) => x.name && x.email && x.value));
  assert.equal((await api('GET', '/owner/dashboard', { token: S.u1 })).status, 403);
  assert.equal((await api('GET', '/stores', { token: S.owner })).status, 403);
});

test('admin dashboard analytics, listings, filters, sorting, paging, detail', async () => {
  let r = await api('GET', '/admin/stats', { token: S.admin });
  assert.ok(r.data.totalUsers >= 4 && r.data.totalStores >= 2 && r.data.totalRatings >= 2);
  assert.equal(Object.values(r.data.distribution).reduce((a, b) => a + b, 0), r.data.totalRatings);
  assert.equal(Object.values(r.data.roles).reduce((a, b) => a + b, 0), r.data.totalUsers);
  assert.ok(r.data.averageRating >= 1 && r.data.averageRating <= 5);
  assert.ok(r.data.topStores.length >= 1 && r.data.topStores.every((s) => s.name && s.rating));
  assert.ok(r.data.recentRatings.length >= 2 && r.data.recentRatings[0].user && r.data.recentRatings[0].store);

  r = await api('GET', `/admin/users?email=${sfx}&sortBy=name&order=desc`, { token: S.admin });
  assert.equal(r.data.items.length, 4); assert.equal(r.data.total, 4); // owner, admin2, user1, user2
  assert.ok(r.data.items.every((u) => u.email && u.address && u.role && !('passwordHash' in u)));
  r = await api('GET', `/admin/users?email=${sfx}&pageSize=3&page=2`, { token: S.admin });
  assert.equal(r.data.items.length, 1); assert.equal(r.data.totalPages, 2);
  assert.equal((await api('GET', `/admin/users?email=${sfx}&role=`, { token: S.admin })).status, 200, 'empty role filter means all roles');
  r = await api('GET', `/admin/users?email=${sfx}&role=OWNER`, { token: S.admin });
  assert.equal(r.data.items.length, 1);
  r = await api('GET', `/admin/stores?name=${sfx}&sortBy=rating&order=desc`, { token: S.admin });
  assert.deepEqual(r.data.items.map((s) => [s.id, s.rating]), [[S.storeId, 4.5], [S.store2, null]]);
  r = await api('GET', `/admin/stores?name=${sfx}&sortBy=rating&order=asc`, { token: S.admin });
  assert.equal(r.data.items[0].id, S.storeId); // unrated stores sort last in both directions
  assert.equal(r.data.items[1].id, S.store2);
  r = await api('GET', `/admin/users/${S.ownerId}`, { token: S.admin });
  assert.equal(r.data.rating, 4.5); assert.equal(r.data.role, 'OWNER');
  assert.equal((await api('GET', '/admin/users/99999999', { token: S.admin })).status, 404);
  r = await api('GET', '/admin/owners/available', { token: S.admin });
  assert.ok(!r.data.some((o) => o.id === S.ownerId));
});

test('password change: wrong current rejected, weak new rejected, new works', async () => {
  assert.equal((await api('PATCH', '/auth/password', { token: S.u1, body: { currentPassword: 'Nope@1234', newPassword: 'NewPass1!' } })).status, 400);
  assert.equal((await api('PATCH', '/auth/password', { token: S.u1, body: { currentPassword: PW, newPassword: 'weak' } })).status, 400);
  assert.equal((await api('PATCH', '/auth/password', { token: S.u1, body: { currentPassword: PW, newPassword: 'NewPass1!' } })).status, 200);
  assert.equal((await api('POST', '/auth/login', { body: { email: `user1.${sfx}@test.com`, password: PW } })).status, 401);
  assert.equal((await api('POST', '/auth/login', { body: { email: `user1.${sfx}@test.com`, password: 'NewPass1!' } })).status, 200);
});

test('deleting a user removes their ratings and unlinks owned store', async () => {
  const before = await prisma.rating.count({ where: { storeId: S.storeId } });
  await prisma.user.deleteMany({ where: { email: `user2.${sfx}@test.com` } });
  assert.equal(await prisma.rating.count({ where: { storeId: S.storeId } }), before - 1);
  await prisma.user.delete({ where: { id: S.ownerId } });
  assert.equal((await prisma.store.findUnique({ where: { id: S.storeId } })).ownerId, null);
  assert.equal((await api('GET', '/auth/me', { token: S.owner })).status, 401, 'deleted user token rejected');
});
