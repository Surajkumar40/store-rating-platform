const env = require('../config/env');

class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message;
  if (err.type === 'entity.parse.failed') { status = 400; message = 'Invalid JSON body'; }
  if (err.code === 'P2002') { status = 409; message = 'A record with this value already exists'; }
  if (status === 500) {
    console.error(err);
    message = 'Internal server error';
  }
  res.status(status).json({
    message,
    ...(err.details && { details: err.details }),
    ...(env.NODE_ENV === 'development' && status === 500 && { stack: err.stack }),
  });
}

module.exports = { ApiError, notFound, errorHandler };
