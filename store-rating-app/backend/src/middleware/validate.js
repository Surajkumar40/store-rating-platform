const { ApiError } = require('./errorHandler');

// validate(schema, 'body' | 'query') -> body is replaced with parsed data; query goes to req.validatedQuery.
module.exports = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const details = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join('.') || '_';
      if (!details[key]) details[key] = issue.message;
    }
    return next(new ApiError(400, 'Validation failed', details));
  }
  if (source === 'body') req.body = result.data;
  else req.validatedQuery = result.data;
  next();
};
