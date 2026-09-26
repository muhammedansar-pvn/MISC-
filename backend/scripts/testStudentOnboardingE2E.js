const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const crypto = require("crypto");
const User = require("../src/modules/users/user.model");
const StudentProfile = require("../src/modules/students/student.model");
const OtpVerification = require("../src/modules/auth/otp-verification.model");
const AccountSetupToken = require("../src/modules/auth/account-setup-token.model");
const { registerStudentWithAccount } = require("../src/modules/students/student.service");
const {
  verifyEmailOtp,
  verifyAccountSetupToken,
  accountSetup,
  resendAccountSetupLink,
  login,
} = require("../src/modules/auth/auth.controller");
const { generateAccountSetupToken } = require("../src/modules/auth/auth.service");

// Helper to simulate express req/res
function mockReqRes(body = {}, params = {}, query = {}) {
  const req = { body, params, query };
  let statusCode = 200;
  let responseData = null;

  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    json(data) {
      responseData = data;
      return res;
    },
    getStatus: () => statusCode,
    getData: () => responseData,
  };

  return { req, res };
}

async function runOnboardingTests() {
  console.log("==========================================================================");
  console.log("TEST SUITE: Student Registration -> OTP -> Password Setup Onboarding Flow");
  console.log("==========================================================================\n");

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("ERROR: MONGODB_URI not found in backend/.env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("[Setup] Connected to database.\n");

  const testSuffix = Date.now();
  const testEmail = `student.onboarding.${testSuffix}@example.com`;
  let testUserId = null;
  let testProfileId = null;

  try {
    // ------------------------------------------------------------------------
    // Step 1: Admin registers new student
    // ------------------------------------------------------------------------
    console.log("[STEP 1] Admin registers new student...");
    const regResult = await registerStudentWithAccount({
      email: testEmail,
      nameEnglish: "Zaid Muhammad",
      dateOfBirth: "2006-05-15",
      admissionYear: 2026,
      fatherName: "Muhammad Ali",
      motherName: "Fatima",
      contactNumber: "9876543210",
    });

    testUserId = regResult.student.userId._id;
    testProfileId = regResult.student._id;

    console.log(`[STEP 1] Created user ID: ${testUserId}, registration: ${regResult.student.registrationNumber}`);

    // Verify initial user state
    const userDoc = await User.findById(testUserId).select("+passwordHash");
    if (userDoc.status !== "PENDING_SETUP") {
      throw new Error(`Expected user status PENDING_SETUP, got: ${userDoc.status}`);
    }
    if (userDoc.emailVerified !== false) {
      throw new Error(`Expected emailVerified to be false, got: ${userDoc.emailVerified}`);
    }
    if (userDoc.passwordHash) {
      throw new Error(`Expected no passwordHash before setup, but found passwordHash.`);
    }
    console.log("  PASS: User created with status: PENDING_SETUP, emailVerified: false, no passwordHash.\n");

    // ------------------------------------------------------------------------
    // Step 2: Attempt login before email verification -> Must be rejected
    // ------------------------------------------------------------------------
    console.log("[STEP 2] Verifying login is rejected for unverified account...");
    const { req: reqLoginPre, res: resLoginPre } = mockReqRes({
      email: testEmail,
      password: "AnyPassword123!",
    });
    await login(reqLoginPre, resLoginPre);
    if (resLoginPre.getStatus() !== 403) {
      throw new Error(`Expected 403 on pre-verification login, got: ${resLoginPre.getStatus()}`);
    }
    console.log(`  PASS: Login blocked with status ${resLoginPre.getStatus()}: ${resLoginPre.getData()?.message}\n`);

    // ------------------------------------------------------------------------
    // Step 3: Student receives OTP and verifies email
    // ------------------------------------------------------------------------
    console.log("[STEP 3] Verifying Email OTP...");
    const otpDoc = await OtpVerification.findOne({
      identifier: testEmail.toLowerCase(),
      purpose: "EMAIL_VERIFICATION",
      verifiedAt: null,
    }).sort({ createdAt: -1 });

    if (!otpDoc) {
      throw new Error("No OtpVerification record found for registered student.");
    }

    // Overwrite with a known OTP hash for deterministic testing
    const testOtpCode = "654321";
    otpDoc.otpHash = crypto.createHash("sha256").update(testOtpCode).digest("hex");
    otpDoc.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await otpDoc.save();

    const { req: reqOtp, res: resOtp } = mockReqRes({
      email: testEmail,
      otp: testOtpCode,
    });
    await verifyEmailOtp(reqOtp, resOtp);

    const otpResData = resOtp.getData();
    if (resOtp.getStatus() !== 200 || !otpResData.success) {
      throw new Error(`verifyEmailOtp failed: ${JSON.stringify(otpResData)}`);
    }
    if (!otpResData.requiresPasswordSetup) {
      throw new Error(`Expected requiresPasswordSetup: true, got: ${otpResData.requiresPasswordSetup}`);
    }

    // Verify DB state after OTP
    const userAfterOtp = await User.findById(testUserId).select("+passwordHash");
    if (userAfterOtp.emailVerified !== true) {
      throw new Error(`Expected emailVerified: true, got: ${userAfterOtp.emailVerified}`);
    }
    if (userAfterOtp.status !== "PENDING_SETUP") {
      throw new Error(`Account must REMAIN in PENDING_SETUP before password setup, got: ${userAfterOtp.status}`);
    }
    if (userAfterOtp.passwordHash) {
      throw new Error("User must NOT have a password hash before setting one.");
    }

    // Check AccountSetupToken was generated
    const setupTokenDoc = await AccountSetupToken.findOne({
      userId: testUserId,
      usedAt: null,
    });
    if (!setupTokenDoc) {
      throw new Error("AccountSetupToken was not generated in DB after OTP verification!");
    }
    console.log(`  PASS: OTP verified. User emailVerified: true, status stays PENDING_SETUP.`);
    console.log(`  PASS: AccountSetupToken generated with expiresAt: ${setupTokenDoc.expiresAt.toISOString()}\n`);

    // ------------------------------------------------------------------------
    // Step 4: Login attempt before password setup -> Must be rejected (Account setup not completed)
    // ------------------------------------------------------------------------
    console.log("[STEP 4] Verifying login is rejected when password is not set...");
    const { req: reqLoginPreSetup, res: resLoginPreSetup } = mockReqRes({
      email: testEmail,
      password: "Password123!",
    });
    await login(reqLoginPreSetup, resLoginPreSetup);
    if (resLoginPreSetup.getStatus() !== 403) {
      throw new Error(`Expected 403 for unset password login, got: ${resLoginPreSetup.getStatus()}`);
    }
    console.log(`  PASS: Login blocked with status 403: ${resLoginPreSetup.getData()?.message}\n`);

    // ------------------------------------------------------------------------
    // Step 5: Test Resend Setup Link (Rate limit check)
    // ------------------------------------------------------------------------
    console.log("[STEP 5] Testing Resend Setup Link rate limiting...");
    const { req: reqResend1, res: resResend1 } = mockReqRes({ email: testEmail });
    await resendAccountSetupLink(reqResend1, resResend1);
    if (resResend1.getStatus() !== 429) {
      throw new Error(`Expected 429 rate limit when resending setup link within 60s, got: ${resResend1.getStatus()}`);
    }
    console.log(`  PASS: Rate limit correctly enforced: ${resResend1.getData()?.message}\n`);

    // ------------------------------------------------------------------------
    // Step 6: Verify Account Setup Token endpoint
    // ------------------------------------------------------------------------
    console.log("[STEP 6] Testing Token Verification endpoint...");
    // Let's generate a known token for test
    const { rawToken } = await generateAccountSetupToken(testUserId);

    // Test with invalid token
    const { req: reqInvalidToken, res: resInvalidToken } = mockReqRes({}, { token: "invalidtoken123" });
    await verifyAccountSetupToken(reqInvalidToken, resInvalidToken);
    if (resInvalidToken.getStatus() !== 400) {
      throw new Error(`Expected 400 for invalid token, got: ${resInvalidToken.getStatus()}`);
    }
    console.log("  PASS: Invalid token rejected with status 400.");

    // Test with valid token
    const { req: reqValidToken, res: resValidToken } = mockReqRes({}, { token: rawToken });
    await verifyAccountSetupToken(reqValidToken, resValidToken);
    if (resValidToken.getStatus() !== 200 || !resValidToken.getData()?.valid) {
      throw new Error(`Expected valid token to return 200, got: ${resValidToken.getStatus()}`);
    }
    console.log(`  PASS: Valid setup token verified for user: ${resValidToken.getData()?.user?.email}\n`);

    // ------------------------------------------------------------------------
    // Step 7: Complete Password Setup
    // ------------------------------------------------------------------------
    console.log("[STEP 7] Completing Account Setup / Set Password...");
    const newPassword = "StrongPassword@2026";
    const customUsername = `zaid_${testSuffix}`;

    const { req: reqSetup, res: resSetup } = mockReqRes({
      token: rawToken,
      username: customUsername,
      password: newPassword,
      confirmPassword: newPassword,
    });
    await accountSetup(reqSetup, resSetup);

    if (resSetup.getStatus() !== 200) {
      throw new Error(`accountSetup failed with status ${resSetup.getStatus()}: ${JSON.stringify(resSetup.getData())}`);
    }

    // Verify DB state after password setup
    const userAfterSetup = await User.findById(testUserId).select("+passwordHash");
    if (userAfterSetup.status !== "ACTIVE") {
      throw new Error(`Expected status ACTIVE, got: ${userAfterSetup.status}`);
    }
    if (!userAfterSetup.passwordHash) {
      throw new Error("Expected passwordHash to be set after setup.");
    }
    if (userAfterSetup.username !== customUsername) {
      throw new Error(`Expected username ${customUsername}, got: ${userAfterSetup.username}`);
    }

    const tokenDocAfterSetup = await AccountSetupToken.findOne({ userId: testUserId });
    if (!tokenDocAfterSetup.usedAt) {
      throw new Error("Expected setupTokenDoc.usedAt to be populated.");
    }
    console.log(`  PASS: Account is now ACTIVE. Username: ${userAfterSetup.username}, password hashed.`);
    console.log(`  PASS: Setup token marked usedAt: ${tokenDocAfterSetup.usedAt.toISOString()}\n`);

    // ------------------------------------------------------------------------
    // Step 8: Re-using the token must fail
    // ------------------------------------------------------------------------
    console.log("[STEP 8] Verifying token reuse is rejected...");
    const { req: reqReuse, res: resReuse } = mockReqRes({
      token: rawToken,
      password: "AnotherPassword123!",
      confirmPassword: "AnotherPassword123!",
    });
    await accountSetup(reqReuse, resReuse);
    if (resReuse.getStatus() !== 400) {
      throw new Error(`Expected 400 when reusing setup token, got: ${resReuse.getStatus()}`);
    }
    console.log(`  PASS: Token reuse blocked: ${resReuse.getData()?.message}\n`);

    // ------------------------------------------------------------------------
    // Step 9: Login with newly created credentials
    // ------------------------------------------------------------------------
    console.log("[STEP 9] Testing normal login with newly setup password...");
    const { req: reqLoginFinal, res: resLoginFinal } = mockReqRes({
      email: testEmail,
      password: newPassword,
    });
    await login(reqLoginFinal, resLoginFinal);

    if (resLoginFinal.getStatus() !== 200) {
      throw new Error(`Login failed with status ${resLoginFinal.getStatus()}: ${JSON.stringify(resLoginFinal.getData())}`);
    }

    const loginData = resLoginFinal.getData();
    if (!loginData.token || !loginData.user || loginData.user.status !== "ACTIVE") {
      throw new Error(`Invalid login payload: ${JSON.stringify(loginData)}`);
    }
    console.log(`  PASS: Login successful! JWT generated, user role: ${loginData.user.role}, status: ${loginData.user.status}\n`);

    console.log("==========================================================================");
    console.log("SUCCESS: All Student Onboarding Flow E2E Tests Passed Perfectly!");
    console.log("==========================================================================");
  } catch (error) {
    console.error("\nTEST SUITE FAILED with error:", error);
    process.exit(1);
  } finally {
    // Cleanup test data
    console.log("\n[Cleanup] Cleaning up test records...");
    if (testUserId) {
      await User.findByIdAndDelete(testUserId);
      await StudentProfile.deleteMany({ userId: testUserId });
      await AccountSetupToken.deleteMany({ userId: testUserId });
      await OtpVerification.deleteMany({ identifier: testEmail.toLowerCase() });
    }
    await mongoose.disconnect();
    console.log("[Cleanup] Database disconnected.");
  }
}

runOnboardingTests();
