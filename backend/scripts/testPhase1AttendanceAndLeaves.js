const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const http = require("http");
const app = require("../src/app");
const User = require("../src/modules/users/user.model");
const StudentProfile = require("../src/modules/students/student.model");
const FacultyProfile = require("../src/modules/faculty/faculty.model");
const ParentProfile = require("../src/modules/parents/parent.model");
const Class = require("../src/modules/academics/class.model");
const AcademicYear = require("../src/modules/academics/academic-year.model");
const AttendanceRecord = require("../src/modules/attendance/attendance-record.model");
const AttendanceCorrectionRequest = require("../src/modules/attendance/attendance-correction-request.model");
const Leave = require("../src/modules/leaves/leave.model");
const { generateToken } = require("../src/shared/utils/jwt");

async function runPhase1Verification() {
  console.log("==================================================================");
  console.log("PHASE 1 VERIFICATION: ATTENDANCE & LEAVE ARCHITECTURE");
  console.log("==================================================================\n");

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("FATAL: MONGODB_URI missing from environment");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("[1/6] Connected to MongoDB Atlas.");

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;
  console.log(`[2/6] Test HTTP server listening on port ${port}.`);

  const cleanupUserIds = [];
  const cleanupProfileIds = [];
  const cleanupParentIds = [];
  const cleanupFacultyIds = [];
  const cleanupClassIds = [];
  const cleanupYearIds = [];
  const cleanupAttendanceIds = [];
  const cleanupLeaveIds = [];

  try {
    const timestamp = Date.now();

    // 1. Establish Academic Year and 2 distinct Classes
    const academicYear = await AcademicYear.create({
      yearName: `Academic Year ${timestamp}`,
      yearCode: `AY${timestamp.toString().slice(-4)}`,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-03-31"),
      status: "ACTIVE",
    });
    cleanupYearIds.push(academicYear._id);

    const classA = await Class.create({
      name: `Sanaviyya 1A-${timestamp}`,
      code: `S1A-${timestamp.toString().slice(-4)}`,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    cleanupClassIds.push(classA._id);

    const classB = await Class.create({
      name: `Sanaviyya 1B-${timestamp}`,
      code: `S1B-${timestamp.toString().slice(-4)}`,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    cleanupClassIds.push(classB._id);

    // 2. Establish Student 1 (in Class A) and Student 2 (in Class B)
    const userStudent1 = await User.create({
      name: "Zaid Student",
      email: `zaid.${timestamp}@markaz.in`,
      username: `zaid.${timestamp}`,
      role: "STUDENT",
      status: "ACTIVE",
      emailVerified: true,
    });
    cleanupUserIds.push(userStudent1._id);

    const profileStudent1 = await StudentProfile.create({
      userId: userStudent1._id,
      registrationNumber: `REG-Z-${timestamp.toString().slice(-4)}`,
      nameEnglish: "Zaid Student",
      dateOfBirth: new Date("2008-03-10"),
      admissionYear: 2026,
      classId: classA._id,
      fatherName: "Father Zaid",
      motherName: "Mother Zaid",
    });
    cleanupProfileIds.push(profileStudent1._id);

    const userStudent2 = await User.create({
      name: "Umar Student",
      email: `umar.${timestamp}@markaz.in`,
      username: `umar.${timestamp}`,
      role: "STUDENT",
      status: "ACTIVE",
      emailVerified: true,
    });
    cleanupUserIds.push(userStudent2._id);

    const profileStudent2 = await StudentProfile.create({
      userId: userStudent2._id,
      registrationNumber: `REG-U-${timestamp.toString().slice(-4)}`,
      nameEnglish: "Umar Student",
      dateOfBirth: new Date("2008-04-12"),
      admissionYear: 2026,
      classId: classB._id,
      fatherName: "Father Umar",
      motherName: "Mother Umar",
    });
    cleanupProfileIds.push(profileStudent2._id);

    // 3. Establish Parent 1 (Father of Student 1 ONLY)
    const userParent1 = await User.create({
      name: "Parent of Zaid",
      email: `parent.zaid.${timestamp}@markaz.in`,
      username: `parent.zaid.${timestamp}`,
      role: "PARENT",
      status: "ACTIVE",
      emailVerified: true,
    });
    cleanupUserIds.push(userParent1._id);

    const parentProfile1 = await ParentProfile.create({
      userId: userParent1._id,
      name: "Parent of Zaid",
      relationType: "FATHER",
      contactNumber: "+91 9876543210",
      studentIds: [profileStudent1._id], // ONLY linked to Student 1
    });
    cleanupParentIds.push(parentProfile1._id);

    // 4. Establish Asatitha 1 (Assigned to Class A) and Asatitha 2 (Assigned to Class B)
    const userUsthad1 = await User.create({
      name: "Usthad Class A",
      email: `usthad.a.${timestamp}@markaz.in`,
      username: `usthad.a.${timestamp}`,
      role: "ASATITHA",
      status: "ACTIVE",
      emailVerified: true,
    });
    cleanupUserIds.push(userUsthad1._id);

    const profileUsthad1 = await FacultyProfile.create({
      userId: userUsthad1._id,
      facultyId: `FAC-A-${timestamp.toString().slice(-4)}`,
      nameEnglish: "Usthad Class A",
      assignedClasses: [classA._id], // ONLY assigned to Class A
    });
    cleanupFacultyIds.push(profileUsthad1._id);

    const userUsthad2 = await User.create({
      name: "Usthad Class B",
      email: `usthad.b.${timestamp}@markaz.in`,
      username: `usthad.b.${timestamp}`,
      role: "ASATITHA",
      status: "ACTIVE",
      emailVerified: true,
    });
    cleanupUserIds.push(userUsthad2._id);

    const profileUsthad2 = await FacultyProfile.create({
      userId: userUsthad2._id,
      facultyId: `FAC-B-${timestamp.toString().slice(-4)}`,
      nameEnglish: "Usthad Class B",
      assignedClasses: [classB._id], // ONLY assigned to Class B
    });
    cleanupFacultyIds.push(profileUsthad2._id);

    console.log(`[3/6] Test domain fixtures established:`);
    console.log(`      Class A: ${classA._id} | Class B: ${classB._id}`);
    console.log(`      Student 1 (Class A): ${profileStudent1._id}`);
    console.log(`      Student 2 (Class B): ${profileStudent2._id}`);
    console.log(`      Parent 1 (Linked ONLY to Student 1): ${parentProfile1._id}`);
    console.log(`      Usthad 1 (Assigned ONLY to Class A): ${profileUsthad1._id}`);
    console.log(`      Usthad 2 (Assigned ONLY to Class B): ${profileUsthad2._id}`);

    // Generate JWTs
    const tokenStudent1 = generateToken({ userId: userStudent1._id.toString(), role: "STUDENT" });
    const tokenParent1 = generateToken({ userId: userParent1._id.toString(), role: "PARENT" });
    const tokenUsthad1 = generateToken({ userId: userUsthad1._id.toString(), role: "ASATITHA" });
    const tokenUsthad2 = generateToken({ userId: userUsthad2._id.toString(), role: "ASATITHA" });

    // -------------------------------------------------------------------------
    // TEST 1: Read-Only Attendance Endpoints for Student (404 Resolution)
    // -------------------------------------------------------------------------
    console.log(`\n--- TEST 1: Mount and query /api/attendance/student/* routes ---`);
    const resSummary = await fetch(`${baseUrl}/attendance/student/summary`, {
      headers: { Authorization: `Bearer ${tokenStudent1}` },
    });
    const bodySummary = await resSummary.json();
    console.log(`1a. GET /attendance/student/summary -> HTTP ${resSummary.status}:`, JSON.stringify(bodySummary));

    const resMonthly = await fetch(`${baseUrl}/attendance/student/monthly`, {
      headers: { Authorization: `Bearer ${tokenStudent1}` },
    });
    const bodyMonthly = await resMonthly.json();
    console.log(`1b. GET /attendance/student/monthly -> HTTP ${resMonthly.status}:`, JSON.stringify(bodyMonthly));

    const resHistory = await fetch(`${baseUrl}/attendance/student/history`, {
      headers: { Authorization: `Bearer ${tokenStudent1}` },
    });
    const bodyHistory = await resHistory.json();
    console.log(`1c. GET /attendance/student/history -> HTTP ${resHistory.status}:`, JSON.stringify(bodyHistory));

    const test1Passed =
      resSummary.status === 200 &&
      resMonthly.status === 200 &&
      resHistory.status === 200 &&
      bodySummary.success === true &&
      bodyMonthly.success === true &&
      bodyHistory.success === true;

    console.log(`Test 1 Result: ${test1Passed ? "PASSED (All 3 attendance routes respond 200 OK)" : "FAILED"}`);
    if (!test1Passed) throw new Error("Test 1 Failed: Attendance routes failed");

    // -------------------------------------------------------------------------
    // TEST 2: Student attempts to apply for leave (MUST BE BLOCKED WITH 403)
    // -------------------------------------------------------------------------
    console.log(`\n--- TEST 2: Student attempts to apply for leave (Must be HTTP 403 Forbidden) ---`);
    const resStudentLeave = await fetch(`${baseUrl}/leaves`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenStudent1}`,
      },
      body: JSON.stringify({
        studentId: profileStudent1._id.toString(),
        dateRange: { startDate: "2026-10-05", endDate: "2026-10-06" },
        reason: "Student applying for own leave",
      }),
    });
    const bodyStudentLeave = await resStudentLeave.json();
    console.log(`POST /api/leaves with STUDENT token -> HTTP ${resStudentLeave.status}:`, bodyStudentLeave);

    const test2Passed = resStudentLeave.status === 403 && bodyStudentLeave.success === false;
    console.log(`Test 2 Result: ${test2Passed ? "PASSED (Student role blocked with 403 from leave application)" : "FAILED"}`);
    if (!test2Passed) throw new Error("Test 2 Failed: Student was allowed to apply for leave");

    // -------------------------------------------------------------------------
    // TEST 3: Parent attempts to apply for a student who is NOT their child (MUST BE REJECTED 403)
    // -------------------------------------------------------------------------
    console.log(`\n--- TEST 3: Parent 1 attempts to apply leave for Student 2 (NOT their child) ---`);
    const resSpoofedLeave = await fetch(`${baseUrl}/leaves`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenParent1}`,
      },
      body: JSON.stringify({
        studentId: profileStudent2._id.toString(), // Attacking / spoofing someone else's child!
        dateRange: { startDate: "2026-10-05", endDate: "2026-10-06" },
        reason: "Parent attempting to apply for stranger child",
      }),
    });
    const bodySpoofedLeave = await resSpoofedLeave.json();
    console.log(`POST /api/leaves with spoofed studentId -> HTTP ${resSpoofedLeave.status}:`, bodySpoofedLeave);

    const test3Passed =
      resSpoofedLeave.status === 403 &&
      bodySpoofedLeave.success === false &&
      bodySpoofedLeave.message.includes("not linked to this parent");

    console.log(`Test 3 Result: ${test3Passed ? "PASSED (Server rejected unauthorized studentId with HTTP 403)" : "FAILED"}`);
    if (!test3Passed) throw new Error("Test 3 Failed: Parent was allowed to apply leave for an unlinked student");

    // -------------------------------------------------------------------------
    // TEST 4: Parent applies for their OWN child (MUST SUCCEED 201)
    // -------------------------------------------------------------------------
    console.log(`\n--- TEST 4: Parent 1 applies leave for Student 1 (Their OWN child) ---`);
    const resValidLeave = await fetch(`${baseUrl}/leaves`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenParent1}`,
      },
      body: JSON.stringify({
        studentId: profileStudent1._id.toString(),
        dateRange: { startDate: "2026-10-05", endDate: "2026-10-06" },
        reason: "Family event travel",
      }),
    });
    const bodyValidLeave = await resValidLeave.json();
    console.log(`POST /api/leaves with valid child -> HTTP ${resValidLeave.status}:`, bodyValidLeave);

    if (bodyValidLeave.data && bodyValidLeave.data._id) {
      cleanupLeaveIds.push(bodyValidLeave.data._id);
    }

    const test4Passed =
      resValidLeave.status === 201 &&
      bodyValidLeave.success === true &&
      bodyValidLeave.data &&
      bodyValidLeave.data.status === "PENDING" &&
      bodyValidLeave.data.studentId?._id === profileStudent1._id.toString();

    console.log(`Test 4 Result: ${test4Passed ? "PASSED (Parent successfully created leave for their own child)" : "FAILED"}`);
    if (!test4Passed) throw new Error("Test 4 Failed: Valid leave application failed");

    const createdLeaveId = bodyValidLeave.data._id;

    // -------------------------------------------------------------------------
    // TEST 5: Usthad 2 (assigned to Class B) tries to approve Class A student's leave (MUST BE REJECTED 403)
    // -------------------------------------------------------------------------
    console.log(`\n--- TEST 5: Usthad 2 (Class B) attempts to approve Class A student's leave ---`);
    const resUsthad2Approve = await fetch(`${baseUrl}/leaves/${createdLeaveId}/approve`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenUsthad2}`,
      },
      body: JSON.stringify({
        reviewRemarks: "Usthad 2 trying to approve out of boundary",
      }),
    });
    const bodyUsthad2Approve = await resUsthad2Approve.json();
    console.log(`PATCH /api/leaves/:id/approve by unassigned Usthad -> HTTP ${resUsthad2Approve.status}:`, bodyUsthad2Approve);

    const test5Passed =
      resUsthad2Approve.status === 403 &&
      bodyUsthad2Approve.success === false &&
      bodyUsthad2Approve.message.includes("not belong to your assigned classes");

    console.log(`Test 5 Result: ${test5Passed ? "PASSED (Rejected unassigned Asatitha approval with HTTP 403)" : "FAILED"}`);
    if (!test5Passed) throw new Error("Test 5 Failed: Unassigned Asatitha was allowed to approve leave");

    // -------------------------------------------------------------------------
    // TEST 6: Usthad 1 (assigned to Class A) approves Class A student's leave (MUST SUCCEED 200)
    // -------------------------------------------------------------------------
    console.log(`\n--- TEST 6: Usthad 1 (Class A) approves Class A student's leave ---`);
    const resUsthad1Approve = await fetch(`${baseUrl}/leaves/${createdLeaveId}/approve`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenUsthad1}`,
      },
      body: JSON.stringify({
        reviewRemarks: "Leave granted for 2 days. Travel safely.",
      }),
    });
    const bodyUsthad1Approve = await resUsthad1Approve.json();
    console.log(`PATCH /api/leaves/:id/approve by assigned Usthad -> HTTP ${resUsthad1Approve.status}:`, bodyUsthad1Approve);

    const test6Passed =
      resUsthad1Approve.status === 200 &&
      bodyUsthad1Approve.success === true &&
      bodyUsthad1Approve.data &&
      bodyUsthad1Approve.data.status === "APPROVED" &&
      bodyUsthad1Approve.data.approvedBy?._id === profileUsthad1._id.toString();

    console.log(`Test 6 Result: ${test6Passed ? "PASSED (Assigned Usthad successfully approved leave)" : "FAILED"}`);
    if (!test6Passed) throw new Error("Test 6 Failed: Assigned Usthad approval failed");

    console.log("\n==================================================================");
    console.log("ALL PHASE 1 ARCHITECTURAL & SECURITY VERIFICATIONS PASSED!");
    console.log("==================================================================");
  } catch (error) {
    console.error("\nTEST FAILED WITH ERROR:", error);
    process.exitCode = 1;
  } finally {
    console.log("\n[5/6] Cleaning up test fixtures from database...");
    await Promise.all([
      User.deleteMany({ _id: { $in: cleanupUserIds } }),
      StudentProfile.deleteMany({ _id: { $in: cleanupProfileIds } }),
      ParentProfile.deleteMany({ _id: { $in: cleanupParentIds } }),
      FacultyProfile.deleteMany({ _id: { $in: cleanupFacultyIds } }),
      Class.deleteMany({ _id: { $in: cleanupClassIds } }),
      AcademicYear.deleteMany({ _id: { $in: cleanupYearIds } }),
      Leave.deleteMany({ _id: { $in: cleanupLeaveIds } }),
      AttendanceRecord.deleteMany({ _id: { $in: cleanupAttendanceIds } }),
    ]);
    console.log("[6/6] Cleanup complete. Shutting down test server & DB connection.");
    server.close();
    await mongoose.disconnect();
  }
}

runPhase1Verification();
