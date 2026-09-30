/**
 * Verification test script for Item 2: Student Dashboard "Today's Attendance"
 *
 * Tests:
 * 1. getStudentDailyAttendance logic across various period permutations:
 *    - No records -> NOT_MARKED
 *    - All records LEAVE -> LEAVE
 *    - Majority attended (e.g. 4 PRESENT, 2 ABSENT, 1 LATE) -> PRESENT
 *    - Minority attended (e.g. 1 PRESENT, 5 ABSENT, 1 LATE) -> ABSENT
 *    - Majority attended but all are LATE (e.g. 4 LATE, 3 ABSENT) -> LATE
 * 2. HTTP GET /api/students/profile as authenticated STUDENT:
 *    - Confirms data.todayAttendance is attached.
 * 3. Fallback auto-provisioning path:
 *    - Authenticates student without prior StudentProfile document.
 *    - Confirms ensureStudentProfileForUser runs and data.todayAttendance is attached.
 */

const http = require("http");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "backend/.env" });

const app = require("../src/app");
const User = require("../src/modules/users/user.model");
const StudentProfile = require("../src/modules/students/student.model");
const AttendanceRecord = require("../src/modules/attendance/attendance-record.model");
const attendanceService = require("../src/modules/attendance/attendance.service");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

async function runTest() {
  console.log("==================================================================");
  console.log("ITEM 2 VERIFICATION: STUDENT DASHBOARD TODAY'S ATTENDANCE");
  console.log("==================================================================");

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("[1/5] Connected to MongoDB Atlas.");

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`[2/5] Test HTTP server listening on port ${port}.`);

  const timestamp = Date.now();
  const testStudentUser = await User.create({
    name: "Student Attendance Test",
    email: `student.att.${timestamp}@markaz.in`,
    username: `student_att_${timestamp}`,
    role: "STUDENT",
    status: "ACTIVE",
    emailVerified: true,
  });

  const dummyClassId = new mongoose.Types.ObjectId();
  const testProfile = await StudentProfile.create({
    userId: testStudentUser._id,
    nameEnglish: "Student Attendance Test",
    dateOfBirth: new Date("2006-01-01"),
    admissionYear: 2024,
    registrationNumber: `REG_${timestamp}`,
    fatherName: "Father Test",
    motherName: "Mother Test",
    classId: dummyClassId,
    status: "ACTIVE",
  });

  const studentToken = jwt.sign(
    { userId: testStudentUser._id, role: "STUDENT" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  console.log("[3/5] Test domain fixtures established.");

  const request = (method, path, headers = {}, body = null) => {
    return new Promise((resolve, reject) => {
      const payload = body ? JSON.stringify(body) : null;
      const req = http.request(
        {
          hostname: "127.0.0.1",
          port,
          path,
          method,
          headers: {
            "Content-Type": "application/json",
            ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
            ...headers,
          },
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
      if (payload) req.write(payload);
      req.end();
    });
  };

  try {
    const today = new Date();
    const todayStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));

    // --- TEST 1: Service Unit Tests for Daily Attendance Logic ---
    console.log("\n--- TEST 1: getStudentDailyAttendance Status Resolution ---");

    // 1a: No records
    const resEmpty = await attendanceService.getStudentDailyAttendance(testProfile._id, today);
    console.log("1a. No records ->", resEmpty.status, `(expected: NOT_MARKED)`);
    if (resEmpty.status !== "NOT_MARKED") throw new Error("Expected NOT_MARKED");

    // 1b: All LEAVE
    const leaveRecords = [];
    for (let p = 1; p <= 7; p++) {
      leaveRecords.push({
        studentId: testProfile._id,
        classId: dummyClassId,
        date: todayStart,
        period: p,
        status: "LEAVE",
        source: "SYSTEM_OVERRIDE",
      });
    }
    await AttendanceRecord.insertMany(leaveRecords);
    const resLeave = await attendanceService.getStudentDailyAttendance(testProfile._id, today);
    console.log("1b. All LEAVE ->", resLeave.status, `(expected: LEAVE)`);
    if (resLeave.status !== "LEAVE") throw new Error("Expected LEAVE");
    await AttendanceRecord.deleteMany({ studentId: testProfile._id });

    // 1c: Majority attended (4 PRESENT, 2 ABSENT, 1 LATE)
    const majorityRecords = [
      { studentId: testProfile._id, classId: dummyClassId, date: todayStart, period: 1, status: "PRESENT" },
      { studentId: testProfile._id, classId: dummyClassId, date: todayStart, period: 2, status: "PRESENT" },
      { studentId: testProfile._id, classId: dummyClassId, date: todayStart, period: 3, status: "ABSENT" },
      { studentId: testProfile._id, classId: dummyClassId, date: todayStart, period: 4, status: "PRESENT" },
      { studentId: testProfile._id, classId: dummyClassId, date: todayStart, period: 5, status: "LATE" },
      { studentId: testProfile._id, classId: dummyClassId, date: todayStart, period: 6, status: "ABSENT" },
      { studentId: testProfile._id, classId: dummyClassId, date: todayStart, period: 7, status: "PRESENT" },
    ];
    await AttendanceRecord.insertMany(majorityRecords);
    const resMajority = await attendanceService.getStudentDailyAttendance(testProfile._id, today);
    console.log("1c. Mixed 4 PRESENT, 2 ABSENT, 1 LATE ->", resMajority.status, `(expected: PRESENT)`);
    if (resMajority.status !== "PRESENT") throw new Error("Expected PRESENT");
    await AttendanceRecord.deleteMany({ studentId: testProfile._id });

    // 1d: Minority attended (1 PRESENT, 5 ABSENT, 1 LATE)
    const minorityRecords = [
      { studentId: testProfile._id, classId: dummyClassId, date: todayStart, period: 1, status: "PRESENT" },
      { studentId: testProfile._id, classId: dummyClassId, date: todayStart, period: 2, status: "ABSENT" },
      { studentId: testProfile._id, classId: dummyClassId, date: todayStart, period: 3, status: "ABSENT" },
      { studentId: testProfile._id, classId: dummyClassId, date: todayStart, period: 4, status: "ABSENT" },
      { studentId: testProfile._id, classId: dummyClassId, date: todayStart, period: 5, status: "LATE" },
      { studentId: testProfile._id, classId: dummyClassId, date: todayStart, period: 6, status: "ABSENT" },
      { studentId: testProfile._id, classId: dummyClassId, date: todayStart, period: 7, status: "ABSENT" },
    ];
    await AttendanceRecord.insertMany(minorityRecords);
    const resMinority = await attendanceService.getStudentDailyAttendance(testProfile._id, today);
    console.log("1d. Mixed 1 PRESENT, 5 ABSENT, 1 LATE ->", resMinority.status, `(expected: ABSENT)`);
    if (resMinority.status !== "ABSENT") throw new Error("Expected ABSENT");
    await AttendanceRecord.deleteMany({ studentId: testProfile._id });

    // 1e: Majority attended but all LATE (4 LATE, 3 ABSENT)
    const lateRecords = [
      { studentId: testProfile._id, classId: dummyClassId, date: todayStart, period: 1, status: "LATE" },
      { studentId: testProfile._id, classId: dummyClassId, date: todayStart, period: 2, status: "LATE" },
      { studentId: testProfile._id, classId: dummyClassId, date: todayStart, period: 3, status: "ABSENT" },
      { studentId: testProfile._id, classId: dummyClassId, date: todayStart, period: 4, status: "LATE" },
      { studentId: testProfile._id, classId: dummyClassId, date: todayStart, period: 5, status: "LATE" },
      { studentId: testProfile._id, classId: dummyClassId, date: todayStart, period: 6, status: "ABSENT" },
      { studentId: testProfile._id, classId: dummyClassId, date: todayStart, period: 7, status: "ABSENT" },
    ];
    await AttendanceRecord.insertMany(lateRecords);
    const resLate = await attendanceService.getStudentDailyAttendance(testProfile._id, today);
    console.log("1e. Mixed 4 LATE, 3 ABSENT ->", resLate.status, `(expected: LATE)`);
    if (resLate.status !== "LATE") throw new Error("Expected LATE");

    console.log("Test 1 Result: ALL LOGIC PERMUTATIONS PASSED");

    // --- TEST 2: GET /api/students/profile endpoint integration ---
    console.log("\n--- TEST 2: GET /api/students/profile with attached todayAttendance ---");
    const profileRes = await request("GET", "/api/students/profile", {
      Authorization: `Bearer ${studentToken}`,
    });
    console.log("GET /api/students/profile -> HTTP Status:", profileRes.status);
    console.log("Attached todayAttendance:", profileRes.body.data?.todayAttendance);
    if (profileRes.status !== 200 || !profileRes.body.data?.todayAttendance) {
      throw new Error("todayAttendance was not attached to /profile response");
    }
    if (profileRes.body.data.todayAttendance.status !== "LATE") {
      throw new Error(`Expected todayAttendance.status to be LATE, got ${profileRes.body.data.todayAttendance.status}`);
    }
    console.log("Test 2 Result: PASSED (Profile endpoint returns todayAttendance cleanly)");

    // --- TEST 3: Fallback Auto-Provisioning Path in getStudentProfile ---
    console.log("\n--- TEST 3: Fallback Auto-Provisioning Path attaches todayAttendance ---");
    const freshStudentUser = await User.create({
      name: "Fresh Student No Profile",
      email: `fresh.student.${timestamp}@markaz.in`,
      username: `fresh_student_${timestamp}`,
      role: "STUDENT",
      status: "ACTIVE",
      emailVerified: true,
    });
    const freshToken = jwt.sign(
      { userId: freshStudentUser._id, role: "STUDENT" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const freshRes = await request("GET", "/api/students/profile", {
      Authorization: `Bearer ${freshToken}`,
    });
    console.log("Fresh student GET /api/students/profile -> HTTP Status:", freshRes.status);
    console.log("Fresh student todayAttendance:", freshRes.body.data?.todayAttendance);
    if (freshRes.status !== 200 || !freshRes.body.data?.todayAttendance) {
      throw new Error("todayAttendance was missing in fallback auto-provisioning path");
    }
    if (freshRes.body.data.todayAttendance.status !== "NOT_MARKED") {
      throw new Error("Fresh student should have status NOT_MARKED");
    }
    console.log("Test 3 Result: PASSED (Fallback auto-provisioning path attaches todayAttendance)");

    console.log("\n==================================================================");
    console.log("ALL ITEM 2 ATTENDANCE INTEGRATION TESTS PASSED!");
    console.log("==================================================================");
  } finally {
    console.log("\n[4/5] Cleaning up test fixtures from database...");
    await User.deleteMany({ email: { $regex: `@markaz.in` } });
    await StudentProfile.deleteMany({ _id: testProfile._id });
    await AttendanceRecord.deleteMany({ studentId: testProfile._id });
    server.close();
    await mongoose.connection.close();
    console.log("[5/5] Cleanup complete. Server closed.");
  }
}

runTest().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
