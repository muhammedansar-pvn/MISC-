const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const http = require("http");
const app = require("../src/app");
const User = require("../src/modules/users/user.model");
const StudentProfile = require("../src/modules/students/student.model");
const AcademicYear = require("../src/modules/academics/academic-year.model");
const Exam = require("../src/modules/exams/exam.model");
const ExamRegistration = require("../src/modules/exams/exam-registration.model");
const { generateToken } = require("../src/shared/utils/jwt");

async function runVerification() {
  console.log("==================================================================");
  console.log("PHASE 0 VERIFICATION: STUDENT JWT RESOLUTION & SPOOFING OVERRIDE");
  console.log("==================================================================\n");

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("FATAL: MONGODB_URI missing from environment");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("[1/5] Connected to MongoDB Atlas.");

  // Spin up an ephemeral HTTP server running the real app
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;
  console.log(`[2/5] Test HTTP server listening on port ${port}.`);

  const cleanupUserIds = [];
  const cleanupProfileIds = [];
  const cleanupExamIds = [];
  const cleanupRegIds = [];
  const cleanupYearIds = [];

  try {
    const timestamp = Date.now();

    // 1. Create a test AcademicYear and Exams
    const academicYear = await AcademicYear.create({
      yearName: `Test Year ${timestamp}`,
      yearCode: `TY${timestamp.toString().slice(-4)}`,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-03-31"),
      isCurrent: false,
      status: "ACTIVE",
    });
    cleanupYearIds.push(academicYear._id);

    const exam1 = await Exam.create({
      title: `Test Exam 1 ${timestamp}`,
      code: `EX1-${timestamp.toString().slice(-4)}`,
      academicYearId: academicYear._id,
      startDate: new Date("2026-10-01"),
      endDate: new Date("2026-10-15"),
      status: "SCHEDULED",
    });
    cleanupExamIds.push(exam1._id);

    const exam2 = await Exam.create({
      title: `Test Exam 2 ${timestamp}`,
      code: `EX2-${timestamp.toString().slice(-4)}`,
      academicYearId: academicYear._id,
      startDate: new Date("2026-11-01"),
      endDate: new Date("2026-11-15"),
      status: "SCHEDULED",
    });
    cleanupExamIds.push(exam2._id);

    // 2. Create Student A (The legitimate caller)
    const userA = await User.create({
      name: "Student Alpha",
      email: `student.alpha.${timestamp}@markaz.in`,
      username: `student.alpha.${timestamp}`,
      role: "STUDENT",
      status: "ACTIVE",
      emailVerified: true,
    });
    cleanupUserIds.push(userA._id);

    const profileA = await StudentProfile.create({
      userId: userA._id,
      registrationNumber: `REG-A-${timestamp.toString().slice(-4)}`,
      nameEnglish: "Student Alpha",
      dateOfBirth: new Date("2008-01-15"),
      admissionYear: 2026,
      fatherName: "Father Alpha",
      motherName: "Mother Alpha",
      disciplineScore: 100,
    });
    cleanupProfileIds.push(profileA._id);

    // 3. Create Student B (A different student)
    const userB = await User.create({
      name: "Student Beta",
      email: `student.beta.${timestamp}@markaz.in`,
      username: `student.beta.${timestamp}`,
      role: "STUDENT",
      status: "ACTIVE",
      emailVerified: true,
    });
    cleanupUserIds.push(userB._id);

    const profileB = await StudentProfile.create({
      userId: userB._id,
      registrationNumber: `REG-B-${timestamp.toString().slice(-4)}`,
      nameEnglish: "Student Beta",
      dateOfBirth: new Date("2008-05-20"),
      admissionYear: 2026,
      fatherName: "Father Beta",
      motherName: "Mother Beta",
      disciplineScore: 100,
    });
    cleanupProfileIds.push(profileB._id);

    console.log(`[3/5] Test entities established:`);
    console.log(`      Student A (Legitimate User): User._id = ${userA._id}, StudentProfile._id = ${profileA._id}`);
    console.log(`      Student B (Victim/Target):   User._id = ${userB._id}, StudentProfile._id = ${profileB._id}`);

    // Generate real JWT token for Student A
    const tokenA = generateToken({
      userId: userA._id.toString(),
      role: "STUDENT",
    });

    // -------------------------------------------------------------------------
    // TEST 1: User Model -> StudentProfile._id Resolution
    // Calling POST /api/exams/exam-registrations without studentId in body.
    // -------------------------------------------------------------------------
    console.log(`\n--- TEST 1: Resolving StudentProfile._id from JWT via User._id lookup ---`);
    const res1 = await fetch(`${baseUrl}/exams/exam-registrations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        examId: exam1._id.toString(),
      }),
    });

    const body1 = await res1.json();
    console.log(`HTTP Status: ${res1.status}`);
    console.log(`Response Body:`, JSON.stringify(body1, null, 2));

    if (body1.data && body1.data._id) {
      cleanupRegIds.push(body1.data._id);
    }

    const test1Passed =
      res1.status === 201 &&
      body1.success === true &&
      body1.data &&
      body1.data.studentId === profileA._id.toString();

    console.log(`Verification:`);
    console.log(`  - Expected studentId: ${profileA._id.toString()}`);
    console.log(`  - Actual studentId:   ${body1.data?.studentId}`);
    console.log(`  - Result: ${test1Passed ? "PASSED (Resolved via StudentProfile.findOne({ userId: decoded.userId }))" : "FAILED"}`);

    if (!test1Passed) {
      throw new Error("Test 1 Failed: studentId was not correctly resolved from JWT context");
    }

    // -------------------------------------------------------------------------
    // TEST 2: Anti-Spoofing & Override Verification
    // Student A sends a request with studentId explicitly set to Student B's profile ID!
    // Server must ignore/overwrite body.studentId with authenticated studentA profileId.
    // -------------------------------------------------------------------------
    console.log(`\n--- TEST 2: Anti-Spoofing: Client body contains Student B's studentId ---`);
    const res2 = await fetch(`${baseUrl}/exams/exam-registrations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        examId: exam2._id.toString(),
        studentId: profileB._id.toString(), // ATTACK: attempting to register Student B!
      }),
    });

    const body2 = await res2.json();
    console.log(`HTTP Status: ${res2.status}`);
    console.log(`Response Body:`, JSON.stringify(body2, null, 2));

    if (body2.data && body2.data._id) {
      cleanupRegIds.push(body2.data._id);
    }

    // Inspect database record directly to verify what was stored
    const dbRecord2 = await ExamRegistration.findById(body2.data?._id).lean();

    const test2Passed =
      res2.status === 201 &&
      body2.success === true &&
      body2.data &&
      body2.data.studentId === profileA._id.toString() &&
      dbRecord2.studentId.toString() === profileA._id.toString() &&
      dbRecord2.studentId.toString() !== profileB._id.toString();

    console.log(`Verification:`);
    console.log(`  - Attacker injected studentId:  ${profileB._id.toString()}`);
    console.log(`  - Server resolved studentId:    ${body2.data?.studentId}`);
    console.log(`  - DB persisted studentId:       ${dbRecord2?.studentId.toString()}`);
    console.log(`  - Result: ${test2Passed ? "PASSED (Injected studentId was strictly overridden with token's studentId)" : "FAILED"}`);

    if (!test2Passed) {
      throw new Error("Test 2 Failed: Injected studentId was not overridden by server-side identity");
    }

    console.log("\n==================================================================");
    console.log("ALL PHASE 0 VERIFICATION CHECKS COMPLETED SUCCESSFULLY!");
    console.log("==================================================================");
  } catch (error) {
    console.error("\nTEST SUITE ERROR:", error);
    process.exitCode = 1;
  } finally {
    // Teardown test documents
    console.log("\n[4/5] Cleaning up temporary test documents...");
    await Promise.all([
      User.deleteMany({ _id: { $in: cleanupUserIds } }),
      StudentProfile.deleteMany({ _id: { $in: cleanupProfileIds } }),
      AcademicYear.deleteMany({ _id: { $in: cleanupYearIds } }),
      Exam.deleteMany({ _id: { $in: cleanupExamIds } }),
      ExamRegistration.deleteMany({ _id: { $in: cleanupRegIds } }),
    ]);
    console.log("[5/5] Test cleanup finished. Closing HTTP server & MongoDB connection.");
    server.close();
    await mongoose.disconnect();
  }
}

runVerification();
