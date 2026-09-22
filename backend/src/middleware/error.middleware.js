const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
};

const globalErrorHandler = (err, req, res, next) => {
  console.error("Server Error:", err.message);

  const statusCode = err.statusCode || err.status || 500;
  const responsePayload = {
    success: false,
    message: err.message || "Internal Server Error",
  };

  if (err.errors) {
    responsePayload.errors = err.errors;
  }

  res.status(statusCode).json(responsePayload);
};

module.exports = {
  notFoundHandler,
  globalErrorHandler,
};
