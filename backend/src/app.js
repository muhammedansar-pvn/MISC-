const express = require("express");
const path = require("path");
const helmet = require("helmet");
const corsMiddleware = require("./config/cors");
const apiRoutes = require("./routes/index");
const { validateEmailConfig } = require("./config/mail");
const { notFoundHandler, globalErrorHandler } = require("./middleware/error.middleware");
const { globalApiLimiter } = require("./middleware/rate-limit.middleware");
const { servePrivateUploads } = require("./middleware/private-upload.middleware");

const app = express();

// Trust reverse proxy (e.g., Nginx, Render, Vercel, AWS ALB) for accurate client IP identification
app.set("trust proxy", 1);

// Security HTTP Headers
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Global Middleware
app.use(corsMiddleware);
app.use(
  express.json({
    limit: "25mb",
    verify: (req, res, buf) => {
      req.rawBody = buf ? buf.toString() : "";
    },
  })
);

// Public Uploads Serving (unauthenticated assets like logos, CMS public downloads)
app.use("/uploads/public", express.static(path.resolve(__dirname, "../uploads/public"), {
  setHeaders: (res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  },
}));

// Protected Private File Storage Serving (requires authentication or signed URL)
app.use("/uploads", servePrivateUploads);

// Initialize & Validate Email Config
validateEmailConfig();

// Global API Rate Limiter
app.use("/api", globalApiLimiter);

// Mount Central API Router
app.use("/api", apiRoutes);

// Catch-all 404 for unknown /api/* endpoints
app.use("/api/*", notFoundHandler);

// Global Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
