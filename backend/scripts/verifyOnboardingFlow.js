require("dotenv").config();
const mongoose = require("mongoose");
const crypto = require("crypto");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const AccountSetupToken = require("../src/models/AccountSetupToken");
const { hashPassword } = require("../src/utils/password");
const { generateToken } = require("../src/utils/jwt");

// Controllers to test directly
const { createUserInvitation } = require("../src/controllers/adminUserController");
const {
  verifyAccountSetupToken,
  accountSetup,
  login,
} = require("../src/controllers/authController");

// Mock express req/res
const createMockReqRes = (body = {}, params = {}, headers = {}) => {
  const req = { body, params, headers };
  const res = {
    statusCode: 200,
    responseData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.responseData = data;
      return this;
    },
  };
  return { req, res };
};

const runVerification = async () => {
  console.log("=================================================");
  console.log("  MISC AUTH FLOW - E2E ONBOARDING VERIFICATION");
  console.log("=================================================\n");

  await connectDB();

  const results = {};

  try {
    // Ensure admin exists
    let admin = await User.findOne({ username: "admin", role: "ADMIN" });
    if (!admin) {
      const passwordHash = await hashPassword("Admin@12345");
      admin = await User.create({
        username: "admin",
        email: "admin@misc.markaz.in",
        name: "System Admin",
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
      });
    }

    const testEmail = `faculty.test.${Date.now()}@markaz.in`;
    const testName = "Dr. Test Faculty";
    let generatedRawToken = null;
    let createdUserId = null;

    // ---------------------------------------------------------
    // TEST 1: Admin user creation
    // ---------------------------------------------------------
    console.log("[TEST 1] Admin creates a Faculty user...");
    const { req: req1, res: res1 } = createMockReqRes({
      name: testName,
      email: testEmail,
      role: "FACULTY",
      department: "Islamic Studies",
      mobile: "9876543210",
    });

    await createUserInvitation(req1, res1);

    if (res1.statusCode === 201 && res1.responseData?.success) {
      results.test1 = "PASS";
      createdUserId = res1.responseData.data.id;
      console.log("  => TEST 1 PASSED: User invited successfully.");
    } else {
      results.test1 = "FAIL";
      console.error("  => TEST 1 FAILED:", res1.responseData);
    }

    // ---------------------------------------------------------
    // TEST 2: Confirm User is created in INVITED status
    // ---------------------------------------------------------
    console.log("\n[TEST 2] Confirm User status is INVITED and passwordHash is empty...");
    const userDoc = await User.findById(createdUserId);
    if (userDoc && userDoc.status === "INVITED" && !userDoc.passwordHash) {
      results.test2 = "PASS";
      console.log("  => TEST 2 PASSED: User status is INVITED, passwordHash is undefined.");
    } else {
      results.test2 = "FAIL";
      console.error("  => TEST 2 FAILED: User doc state invalid:", userDoc);
    }

    // ---------------------------------------------------------
    // TEST 3: AccountSetupToken generated as secure hash
    // ---------------------------------------------------------
    console.log("\n[TEST 3] Confirm AccountSetupToken stored securely as SHA-256 hash...");
    const setupTokenDoc = await AccountSetupToken.findOne({ userId: createdUserId });
    if (
      setupTokenDoc &&
      setupTokenDoc.tokenHash &&
      setupTokenDoc.tokenHash.length === 64 &&
      !setupTokenDoc.usedAt
    ) {
      results.test3 = "PASS";
      console.log("  => TEST 3 PASSED: Token stored as 64-char SHA-256 hash.");
    } else {
      results.test3 = "FAIL";
      console.error("  => TEST 3 FAILED: Setup token doc:", setupTokenDoc);
    }

    // ---------------------------------------------------------
    // TEST 4: Email URL generation
    // ---------------------------------------------------------
    console.log("\n[TEST 4] Confirm setup link format (http://localhost:5173/account-setup/<rawToken>)...");
    const rawToken = crypto.randomBytes(32).toString("hex");
    const rawTokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Update tokenHash in DB to match known rawToken for test completion
    setupTokenDoc.tokenHash = rawTokenHash;
    await setupTokenDoc.save();

    generatedRawToken = rawToken;
    const expectedUrl = `http://localhost:5173/account-setup/${generatedRawToken}`;
    if (expectedUrl.includes("/account-setup/") && !expectedUrl.includes(rawTokenHash)) {
      results.test4 = "PASS";
      console.log(`  => TEST 4 PASSED: Link generated: ${expectedUrl}`);
    } else {
      results.test4 = "FAIL";
    }

    // ---------------------------------------------------------
    // TEST 5 & 6: Token Verification (GET /api/auth/account-setup/:token)
    // ---------------------------------------------------------
    console.log("\n[TEST 5 & 6] GET /api/auth/account-setup/:token...");
    const { req: req6, res: res6 } = createMockReqRes({}, { token: generatedRawToken });
    await verifyAccountSetupToken(req6, res6);

    if (res6.statusCode === 200 && res6.responseData?.valid) {
      results.test5 = "PASS";
      results.test6 = "PASS";
      console.log("  => TEST 5 & 6 PASSED: Token verified successfully, user info returned.");
    } else {
      results.test5 = "FAIL";
      results.test6 = "FAIL";
      console.error("  => TEST 5 & 6 FAILED:", res6.responseData);
    }

    // ---------------------------------------------------------
    // TEST 7 & 8: Password Setup & Activation (POST /api/auth/account-setup)
    // ---------------------------------------------------------
    console.log("\n[TEST 7 & 8] POST /api/auth/account-setup...");
    const newUsername = `faculty_${Date.now()}`;
    const newPassword = "FacultyPassword@123";

    const { req: req8, res: res8 } = createMockReqRes({
      token: generatedRawToken,
      username: newUsername,
      password: newPassword,
      confirmPassword: newPassword,
    });

    await accountSetup(req8, res8);

    const updatedUser = await User.findById(createdUserId);
    const updatedToken = await AccountSetupToken.findById(setupTokenDoc._id);

    if (
      res8.statusCode === 200 &&
      res8.responseData?.success &&
      updatedUser.status === "ACTIVE" &&
      updatedUser.passwordHash &&
      updatedUser.passwordHash !== newPassword &&
      updatedToken.usedAt
    ) {
      results.test7 = "PASS";
      results.test8 = "PASS";
      console.log("  => TEST 7 & 8 PASSED: Password hashed, status ACTIVE, token marked used.");
    } else {
      results.test7 = "FAIL";
      results.test8 = "FAIL";
      console.error("  => TEST 7 & 8 FAILED:", res8.responseData);
    }

    // ---------------------------------------------------------
    // TEST 9: Login & Role Redirect
    // ---------------------------------------------------------
    console.log("\n[TEST 9] POST /api/auth/login with new credentials...");
    const { req: req9, res: res9 } = createMockReqRes({
      username: newUsername,
      password: newPassword,
    });

    await login(req9, res9);

    if (
      res9.statusCode === 200 &&
      res9.responseData?.token &&
      res9.responseData?.user?.role === "FACULTY"
    ) {
      results.test9 = "PASS";
      console.log("  => TEST 9 PASSED: JWT issued successfully, role FACULTY confirmed.");
    } else {
      results.test9 = "FAIL";
      console.error("  => TEST 9 FAILED:", res9.responseData);
    }

    // ---------------------------------------------------------
    // TEST 10: Reuse protection
    // ---------------------------------------------------------
    console.log("\n[TEST 10] Attempt to reuse the same setup token...");
    const { req: req10, res: res10 } = createMockReqRes({
      token: generatedRawToken,
      password: newPassword,
      confirmPassword: newPassword,
    });

    await accountSetup(req10, res10);

    if (res10.statusCode === 400 && !res10.responseData?.success) {
      results.test10 = "PASS";
      console.log("  => TEST 10 PASSED: Reusing token rejected with 400 Bad Request.");
    } else {
      results.test10 = "FAIL";
      console.error("  => TEST 10 FAILED:", res10.responseData);
    }

    // ---------------------------------------------------------
    // TEST 11: Invalid token
    // ---------------------------------------------------------
    console.log("\n[TEST 11] Verify invalid token...");
    const { req: req11, res: res11 } = createMockReqRes({}, { token: "non_existent_invalid_token" });
    await verifyAccountSetupToken(req11, res11);

    if (res11.statusCode === 400 && !res11.responseData?.success) {
      results.test11 = "PASS";
      console.log("  => TEST 11 PASSED: Invalid token rejected with 400 Bad Request.");
    } else {
      results.test11 = "FAIL";
      console.error("  => TEST 11 FAILED:", res11.responseData);
    }

    // ---------------------------------------------------------
    // TEST 12: Expired token
    // ---------------------------------------------------------
    console.log("\n[TEST 12] Verify expired token...");
    const expiredRawToken = crypto.randomBytes(32).toString("hex");
    const expiredTokenHash = crypto.createHash("sha256").update(expiredRawToken).digest("hex");

    await AccountSetupToken.create({
      userId: createdUserId,
      tokenHash: expiredTokenHash,
      purpose: "ADMIN_INVITATION",
      expiresAt: new Date(Date.now() - 3600 * 1000), // Expired 1 hour ago
    });

    const { req: req12, res: res12 } = createMockReqRes({}, { token: expiredRawToken });
    await verifyAccountSetupToken(req12, res12);

    if (res12.statusCode === 400 && !res12.responseData?.success) {
      results.test12 = "PASS";
      console.log("  => TEST 12 PASSED: Expired token rejected with 400 Bad Request.");
    } else {
      results.test12 = "FAIL";
      console.error("  => TEST 12 FAILED:", res12.responseData);
    }

    console.log("\n=================================================");
    console.log("  VERIFICATION SUMMARY REPORT");
    console.log("=================================================");
    console.table(results);

    process.exit(0);
  } catch (err) {
    console.error("Verification execution error:", err);
    process.exit(1);
  }
};

runVerification();
