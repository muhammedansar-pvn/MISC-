const express = require("express");
const corsMiddleware = require("./config/cors");
const apiRoutes = require("./routes/index");
const { validateEmailConfig } = require("./config/mail");
const { notFoundHandler, globalErrorHandler } = require("./middleware/error.middleware");

const app = express();

// Global Middleware
app.use(corsMiddleware);
app.use(express.json());

// Initialize & Validate Email Config
validateEmailConfig();

// Mount Central API Router
app.use("/api", apiRoutes);

// Catch-all 404 for unknown /api/* endpoints
app.use("/api/*", notFoundHandler);

// Global Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
