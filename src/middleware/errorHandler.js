function notFound(_req, res) {
  res.status(404).json({
    error: {
      message: "Route not found."
    }
  });
}

function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: err.message || "Internal server error.",
      ...(err.details ? { details: err.details } : {})
    }
  });
}

module.exports = {
  notFound,
  errorHandler
};
