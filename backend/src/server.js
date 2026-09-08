require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const accountSetupRoutes = require("./routes/accountSetupRoutes");
const studentRoutes = require("./routes/studentRoutes");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MISC API is running",
  });
});

// Authentication Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", accountSetupRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
// 404 Handler for Unknown API Routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

connectDB();

const server = app.listen(PORT, () => {
  console.log(`MISC Backend Server running on port ${PORT}`);
});

server.on("error", (error) => {
  console.error("Server Startup Error:", error.message);
});