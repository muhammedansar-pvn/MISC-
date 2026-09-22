const rateLimitMap = new Map();

/**
 * Creates an in-memory rate limiting middleware.
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
  return (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    const key = `${req.baseUrl}${req.path}:${ip}`;
    const now = Date.now();

    const record = rateLimitMap.get(key) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }

    rateLimitMap.set(key, record);

    if (rateLimitMap.size > 2000) {
      for (const [k, v] of rateLimitMap.entries()) {
        if (now > v.resetTime) rateLimitMap.delete(k);
      }
    }

    if (record.count > max) {
      return res.status(429).json({
        success: false,
        message,
      });
    }

    next();
  };
};

module.exports = {
  createRateLimiter,
};
