// Forwards errors from async route handlers to the error middleware (Express 4 needs this).
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
