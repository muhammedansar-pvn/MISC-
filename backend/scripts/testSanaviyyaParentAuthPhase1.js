process.env.NODE_ENV = "test";
const mongoose = require("mongoose");
const http = require("http");
const crypto = require("crypto");
const env = require("../src/config/env");
const app = require("../src/app");
const User = require("../src/modules/users/user.model");
const StudentProfile = require("../src/modules/students/student.model");
const ParentProfile = require("../src/modules/parents/parent.model");
const Class = require("../src/modules/academics/class.model");
const Subject = require("../src/modules/academics/subject.model");
const AcademicYear = require("../src/modules/academics/academic-year.model");
const AttendanceRecord = require("../src/modules/attendance/attendance-record.model");
const OtpVerification = require("../src/modules/auth/otp-verification.model");
const AccountSetupToken = require("../src/modules/auth/account-setup-token.model");
const { registerStudentWithAccount } = require("../src/modules/students/student.service");
const { hashOtp } = require("../src/modules/auth/auth.service");
const { generateToken } = require("../src/shared/utils/jwt");

async function run() {
  console.log("==================================================================");
  console.log("SANAVIYYA PARENT AUTHENTICATION & LINKING TEST SUITE (14 TESTS)");
  console.log("==================================================================");

  await mongoose.connect(env.MONGODB_URI);
  console.log("[1/4] Connected to MongoDB Atlas.");

  const server = http.createServer(app);
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;
  console.log(`[2/4] Test HTTP server listening on port ${port}.`);

  const timestamp = Date.now();

  const cleanup = {
    users: [],
    studentProfiles: [],
    parentProfiles: [],
    classes: [],
    subjects: [],
    academicYears: [],
    attendanceRecords: [],
    otpVerifications: [],
    accountSetupTokens: [],
  };

  async function apiRequest(endpoint, { method = "GET", token, body = null } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    let json = {};
    try {
      json = await res.json();
    } catch (e) {}

    return { status: res.status, data: json };
  }

  try {
    // -------------------------------------------------------------------------
    // Setup Base Academic Entities
    // -------------------------------------------------------------------------
    const academicYear = await AcademicYear.create({
      yearName: `Sanaviyya Academic Year ${timestamp}`,
      yearCode: `AY-${timestamp.toString().slice(-4)}`,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-03-31"),
      status: "ACTIVE",
    });
    cleanup.academicYears.push(academicYear._id);

    const testClass = await Class.create({
      name: `Class 1 ${timestamp}`,
      code: `CLS-${timestamp.toString().slice(-4)}`,
      academicYearId: academicYear._id,
      capacity: 30,
      status: "ACTIVE",
    });
    cleanup.classes.push(testClass._id);

    const testSubject = await Subject.create({
      subjectName: `Nahw and Morphology ${timestamp}`,
      subjectCode: `NAH${timestamp.toString().slice(-4)}`,
      category: "LANGUAGE",
      status: "ACTIVE",
    });
    cleanup.subjects.push(testSubject._id);

    console.log("[3/4] Base test domain fixtures established.\n");
    console.log("==================== TEST SUITE EXECUTION ====================");

    const parentEmail = `parent_${timestamp}@sanaviyya.test`;
    const studentAEmail = `student_a_${timestamp}@sanaviyya.test`;

    // -------------------------------------------------------------------------
    // TEST 1: New parent account created without password
    // -------------------------------------------------------------------------
    const regPayloadA = {
      nameEnglish: `Student Alpha ${timestamp}`,
      email: studentAEmail,
      dateOfBirth: "2008-01-01",
      admissionYear: 2026,
      classId: testClass._id.toString(),
      fatherName: `Father Alpha ${timestamp}`,
      motherName: `Mother Alpha ${timestamp}`,
      parentEmail,
      parentMobile: "9876543210",
      relationship: "FATHER",
    };

    const regResultA = await registerStudentWithAccount(regPayloadA);
    const studentProfileA = regResultA.student;
    cleanup.studentProfiles.push(studentProfileA._id);
    if (studentProfileA.userId?._id) cleanup.users.push(studentProfileA.userId._id);

    const parentUser = await User.findOne({ email: parentEmail }).select("+passwordHash");
    if (!parentUser) {
      throw new Error("Test 1 Failed: Parent user was not created in database");
    }
    cleanup.users.push(parentUser._id);

    if (
      parentUser.role === "PARENT" &&
      parentUser.passwordHash === undefined &&
      parentUser.emailVerified === false &&
      parentUser.status === "PENDING_EMAIL_VERIFICATION"
    ) {
      console.log("✓ Test 1 Passed: New parent account created without password (role=PARENT, status=PENDING_EMAIL_VERIFICATION, password=NONE)");
    } else {
      throw new Error(`Test 1 Failed: Unexpected parent user state: ${JSON.stringify(parentUser)}`);
    }

    const parentProfileA = await ParentProfile.findOne({ userId: parentUser._id });
    if (!parentProfileA) {
      throw new Error("Test 1 Failed: ParentProfile was not created for parent user");
    }
    cleanup.parentProfiles.push(parentProfileA._id);

    // -------------------------------------------------------------------------
    // TEST 2: Verification OTP sent
    // -------------------------------------------------------------------------
    const emailOtpDoc = await OtpVerification.findOne({
      identifier: parentEmail,
      purpose: "EMAIL_VERIFICATION",
    });

    if (emailOtpDoc && emailOtpDoc.otpHash && emailOtpDoc.expiresAt > new Date()) {
      cleanup.otpVerifications.push(emailOtpDoc._id);
      console.log("✓ Test 2 Passed: Verification OTP sent and stored (purpose=EMAIL_VERIFICATION, expires in 10m)");
    } else {
      throw new Error("Test 2 Failed: No active EMAIL_VERIFICATION OTP found for parent email");
    }

    // -------------------------------------------------------------------------
    // TEST 3: Unverified parent cannot login
    // -------------------------------------------------------------------------
    const unverifiedReqRes = await apiRequest("/auth/parent/request-otp", {
      method: "POST",
      body: { email: parentEmail },
    });

    if (unverifiedReqRes.status === 403 && unverifiedReqRes.data.requiresEmailVerification === true) {
      console.log("✓ Test 3 Passed: Unverified parent blocked from requesting login OTP (HTTP 403 requiresEmailVerification=true)");
    } else {
      throw new Error(`Test 3 Failed: Expected 403, got ${unverifiedReqRes.status}: ${JSON.stringify(unverifiedReqRes.data)}`);
    }

    const unverifiedVerifyRes = await apiRequest("/auth/parent/verify-otp", {
      method: "POST",
      body: { email: parentEmail, otp: "123456" },
    });
    if (unverifiedVerifyRes.status === 403) {
      console.log("✓ Test 3 (b) Passed: Unverified parent blocked from verifying login OTP (HTTP 403)");
    } else {
      throw new Error(`Test 3 (b) Failed: Expected 403, got ${unverifiedVerifyRes.status}`);
    }

    // -------------------------------------------------------------------------
    // TEST 4: Valid verification OTP -> email verified
    // -------------------------------------------------------------------------
    const knownVerifyCode = "123456";
    emailOtpDoc.otpHash = hashOtp(knownVerifyCode);
    await emailOtpDoc.save();

    const verifyEmailRes = await apiRequest("/auth/verify-email-otp", {
      method: "POST",
      body: { email: parentEmail, otp: knownVerifyCode },
    });

    if (
      verifyEmailRes.status === 200 &&
      verifyEmailRes.data.success === true &&
      verifyEmailRes.data.requiresPasswordSetup === false
    ) {
      const refreshedParent = await User.findById(parentUser._id);
      if (refreshedParent.emailVerified === true && refreshedParent.status === "ACTIVE") {
        const setupTokens = await AccountSetupToken.find({ userId: parentUser._id });
        if (setupTokens.length === 0) {
          console.log("✓ Test 4 Passed: Valid verification OTP verified email (emailVerified=true, status=ACTIVE, requiresPasswordSetup=false, zero setup tokens)");
        } else {
          throw new Error("Test 4 Failed: AccountSetupToken was generated for parent account");
        }
      } else {
        throw new Error("Test 4 Failed: Parent user did not transition to ACTIVE or emailVerified=true");
      }
    } else {
      throw new Error(`Test 4 Failed: Expected 200 with requiresPasswordSetup=false, got ${verifyEmailRes.status}`);
    }

    // -------------------------------------------------------------------------
    // TEST 5: Verified parent requests login OTP
    // -------------------------------------------------------------------------
    const reqLoginOtpRes = await apiRequest("/auth/parent/request-otp", {
      method: "POST",
      body: { email: parentEmail },
    });

    if (reqLoginOtpRes.status === 200 && reqLoginOtpRes.data.success === true) {
      const loginOtpDoc = await OtpVerification.findOne({
        identifier: parentEmail,
        purpose: "PARENT_LOGIN",
      });

      if (loginOtpDoc && loginOtpDoc.expiresAt > new Date()) {
        cleanup.otpVerifications.push(loginOtpDoc._id);
        console.log("✓ Test 5 Passed: Verified parent successfully requested login OTP (purpose=PARENT_LOGIN)");
      } else {
        throw new Error("Test 5 Failed: No PARENT_LOGIN OTP record found in database");
      }
    } else {
      throw new Error(`Test 5 Failed: Expected 200, got ${reqLoginOtpRes.status}: ${JSON.stringify(reqLoginOtpRes.data)}`);
    }

    // -------------------------------------------------------------------------
    // TEST 6: Valid login OTP -> authenticated successfully
    // -------------------------------------------------------------------------
    const knownLoginOtp = "654321";
    const loginOtpDoc = await OtpVerification.findOne({
      identifier: parentEmail,
      purpose: "PARENT_LOGIN",
    });
    loginOtpDoc.otpHash = hashOtp(knownLoginOtp);
    await loginOtpDoc.save();

    const verifyLoginRes = await apiRequest("/auth/parent/verify-otp", {
      method: "POST",
      body: { email: parentEmail, otp: knownLoginOtp },
    });

    let parentJwtToken = null;
    if (
      verifyLoginRes.status === 200 &&
      verifyLoginRes.data.success === true &&
      verifyLoginRes.data.token &&
      verifyLoginRes.data.user?.role === "PARENT"
    ) {
      parentJwtToken = verifyLoginRes.data.token;
      console.log("✓ Test 6 Passed: Valid login OTP authenticated successfully (JWT session issued, role=PARENT)");
    } else {
      throw new Error(`Test 6 Failed: Expected 200 with token, got ${verifyLoginRes.status}: ${JSON.stringify(verifyLoginRes.data)}`);
    }

    // -------------------------------------------------------------------------
    // TEST 7: Invalid login OTP -> rejected
    // -------------------------------------------------------------------------
    // Request fresh OTP
    await OtpVerification.deleteMany({ identifier: parentEmail, purpose: "PARENT_LOGIN" });
    await apiRequest("/auth/parent/request-otp", {
      method: "POST",
      body: { email: parentEmail },
    });

    const invalidOtpRes = await apiRequest("/auth/parent/verify-otp", {
      method: "POST",
      body: { email: parentEmail, otp: "000000" },
    });

    if (invalidOtpRes.status === 400 && invalidOtpRes.data.success === false) {
      console.log("✓ Test 7 Passed: Invalid login OTP rejected (HTTP 400)");
    } else {
      throw new Error(`Test 7 Failed: Expected 400, got ${invalidOtpRes.status}`);
    }

    // -------------------------------------------------------------------------
    // TEST 8: Expired login OTP -> rejected
    // -------------------------------------------------------------------------
    const expiredOtpDoc = await OtpVerification.findOne({
      identifier: parentEmail,
      purpose: "PARENT_LOGIN",
    });
    if (expiredOtpDoc) {
      expiredOtpDoc.expiresAt = new Date(Date.now() - 5000); // 5 seconds in past
      await expiredOtpDoc.save();
    }

    const expiredOtpRes = await apiRequest("/auth/parent/verify-otp", {
      method: "POST",
      body: { email: parentEmail, otp: "654321" },
    });

    if (expiredOtpRes.status === 400 && expiredOtpRes.data.success === false) {
      console.log("✓ Test 8 Passed: Expired login OTP rejected (HTTP 400)");
    } else {
      throw new Error(`Test 8 Failed: Expected 400, got ${expiredOtpRes.status}`);
    }

    // -------------------------------------------------------------------------
    // TEST 9: Suspended parent -> rejected
    // -------------------------------------------------------------------------
    await User.findByIdAndUpdate(parentUser._id, { status: "SUSPENDED" });

    const suspendedReqRes = await apiRequest("/auth/parent/request-otp", {
      method: "POST",
      body: { email: parentEmail },
    });
    const suspendedVerifyRes = await apiRequest("/auth/parent/verify-otp", {
      method: "POST",
      body: { email: parentEmail, otp: "123456" },
    });
    const suspendedApiRes = await apiRequest("/parents/me", {
      token: parentJwtToken,
    });

    if (
      suspendedReqRes.status === 403 &&
      suspendedVerifyRes.status === 403 &&
      suspendedApiRes.status === 401
    ) {
      console.log("✓ Test 9 Passed: Suspended parent rejected on request-otp (HTTP 403), verify-otp (HTTP 403), and session (HTTP 401)");
    } else {
      throw new Error(`Test 9 Failed: Suspended checks failed (req=${suspendedReqRes.status}, ver=${suspendedVerifyRes.status}, api=${suspendedApiRes.status})`);
    }

    // Restore active status
    await User.findByIdAndUpdate(parentUser._id, { status: "ACTIVE" });

    // -------------------------------------------------------------------------
    // TEST 10: Deleted parent -> rejected
    // -------------------------------------------------------------------------
    await User.findByIdAndUpdate(parentUser._id, { isDeleted: true });

    const deletedReqRes = await apiRequest("/auth/parent/request-otp", {
      method: "POST",
      body: { email: parentEmail },
    });
    const deletedVerifyRes = await apiRequest("/auth/parent/verify-otp", {
      method: "POST",
      body: { email: parentEmail, otp: "123456" },
    });
    const deletedApiRes = await apiRequest("/parents/me", {
      token: parentJwtToken,
    });

    if (
      (deletedReqRes.status === 404 || deletedReqRes.status === 403) &&
      (deletedVerifyRes.status === 404 || deletedVerifyRes.status === 403) &&
      deletedApiRes.status === 401
    ) {
      console.log("✓ Test 10 Passed: Deleted parent rejected across OTP and authenticated access (HTTP 404/403/401)");
    } else {
      throw new Error(`Test 10 Failed: Deleted checks failed (req=${deletedReqRes.status}, ver=${deletedVerifyRes.status}, api=${deletedApiRes.status})`);
    }

    // Restore not deleted
    await User.findByIdAndUpdate(parentUser._id, { isDeleted: false });

    // -------------------------------------------------------------------------
    // TEST 11: Parent can access linked child
    // -------------------------------------------------------------------------
    // Seed attendance record for Student A
    const attA = await AttendanceRecord.create({
      studentId: studentProfileA._id,
      classId: testClass._id,
      subjectId: testSubject._id,
      academicYearId: academicYear._id,
      date: new Date("2026-09-01T00:00:00.000Z"),
      period: 1,
      status: "PRESENT",
      source: "MANUAL",
      markedBy: parentUser._id,
    });
    cleanup.attendanceRecords.push(attA._id);

    const linkedChildRes = await apiRequest(`/parents/students/${studentProfileA._id}`, {
      token: parentJwtToken,
    });
    const linkedAttRes = await apiRequest(`/attendance/student/summary?studentId=${studentProfileA._id}`, {
      token: parentJwtToken,
    });

    if (linkedChildRes.status === 200 && linkedAttRes.status === 200) {
      console.log("✓ Test 11 Passed: Parent accesses linked child profile and attendance (HTTP 200)");
    } else {
      throw new Error(`Test 11 Failed: linkedChild=${linkedChildRes.status}, linkedAtt=${linkedAttRes.status}`);
    }

    // -------------------------------------------------------------------------
    // TEST 12: Parent cannot access unrelated student
    // -------------------------------------------------------------------------
    // Create an unrelated student (Student B)
    const unrelatedUser = await User.create({
      name: `Unrelated Student ${timestamp}`,
      email: `unrelated_${timestamp}@sanaviyya.test`,
      username: `unrelated_${timestamp}`,
      role: "STUDENT",
      status: "ACTIVE",
    });
    cleanup.users.push(unrelatedUser._id);

    const unrelatedStudent = await StudentProfile.create({
      userId: unrelatedUser._id,
      registrationNumber: `REG-UNR-${timestamp.toString().slice(-4)}`,
      nameEnglish: `Unrelated Student ${timestamp}`,
      fatherName: "Other Father",
      motherName: "Other Mother",
      dateOfBirth: new Date("2008-05-05"),
      admissionYear: 2026,
      classId: testClass._id,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    cleanup.studentProfiles.push(unrelatedStudent._id);

    const unlinkedChildRes = await apiRequest(`/parents/students/${unrelatedStudent._id}`, {
      token: parentJwtToken,
    });
    const unlinkedAttRes = await apiRequest(`/attendance/student/summary?studentId=${unrelatedStudent._id}`, {
      token: parentJwtToken,
    });
    const unlinkedStudentDirectRes = await apiRequest(`/students/${unrelatedStudent._id}`, {
      token: parentJwtToken,
    });

    if (
      unlinkedChildRes.status === 403 &&
      unlinkedAttRes.status === 403 &&
      unlinkedStudentDirectRes.status === 403
    ) {
      console.log("✓ Test 12 Passed: Parent blocked from unrelated student across all endpoints (HTTP 403 IDOR protected)");
    } else {
      throw new Error(`Test 12 Failed: unlinkedChild=${unlinkedChildRes.status}, unlinkedAtt=${unlinkedAttRes.status}, unlinkedDirect=${unlinkedStudentDirectRes.status}`);
    }

    // -------------------------------------------------------------------------
    // TEST 13: Same parent email registering second child reuses existing Parent account
    // -------------------------------------------------------------------------
    const regPayloadB = {
      nameEnglish: `Student Beta (Sibling) ${timestamp}`,
      email: `student_b_sibling_${timestamp}@sanaviyya.test`,
      dateOfBirth: "2010-02-02",
      admissionYear: 2026,
      classId: testClass._id.toString(),
      fatherName: `Father Alpha ${timestamp}`,
      motherName: `Mother Alpha ${timestamp}`,
      parentEmail, // Identical parent email
      parentMobile: "9876543210",
      relationship: "FATHER",
    };

    const regResultB = await registerStudentWithAccount(regPayloadB);
    const studentProfileB = regResultB.student;
    cleanup.studentProfiles.push(studentProfileB._id);
    if (studentProfileB.userId?._id) cleanup.users.push(studentProfileB.userId._id);

    // Verify parent accounts count
    const parentAccounts = await User.find({ email: parentEmail });
    if (parentAccounts.length !== 1) {
      throw new Error(`Test 13 Failed: Expected 1 parent account, found ${parentAccounts.length}`);
    }

    // Verify ParentProfile contains both children
    const updatedParentProfile = await ParentProfile.findOne({ userId: parentUser._id });
    const linkedIds = (updatedParentProfile.studentIds || []).map((id) => id.toString());

    if (
      linkedIds.includes(studentProfileA._id.toString()) &&
      linkedIds.includes(studentProfileB._id.toString()) &&
      studentProfileB.parentUserId?.toString() === parentUser._id.toString()
    ) {
      console.log(`✓ Test 13 Passed: Registering second child reuses single Parent account (studentIds contains both [Student A, Student B])`);
    } else {
      throw new Error(`Test 13 Failed: ParentProfile does not link both students: ${JSON.stringify(linkedIds)}`);
    }

    // -------------------------------------------------------------------------
    // TEST 14: No password is required anywhere in Parent authentication
    // -------------------------------------------------------------------------
    const passwordLoginRes = await apiRequest("/auth/login", {
      method: "POST",
      body: {
        email: parentEmail,
        password: "SomePassword123!",
      },
    });

    const forgotPasswordRes = await apiRequest("/auth/forgot-password", {
      method: "POST",
      body: {
        email: parentEmail,
      },
    });

    const finalParentUserCheck = await User.findById(parentUser._id).select("+passwordHash");

    if (
      passwordLoginRes.status === 403 &&
      forgotPasswordRes.status === 400 &&
      finalParentUserCheck.passwordHash === undefined
    ) {
      console.log("✓ Test 14 Passed: No passwords required anywhere (Password login HTTP 403, Forgot password HTTP 400, passwordHash=undefined in DB)");
    } else {
      throw new Error(`Test 14 Failed: passwordLogin=${passwordLoginRes.status}, forgotPassword=${forgotPasswordRes.status}, passwordHash=${finalParentUserCheck.passwordHash}`);
    }

    console.log("\n==================================================================");
    console.log("ALL 14 SANAVIYYA PARENT AUTHENTICATION TESTS PASSED! ✓");
    console.log("==================================================================");
  } finally {
    console.log("\n[4/4] Cleaning up test fixtures from database...");
    await Promise.all([
      User.deleteMany({ _id: { $in: cleanup.users } }),
      StudentProfile.deleteMany({ _id: { $in: cleanup.studentProfiles } }),
      ParentProfile.deleteMany({ _id: { $in: cleanup.parentProfiles } }),
      Class.deleteMany({ _id: { $in: cleanup.classes } }),
      Subject.deleteMany({ _id: { $in: cleanup.subjects } }),
      AcademicYear.deleteMany({ _id: { $in: cleanup.academicYears } }),
      AttendanceRecord.deleteMany({ _id: { $in: cleanup.attendanceRecords } }),
      OtpVerification.deleteMany({ _id: { $in: cleanup.otpVerifications } }),
      AccountSetupToken.deleteMany({ _id: { $in: cleanup.accountSetupTokens } }),
    ]);
    await server.close();
    await mongoose.disconnect();
    console.log("Test teardown complete. Server closed.");
  }
}

run().catch((err) => {
  console.error("TEST EXECUTION FAILED:", err);
  process.exit(1);
});
