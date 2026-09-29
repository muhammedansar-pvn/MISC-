require("dotenv").config();

const DEV_DEFAULT_JWT_SECRET = "default_jwt_secret_dev_key";

if (
  process.env.NODE_ENV === "production" &&
  (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === "" || process.env.JWT_SECRET === DEV_DEFAULT_JWT_SECRET)
) {
  throw new Error("FATAL: JWT_SECRET must be explicitly set to a secure string in production and cannot equal the dev default.");
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/misc",
  JWT_SECRET: process.env.JWT_SECRET || DEV_DEFAULT_JWT_SECRET,
  APP_URL: process.env.APP_URL || "http://localhost:3000",
  SETUP_BASE_URL: process.env.SETUP_BASE_URL || "http://localhost:3000/account-setup",
  
  // SMTP Configuration
  SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587", 10),
  SMTP_SECURE: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || "MISC",
  SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "no-reply@misc.edu",

  // Payment Gateways
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
};

module.exports = env;
