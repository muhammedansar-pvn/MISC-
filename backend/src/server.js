const http = require("http");
const mongoose = require("mongoose");
const env = require("./config/env");
const connectDB = require("./config/db");
const app = require("./app");
const { initSocketServer, closeSocketServer } = require("./socket");

const PORT = env.PORT || 5000;

connectDB();

const httpServer = http.createServer(app);

// Attach Socket.IO real-time server
initSocketServer(httpServer);

const server = httpServer.listen(PORT, () => {
  console.log(`MISC Backend Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

server.on("error", (error) => {
  console.error("Server Startup Error:", error.message);
});

// Graceful Shutdown Implementation
let isShuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

  // Force shutdown after 10s timeout to prevent hanging process
  const forceExitTimeout = setTimeout(() => {
    console.error("Graceful shutdown timeout exceeded (10s). Forcing process exit.");
    process.exit(1);
  }, 10000);
  forceExitTimeout.unref();

  try {
    // 1. Close Socket.IO connections
    console.log("Closing Socket.IO connections...");
    await closeSocketServer();

    // 2. Stop accepting new HTTP requests and finish in-flight requests
    console.log("Closing HTTP server...");
    await new Promise((resolve) => server.close(resolve));

    // 3. Close MongoDB database connections
    console.log("Closing MongoDB connection...");
    await mongoose.connection.close(false);

    console.log("Graceful shutdown complete. Exiting cleanly.");
    process.exit(0);
  } catch (err) {
    console.error("Error during graceful shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Unhandled Rejections and Exceptions
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception thrown:", error);
  gracefulShutdown("uncaughtException");
});

module.exports = server;