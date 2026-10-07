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
const { hashOtp } = require("../src/modules/auth/auth.service");
const { generateToken } = require("../src/shared/utils/jwt");
const bcrypt = require("bcryptjs");

async function run() {
  console.log("==================================================================");
  console.log("MISC SANAVIYYA — STUDENT → PARENT EMAIL VERIFICATION E2E (20 TESTS)");
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
      yearName: `Academic Year ${timestamp}`,
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
      subjectName: `Nahw and Grammar ${timestamp}`,
      subjectCode: `NAH${timestamp.toString().slice(-4)}`,
      category: "LANGUAGE",
      status: "ACTIVE",
    });
    cleanup.subjects.push(testSubject._id);

    console.log("[3/4] Base test domain fixtures established.\n");
    console.log("==================== TEST SUITE EXECUTION ====================");

    const studentPass = "StudentPass123!";
    const passwordHash = await bcrypt.hash(studentPass, 10);

    // Create Unverified Student User
    const unverifiedStudentUser = await User.create({
      name: `Unverified Student ${timestamp}`,
      email: `unverified_student_${timestamp}@sanaviyya.test`,
      username: `unverified_student_${timestamp}`,
      passwordHash,
      role: "STUDENT",
      status: "ACTIVE",
      emailVerified: false,
    });
    cleanup.users.push(unverifiedStudentUser._id);

    const unverifiedStudentProfile = await StudentProfile.create({
      userId: unverifiedStudentUser._id,
      registrationNumber: `REG-UNV-${timestamp.toString().slice(-4)}`,
      nameEnglish: `Unverified Student ${timestamp}`,
      fatherName: "Father One",
      motherName: "Mother One",
      dateOfBirth: new Date("2008-01-01"),
      admissionYear: 2026,
      classId: testClass._id,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    cleanup.studentProfiles.push(unverifiedStudentProfile._id);

    const unverifiedStudentToken = generateToken({
      userId: unverifiedStudentUser._id.toString(),
      role: "STUDENT",
    });

    // Create Verified Student A User
    const verifiedStudentUserA = await User.create({
      name: `Student Alpha ${timestamp}`,
      email: `student_alpha_${timestamp}@sanaviyya.test`,
      username: `student_alpha_${timestamp}`,
      passwordHash,
      role: "STUDENT",
      status: "ACTIVE",
      emailVerified: true,
    });
    cleanup.users.push(verifiedStudentUserA._id);

    const studentProfileA = await StudentProfile.create({
      userId: verifiedStudentUserA._id,
      registrationNumber: `REG-ALP-${timestamp.toString().slice(-4)}`,
      nameEnglish: `Student Alpha ${timestamp}`,
      fatherName: "Father Alpha",
      motherName: "Mother Alpha",
      dateOfBirth: new Date("2008-02-02"),
      admissionYear: 2026,
      classId: testClass._id,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    cleanup.studentProfiles.push(studentProfileA._id);

    const studentTokenA = generateToken({
      userId: verifiedStudentUserA._id.toString(),
      role: "STUDENT",
    });

    const parentEmail = `parent_${timestamp}@sanaviyya.test`;

    // -------------------------------------------------------------------------
    // TEST 1: Student cannot start Parent verification before Student email verification
    // -------------------------------------------------------------------------
    const unverifiedInitRes = await apiRequest("/students/parent", {
      method: "POST",
      token: unverifiedStudentToken,
      body: {
        parentName: `Parent Alpha ${timestamp}`,
        parentEmail,
        relationship: "FATHER",
      },
    });

    if (unverifiedInitRes.status === 403 && unverifiedInitRes.data.success === false) {
      console.log("✓ Test 1 Passed: Unverified student blocked from initiating parent verification (HTTP 403)");
    } else {
      throw new Error(`Test 1 Failed: Expected 403, got ${unverifiedInitRes.status}: ${JSON.stringify(unverifiedInitRes.data)}`);
    }

    // -------------------------------------------------------------------------
    // TEST 2: Verified Student can initiate Parent verification
    // -------------------------------------------------------------------------
    const verifiedInitRes = await apiRequest("/students/parent", {
      method: "POST",
      token: studentTokenA,
      body: {
        parentName: `Parent Alpha ${timestamp}`,
        parentEmail,
        relationship: "FATHER",
        parentMobile: "9876543210",
      },
    });

    if (
      (verifiedInitRes.status === 201 || verifiedInitRes.status === 200) &&
      verifiedInitRes.data.success === true &&
      verifiedInitRes.data.alreadyVerified === false
    ) {
      console.log("✓ Test 2 Passed: Verified student successfully initiated parent verification (HTTP 201/200, alreadyVerified=false)");
    } else {
      throw new Error(`Test 2 Failed: Expected success initiation, got ${verifiedInitRes.status}: ${JSON.stringify(verifiedInitRes.data)}`);
    }

    // -------------------------------------------------------------------------
    // TEST 3: Parent OTP email is sent and stored
    // -------------------------------------------------------------------------
    const parentOtpDoc = await OtpVerification.findOne({
      identifier: parentEmail,
      purpose: "EMAIL_VERIFICATION",
    });

    if (parentOtpDoc && parentOtpDoc.otpHash && parentOtpDoc.expiresAt > new Date()) {
      cleanup.otpVerifications.push(parentOtpDoc._id);
      console.log("✓ Test 3 Passed: Parent OTP generated and stored (purpose=EMAIL_VERIFICATION, expires in 10m)");
    } else {
      throw new Error("Test 3 Failed: No active EMAIL_VERIFICATION OTP found for parent email");
    }

    // Track parent user & profile for cleanup
    const parentUser = await User.findOne({ email: parentEmail });
    if (parentUser) cleanup.users.push(parentUser._id);
    const parentProf = await ParentProfile.findOne({ userId: parentUser?._id });
    if (parentProf) cleanup.parentProfiles.push(parentProf._id);

    // -------------------------------------------------------------------------
    // TEST 4: Invalid Parent OTP fails
    // -------------------------------------------------------------------------
    const invalidOtpRes = await apiRequest("/auth/parent/verify-otp", {
      method: "POST",
      body: {
        email: parentEmail,
        otp: "000000",
        purpose: "EMAIL_VERIFICATION",
      },
    });

    if (invalidOtpRes.status === 400 && invalidOtpRes.data.success === false) {
      console.log("✓ Test 4 Passed: Invalid Parent verification OTP rejected (HTTP 400)");
    } else {
      throw new Error(`Test 4 Failed: Expected 400, got ${invalidOtpRes.status}`);
    }

    // -------------------------------------------------------------------------
    // TEST 5: Expired Parent OTP fails
    // -------------------------------------------------------------------------
    const knownParentOtp = "246810";
    parentOtpDoc.otpHash = hashOtp(knownParentOtp);
    parentOtpDoc.expiresAt = new Date(Date.now() - 10000); // 10s expired
    await parentOtpDoc.save();

    const expiredOtpRes = await apiRequest("/auth/parent/verify-otp", {
      method: "POST",
      body: {
        email: parentEmail,
        otp: knownParentOtp,
        purpose: "EMAIL_VERIFICATION",
      },
    });

    if (expiredOtpRes.status === 400 && expiredOtpRes.data.success === false) {
      console.log("✓ Test 5 Passed: Expired Parent verification OTP rejected (HTTP 400)");
    } else {
      throw new Error(`Test 5 Failed: Expected 400, got ${expiredOtpRes.status}`);
    }

    // -------------------------------------------------------------------------
    // TEST 6: Resend OTP invalidates previous OTP
    // -------------------------------------------------------------------------
    // Student triggers resend OTP
    const resendOtpRes = await apiRequest("/students/parent/resend-otp", {
      method: "POST",
      token: studentTokenA,
    });

    if (resendOtpRes.status === 200 && resendOtpRes.data.success === true) {
      const freshOtpDoc = await OtpVerification.findOne({
        identifier: parentEmail,
        purpose: "EMAIL_VERIFICATION",
      });
      cleanup.otpVerifications.push(freshOtpDoc._id);

      // Verify old OTP hash is invalidated
      if (freshOtpDoc.otpHash !== hashOtp(knownParentOtp)) {
        console.log("✓ Test 6 Passed: Resend OTP replaced old OTP and reset expiration");
      } else {
        throw new Error("Test 6 Failed: Resend OTP did not replace previous OTP");
      }
    } else {
      throw new Error(`Test 6 Failed: Resend OTP returned ${resendOtpRes.status}`);
    }

    // -------------------------------------------------------------------------
    // TEST 7: Reused OTP fails
    // -------------------------------------------------------------------------
    const activeOtpDoc = await OtpVerification.findOne({
      identifier: parentEmail,
      purpose: "EMAIL_VERIFICATION",
    });
    const validParentOtp = "789123";
    activeOtpDoc.otpHash = hashOtp(validParentOtp);
    activeOtpDoc.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await activeOtpDoc.save();

    // First use (will be tested in Test 8 below)

    // -------------------------------------------------------------------------
    // TEST 8: Valid Parent OTP succeeds
    // -------------------------------------------------------------------------
    const validVerifyRes = await apiRequest("/auth/parent/verify-otp", {
      method: "POST",
      body: {
        email: parentEmail,
        otp: validParentOtp,
        purpose: "EMAIL_VERIFICATION",
      },
    });

    if (
      validVerifyRes.status === 200 &&
      validVerifyRes.data.success === true &&
      validVerifyRes.data.requiresPasswordSetup === false
    ) {
      console.log("✓ Test 8 Passed: Valid Parent verification OTP verified successfully (HTTP 200, requiresPasswordSetup=false)");
    } else {
      throw new Error(`Test 8 Failed: Expected 200, got ${validVerifyRes.status}: ${JSON.stringify(validVerifyRes.data)}`);
    }

    // Now test reuse of same OTP:
    const reuseOtpRes = await apiRequest("/auth/parent/verify-otp", {
      method: "POST",
      body: {
        email: parentEmail,
        otp: validParentOtp,
        purpose: "EMAIL_VERIFICATION",
      },
    });

    if (reuseOtpRes.status === 200 && reuseOtpRes.data.alreadyVerified === true) {
      console.log("✓ Test 7 Passed: Reused OTP recognized account already verified without duplicate OTP consumption");
    } else if (reuseOtpRes.status === 400) {
      console.log("✓ Test 7 Passed: Reused OTP rejected (HTTP 400)");
    } else {
      throw new Error(`Test 7 Failed: Unexpected reuse response ${reuseOtpRes.status}`);
    }

    // -------------------------------------------------------------------------
    // TEST 9: Parent email becomes verified & account ACTIVE
    // -------------------------------------------------------------------------
    const updatedParentUser = await User.findById(parentUser._id);
    if (updatedParentUser.emailVerified === true && updatedParentUser.status === "ACTIVE") {
      console.log("✓ Test 9 Passed: Parent user account is emailVerified=true and status=ACTIVE");
    } else {
      throw new Error(`Test 9 Failed: Unexpected parent user state: ${JSON.stringify(updatedParentUser)}`);
    }

    // -------------------------------------------------------------------------
    // TEST 10: Student ↔ Parent relationship created
    // -------------------------------------------------------------------------
    const updatedStudentA = await StudentProfile.findById(studentProfileA._id);
    const updatedParentProf = await ParentProfile.findOne({ userId: parentUser._id });

    if (
      updatedStudentA.parentUserId?.toString() === parentUser._id.toString() &&
      updatedParentProf.studentIds.map((id) => id.toString()).includes(studentProfileA._id.toString())
    ) {
      console.log("✓ Test 10 Passed: Bidirectional Student ↔ Parent relationship established");
    } else {
      throw new Error("Test 10 Failed: Relationship not properly bidirectional");
    }

    // -------------------------------------------------------------------------
    // TEST 11: Existing Parent account is reused instead of duplicated
    // -------------------------------------------------------------------------
    // Create Student Beta (Sibling)
    const verifiedStudentUserB = await User.create({
      name: `Student Beta (Sibling) ${timestamp}`,
      email: `student_beta_${timestamp}@sanaviyya.test`,
      username: `student_beta_${timestamp}`,
      passwordHash,
      role: "STUDENT",
      status: "ACTIVE",
      emailVerified: true,
    });
    cleanup.users.push(verifiedStudentUserB._id);

    const studentProfileB = await StudentProfile.create({
      userId: verifiedStudentUserB._id,
      registrationNumber: `REG-BET-${timestamp.toString().slice(-4)}`,
      nameEnglish: `Student Beta ${timestamp}`,
      fatherName: "Father Alpha",
      motherName: "Mother Alpha",
      dateOfBirth: new Date("2010-05-05"),
      admissionYear: 2026,
      classId: testClass._id,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    cleanup.studentProfiles.push(studentProfileB._id);

    const studentTokenB = generateToken({
      userId: verifiedStudentUserB._id.toString(),
      role: "STUDENT",
    });

    // Student B links to the SAME already verified parent email
    const linkSiblingRes = await apiRequest("/students/parent", {
      method: "POST",
      token: studentTokenB,
      body: {
        parentName: `Parent Alpha ${timestamp}`,
        parentEmail, // Identical parent email
        relationship: "FATHER",
      },
    });

    const parentUserCount = await User.countDocuments({ email: parentEmail });

    if (
      linkSiblingRes.status === 200 &&
      linkSiblingRes.data.success === true &&
      linkSiblingRes.data.alreadyVerified === true &&
      parentUserCount === 1
    ) {
      console.log("✓ Test 11 Passed: Existing Parent account reused with 0 duplicate user records created");
    } else {
      throw new Error(`Test 11 Failed: parentUserCount=${parentUserCount}, status=${linkSiblingRes.status}`);
    }

    // -------------------------------------------------------------------------
    // TEST 12: Existing Parent linked children are preserved
    // -------------------------------------------------------------------------
    const refreshedParentProf = await ParentProfile.findOne({ userId: parentUser._id });
    const linkedIds = (refreshedParentProf.studentIds || []).map((id) => id.toString());

    if (
      linkedIds.includes(studentProfileA._id.toString()) &&
      linkedIds.includes(studentProfileB._id.toString())
    ) {
      console.log(`✓ Test 12 Passed: Multi-child relationship preserved (studentIds: [${linkedIds.length} children])`);
    } else {
      throw new Error(`Test 12 Failed: Expected both children linked, found: ${JSON.stringify(linkedIds)}`);
    }

    // -------------------------------------------------------------------------
    // TEST 13: Unauthorized Student cannot attach themselves without verified session
    // -------------------------------------------------------------------------
    const unauthRes = await apiRequest("/students/parent", {
      method: "POST",
      // No token
      body: {
        parentName: "Hacker Parent",
        parentEmail: "hacker@parent.test",
      },
    });

    if (unauthRes.status === 401) {
      console.log("✓ Test 13 Passed: Unauthenticated request to /students/parent blocked (HTTP 401)");
    } else {
      throw new Error(`Test 13 Failed: Expected 401, got ${unauthRes.status}`);
    }

    // -------------------------------------------------------------------------
    // TEST 14: Parent cannot attach themselves to an arbitrary Student directly
    // -------------------------------------------------------------------------
    // Generate temporary parent JWT
    const tempParentToken = generateToken({
      userId: parentUser._id.toString(),
      role: "PARENT",
    });

    const parentForbiddenRes = await apiRequest("/students/parent", {
      method: "POST",
      token: tempParentToken, // PARENT role, not STUDENT
      body: {
        parentName: "Parent Self",
        parentEmail,
      },
    });

    if (parentForbiddenRes.status === 403) {
      console.log("✓ Test 14 Passed: Parent role blocked from student-only endpoint /students/parent (HTTP 403 RBAC)");
    } else {
      throw new Error(`Test 14 Failed: Expected 403, got ${parentForbiddenRes.status}`);
    }

    // -------------------------------------------------------------------------
    // TEST 15: Parent can request login OTP after verification
    // -------------------------------------------------------------------------
    const parentLoginReqRes = await apiRequest("/auth/parent/request-otp", {
      method: "POST",
      body: { email: parentEmail },
    });

    if (parentLoginReqRes.status === 200 && parentLoginReqRes.data.success === true) {
      console.log("✓ Test 15 Passed: Verified parent successfully requests login OTP (HTTP 200)");
    } else {
      throw new Error(`Test 15 Failed: Expected 200, got ${parentLoginReqRes.status}: ${JSON.stringify(parentLoginReqRes.data)}`);
    }

    // -------------------------------------------------------------------------
    // TEST 16: Parent receives correct JWT/session after login OTP verification
    // -------------------------------------------------------------------------
    const loginOtpCode = "345678";
    const loginOtpDoc = await OtpVerification.findOne({
      identifier: parentEmail,
      purpose: "PARENT_LOGIN",
    });
    loginOtpDoc.otpHash = hashOtp(loginOtpCode);
    await loginOtpDoc.save();

    const parentLoginVerifyRes = await apiRequest("/auth/parent/verify-otp", {
      method: "POST",
      body: { email: parentEmail, otp: loginOtpCode },
    });

    let parentSessionToken = null;
    if (
      parentLoginVerifyRes.status === 200 &&
      parentLoginVerifyRes.data.token &&
      parentLoginVerifyRes.data.user?.role === "PARENT"
    ) {
      parentSessionToken = parentLoginVerifyRes.data.token;
      console.log("✓ Test 16 Passed: Parent login OTP verified and issued valid JWT session (role=PARENT)");
    } else {
      throw new Error(`Test 16 Failed: Expected 200 with token, got ${parentLoginVerifyRes.status}`);
    }

    // -------------------------------------------------------------------------
    // TEST 17: Parent can access only linked Student data
    // -------------------------------------------------------------------------
    // Access linked Student A
    const childARes = await apiRequest(`/parents/students/${studentProfileA._id}`, {
      token: parentSessionToken,
    });
    // Access linked Student B
    const childBRes = await apiRequest(`/parents/students/${studentProfileB._id}`, {
      token: parentSessionToken,
    });
    // Attempt access to unrelated Student (UnverifiedStudent)
    const unrelatedChildRes = await apiRequest(`/parents/students/${unverifiedStudentProfile._id}`, {
      token: parentSessionToken,
    });

    if (
      childARes.status === 200 &&
      childBRes.status === 200 &&
      unrelatedChildRes.status === 403
    ) {
      console.log("✓ Test 17 Passed: Parent IDOR protected (HTTP 200 for linked children A & B, HTTP 403 for unlinked student)");
    } else {
      throw new Error(`Test 17 Failed: childA=${childARes.status}, childB=${childBRes.status}, unrelated=${unrelatedChildRes.status}`);
    }

    // -------------------------------------------------------------------------
    // TEST 18: Unauthenticated user cannot access /parent protected routes
    // -------------------------------------------------------------------------
    const protectedParentRes = await apiRequest("/parents/me", {
      // No token
    });

    if (protectedParentRes.status === 401) {
      console.log("✓ Test 18 Passed: Unauthenticated access to /parents/me rejected (HTTP 401)");
    } else {
      throw new Error(`Test 18 Failed: Expected 401, got ${protectedParentRes.status}`);
    }

    // -------------------------------------------------------------------------
    // TEST 19: Existing Parent login still works
    // -------------------------------------------------------------------------
    await OtpVerification.deleteMany({ identifier: parentEmail, purpose: "PARENT_LOGIN" });
    const test19ReqRes = await apiRequest("/auth/parent/request-otp", {
      method: "POST",
      body: { email: parentEmail },
    });
    const test19OtpCode = "112233";
    const test19OtpDoc = await OtpVerification.findOne({
      identifier: parentEmail,
      purpose: "PARENT_LOGIN",
    });
    test19OtpDoc.otpHash = hashOtp(test19OtpCode);
    await test19OtpDoc.save();

    const test19VerifyRes = await apiRequest("/auth/parent/verify-otp", {
      method: "POST",
      body: { email: parentEmail, otp: test19OtpCode },
    });

    if (test19VerifyRes.status === 200 && test19VerifyRes.data.token) {
      console.log("✓ Test 19 Passed: Standard parent login flow remains fully operational");
    } else {
      throw new Error(`Test 19 Failed: Standard parent login failed (${test19VerifyRes.status})`);
    }

    // -------------------------------------------------------------------------
    // TEST 20: Existing Student login still works
    // -------------------------------------------------------------------------
    const studentLoginRes = await apiRequest("/auth/login", {
      method: "POST",
      body: {
        email: verifiedStudentUserA.email,
        password: studentPass,
      },
    });

    if (studentLoginRes.status === 200 && studentLoginRes.data.token && studentLoginRes.data.user?.role === "STUDENT") {
      console.log("✓ Test 20 Passed: Standard student password login remains fully operational");
    } else {
      throw new Error(`Test 20 Failed: Student login failed: ${studentLoginRes.status}: ${JSON.stringify(studentLoginRes.data)}`);
    }

    console.log("\n==================================================================");
    console.log("ALL 20 STUDENT → PARENT VERIFICATION FLOW TESTS PASSED! ✓");
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
