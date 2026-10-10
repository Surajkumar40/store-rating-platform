// Runs without a database: Prisma is stubbed so we can test validation, auth and role rules.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://x:x@localhost:5432/x';
process.env.JWT_SECRET = 'test_secret_key_that_is_definitely_longer_than_32_chars';
process.env.CLIENT_URL = 'http://localhost:5173';

const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const jwt = require('jsonwebtoken');

const users = {
  1: { id: 1, name: 'Admin Person With Long Name', email: 'a@x.com', address: 'x', role: 'ADMIN', passwordHash: 'x' },
  2: { id: 2, name: 'Normal Person With Long Name', email: 'u@x.com', address: 'x', role: 'USER', passwordHash: 'x' },
  3: { id: 3, name: 'Owner Person With Long Name!', email: 'o@x.com', address: 'x', role: 'OWNER', passwordHash: 'x' },
};
const model = (extra = {}) => new Proxy(extra, {
  get: (t, k) => t[k] || (k === 'count' ? async () => 3 : k === 'aggregate' ? async () => ({ _avg: { value: null } }) : async () => []),
});
const stub = { user: model({ findUnique: async ({ where }) => users[where.id] || null }), store: model(), rating: model() };
require.cache[require.resolve('../config/prisma')] = { id: 'p', filename: 'p', loaded: true, exports: stub };

const app = require('../app');
const server = http.createServer(app);
let base;
test.before(() => new Promise((r) => server.listen(0, () => { base = `http://localhost:${server.address().port}/api`; r(); })));
test.after(() => server.close());

const token = (id) => jwt.sign({ sub: id }, process.env.JWT_SECRET);
const call = (method, path, body, id) =>
  fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(id && { Authorization: `Bearer ${token(id)}` }) }, body: body && JSON.stringify(body) });

const good = { name: 'A Perfectly Valid Long Name', email: 'new@x.com', address: '1 Road', password: 'Passw0rd!' };

test('signup validation rejects bad fields', async () => {
  for (const [k, v, msg] of [
    ['name', 'Too short', /at least 20/], ['name', 'x'.repeat(61), /at most 60/],
    ['address', 'x'.repeat(401), /at most 400/], ['email', 'nope', /valid email/],
    ['password', 'short1!', /at least 8/], ['password', 'nouppercase1!', /uppercase/],
    ['password', 'NoSpecial123', /special/], ['password', 'Aa1!' + 'x'.repeat(13), /at most 16/],
  ]) {
    const res = await call('POST', '/auth/signup', { ...good, [k]: v });
    const j = await res.json();
    assert.equal(res.status, 400, `${k}=${v}`);
    assert.match(j.details[k], msg);
  }
});

test('protected routes need a token', async () => {
  assert.equal((await call('GET', '/auth/me')).status, 401);
  const bad = await fetch(base + '/auth/me', { headers: { Authorization: 'Bearer junk' } });
  assert.equal(bad.status, 401);
});

test('role rules', async () => {
  assert.equal((await call('GET', '/admin/stats', null, 2)).status, 403);
  assert.equal((await call('GET', '/admin/stats', null, 3)).status, 403);
  const ok = await call('GET', '/admin/stats', null, 1);
  assert.equal(ok.status, 200);
  const body = await ok.json();
  assert.equal(body.totalUsers, 3);
  assert.deepEqual(body.distribution, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  assert.deepEqual(body.topStores, []);
  assert.equal((await call('GET', '/stores', null, 1)).status, 403);
  assert.equal((await call('GET', '/owner/dashboard', null, 2)).status, 403);
  assert.equal((await call('PUT', '/stores/1/rating', { value: 4 }, 3)).status, 403);
});

test('rating must be an integer 1-5', async () => {
  for (const value of [0, 6, 2.5, 'abc']) assert.equal((await call('PUT', '/stores/1/rating', { value }, 2)).status, 400);
});

test('query and body validation on admin routes', async () => {
  assert.equal((await call('GET', '/admin/users?sortBy=passwordHash', null, 1)).status, 400); // no sorting by secret columns
  assert.equal((await call('GET', '/admin/users?role=HACKER', null, 1)).status, 400);
  assert.equal((await call('POST', '/admin/users', { ...good, role: 'USER', name: 'short' }, 1)).status, 400);
  assert.equal((await call('GET', '/admin/users/abc', null, 1)).status, 400);
});

test('paging params are validated', async () => {
  assert.equal((await call('GET', '/admin/users?page=0', null, 1)).status, 400);
  assert.equal((await call('GET', '/admin/users?pageSize=1000', null, 1)).status, 400);
  assert.equal((await call('GET', '/stores?rated=maybe', null, 2)).status, 400);
});

test('bad JSON and unknown routes return JSON errors', async () => {
  const res = await fetch(base + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' });
  assert.equal(res.status, 400);
  assert.equal((await call('GET', '/nope')).status, 404);
});
