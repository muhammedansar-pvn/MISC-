const rateLimit = require("express-rate-limit");

/**
 * Creates an express-rate-limit middleware with standardized JSON responses.
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (default: 15 minutes)
 * @param {number} options.max - Maximum number of requests allowed per window (default: 10)
 * @param {string} options.message - Error message when limit is exceeded
 */
const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 10,
  message = "Too many requests. Please try again later.",
} = {}) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      return res.status(429).json({
        success: false,
        message,
      });
    },
  });
};

// Global API Limiter (500 requests per 15 min window)
const globalApiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: "Too many requests to MISC API. Please slow down.",
});

// Strict Account Setup & Set Password Limiter
const accountSetupLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many account setup attempts. Please try again after 15 minutes.",
});

// Public Enquiry Form Limiter
const enquiryLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many enquiry submissions from this IP. Please wait before submitting again.",
});

// Admin Password Reset Limiter (20 requests per 15 min window)
const adminPasswordResetLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many password reset requests initiated. Please try again after 15 minutes.",
});

module.exports = {
  createRateLimiter,
  globalApiLimiter,
  accountSetupLimiter,
  enquiryLimiter,
  adminPasswordResetLimiter,
};
