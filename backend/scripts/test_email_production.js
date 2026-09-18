const mongoose = require("mongoose");
const express = require("express");
const http = require("http");
const crypto = require("crypto");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const { validateEmailConfig, sendOtpEmail, sendPasswordResetEmail, sendUserInvitationEmail } = require("../src/services/emailService");
const EmailEvent = require("../src/models/EmailEvent");
const webhookRoutes = require("../src/routes/webhookRoutes");

function makeRequest(port, path, method, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = typeof data === "string" || Buffer.isBuffer(data) ? data : data ? JSON.stringify(data) : "";
    const options = {
      hostname: "127.0.0.1",
      port,
      path,
      method,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runProductionEmailTests() {
  console.log("==================================================");
  console.log("STARTING PRODUCTION EMAIL HARDENING TEST SUITE");
  console.log("==================================================");

  const results = {};

  // 1. Email Config Validation Test
  console.log("\n--- TEST 1: Email Configuration Validation ---");
  const configValid = validateEmailConfig();
  results["Email Config Validation"] = configValid ? "PASS" : "WARN (Dev Fallback)";

  // 2. Email Service Template & Dispatch Test
  console.log("\n--- TEST 2: Email Template Dispatch ---");
  const otpRes = await sendOtpEmail("delivered@resend.dev", "987654", "EMAIL_VERIFICATION");
  const resetRes = await sendPasswordResetEmail("delivered@resend.dev", "sample_reset_token_123");
  const setupRes = await sendUserInvitationEmail("delivered@resend.dev", "John Doe", "sample_setup_token_123");

  const templatesPass = otpRes.success && resetRes.success && setupRes.success;
  results["Email Template Dispatch"] = templatesPass ? "PASS" : "FAIL";

  // Connect MongoDB for Webhook Idempotency Test
  if (process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Connected to MongoDB for Webhook Tests");

    const app = express();
    app.use("/api/webhooks", webhookRoutes);

    const PORT = 5098;
    const server = app.listen(PORT);

    try {
      const testEventId = `evt_test_${Date.now()}`;
      await EmailEvent.deleteMany({ eventId: testEventId });

      const webhookPayload = {
        id: testEventId,
        type: "email.delivered",
        data: {
          email_id: "msg_test_123",
          to: ["user@example.com"],
          subject: "Test Subject",
          created_at: new Date().toISOString(),
        },
      };

      // 3. First Webhook Request
      console.log("\n--- TEST 3: Resend Webhook Processing ---");
      const whRes1 = await makeRequest(PORT, "/api/webhooks/resend", "POST", webhookPayload);
      console.log("First Webhook Response:", whRes1);

      // 4. Second Webhook Request (Idempotency Check)
      console.log("\n--- TEST 4: Resend Webhook Idempotency ---");
      const whRes2 = await makeRequest(PORT, "/api/webhooks/resend", "POST", webhookPayload);
      console.log("Second Webhook Response:", whRes2);

      const dbEvent = await EmailEvent.findOne({ provider: "resend", eventId: testEventId });

      const webhookPass =
        whRes1.status === 200 &&
        whRes2.status === 200 &&
        whRes2.data.message.includes("Duplicate") &&
        dbEvent &&
        dbEvent.type === "email.delivered";

      results["Webhook Processing & Idempotency"] = webhookPass ? "PASS" : "FAIL";

      // Cleanup
      await EmailEvent.deleteMany({ eventId: testEventId });
    } finally {
      server.close();
      await mongoose.disconnect();
    }
  }

  console.log("\n==================================================");
  console.log("SUMMARY OF PRODUCTION EMAIL HARDENING TEST RESULTS:");
  console.log("==================================================");
  console.table(results);
}

runProductionEmailTests().catch((err) => {
  console.error("Production Email Test Suite Error:", err);
  process.exit(1);
});
