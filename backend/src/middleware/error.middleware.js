const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
};

const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  // Log error details for server-side debugging
  console.error("Server Error:", err.stack || err.message);

  const isProduction = process.env.NODE_ENV === "production";
  const safeMessage = (statusCode >= 500 && isProduction)
    ? "Internal Server Error"
    : (err.message || "Internal Server Error");

  const responsePayload = {
    success: false,
    message: safeMessage,
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
