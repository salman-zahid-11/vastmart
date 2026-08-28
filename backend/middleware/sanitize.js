const sanitize = require('mongo-sanitize');

// Strips any keys starting with '$' or containing '.' from req.body, req.query,
// req.params — prevents NoSQL injection attacks (e.g. { email: { $ne: null } })
const sanitizeMiddleware = (req, res, next) => {
  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  next();
};

module.exports = sanitizeMiddleware;