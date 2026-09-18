const mongoose = require("mongoose");
const express = require("express");
const http = require("http");
const crypto = require("crypto");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const User = require("../src/models/User");
const AccountSetupToken = require("../src/models/AccountSetupToken");
const adminRoutes = require("../src/routes/adminRoutes");
const { generateToken } = require("../src/utils/jwt");

function makeRequest(port, path, method, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : "";
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

async function runInvitationRollbackTest() {
  console.log("==================================================");
  console.log("TESTING ADMIN INVITATION EMAIL FAILURE & ROLLBACK");
  console.log("==================================================");

  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI missing in environment");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✓ Connected to MongoDB");

  // Create an Admin user for JWT authorization header
  const adminEmail = "test.admin.inviter@example.com";
  await User.deleteMany({ email: adminEmail });

  const adminUser = await User.create({
    name: "Test Admin Inviter",
    email: adminEmail,
    username: adminEmail,
    role: "ADMIN",
    status: "ACTIVE",
    emailVerified: true,
  });

  const adminJwt = generateToken({ userId: adminUser._id, role: "ADMIN" });
  const authHeaders = { Authorization: `Bearer ${adminJwt}` };

  const app = express();
  app.use(express.json());
  app.use("/api/admin", adminRoutes);

  const PORT = 5097;
  const server = app.listen(PORT);
  console.log(`✓ Test server running on port ${PORT}`);

  const results = {};

  try {
    // ---------------------------------------------------------
    // TEST 1: SUCCESSFUL INVITATION (delivered@resend.dev)
    // ---------------------------------------------------------
    console.log("\n--- TEST 1: Successful Admin Invitation (delivered@resend.dev) ---");
    const successEmail = "delivered@resend.dev";

    // Delete prior records if any
    const existingUser = await User.findOne({ email: successEmail });
    if (existingUser) {
      await AccountSetupToken.deleteMany({ userId: existingUser._id });
      await User.deleteOne({ _id: existingUser._id });
    }

    const res1 = await makeRequest(PORT, "/api/admin/users", "POST", {
      name: "Resend Test Recipient",
      email: successEmail,
      role: "STUDENT",
    }, authHeaders);

    console.log("Response for delivered@resend.dev:", res1);

    const user1Doc = await User.findOne({ email: successEmail });
    const token1Doc = user1Doc ? await AccountSetupToken.findOne({ userId: user1Doc._id }) : null;

    const test1Pass =
      res1.status === 201 &&
      res1.data.success === true &&
      user1Doc &&
      user1Doc.status === "INVITED" &&
      token1Doc &&
      token1Doc.purpose === "ADMIN_INVITATION";

    results["Successful Invitation (delivered@resend.dev)"] = test1Pass ? "PASS" : "FAIL";

    // Clean up test 1 records
    if (user1Doc) {
      await AccountSetupToken.deleteMany({ userId: user1Doc._id });
      await User.deleteOne({ _id: user1Doc._id });
    }

    // ---------------------------------------------------------
    // TEST 2: FAILED INVITATION & ROLLBACK (external Gmail on sandbox)
    // ---------------------------------------------------------
    console.log("\n--- TEST 2: Resend Rejected External Email (mdapvn86@gmail.com) ---");
    const externalEmail = "mdapvn86@gmail.com";

    // Clean up any existing records first
    const existingExtUser = await User.findOne({ email: externalEmail });
    if (existingExtUser) {
      await AccountSetupToken.deleteMany({ userId: existingExtUser._id });
      await User.deleteOne({ _id: existingExtUser._id });
    }

    const res2 = await makeRequest(PORT, "/api/admin/users", "POST", {
      name: "Muhammad Ansar",
      email: externalEmail,
      role: "STUDENT",
    }, authHeaders);

    console.log("Response for external Gmail (Resend Sandbox 422):", res2);

    const user2Doc = await User.findOne({ email: externalEmail });
    const token2Doc = await AccountSetupToken.findOne({
      tokenHash: "9a1e4abf33828feeefa0338b30980e2ffe79cb6e87194633ac644ea9226aca4e",
    });

    const test2Pass =
      res2.status === 500 &&
      res2.data.success === false &&
      res2.data.message.includes("Failed to send account setup invitation") &&
      !user2Doc && // User was rolled back and deleted!
      !token2Doc; // Token was rolled back and deleted!

    results["Failed Invitation & DB Rollback"] = test2Pass ? "PASS" : "FAIL";
    console.log(`Failed Invitation & DB Rollback Result: ${results["Failed Invitation & DB Rollback"]}`);
  } finally {
    await User.deleteMany({ email: adminEmail });
    server.close();
    await mongoose.disconnect();
  }

  console.log("\n==================================================");
  console.log("SUMMARY OF INVITATION ROLLBACK TEST RESULTS:");
  console.log("==================================================");
  console.table(results);

  const allPassed = Object.values(results).every((r) => r === "PASS");
  if (allPassed) {
    console.log("\nSUCCESS: INVITATION FAILURE & ROLLBACK VERIFIED");
  } else {
    console.log("\nFAILURE: Invitation failure rollback test failed.");
    process.exit(1);
  }
}

runInvitationRollbackTest().catch((err) => {
  console.error("Fatal Test Script Error:", err);
  process.exit(1);
});
