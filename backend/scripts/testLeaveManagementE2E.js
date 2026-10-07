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
const Subject = require("../src/modules/academics/subject.model");
const Timetable = require("../src/modules/academics/timetable.model");
const AttendanceRecord = require("../src/modules/attendance/attendance-record.model");
const Leave = require("../src/modules/leaves/leave.model");
const { generateToken } = require("../src/shared/utils/jwt");

async function runE2ELeaveTests() {
  console.log("==================================================================");
  console.log("PHASE 1 END-TO-END VERIFICATION: LEAVE MANAGEMENT SYSTEM");
  console.log("==================================================================\n");

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("FATAL: MONGODB_URI missing from environment");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("[1/5] Connected to MongoDB Atlas.");

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;
  console.log(`[2/5] Test HTTP server listening on port ${port}.`);

  const cleanupUserIds = [];
  const cleanupProfileIds = [];
  const cleanupParentIds = [];
  const cleanupFacultyIds = [];
  const cleanupClassIds = [];
  const cleanupYearIds = [];
  const cleanupSubjectIds = [];
  const cleanupTimetableIds = [];
  const cleanupAttendanceIds = [];
  const cleanupLeaveIds = [];

  let testPassedCount = 0;
  let testTotalCount = 0;

  function assert(condition, message) {
    testTotalCount++;
    if (condition) {
      console.log(`  PASS: ${message}`);
      testPassedCount++;
    } else {
      console.error(`  FAIL: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    const timestamp = Date.now();

    // 1. Setup Academic Context
    const academicYear = await AcademicYear.create({
      yearName: `Leave AY ${timestamp}`,
      yearCode: `LAY${timestamp.toString().slice(-4)}`,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-03-31"),
      status: "ACTIVE",
    });
    cleanupYearIds.push(academicYear._id);

    const testClass = await Class.create({
      name: `Leave Class ${timestamp}`,
      code: `LC${timestamp.toString().slice(-4)}`,
      academicYearId: academicYear._id,
      capacity: 30,
      status: "ACTIVE",
    });
    cleanupClassIds.push(testClass._id);

    const testSubject = await Subject.create({
      subjectName: `Fiqh Studies ${timestamp}`,
      subjectCode: `FQ${timestamp.toString().slice(-4)}`,
      category: "ISLAMIC_STUDIES",
      status: "ACTIVE",
    });
    cleanupSubjectIds.push(testSubject._id);

    // Setup Faculty (assigned to testClass)
    const facultyUser = await User.create({
      name: `Usthad Ahmad ${timestamp}`,
      email: `faculty_${timestamp}@markaz.edu`,
      username: `faculty_${timestamp}`,
      password: "HashedPassword123!",
      role: "FACULTY",
      status: "ACTIVE",
    });
    cleanupUserIds.push(facultyUser._id);

    const facultyProfile = await FacultyProfile.create({
      userId: facultyUser._id,
      nameEnglish: `Usthad Ahmad ${timestamp}`,
      facultyId: `FAC-${timestamp.toString().slice(-4)}`,
      assignedClasses: [testClass._id],
      status: "ACTIVE",
    });
    cleanupFacultyIds.push(facultyProfile._id);

    // Setup timetable for Monday period 1
    const timetableEntry = await Timetable.create({
      classId: testClass._id,
      subjectId: testSubject._id,
      facultyId: facultyProfile._id,
      academicYearId: academicYear._id,
      dayOfWeek: "MONDAY",
      periodNumber: 1,
      startTime: "09:00",
      endTime: "10:00",
    });
    cleanupTimetableIds.push(timetableEntry._id);

    // 2. Setup Student 1 (in testClass)
    const studentUser1 = await User.create({
      name: `Student One ${timestamp}`,
      email: `student1_${timestamp}@markaz.edu`,
      username: `student1_${timestamp}`,
      password: "HashedPassword123!",
      role: "STUDENT",
      status: "ACTIVE",
    });
    cleanupUserIds.push(studentUser1._id);

    const studentProfile1 = await StudentProfile.create({
      userId: studentUser1._id,
      nameEnglish: `Student One ${timestamp}`,
      registrationNumber: `REG-ST1-${timestamp}`,
      fatherName: "Father One",
      motherName: "Mother One",
      admissionYear: 2026,
      dateOfBirth: new Date("2008-01-01"),
      classId: testClass._id,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    cleanupProfileIds.push(studentProfile1._id);

    // Setup Student 2 (another student for IDOR checks)
    const studentUser2 = await User.create({
      name: `Student Two ${timestamp}`,
      email: `student2_${timestamp}@markaz.edu`,
      username: `student2_${timestamp}`,
      password: "HashedPassword123!",
      role: "STUDENT",
      status: "ACTIVE",
    });
    cleanupUserIds.push(studentUser2._id);

    const studentProfile2 = await StudentProfile.create({
      userId: studentUser2._id,
      nameEnglish: `Student Two ${timestamp}`,
      registrationNumber: `REG-ST2-${timestamp}`,
      fatherName: "Father Two",
      motherName: "Mother Two",
      admissionYear: 2026,
      dateOfBirth: new Date("2008-02-02"),
      classId: testClass._id,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    cleanupProfileIds.push(studentProfile2._id);

    // 3. Setup Parent (linked ONLY to studentProfile1)
    const parentUser = await User.create({
      name: `Parent One ${timestamp}`,
      email: `parent_${timestamp}@markaz.edu`,
      username: `parent_${timestamp}`,
      password: "HashedPassword123!",
      role: "PARENT",
      status: "ACTIVE",
    });
    cleanupUserIds.push(parentUser._id);

    const parentProfile = await ParentProfile.create({
      userId: parentUser._id,
      name: `Parent One ${timestamp}`,
      relationType: "FATHER",
      studentIds: [studentProfile1._id],
      status: "ACTIVE",
    });
    cleanupParentIds.push(parentProfile._id);

    // 5. Setup Admin
    const adminUser = await User.create({
      name: `Admin Manager ${timestamp}`,
      email: `admin_${timestamp}@markaz.edu`,
      username: `admin_${timestamp}`,
      password: "HashedPassword123!",
      role: "ADMIN",
      status: "ACTIVE",
    });
    cleanupUserIds.push(adminUser._id);

    // Generate JWT Tokens
    const student1Token = generateToken({
      userId: studentUser1._id.toString(),
      role: "STUDENT",
      studentId: studentProfile1._id.toString(),
    });
    const student2Token = generateToken({
      userId: studentUser2._id.toString(),
      role: "STUDENT",
      studentId: studentProfile2._id.toString(),
    });
    const parentToken = generateToken({
      userId: parentUser._id.toString(),
      role: "PARENT",
      parentId: parentProfile._id.toString(),
      parentStudentIds: [studentProfile1._id.toString()],
    });
    const facultyToken = generateToken({
      userId: facultyUser._id.toString(),
      role: "FACULTY",
      facultyId: facultyProfile._id.toString(),
    });
    const adminToken = generateToken({
      userId: adminUser._id.toString(),
      role: "ADMIN",
    });

    console.log("[3/5] Test entities and credentials provisioned.\n");
    console.log("[4/5] Executing E2E Test Cases...\n");

    // Helper for requests
    async function apiRequest(endpoint, options = {}) {
      const url = `${baseUrl}${endpoint}`;
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
          ...options.headers,
        },
        ...options,
      });
      const data = await res.json().catch(() => null);
      return { status: res.status, data };
    }

    // =========================================================================
    // TEST 1: Student attempts to submit leave -> 403 Forbidden
    // =========================================================================
    console.log("--- TEST 1: Student attempts to submit leave (Must be Rejected) ---");
    const test1Res = await apiRequest("/leaves", {
      method: "POST",
      token: student1Token,
      body: JSON.stringify({
        startDate: "2026-11-02",
        endDate: "2026-11-02",
        leaveType: "MEDICAL",
        reason: "Severe fever and doctor advised rest",
      }),
    });
    assert(test1Res.status === 403, `Student application correctly rejected with 403 Forbidden (got ${test1Res.status})`);
    assert(test1Res.data.success === false, "Response reports success = false");

    // =========================================================================
    // TEST 2: Student attempts IDOR for another student -> 403 Forbidden
    // =========================================================================
    console.log("\n--- TEST 2: Student attempts IDOR for another student ---");
    const test2Res = await apiRequest("/leaves", {
      method: "POST",
      token: student1Token,
      body: JSON.stringify({
        studentId: studentProfile2._id.toString(), // Tampered!
        startDate: "2026-11-05",
        endDate: "2026-11-06",
        reason: "Malicious attempt to file on behalf of peer",
      }),
    });
    assert(test2Res.status === 403, `IDOR attempt blocked with 403 Forbidden (got ${test2Res.status})`);
    assert(test2Res.data.success === false, "IDOR response reports success = false");

    // =========================================================================
    // TEST 3: Parent attempts backdated leave (past date) -> 400 Bad Request
    // =========================================================================
    console.log("\n--- TEST 3: Parent attempts backdated leave (Past Date) ---");
    const test3PastRes = await apiRequest("/leaves", {
      method: "POST",
      token: parentToken,
      body: JSON.stringify({
        studentId: studentProfile1._id.toString(),
        startDate: "2026-10-01", // Past date!
        endDate: "2026-10-02",
        leaveType: "CASUAL",
        reason: "Past absence filing attempt",
      }),
    });
    assert(test3PastRes.status === 400, `Backdated leave rejected with 400 Bad Request (got ${test3PastRes.status})`);
    assert(
      test3PastRes.data.message.includes("Leave can only be requested from today onwards"),
      "Error message mentions no backdated leave policy"
    );

    // =========================================================================
    // TEST 4: Parent attempts invalid date range (endDate < startDate) -> 400
    // =========================================================================
    console.log("\n--- TEST 4: Parent attempts invalid date range (endDate < startDate) ---");
    const test4RangeRes = await apiRequest("/leaves", {
      method: "POST",
      token: parentToken,
      body: JSON.stringify({
        studentId: studentProfile1._id.toString(),
        startDate: "2026-11-15",
        endDate: "2026-11-10", // Earlier than start!
        leaveType: "CASUAL",
        reason: "Reversed date range",
      }),
    });
    assert(test4RangeRes.status === 400, `Invalid date range rejected with 400 Bad Request (got ${test4RangeRes.status})`);

    // =========================================================================
    // TEST 5: Parent applies leave for TODAY -> 201 Created
    // =========================================================================
    console.log("\n--- TEST 5: Parent applies leave for TODAY (Allowed) ---");
    const todayISO = new Date().toISOString().split("T")[0];
    const test5TodayRes = await apiRequest("/leaves", {
      method: "POST",
      token: parentToken,
      body: JSON.stringify({
        studentId: studentProfile1._id.toString(),
        startDate: todayISO,
        endDate: todayISO,
        leaveType: "MEDICAL",
        reason: "Sudden illness today morning",
      }),
    });
    assert(test5TodayRes.status === 201, `Today's leave returned 201 Created (got ${test5TodayRes.status})`);
    assert(test5TodayRes.data.data.status === "PENDING", "Today leave status is PENDING");
    assert(test5TodayRes.data.data.applicantRole === "PARENT", "applicantRole is PARENT");
    const todayLeaveId = test5TodayRes.data.data._id;
    cleanupLeaveIds.push(todayLeaveId);

    // =========================================================================
    // TEST 6: Parent applies leave for FUTURE DATE -> 201 Created
    // =========================================================================
    console.log("\n--- TEST 6: Parent applies leave for FUTURE DATE (Allowed) ---");
    const test6FutureRes = await apiRequest("/leaves", {
      method: "POST",
      token: parentToken,
      body: JSON.stringify({
        studentId: studentProfile1._id.toString(),
        startDate: "2026-11-02", // Future Monday
        endDate: "2026-11-02",
        leaveType: "FAMILY_EMERGENCY",
        reason: "Attending sister wedding ceremony in hometown",
      }),
    });
    assert(test6FutureRes.status === 201, `Future leave application returned 201 Created (got ${test6FutureRes.status})`);
    assert(test6FutureRes.data.data.status === "PENDING", "Future leave status is PENDING");
    assert(test6FutureRes.data.data.applicantRole === "PARENT", "applicantRole is PARENT");
    const futureLeaveId = test6FutureRes.data.data._id;
    cleanupLeaveIds.push(futureLeaveId);

    // =========================================================================
    // TEST 7: Parent attempts IDOR for unlinked student -> 403 Forbidden
    // =========================================================================
    console.log("\n--- TEST 7: Parent attempts IDOR for unlinked student ---");
    const test7UnlinkedRes = await apiRequest("/leaves", {
      method: "POST",
      token: parentToken,
      body: JSON.stringify({
        studentId: studentProfile2._id.toString(), // Unlinked!
        startDate: "2026-11-20",
        endDate: "2026-11-21",
        reason: "Attempting to file for unlinked child",
      }),
    });
    assert(test7UnlinkedRes.status === 403, `Unlinked parent application blocked with 403 Forbidden (got ${test7UnlinkedRes.status})`);

    // =========================================================================
    // TEST 8: Overlapping leave prevention -> 400 Bad Request
    // =========================================================================
    console.log("\n--- TEST 8: Overlapping leave application check ---");
    const test8OverlapRes = await apiRequest("/leaves", {
      method: "POST",
      token: parentToken,
      body: JSON.stringify({
        studentId: studentProfile1._id.toString(),
        startDate: "2026-11-02", // Same as Test 6!
        endDate: "2026-11-03",
        reason: "Duplicate overlapping dates request",
      }),
    });
    assert(test8OverlapRes.status === 400, `Overlapping request blocked with 400 Bad Request (got ${test8OverlapRes.status})`);
    assert(test8OverlapRes.data.message.includes("overlapping"), "Error message mentions overlapping leave");

    // =========================================================================
    // TEST 9: Unauthorized review attempt (Student trying to approve leave) -> 403
    // =========================================================================
    console.log("\n--- TEST 9: Unauthorized review role guard ---");
    const test9ReviewRes = await apiRequest(`/leaves/${futureLeaveId}/approve`, {
      method: "PATCH",
      token: student1Token, // Student cannot review!
      body: JSON.stringify({ reviewRemarks: "Self-approval hack" }),
    });
    assert(test9ReviewRes.status === 403, `Student review blocked with 403 Forbidden (got ${test9ReviewRes.status})`);

    // =========================================================================
    // TEST 10: Faculty approves leave -> 200 OK + Attendance sync
    // =========================================================================
    console.log("\n--- TEST 10: Faculty approves leave with attendance sync ---");
    const test10ApproveRes = await apiRequest(`/leaves/${futureLeaveId}/approve`, {
      method: "PATCH",
      token: facultyToken,
      body: JSON.stringify({ reviewRemarks: "Family emergency accepted. Leave approved." }),
    });
    assert(test10ApproveRes.status === 200, `Faculty approval returned 200 OK (got ${test10ApproveRes.status})`);
    assert(test10ApproveRes.data.data.status === "APPROVED", "Status updated to APPROVED");
    assert(test10ApproveRes.data.data.reviewRemarks.includes("Leave approved"), "Review remarks stored properly");

    // Verify Attendance record was automatically upserted with status LEAVE
    const syncAttendance = await AttendanceRecord.findOne({
      studentId: studentProfile1._id,
      date: new Date(Date.UTC(2026, 10, 2)), // 2026-11-02
      status: "LEAVE",
    }).lean();
    assert(!!syncAttendance, "Attendance record was created/updated with status LEAVE");
    assert(syncAttendance.isCorrected === true, "Attendance record is marked isCorrected = true");
    if (syncAttendance) cleanupAttendanceIds.push(syncAttendance._id);

    // =========================================================================
    // TEST 11: Faculty rejects leave with remarks -> 200 OK
    // =========================================================================
    console.log("\n--- TEST 11: Faculty rejects leave with remarks ---");
    const test11RejectRes = await apiRequest(`/leaves/${todayLeaveId}/reject`, {
      method: "PATCH",
      token: facultyToken,
      body: JSON.stringify({ reviewRemarks: "Medical certificate not provided. Request rejected." }),
    });
    assert(test11RejectRes.status === 200, `Faculty rejection returned 200 OK (got ${test11RejectRes.status})`);
    assert(test11RejectRes.data.data.status === "REJECTED", "Status updated to REJECTED");
    assert(test11RejectRes.data.data.reviewRemarks.includes("Request rejected"), "Rejection remarks stored properly");

    // =========================================================================
    // TEST 12: Admin oversight & listing verification -> 200 OK
    // =========================================================================
    console.log("\n--- TEST 12: Admin oversight & listing ---");
    const test12AdminRes = await apiRequest("/leaves", {
      method: "GET",
      token: adminToken,
    });
    assert(test12AdminRes.status === 200, `Admin leaves list returned 200 OK (got ${test12AdminRes.status})`);
    assert(Array.isArray(test12AdminRes.data.data), "Admin receives array of leaves");
    const foundApproved = test12AdminRes.data.data.some((l) => l._id === futureLeaveId);
    const foundRejected = test12AdminRes.data.data.some((l) => l._id === todayLeaveId);
    assert(foundApproved && foundRejected, "Admin oversight sees both approved and rejected leave records");

    console.log(`\n==================================================================`);
    console.log(`ALL TESTS PASSED! (${testPassedCount}/${testTotalCount})`);
    console.log(`==================================================================\n`);
  } catch (err) {
    console.error("\nTEST SUITE FAILED WITH EXCEPTION:\n", err);
    process.exitCode = 1;
  } finally {
    console.log("[5/5] Cleaning up test data from MongoDB...");
    await Leave.deleteMany({ _id: { $in: cleanupLeaveIds } });
    await AttendanceRecord.deleteMany({ _id: { $in: cleanupAttendanceIds } });
    await Timetable.deleteMany({ _id: { $in: cleanupTimetableIds } });
    await Subject.deleteMany({ _id: { $in: cleanupSubjectIds } });
    await Class.deleteMany({ _id: { $in: cleanupClassIds } });
    await AcademicYear.deleteMany({ _id: { $in: cleanupYearIds } });
    await StudentProfile.deleteMany({ _id: { $in: cleanupProfileIds } });
    await ParentProfile.deleteMany({ _id: { $in: cleanupParentIds } });
    await FacultyProfile.deleteMany({ _id: { $in: cleanupFacultyIds } });
    await User.deleteMany({ _id: { $in: cleanupUserIds } });

    await server.close();
    await mongoose.disconnect();
    console.log("Cleanup complete and server closed.");
  }
}

runE2ELeaveTests();
