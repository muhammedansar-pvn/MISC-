require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Routes Imports
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const accountSetupRoutes = require("./routes/accountSetupRoutes");
const institutionRoutes = require("./routes/institutionRoutes");
const academicRoutes = require("./routes/academicRoutes");
const studentRoutes = require("./routes/studentRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const cmsRoutes = require("./routes/cmsRoutes");
const eventRoutes = require("./routes/eventRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const examRoutes = require("./routes/examRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const { handleTestEmail } = require("./controllers/testEmailController");
const { validateEmailConfig } = require("./services/emailService");

const app = express();

// Middleware
app.use(cors());

// Webhook Routes (Must be mounted before global express.json() for raw body parsing)
app.use("/api/webhooks", webhookRoutes);

app.use(express.json());

// Validate Email Service Configuration
validateEmailConfig();

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MISC Integrated Portal API Server is running",
  });
});

// Resend Email Integration Test Endpoint (Dev Only)
app.get("/api/test-email", handleTestEmail);

// Mount API Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", accountSetupRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/institutions", institutionRoutes);
app.use("/api/academic", academicRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/exams", examRoutes);

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

module.exports = app;