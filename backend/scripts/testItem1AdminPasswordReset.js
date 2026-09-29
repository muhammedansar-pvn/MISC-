const mongoose = require("mongoose");
const http = require("http");
const env = require("../src/config/env");
const app = require("../src/app");
const User = require("../src/modules/users/user.model");
const PasswordResetToken = require("../src/modules/auth/password-reset-token.model");
const { generateToken } = require("../src/shared/utils/jwt");

async function run() {
  console.log("==================================================================");
  console.log("ITEM 1 VERIFICATION: ADMIN PASSWORD RESET ENDPOINT");
  console.log("==================================================================");

  await mongoose.connect(env.MONGODB_URI);
  console.log("[1/5] Connected to MongoDB Atlas.");

  const server = http.createServer(app);
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;
  console.log(`[2/5] Test HTTP server listening on port ${port}.`);

  const timestamp = Date.now();

  // Create Fixtures: Admin User, Faculty User (Target), Student User (Unauthorized)
  const adminUser = await User.create({
    name: "Admin User",
    email: `admin.p2.${timestamp}@markaz.in`,
    password: "Password123!",
    role: "ADMIN",
    status: "ACTIVE",
  });

  const targetFacultyUser = await User.create({
    name: "Faculty Target",
    email: `target.faculty.${timestamp}@markaz.in`,
    password: "InitialPassword123!",
    role: "FACULTY",
    status: "ACTIVE",
  });

  const studentUser = await User.create({
    name: "Student Caller",
    email: `student.caller.${timestamp}@markaz.in`,
    password: "Password123!",
    role: "STUDENT",
    status: "ACTIVE",
  });

  const adminToken = generateToken({ userId: adminUser._id.toString(), role: "ADMIN" });
  const studentToken = generateToken({ userId: studentUser._id.toString(), role: "STUDENT" });

  console.log("[3/5] Test domain fixtures established.");

  try {
    // -------------------------------------------------------------
    // TEST 1: Role check - Non-Admin (STUDENT) gets 403 Forbidden
    // -------------------------------------------------------------
    console.log("\n--- TEST 1: Student role attempts to reset password ---");
    let res = await fetch(`${baseUrl}/admin/users/${targetFacultyUser._id}/reset-password`, {
      method: "POST",
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    let data = await res.json();
    console.log("Student POST /reset-password -> HTTP Status:", res.status, "Message:", data.message);
    if (res.status !== 403) {
      throw new Error(`Expected HTTP 403 Forbidden, got ${res.status}`);
    }
    console.log("Test 1 Result: PASSED (Non-admin strictly blocked)");

    // -------------------------------------------------------------
    // TEST 2: Invalid / Non-existent ID handling
    // -------------------------------------------------------------
    console.log("\n--- TEST 2: Invalid & Non-existent user IDs ---");
    res = await fetch(`${baseUrl}/admin/users/not-an-id/reset-password`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    data = await res.json();
    console.log("Invalid ID -> HTTP Status:", res.status, "Message:", data.message);
    if (res.status !== 400) {
      throw new Error(`Expected HTTP 400 for invalid ID, got ${res.status}`);
    }

    const nonExistentId = new mongoose.Types.ObjectId();
    res = await fetch(`${baseUrl}/admin/users/${nonExistentId}/reset-password`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    data = await res.json();
    console.log("Non-existent ID -> HTTP Status:", res.status, "Message:", data.message);
    if (res.status !== 404) {
      throw new Error(`Expected HTTP 404 for non-existent user, got ${res.status}`);
    }
    console.log("Test 2 Result: PASSED (Validation and 404 response verified)");

    // -------------------------------------------------------------
    // TEST 3: Admin triggers password reset for valid target user
    // -------------------------------------------------------------
    console.log("\n--- TEST 3: Admin triggers password reset for valid user ---");
    // Pre-insert an old dummy reset token to verify invalidation/deletion
    await PasswordResetToken.create({
      userId: targetFacultyUser._id,
      tokenHash: "old-dummy-hash-" + timestamp,
      expiresAt: new Date(Date.now() + 10000),
    });
    const tokensBefore = await PasswordResetToken.countDocuments({ userId: targetFacultyUser._id });
    console.log("Tokens before admin reset call:", tokensBefore);

    res = await fetch(`${baseUrl}/admin/users/${targetFacultyUser._id}/reset-password`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    data = await res.json();
    console.log("Admin POST /reset-password -> HTTP Status:", res.status, "Response:", data);

    if (res.status !== 200 || !data.success) {
      throw new Error(`Failed admin password reset: ${JSON.stringify(data)}`);
    }

    // Security check: rawToken, token, password must NOT be in the response
    if (data.rawToken || data.token || data.password || data.data?.token || data.data?.rawToken) {
      throw new Error("SECURITY FAILURE: Raw token leaked in response body!");
    }

    // Verify exactly ONE active token exists in DB now (old one was deleted)
    const activeTokens = await PasswordResetToken.find({ userId: targetFacultyUser._id });
    console.log("Active reset tokens in DB:", activeTokens.length);
    if (activeTokens.length !== 1) {
      throw new Error(`Expected exactly 1 reset token, found ${activeTokens.length}`);
    }

    const createdTokenDoc = activeTokens[0];
    const expiryHours = (new Date(createdTokenDoc.expiresAt) - Date.now()) / (1000 * 60 * 60);
    console.log(`Token expiry duration: ~${Math.round(expiryHours)} hours`);
    if (expiryHours < 23 || expiryHours > 25) {
      throw new Error(`Token expiry duration should be ~24 hours, found ${expiryHours}`);
    }

    console.log("Test 3 Result: PASSED (24h token stored, old tokens cleared, zero raw tokens leaked)");

    console.log("\n==================================================================");
    console.log("ALL ITEM 1 ADMIN PASSWORD RESET TESTS PASSED!");
    console.log("==================================================================");
  } finally {
    console.log("\n[4/5] Cleaning up test fixtures from database...");
    await PasswordResetToken.deleteMany({ userId: targetFacultyUser._id });
    await User.deleteMany({ _id: { $in: [adminUser._id, targetFacultyUser._id, studentUser._id] } });
    server.close();
    await mongoose.disconnect();
    console.log("[5/5] Cleanup complete. Server closed.");
  }
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
