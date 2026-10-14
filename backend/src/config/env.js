const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
require("dotenv").config();

if (!process.env.NODE_ENV || !process.env.NODE_ENV.trim()) {
  throw new Error("FATAL: NODE_ENV is not set. It must be explicitly set to 'production', 'development', or 'test'.");
}

const isProduction = process.env.NODE_ENV === "production";

// Fail-fast validation for mandatory production secrets
if (isProduction) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim().length < 32) {
    throw new Error("FATAL: JWT_SECRET must be set to a secure string of at least 32 characters in production.");
  }
  if (!process.env.MONGODB_URI || process.env.MONGODB_URI.trim() === "") {
    throw new Error("FATAL: MONGODB_URI must be explicitly set in production.");
  }
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/misc",
  JWT_SECRET: process.env.JWT_SECRET || (isProduction ? "" : "dev_jwt_secret_insecure_local_only"),
  APP_URL: process.env.APP_URL || "http://localhost:3000",
  SETUP_BASE_URL: process.env.SETUP_BASE_URL || "http://localhost:3000/account-setup",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.toLowerCase().trim() : "",
  
  // SMTP Configuration
  SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587", 10),
  SMTP_SECURE: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || "MISC",
  SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "no-reply@misc.edu",

  // Payment Gateways (Strict production isolation - zero hardcoded fallback credentials)
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
};

module.exports = env;
