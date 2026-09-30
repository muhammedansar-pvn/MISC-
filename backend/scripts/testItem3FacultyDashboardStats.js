/**
 * Verification test script for Item 3: Faculty Dashboard Action Cards
 *
 * Tests:
 * 1. Role Guard:
 *    - Unauthenticated -> 401
 *    - STUDENT -> 403
 *    - ADMIN -> 403 (strict FACULTY only)
 * 2. Empty state:
 *    - Faculty with 0 assigned classes -> { unmarkedAttendanceCount: 0, pendingLeavesCount: 0, assignedClassesCount: 0 }
 * 3. Live calculation:
 *    - Faculty assigned to Class A
 *    - Timetable entries scheduled for today's day of week
 *    - Partial attendance marked in AttendanceRecord
 *    - Pending leaves in Leave collection for students in Class A
 *    - Verifies accurate unmarkedAttendanceCount and pendingLeavesCount
 */

const http = require("http");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "backend/.env" });

const app = require("../src/app");
const User = require("../src/modules/users/user.model");
const FacultyProfile = require("../src/modules/faculty/faculty.model");
const StudentProfile = require("../src/modules/students/student.model");
const Timetable = require("../src/modules/academics/timetable.model");
const AttendanceRecord = require("../src/modules/attendance/attendance-record.model");
const Leave = require("../src/modules/leaves/leave.model");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

async function runTest() {
  console.log("==================================================================");
  console.log("ITEM 3 VERIFICATION: FACULTY DASHBOARD ACTION COUNTERS");
  console.log("==================================================================");

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("[1/5] Connected to MongoDB Atlas.");

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`[2/5] Test HTTP server listening on port ${port}.`);

  const timestamp = Date.now();
  const cleanupUserIds = [];
  const cleanupFacultyIds = [];
  const cleanupStudentIds = [];
  const cleanupTimetableIds = [];
  const cleanupAttendanceIds = [];
  const cleanupLeaveIds = [];

  const request = (method, path, token = null) => {
    return new Promise((resolve, reject) => {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const req = http.request(
        {
          hostname: "127.0.0.1",
          port,
          path,
          method,
          headers,
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              resolve({ status: res.statusCode, body: JSON.parse(data) });
            } catch (e) {
              resolve({ status: res.statusCode, body: data });
            }
          });
        }
      );
      req.on("error", reject);
      req.end();
    });
  };

  try {
    // --- 1. Security & Role Guard Verification ---
    console.log("\n--- TEST 1: Role Guard on GET /api/faculty/dashboard-stats ---");

    // Unauthenticated
    const unauthRes = await request("GET", "/api/faculty/dashboard-stats");
    console.log("Unauthenticated -> HTTP Status:", unauthRes.status);
    if (unauthRes.status !== 401) throw new Error("Expected 401 for unauthenticated request");

    // Student token
    const studentUser = await User.create({
      name: "Student Guard Test",
      email: `student.guard.${timestamp}@markaz.in`,
      role: "STUDENT",
      status: "ACTIVE",
    });
    cleanupUserIds.push(studentUser._id);
    const studentToken = jwt.sign({ userId: studentUser._id, role: "STUDENT" }, JWT_SECRET);
    const studentRes = await request("GET", "/api/faculty/dashboard-stats", studentToken);
    console.log("Student role -> HTTP Status:", studentRes.status, `(expected: 403)`);
    if (studentRes.status !== 403) throw new Error("Expected 403 for student");

    // Admin token (should be 403 since route is restricted to FACULTY only)
    const adminUser = await User.create({
      name: "Admin Guard Test",
      email: `admin.guard.${timestamp}@markaz.in`,
      role: "ADMIN",
      status: "ACTIVE",
    });
    cleanupUserIds.push(adminUser._id);
    const adminToken = jwt.sign({ userId: adminUser._id, role: "ADMIN" }, JWT_SECRET);
    const adminRes = await request("GET", "/api/faculty/dashboard-stats", adminToken);
    console.log("Admin role -> HTTP Status:", adminRes.status, `(expected: 403)`);
    if (adminRes.status !== 403) throw new Error("Expected 403 for admin (strictly FACULTY only)");

    console.log("Test 1 Result: PASSED (Strict role guard enforced)");

    // --- 2. Empty State Verification ---
    console.log("\n--- TEST 2: Faculty with No Assigned Classes ---");
    const facultyUser1 = await User.create({
      name: "Faculty Unassigned",
      email: `faculty.unassigned.${timestamp}@markaz.in`,
      role: "FACULTY",
      status: "ACTIVE",
    });
    cleanupUserIds.push(facultyUser1._id);
    const facultyProfile1 = await FacultyProfile.create({
      userId: facultyUser1._id,
      facultyId: `FAC-UN-${timestamp}`,
      nameEnglish: "Faculty Unassigned",
      assignedClasses: [],
      status: "ACTIVE",
    });
    cleanupFacultyIds.push(facultyProfile1._id);

    const facultyToken1 = jwt.sign({ userId: facultyUser1._id, role: "FACULTY" }, JWT_SECRET);
    const emptyRes = await request("GET", "/api/faculty/dashboard-stats", facultyToken1);
    console.log("Unassigned Faculty Stats:", emptyRes.body.data);
    if (
      emptyRes.status !== 200 ||
      emptyRes.body.data.unmarkedAttendanceCount !== 0 ||
      emptyRes.body.data.pendingLeavesCount !== 0 ||
      emptyRes.body.data.assignedClassesCount !== 0
    ) {
      throw new Error("Expected all zero stats for unassigned faculty");
    }
    console.log("Test 2 Result: PASSED (Empty state returns zero counters)");

    // --- 3. Live Dynamic Calculations ---
    console.log("\n--- TEST 3: Dynamic Calculation of Unmarked Attendance & Pending Leaves ---");
    const classId = new mongoose.Types.ObjectId();
    const academicYearId = new mongoose.Types.ObjectId();
    const subjectId = new mongoose.Types.ObjectId();

    const facultyUser2 = await User.create({
      name: "Faculty Assigned",
      email: `faculty.assigned.${timestamp}@markaz.in`,
      role: "FACULTY",
      status: "ACTIVE",
    });
    cleanupUserIds.push(facultyUser2._id);
    const facultyProfile2 = await FacultyProfile.create({
      userId: facultyUser2._id,
      facultyId: `FAC-AS-${timestamp}`,
      nameEnglish: "Faculty Assigned",
      assignedClasses: [classId],
      status: "ACTIVE",
    });
    cleanupFacultyIds.push(facultyProfile2._id);
    const facultyToken2 = jwt.sign({ userId: facultyUser2._id, role: "FACULTY" }, JWT_SECRET);

    // Create 2 students in classId
    const student1 = await StudentProfile.create({
      userId: new mongoose.Types.ObjectId(),
      nameEnglish: "Student One",
      dateOfBirth: new Date("2006-01-01"),
      admissionYear: 2024,
      registrationNumber: `REG-1-${timestamp}`,
      fatherName: "Father 1",
      motherName: "Mother 1",
      classId,
      status: "ACTIVE",
    });
    cleanupStudentIds.push(student1._id);

    const student2 = await StudentProfile.create({
      userId: new mongoose.Types.ObjectId(),
      nameEnglish: "Student Two",
      dateOfBirth: new Date("2006-01-01"),
      admissionYear: 2024,
      registrationNumber: `REG-2-${timestamp}`,
      fatherName: "Father 2",
      motherName: "Mother 2",
      classId,
      status: "ACTIVE",
    });
    cleanupStudentIds.push(student2._id);

    // Create 2 pending leaves for student1 and student2
    const leave1 = await Leave.create({
      studentId: student1._id,
      appliedBy: new mongoose.Types.ObjectId(),
      dateRange: { startDate: new Date(), endDate: new Date() },
      reason: "Medical appointment",
      status: "PENDING",
    });
    cleanupLeaveIds.push(leave1._id);

    const leave2 = await Leave.create({
      studentId: student2._id,
      appliedBy: new mongoose.Types.ObjectId(),
      dateRange: { startDate: new Date(), endDate: new Date() },
      reason: "Family function",
      status: "PENDING",
    });
    cleanupLeaveIds.push(leave2._id);

    // Create 1 already approved leave (must not be counted in pending)
    const leaveApproved = await Leave.create({
      studentId: student1._id,
      appliedBy: new mongoose.Types.ObjectId(),
      dateRange: { startDate: new Date(), endDate: new Date() },
      reason: "Past approved leave",
      status: "APPROVED",
    });
    cleanupLeaveIds.push(leaveApproved._id);

    // Determine today's dayOfWeek
    const DAYS_OF_WEEK_MAP = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];
    const todayDayOfWeek = DAYS_OF_WEEK_MAP[new Date().getUTCDay()];

    // Schedule 3 periods in Timetable for today
    const tt1 = await Timetable.create({
      academicYearId,
      classId,
      dayOfWeek: todayDayOfWeek,
      periodNumber: 1,
      startTime: "09:00",
      endTime: "09:45",
      subjectId,
      facultyId: facultyProfile2._id,
      status: "ACTIVE",
    });
    const tt2 = await Timetable.create({
      academicYearId,
      classId,
      dayOfWeek: todayDayOfWeek,
      periodNumber: 2,
      startTime: "09:45",
      endTime: "10:30",
      subjectId,
      facultyId: facultyProfile2._id,
      status: "ACTIVE",
    });
    const tt3 = await Timetable.create({
      academicYearId,
      classId,
      dayOfWeek: todayDayOfWeek,
      periodNumber: 3,
      startTime: "10:45",
      endTime: "11:30",
      subjectId,
      facultyId: facultyProfile2._id,
      status: "ACTIVE",
    });
    cleanupTimetableIds.push(tt1._id, tt2._id, tt3._id);

    // Mark Period 1 in AttendanceRecord for student1 & student2
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const attRecord1 = await AttendanceRecord.create({
      studentId: student1._id,
      classId,
      date: todayStart,
      period: 1,
      status: "PRESENT",
      source: "SYSTEM_OVERRIDE",
    });
    cleanupAttendanceIds.push(attRecord1._id);

    // Now: 3 scheduled periods (Periods 1, 2, 3), Period 1 is marked -> Unmarked periods = 2 (Periods 2 & 3).
    // Pending leaves = 2 (leave1 & leave2).
    const dynamicRes = await request("GET", "/api/faculty/dashboard-stats", facultyToken2);
    console.log("Assigned Faculty Stats Response:", dynamicRes.body.data);
    if (dynamicRes.status !== 200) throw new Error("Expected 200 response");

    const { unmarkedAttendanceCount, pendingLeavesCount, assignedClassesCount } = dynamicRes.body.data;
    console.log(`Verifying: unmarkedAttendanceCount=${unmarkedAttendanceCount} (expected: 2)`);
    console.log(`Verifying: pendingLeavesCount=${pendingLeavesCount} (expected: 2)`);
    console.log(`Verifying: assignedClassesCount=${assignedClassesCount} (expected: 1)`);

    if (unmarkedAttendanceCount !== 2) {
      throw new Error(`Expected unmarkedAttendanceCount=2, got ${unmarkedAttendanceCount}`);
    }
    if (pendingLeavesCount !== 2) {
      throw new Error(`Expected pendingLeavesCount=2, got ${pendingLeavesCount}`);
    }
    if (assignedClassesCount !== 1) {
      throw new Error(`Expected assignedClassesCount=1, got ${assignedClassesCount}`);
    }

    console.log("Test 3 Result: PASSED (Exact dynamic calculation verified)");

    console.log("\n==================================================================");
    console.log("ALL ITEM 3 FACULTY DASHBOARD ACTION COUNTER TESTS PASSED!");
    console.log("==================================================================");
  } finally {
    console.log("\n[4/5] Cleaning up test fixtures from database...");
    await User.deleteMany({ _id: { $in: cleanupUserIds } });
    await FacultyProfile.deleteMany({ _id: { $in: cleanupFacultyIds } });
    await StudentProfile.deleteMany({ _id: { $in: cleanupStudentIds } });
    await Timetable.deleteMany({ _id: { $in: cleanupTimetableIds } });
    await AttendanceRecord.deleteMany({ _id: { $in: cleanupAttendanceIds } });
    await Leave.deleteMany({ _id: { $in: cleanupLeaveIds } });
    server.close();
    await mongoose.connection.close();
    console.log("[5/5] Cleanup complete. Server closed.");
  }
}

runTest().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
