const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const prisma = require('../config/prisma');
const { ApiError } = require('../middleware/errorHandler');

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, address: u.address, role: u.role });
const sign = (u) => jwt.sign({ sub: u.id, role: u.role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
const hash = (pw) => bcrypt.hash(pw, 12);

// Used for unknown emails so login timing doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('Dummy@password1', 12);

async function createUser(data) {
  const exists = await prisma.user.findUnique({ where: { email: data.email } });
  if (exists) throw new ApiError(409, 'Email is already registered', { email: 'Email is already registered' });
  const { password, ...rest } = data;
  return prisma.user.create({ data: { ...rest, passwordHash: await hash(password) } });
}

async function signup(data) {
  const user = await createUser({ ...data, role: 'USER' }); // signup can only ever create normal users
  return { token: sign(user), user: publicUser(user) };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
  if (!user || !ok) throw new ApiError(401, 'Invalid email or password');
  return { token: sign(user), user: publicUser(user) };
}

async function changePassword(user, { currentPassword, newPassword }) {
  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) throw new ApiError(400, 'Validation failed', { currentPassword: 'Current password is incorrect' });
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hash(newPassword) } });
}

module.exports = { publicUser, createUser, signup, login, changePassword };
