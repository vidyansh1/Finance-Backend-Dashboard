const jwt = require("jsonwebtoken");
const { JWT_SECRET, USER_STATUSES } = require("../config");
const { HttpError } = require("../lib/httpError");
const { findUserById, sanitizeUser } = require("../services/userService");

async function authenticate(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new HttpError(401, "Authorization token is required."));
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await findUserById(payload.sub);

    if (!user || user.status !== USER_STATUSES.ACTIVE) {
      return next(new HttpError(401, "The authenticated user is unavailable."));
    }

    req.user = sanitizeUser(user);
    return next();
  } catch {
    return next(new HttpError(401, "Invalid or expired token."));
  }
}

function authorize(...roles) {
  return function authorizeByRole(req, _res, next) {
    if (!req.user) {
      return next(new HttpError(401, "Authentication is required."));
    }

    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, "You do not have permission to perform this action."));
    }

    return next();
  };
}

module.exports = {
  authenticate,
  authorize
};
