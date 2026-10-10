const { z } = require('zod');

const name = z.string().trim().min(20, 'Name must be at least 20 characters').max(60, 'Name must be at most 60 characters');
const email = z.string().trim().toLowerCase().max(255).email('Enter a valid email address');
const address = z.string().trim().min(1, 'Address is required').max(400, 'Address must be at most 400 characters');
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(16, 'Password must be at most 16 characters')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[^A-Za-z0-9]/, 'Password must include a special character');

const order = z.enum(['asc', 'desc']).default('asc');
const text = z.string().trim().max(100).optional();
const paging = {
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
};

const signup = z.object({ name, email, address, password });
const login = z.object({ email, password: z.string().min(1, 'Password is required') });
const changePassword = z.object({ currentPassword: z.string().min(1, 'Current password is required'), newPassword: password });

const createUser = z.object({ name, email, address, password, role: z.enum(['ADMIN', 'USER', 'OWNER']) });
const createStore = z.object({ name, email, address, ownerId: z.coerce.number().int().positive().nullish() });

const userQuery = z.object({
  name: text, email: text, address: text,
  role: z.preprocess((v) => (v === '' ? undefined : v), z.enum(['ADMIN', 'USER', 'OWNER']).optional()), // empty filter = all roles
  sortBy: z.enum(['name', 'email', 'address', 'role']).default('name'),
  order, ...paging,
});
const adminStoreQuery = z.object({
  name: text, email: text, address: text,
  sortBy: z.enum(['name', 'email', 'address', 'rating']).default('name'),
  order, ...paging,
});
const storeQuery = z.object({
  search: text, name: text, address: text,
  sortBy: z.enum(['name', 'address', 'rating']).default('name'),
  rated: z.enum(['all', 'rated', 'unrated']).default('all'),
  order, ...paging,
});
const rating = z.object({ value: z.coerce.number().int('Rating must be a whole number').min(1, 'Rating must be 1 to 5').max(5, 'Rating must be 1 to 5') });

module.exports = { signup, login, changePassword, createUser, createStore, userQuery, adminStoreQuery, storeQuery, rating };
