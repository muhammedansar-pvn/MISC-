const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
};

const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors;

  const isProduction = process.env.NODE_ENV === "production";

  // Sanitize common database/internal errors
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid identifier format";
    errors = undefined;
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    if (err.errors) {
      errors = Object.values(err.errors).map((e) => e.message);
    }
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    message = `A record with this ${field} already exists.`;
    errors = undefined;
  }

  // Safe logging without leaking sensitive payload data
  console.error(`[${new Date().toISOString()}] Server Error (${statusCode}):`, isProduction ? (err.message || err) : (err.stack || err));

  if (statusCode >= 500 && isProduction) {
    message = "Internal Server Error";
    errors = undefined;
  }

  const responsePayload = {
    success: false,
    message,
  };

  if (errors) {
    responsePayload.errors = errors;
  }

  res.status(statusCode).json(responsePayload);
};

module.exports = {
  notFoundHandler,
  globalErrorHandler,
};
