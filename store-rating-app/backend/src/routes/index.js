const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const c = require('../controllers/controllers');
const v = require('../validators/schemas');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === 'test' ? 1000 : 20,
  message: { message: 'Too many attempts, try again later' },
});

// Auth
router.post('/auth/signup', authLimiter, validate(v.signup), c.signup);
router.post('/auth/login', authLimiter, validate(v.login), c.login);
router.get('/auth/me', authenticate, c.me);
router.patch('/auth/password', authenticate, validate(v.changePassword), c.changePassword);

// Admin
const admin = [authenticate, authorize('ADMIN')];
router.get('/admin/stats', admin, c.stats);
router.post('/admin/users', admin, validate(v.createUser), c.addUser);
router.get('/admin/users', admin, validate(v.userQuery, 'query'), c.listUsers);
router.get('/admin/users/:id', admin, c.getUser);
router.post('/admin/stores', admin, validate(v.createStore), c.addStore);
router.get('/admin/stores', admin, validate(v.adminStoreQuery, 'query'), c.adminListStores);
router.get('/admin/owners/available', admin, c.availableOwners);

// Normal user
router.get('/stores', authenticate, authorize('USER'), validate(v.storeQuery, 'query'), c.listStores);
router.put('/stores/:id/rating', authenticate, authorize('USER'), validate(v.rating), c.rateStore);

// Store owner
router.get('/owner/dashboard', authenticate, authorize('OWNER'), c.ownerDashboard);

module.exports = router;
