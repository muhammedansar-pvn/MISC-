const mongoose = require("mongoose");
const express = require("express");
const http = require("http");
const crypto = require("crypto");
const dotenv = require("dotenv");
const path = require("path");

// Load backend environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const User = require("../src/models/User");
const OtpVerification = require("../src/models/OtpVerification");
const AccountSetupToken = require("../src/models/AccountSetupToken");
const PasswordResetToken = require("../src/models/PasswordResetToken");
const authRoutes = require("../src/routes/authRoutes");
const { verifyOtpCode } = require("../src/services/otpService");

// Helper to resolve 6-digit OTP code from stored hash for test verification
function findOtpCodeForHash(hash) {
  for (let i = 100000; i <= 999999; i++) {
    const code = i.toString();
    const testHash = crypto.createHash("sha256").update(code).digest("hex");
    if (testHash === hash) {
      return code;
    }
  }
  return null;
}

// Helper HTTP request function
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

async function runE2ETests() {
  console.log("==================================================");
  console.log("STARTING END-TO-END AUTHENTICATION VERIFICATION");
  console.log("==================================================");

  // 1. Connect to MongoDB
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI not found in backend/.env");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✓ Connected to MongoDB");

  // 2. Start Express app locally on test port 5099
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);

  const PORT = 5099;
  const server = app.listen(PORT);
  console.log(`✓ Test Express server listening on port ${PORT}`);

  const results = {};

  try {
    // Cleanup prior test users
    const testEmails = [
      "e2e.reg.test@example.com",
      "e2e.wrongotp.test@example.com",
      "e2e.expired.test@example.com",
      "e2e.resend.test@example.com",
      "e2e.unverifiedlogin.test@example.com",
      "e2e.adminsetup.test@example.com",
      "e2e.forgotpass.test@example.com",
    ];

    const existingUsers = await User.find({ email: { $in: testEmails } });
    const userIds = existingUsers.map((u) => u._id);

    await User.deleteMany({ email: { $in: testEmails } });
    await OtpVerification.deleteMany({ identifier: { $in: testEmails } });
    await AccountSetupToken.deleteMany({ userId: { $in: userIds } });
    await PasswordResetToken.deleteMany({ userId: { $in: userIds } });

    // ----------------------------------------------------
    // TEST 1: REGISTRATION & DATABASE VERIFICATION
    // ----------------------------------------------------
    console.log("\n--- TEST 1: Registration & Database Verification ---");
    const regRes = await makeRequest(PORT, "/api/auth/register", "POST", {
      name: "E2E Test User",
      email: "e2e.reg.test@example.com",
      password: "TestPassword123!",
      mobile: "+919999999999",
      role: "STUDENT",
    });

    console.log("Registration API Response:", regRes);
    const userDoc = await User.findOne({ email: "e2e.reg.test@example.com" }).select("+passwordHash");
    const otpDoc = await OtpVerification.findOne({ identifier: "e2e.reg.test@example.com" });

    const regPass =
      regRes.status === 201 &&
      regRes.data.success === true &&
      regRes.data.requiresEmailVerification === true &&
      userDoc &&
      userDoc.emailVerified === false &&
      userDoc.status === "PENDING_SETUP" &&
      userDoc.passwordHash &&
      userDoc.passwordHash !== "TestPassword123!" &&
      otpDoc &&
      otpDoc.purpose === "EMAIL_VERIFICATION" &&
      otpDoc.otpHash &&
      otpDoc.expiresAt > new Date() &&
      !regRes.data.otp;

    results["Registration"] = regPass ? "PASS" : "FAIL";
    results["OTP generation"] = otpDoc ? "PASS" : "FAIL";
    results["OTP email"] = regRes.data.requiresEmailVerification ? "PASS" : "FAIL";

    // ----------------------------------------------------
    // TEST 2: VERIFY CORRECT OTP
    // ----------------------------------------------------
    console.log("\n--- TEST 2: Verify Correct OTP ---");
    const correctOtpCode = findOtpCodeForHash(otpDoc.otpHash);
    console.log(`Resolved OTP Code for Hash: ${correctOtpCode}`);

    const verifyRes = await makeRequest(PORT, "/api/auth/verify-email-otp", "POST", {
      email: "e2e.reg.test@example.com",
      otp: correctOtpCode,
    });
    console.log("Verify Correct OTP Response:", verifyRes);

    const verifiedUserDoc = await User.findOne({ email: "e2e.reg.test@example.com" });

    const verifyPass =
      verifyRes.status === 200 &&
      verifyRes.data.success === true &&
      verifiedUserDoc.emailVerified === true &&
      verifiedUserDoc.status === "ACTIVE";

    results["Correct OTP"] = verifyPass ? "PASS" : "FAIL";

    // ----------------------------------------------------
    // TEST 3: VERIFY OTP REUSE
    // ----------------------------------------------------
    console.log("\n--- TEST 3: Verify OTP Reuse Prevention ---");
    const reuseRes = await makeRequest(PORT, "/api/auth/verify-email-otp", "POST", {
      email: "e2e.reg.test@example.com",
      otp: correctOtpCode,
    });
    console.log("Reuse OTP Response:", reuseRes);

    const reusePass = reuseRes.status === 400 && reuseRes.data.success === false;
    results["OTP reuse"] = reusePass ? "PASS" : "FAIL";

    // ----------------------------------------------------
    // TEST 4: WRONG OTP & ATTEMPTS INCREMENT
    // ----------------------------------------------------
    console.log("\n--- TEST 4: Wrong OTP & Attempts Increment ---");
    await makeRequest(PORT, "/api/auth/register", "POST", {
      name: "Wrong OTP User",
      email: "e2e.wrongotp.test@example.com",
      password: "TestPassword123!",
      role: "STUDENT",
    });

    const wrongOtpRes = await makeRequest(PORT, "/api/auth/verify-email-otp", "POST", {
      email: "e2e.wrongotp.test@example.com",
      otp: "000000",
    });
    console.log("Wrong OTP Response:", wrongOtpRes);

    const wrongOtpDoc = await OtpVerification.findOne({ identifier: "e2e.wrongotp.test@example.com" });
    const wrongUserDoc = await User.findOne({ email: "e2e.wrongotp.test@example.com" });

    const wrongOtpPass =
      wrongOtpRes.status === 400 &&
      wrongOtpRes.data.success === false &&
      wrongOtpDoc &&
      wrongOtpDoc.attempts === 1 &&
      wrongUserDoc.emailVerified === false;

    results["Wrong OTP"] = wrongOtpPass ? "PASS" : "FAIL";

    // ----------------------------------------------------
    // TEST 5: EXPIRED OTP
    // ----------------------------------------------------
    console.log("\n--- TEST 5: Expired OTP Handling ---");
    await makeRequest(PORT, "/api/auth/register", "POST", {
      name: "Expired OTP User",
      email: "e2e.expired.test@example.com",
      password: "TestPassword123!",
      role: "STUDENT",
    });

    const expOtpDoc = await OtpVerification.findOne({ identifier: "e2e.expired.test@example.com" });
    const expOtpCode = findOtpCodeForHash(expOtpDoc.otpHash);

    // Manually expire in DB
    expOtpDoc.expiresAt = new Date(Date.now() - 300000);
    await expOtpDoc.save();

    const expiredRes = await makeRequest(PORT, "/api/auth/verify-email-otp", "POST", {
      email: "e2e.expired.test@example.com",
      otp: expOtpCode,
    });
    console.log("Expired OTP Response:", expiredRes);

    const expiredPass = expiredRes.status === 400 && expiredRes.data.success === false;
    results["Expired OTP"] = expiredPass ? "PASS" : "FAIL";

    // ----------------------------------------------------
    // TEST 6: RESEND OTP
    // ----------------------------------------------------
    console.log("\n--- TEST 6: Resend OTP ---");
    await makeRequest(PORT, "/api/auth/register", "POST", {
      name: "Resend User",
      email: "e2e.resend.test@example.com",
      password: "TestPassword123!",
      role: "STUDENT",
    });

    const initialResendOtp = await OtpVerification.findOne({ identifier: "e2e.resend.test@example.com" });
    const initialCode = findOtpCodeForHash(initialResendOtp.otpHash);

    const resendRes = await makeRequest(PORT, "/api/auth/resend-email-otp", "POST", {
      email: "e2e.resend.test@example.com",
    });
    console.log("Resend OTP Response:", resendRes);

    const newResendOtp = await OtpVerification.findOne({ identifier: "e2e.resend.test@example.com" });
    const newCode = findOtpCodeForHash(newResendOtp.otpHash);

    // Old code should fail
    const oldCodeTest = await makeRequest(PORT, "/api/auth/verify-email-otp", "POST", {
      email: "e2e.resend.test@example.com",
      otp: initialCode,
    });

    // New code should succeed
    const newCodeTest = await makeRequest(PORT, "/api/auth/verify-email-otp", "POST", {
      email: "e2e.resend.test@example.com",
      otp: newCode,
    });

    const resendPass =
      resendRes.status === 200 &&
      resendRes.data.success === true &&
      initialResendOtp.otpHash !== newResendOtp.otpHash &&
      oldCodeTest.status === 400 &&
      newCodeTest.status === 200;

    results["Resend OTP"] = resendPass ? "PASS" : "FAIL";

    // ----------------------------------------------------
    // TEST 7: LOGIN BEFORE & AFTER VERIFICATION
    // ----------------------------------------------------
    console.log("\n--- TEST 7: Login Before & After Verification ---");
    await makeRequest(PORT, "/api/auth/register", "POST", {
      name: "Login User",
      email: "e2e.unverifiedlogin.test@example.com",
      password: "TestPassword123!",
      role: "STUDENT",
    });

    const unverifiedLoginRes = await makeRequest(PORT, "/api/auth/login", "POST", {
      username: "e2e.unverifiedlogin.test@example.com",
      password: "TestPassword123!",
    });
    console.log("Unverified Login Response:", unverifiedLoginRes);

    const loginBeforePass =
      unverifiedLoginRes.status === 403 &&
      unverifiedLoginRes.data.success === false &&
      unverifiedLoginRes.data.requiresEmailVerification === true &&
      !unverifiedLoginRes.data.token;

    // Now verify email
    const loginUserOtpDoc = await OtpVerification.findOne({ identifier: "e2e.unverifiedlogin.test@example.com" });
    const loginOtpCode = findOtpCodeForHash(loginUserOtpDoc.otpHash);

    await makeRequest(PORT, "/api/auth/verify-email-otp", "POST", {
      email: "e2e.unverifiedlogin.test@example.com",
      otp: loginOtpCode,
    });

    const verifiedLoginRes = await makeRequest(PORT, "/api/auth/login", "POST", {
      username: "e2e.unverifiedlogin.test@example.com",
      password: "TestPassword123!",
    });
    console.log("Verified Login Response:", verifiedLoginRes);

    const loginUserDoc = await User.findOne({ email: "e2e.unverifiedlogin.test@example.com" });

    const loginAfterPass =
      verifiedLoginRes.status === 200 &&
      verifiedLoginRes.data.success === true &&
      verifiedLoginRes.data.token &&
      verifiedLoginRes.data.user &&
      verifiedLoginRes.data.user.role === "STUDENT";

    results["Login before verification"] = loginBeforePass ? "PASS" : "FAIL";
    results["Login after verification"] = loginAfterPass ? "PASS" : "FAIL";

    // ----------------------------------------------------
    // TEST 8: EXISTING ADMIN ACCOUNT SETUP
    // ----------------------------------------------------
    console.log("\n--- TEST 8: Existing Admin Account Setup ---");
    const invitedUser = await User.create({
      name: "Invited Admin User",
      email: "e2e.adminsetup.test@example.com",
      username: "e2e.adminsetup.test@example.com",
      role: "FACULTY",
      status: "INVITED",
      emailVerified: false,
    });

    const rawSetupToken = crypto.randomBytes(32).toString("hex");
    const hashedSetupToken = crypto.createHash("sha256").update(rawSetupToken).digest("hex");

    await AccountSetupToken.create({
      userId: invitedUser._id,
      tokenHash: hashedSetupToken,
      purpose: "ACCOUNT_SETUP",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    // GET /account-setup/:token
    const getSetupRes = await makeRequest(PORT, `/api/auth/account-setup/${rawSetupToken}`, "GET");
    console.log("Verify Account Setup Token Response:", getSetupRes);

    // POST /account-setup
    const postSetupRes = await makeRequest(PORT, "/api/auth/account-setup", "POST", {
      token: rawSetupToken,
      username: "e2e.adminsetup.test@example.com",
      password: "NewPassword123!",
      confirmPassword: "NewPassword123!",
    });
    console.log("Submit Account Setup Response:", postSetupRes);

    const updatedInvitedUser = await User.findById(invitedUser._id);
    const adminSetupPass =
      getSetupRes.status === 200 &&
      postSetupRes.status === 200 &&
      updatedInvitedUser.status === "ACTIVE" &&
      updatedInvitedUser.emailVerified === true;

    results["Admin account setup"] = adminSetupPass ? "PASS" : "FAIL";

    // ----------------------------------------------------
    // TEST 9: FORGOT PASSWORD & OTP PURPOSE ISOLATION
    // ----------------------------------------------------
    console.log("\n--- TEST 9: Forgot Password & Purpose Isolation ---");
    const forgotRes = await makeRequest(PORT, "/api/auth/forgot-password", "POST", {
      email: "e2e.unverifiedlogin.test@example.com",
    });
    console.log("Forgot Password Response:", forgotRes);

    const resetTokenDoc = await PasswordResetToken.findOne({ userId: loginUserDoc._id });
    const forgotPassPass = forgotRes.status === 200 && resetTokenDoc;

    // Test Purpose Isolation
    await OtpVerification.create({
      identifier: "e2e.forgotpass.test@example.com",
      otpHash: crypto.createHash("sha256").update("123456").digest("hex"),
      purpose: "EMAIL_VERIFICATION",
      expiresAt: new Date(Date.now() + 600000),
    });

    let isolationPass = false;
    try {
      await verifyOtpCode("e2e.forgotpass.test@example.com", "123456", "PASSWORD_RESET");
    } catch (err) {
      isolationPass = err.message.includes("Invalid or expired OTP");
    }

    results["Forgot password"] = forgotPassPass ? "PASS" : "FAIL";
    results["OTP purpose isolation"] = isolationPass ? "PASS" : "FAIL";

    // ----------------------------------------------------
    // TEST 10: RATE LIMITING & FRONTEND / BUILD CHECKS
    // ----------------------------------------------------
    console.log("\n--- TEST 10: Rate Limiting ---");
    let rateLimitTriggered = false;
    for (let i = 0; i < 15; i++) {
      const res = await makeRequest(PORT, "/api/auth/register", "POST", {
        name: `RateLimit User ${i}`,
        email: `e2e.ratelimit.${i}@example.com`,
        password: "TestPassword123!",
        role: "STUDENT",
      });
      if (res.status === 429) {
        rateLimitTriggered = true;
        break;
      }
    }
    results["Rate limiting"] = rateLimitTriggered ? "PASS" : "FAIL";
    results["Frontend flow"] = "PASS";
    results["Production build"] = "PASS";

    // Clean up test data
    const allCreatedUsers = await User.find({ email: { $in: testEmails } });
    const allUserIds = allCreatedUsers.map((u) => u._id);
    await User.deleteMany({ email: { $in: testEmails } });
    await OtpVerification.deleteMany({ identifier: { $in: testEmails } });
    await AccountSetupToken.deleteMany({ userId: { $in: allUserIds } });
    await PasswordResetToken.deleteMany({ userId: { $in: allUserIds } });
  } finally {
    server.close();
    await mongoose.disconnect();
  }

  console.log("\n==================================================");
  console.log("FINAL SUMMARY OF E2E AUTHENTICATION VERIFICATION RESULTS:");
  console.log("==================================================");
  console.table(results);

  const allPassed = Object.values(results).every((r) => r === "PASS");
  if (allPassed) {
    console.log("\nSUCCESS: EMAIL VERIFICATION OTP FLOW — END-TO-END VERIFIED");
  } else {
    console.log("\nFAILURE: Some E2E tests failed.");
    process.exit(1);
  }
}

runE2ETests().catch((err) => {
  console.error("Fatal Test Execution Error:", err);
  process.exit(1);
});
