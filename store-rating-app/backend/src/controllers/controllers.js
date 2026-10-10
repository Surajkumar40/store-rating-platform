const asyncHandler = require('../utils/asyncHandler');
const auth = require('../services/authService');
const admin = require('../services/adminService');
const stores = require('../services/storeService');
const { ApiError } = require('../middleware/errorHandler');

const id = (req) => {
  const n = Number(req.params.id);
  if (!Number.isInteger(n) || n <= 0) throw new ApiError(400, 'Invalid id');
  return n;
};

module.exports = {
  signup: asyncHandler(async (req, res) => res.status(201).json(await auth.signup(req.body))),
  login: asyncHandler(async (req, res) => res.json(await auth.login(req.body))),
  me: (req, res) => res.json({ user: auth.publicUser(req.user) }),
  changePassword: asyncHandler(async (req, res) => {
    await auth.changePassword(req.user, req.body);
    res.json({ message: 'Password updated' });
  }),

  stats: asyncHandler(async (req, res) => res.json(await admin.stats())),
  addUser: asyncHandler(async (req, res) => res.status(201).json(await admin.addUser(req.body))),
  listUsers: asyncHandler(async (req, res) => res.json(await admin.listUsers(req.validatedQuery))),
  getUser: asyncHandler(async (req, res) => res.json(await admin.getUser(id(req)))),
  addStore: asyncHandler(async (req, res) => res.status(201).json(await admin.addStore(req.body))),
  adminListStores: asyncHandler(async (req, res) => res.json(await admin.listStores(req.validatedQuery))),
  availableOwners: asyncHandler(async (req, res) => res.json(await admin.availableOwners())),

  listStores: asyncHandler(async (req, res) => res.json(await stores.listForUser(req.user.id, req.validatedQuery))),
  rateStore: asyncHandler(async (req, res) => res.json(await stores.rateStore(req.user.id, id(req), req.body.value))),
  ownerDashboard: asyncHandler(async (req, res) => res.json(await stores.ownerDashboard(req.user.id))),
};
