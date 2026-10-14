const assert = require("assert");
const bcrypt = require("bcryptjs");
const User = require("../src/modules/users/user.model");
const FacultyProfile = require("../src/modules/faculty/faculty.model");
const OtpVerification = require("../src/modules/auth/otp-verification.model");
const emailService = require("../src/shared/services/email.service");

let emailSentDetails = null;
emailService.sendOtpEmail = async (identifier, rawOtp, purpose, options) => {
  emailSentDetails = { identifier, rawOtp, purpose, options };
  return { success: true };
};

const authController = require("../src/modules/auth/auth.controller");

// Helper to create mock response object
function createMockRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return res;
}

async function runTestSuite() {
  console.log("==================================================================");
  console.log("TEST SUITE: ADMIN DIRECT LOGIN & 2FA ROLE COMPATIBILITY AUDIT");
  console.log("==================================================================\n");

  const originalFindOne = User.findOne;
  const originalFacultyFindOne = FacultyProfile.findOne;
  const originalOtpFindOne = OtpVerification.findOne;
  const originalOtpDeleteMany = OtpVerification.deleteMany;
  const originalOtpCreate = OtpVerification.create;
  const originalSendOtpEmail = emailService.sendOtpEmail;

  FacultyProfile.findOne = () => ({
    select: () => ({
      lean: () => Promise.resolve({ status: "ACTIVE", isDeleted: false }),
    }),
  });

  let otpCreatedDoc = null;
  OtpVerification.findOne = () => ({
    sort: () => Promise.resolve(null),
  });
  OtpVerification.deleteMany = () => Promise.resolve({ deletedCount: 0 });
  OtpVerification.create = async (doc) => {
    otpCreatedDoc = doc;
    return doc;
  };

  const samplePassword = "SecurePassword123!";
  const sampleHash = await bcrypt.hash(samplePassword, 10);

  function mockDbUser(userRecord) {
    User.findOne = () => ({
      select: () => Promise.resolve(userRecord),
    });
  }

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    otpCreatedDoc = null;
    emailSentDetails = null;
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}`);
      console.error(err);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: ADMIN logs in directly with username/password (No 2FA)
    // -------------------------------------------------------------
    await test("TEST 1: ADMIN logs in directly without 2FA or OTP generation", async () => {
      const mockAdmin = {
        _id: "660000000000000000000001",
        username: "admin_test",
        email: "admin@markazsanaviyya.org",
        name: "Main Administrator",
        role: "ADMIN",
        status: "ACTIVE",
        isDeleted: false,
        emailVerified: true,
        passwordHash: sampleHash,
        save: async () => {},
      };
      mockDbUser(mockAdmin);

      const req = {
        body: { username: "admin_test", password: samplePassword },
      };
      const res = createMockRes();

      await authController.login(req, res);

      assert.strictEqual(res.statusCode, 200, "Expected status 200");
      assert.strictEqual(res.body.success, true, "Expected success true");
      assert.strictEqual(res.body.message, "Login successful", "Expected 'Login successful'");
      assert.ok(res.body.token, "Expected valid JWT token");
      assert.strictEqual(res.body.user.role, "ADMIN", "Expected user.role ADMIN");
      assert.strictEqual(res.body.requires2FA, undefined, "Expected requires2FA not to be set");
      assert.strictEqual(otpCreatedDoc, null, "Expected sendAndStoreOtp NOT to create OTP doc for ADMIN");
      assert.strictEqual(emailSentDetails, null, "Expected no 2FA OTP email for ADMIN");
    });

    // -------------------------------------------------------------
    // TEST 2: ADMIN ignores client-passed requires2FA: true
    // -------------------------------------------------------------
    await test("TEST 2: ADMIN ignores requires2FA: true in payload and logs in directly", async () => {
      const mockAdmin = {
        _id: "660000000000000000000001",
        username: "admin_test",
        email: "admin@markazsanaviyya.org",
        name: "Main Administrator",
        role: "ADMIN",
        status: "ACTIVE",
        isDeleted: false,
        emailVerified: true,
        passwordHash: sampleHash,
        save: async () => {},
      };
      mockDbUser(mockAdmin);

      const req = {
        body: { username: "admin_test", password: samplePassword, requires2FA: true },
      };
      const res = createMockRes();

      await authController.login(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.requires2FA, undefined);
      assert.ok(res.body.token);
      assert.strictEqual(otpCreatedDoc, null, "OTP must not be created");
      assert.strictEqual(emailSentDetails, null, "OTP email must not be sent");
    });

    // -------------------------------------------------------------
    // TEST 3: ADMIN with twoFactorEnabled: true still logs in directly
    // -------------------------------------------------------------
    await test("TEST 3: ADMIN with twoFactorEnabled: true in DB logs in directly", async () => {
      const mockAdmin = {
        _id: "660000000000000000000001",
        username: "admin_test",
        email: "admin@markazsanaviyya.org",
        name: "Main Administrator",
        role: "ADMIN",
        status: "ACTIVE",
        isDeleted: false,
        emailVerified: true,
        twoFactorEnabled: true,
        passwordHash: sampleHash,
        save: async () => {},
      };
      mockDbUser(mockAdmin);

      const req = {
        body: { username: "admin_test", password: samplePassword },
      };
      const res = createMockRes();

      await authController.login(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.requires2FA, undefined);
      assert.ok(res.body.token);
      assert.strictEqual(otpCreatedDoc, null, "OTP must not be created");
      assert.strictEqual(emailSentDetails, null, "OTP email must not be sent");
    });

    // -------------------------------------------------------------
    // TEST 4: ADMIN with incorrect password returns 401
    // -------------------------------------------------------------
    await test("TEST 4: ADMIN with incorrect password returns 401 Unauthorized", async () => {
      const mockAdmin = {
        _id: "660000000000000000000001",
        username: "admin_test",
        email: "admin@markazsanaviyya.org",
        role: "ADMIN",
        status: "ACTIVE",
        isDeleted: false,
        passwordHash: sampleHash,
      };
      mockDbUser(mockAdmin);

      const req = {
        body: { username: "admin_test", password: "WrongPassword999!" },
      };
      const res = createMockRes();

      await authController.login(req, res);

      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, "Invalid username or password");
    });

    // -------------------------------------------------------------
    // TEST 5: ADMIN with inactive status returns 403
    // -------------------------------------------------------------
    await test("TEST 5: ADMIN with inactive status returns 403 Account is not active", async () => {
      const mockAdmin = {
        _id: "660000000000000000000001",
        username: "admin_test",
        email: "admin@markazsanaviyya.org",
        role: "ADMIN",
        status: "INACTIVE",
        isDeleted: false,
        passwordHash: sampleHash,
      };
      mockDbUser(mockAdmin);

      const req = {
        body: { username: "admin_test", password: samplePassword },
      };
      const res = createMockRes();

      await authController.login(req, res);

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, "Account is not active");
    });

    // -------------------------------------------------------------
    // TEST 6: PRINCIPAL enforces 2FA and generates OTP
    // -------------------------------------------------------------
    await test("TEST 6: PRINCIPAL still unconditionally enforces 2FA OTP", async () => {
      const mockPrincipal = {
        _id: "660000000000000000000002",
        username: "principal_test",
        email: "principal@markazsanaviyya.org",
        name: "College Principal",
        role: "PRINCIPAL",
        status: "ACTIVE",
        isDeleted: false,
        emailVerified: true,
        passwordHash: sampleHash,
      };
      mockDbUser(mockPrincipal);

      const req = {
        body: { username: "principal_test", password: samplePassword },
      };
      const res = createMockRes();

      await authController.login(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.requires2FA, true);
      assert.ok(res.body.verificationId, "Expected verificationId");
      assert.ok(otpCreatedDoc, "Expected OTP record to be created in DB");
      assert.strictEqual(otpCreatedDoc.purpose, "LOGIN_2FA");
      assert.ok(emailSentDetails, "Expected email to be sent");
      assert.strictEqual(emailSentDetails.purpose, "LOGIN_2FA");
    });

    // -------------------------------------------------------------
    // TEST 7: HOD enforces 2FA and generates OTP
    // -------------------------------------------------------------
    await test("TEST 7: HOD still unconditionally enforces 2FA OTP", async () => {
      const mockHOD = {
        _id: "660000000000000000000003",
        username: "hod_test",
        email: "hod@markazsanaviyya.org",
        name: "Department Head",
        role: "HOD",
        status: "ACTIVE",
        isDeleted: false,
        emailVerified: true,
        passwordHash: sampleHash,
      };
      mockDbUser(mockHOD);

      const req = {
        body: { username: "hod_test", password: samplePassword },
      };
      const res = createMockRes();

      await authController.login(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.requires2FA, true);
      assert.ok(res.body.verificationId, "Expected verificationId");
      assert.ok(otpCreatedDoc, "Expected OTP record to be created in DB");
      assert.strictEqual(otpCreatedDoc.purpose, "LOGIN_2FA");
      assert.ok(emailSentDetails, "Expected email to be sent");
    });

    // -------------------------------------------------------------
    // TEST 8: FACULTY without 2FA logs in directly
    // -------------------------------------------------------------
    await test("TEST 8: FACULTY without 2FA enabled logs in directly with token", async () => {
      const mockFaculty = {
        _id: "660000000000000000000004",
        username: "faculty_test",
        email: "faculty@markazsanaviyya.org",
        name: "Usthad Faculty",
        role: "FACULTY",
        status: "ACTIVE",
        isDeleted: false,
        emailVerified: true,
        twoFactorEnabled: false,
        passwordHash: sampleHash,
      };
      mockDbUser(mockFaculty);

      const req = {
        body: { username: "faculty_test", password: samplePassword },
      };
      const res = createMockRes();

      await authController.login(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.requires2FA, undefined);
      assert.ok(res.body.token);
      assert.strictEqual(otpCreatedDoc, null);
      assert.strictEqual(emailSentDetails, null);
    });

    // -------------------------------------------------------------
    // TEST 9: FACULTY with twoFactorEnabled: true triggers 2FA
    // -------------------------------------------------------------
    await test("TEST 9: FACULTY with twoFactorEnabled: true triggers 2FA", async () => {
      const mockFaculty2FA = {
        _id: "660000000000000000000005",
        username: "faculty_2fa",
        email: "faculty2fa@markazsanaviyya.org",
        name: "Usthad Faculty 2FA",
        role: "FACULTY",
        status: "ACTIVE",
        isDeleted: false,
        emailVerified: true,
        twoFactorEnabled: true,
        passwordHash: sampleHash,
      };
      mockDbUser(mockFaculty2FA);

      const req = {
        body: { username: "faculty_2fa", password: samplePassword },
      };
      const res = createMockRes();

      await authController.login(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.requires2FA, true);
      assert.ok(res.body.verificationId);
      assert.ok(otpCreatedDoc);
      assert.strictEqual(otpCreatedDoc.purpose, "LOGIN_2FA");
      assert.ok(emailSentDetails);
    });
  } finally {
    // Restore mocks
    User.findOne = originalFindOne;
    FacultyProfile.findOne = originalFacultyFindOne;
    OtpVerification.findOne = originalOtpFindOne;
    OtpVerification.deleteMany = originalOtpDeleteMany;
    OtpVerification.create = originalOtpCreate;
    emailService.sendOtpEmail = originalSendOtpEmail;
  }

  console.log("\n==================================================================");
  console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Unhandled error in test runner:", err);
  process.exit(1);
});
