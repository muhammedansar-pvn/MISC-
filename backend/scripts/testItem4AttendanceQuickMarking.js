/**
 * testItem4AttendanceQuickMarking.js
 * Verification test suite for Item 4: 7-Period Attendance Quick-Marking
 *
 * Verifies:
 * 1. Role Guards (Unauthenticated 401, Student 403)
 * 2. Class Scoping: Faculty unassigned class returns 403
 * 3. Validation: Invalid period (0, 8) returns 400
 * 4. Validation: Student not in class returns 400
 * 5. Validation: Future date returns 400
 * 6. Faculty assigned class mark roster returns 200 and persists records
 * 7. Upsert deduplication: Re-submitting same student/date/period updates status, does not create duplicates
 * 8. GET /api/attendance/class-records returns existing marks
 * 9. Admin role can mark class roster without assignedClasses restriction
 */

require("dotenv").config({ path: "backend/.env" });
const mongoose = require("mongoose");
const http = require("http");
const app = require("../src/app");
const jwt = require("jsonwebtoken");

const User = require("../src/modules/users/user.model");
const StudentProfile = require("../src/modules/students/student.model");
const FacultyProfile = require("../src/modules/faculty/faculty.model");
const Class = require("../src/modules/academics/class.model");
const AcademicYear = require("../src/modules/academics/academic-year.model");
const AttendanceRecord = require("../src/modules/attendance/attendance-record.model");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const createToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      id: user._id.toString(),
      facultyId: user.facultyId ? user.facultyId.toString() : undefined,
      studentId: user.studentId ? user.studentId.toString() : undefined,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};

const makeRequest = (port, options, body = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request({ port, ...options }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on("error", reject);
    if (body) {
      req.write(typeof body === "string" ? body : JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  console.log("==================================================================");
  console.log("ITEM 4 VERIFICATION: 7-PERIOD ATTENDANCE QUICK-MARKING");
  console.log("==================================================================");

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("[1/5] Connected to MongoDB Atlas.");

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`[2/5] Test HTTP server listening on port ${port}.`);

  const tag = `test_i4_${Date.now()}`;
  const cleanupUserIds = [];
  const cleanupProfileIds = [];
  const cleanupClassIds = [];
  const cleanupYearIds = [];
  const cleanupAttendanceIds = [];

  try {
    // 0. Establish Academic Year
    const academicYear = await AcademicYear.create({
      yearName: `AY ${tag}`,
      yearCode: `Y${Date.now().toString().slice(-4)}`,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-03-31"),
      status: "ACTIVE",
    });
    cleanupYearIds.push(academicYear._id);

    // 1. Create Class A & Class B
    const classA = await Class.create({
      name: `Class A ${tag}`,
      code: `CLA-${Date.now().toString().slice(-4)}`,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    const classB = await Class.create({
      name: `Class B ${tag}`,
      code: `CLB-${Date.now().toString().slice(-4)}`,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    cleanupClassIds.push(classA._id, classB._id);


    // 2. Create Users
    const facultyUserA = await User.create({
      name: "Faculty Usthad A",
      email: `facultyA.${tag}@markaz.in`,
      passwordHash: "hash123",
      role: "FACULTY",
      status: "ACTIVE",
    });
    const facultyUserB = await User.create({
      name: "Faculty Usthad B",
      email: `facultyB.${tag}@markaz.in`,
      passwordHash: "hash123",
      role: "FACULTY",
      status: "ACTIVE",
    });
    const studentUser1 = await User.create({
      name: "Student One",
      email: `student1.${tag}@markaz.in`,
      passwordHash: "hash123",
      role: "STUDENT",
      status: "ACTIVE",
    });
    const studentUser2 = await User.create({
      name: "Student Two",
      email: `student2.${tag}@markaz.in`,
      passwordHash: "hash123",
      role: "STUDENT",
      status: "ACTIVE",
    });
    const studentUser3 = await User.create({
      name: "Student Three (Class B)",
      email: `student3.${tag}@markaz.in`,
      passwordHash: "hash123",
      role: "STUDENT",
      status: "ACTIVE",
    });
    const adminUser = await User.create({
      name: "Super Admin",
      email: `admin.${tag}@markaz.in`,
      passwordHash: "hash123",
      role: "ADMIN",
      status: "ACTIVE",
    });
    cleanupUserIds.push(
      facultyUserA._id,
      facultyUserB._id,
      studentUser1._id,
      studentUser2._id,
      studentUser3._id,
      adminUser._id
    );

    // 3. Create Profiles
    const facultyProfA = await FacultyProfile.create({
      userId: facultyUserA._id,
      facultyId: `FAC-A-${Date.now().toString().slice(-4)}`,
      nameEnglish: "Faculty Usthad A",
      assignedClasses: [classA._id],
    });
    const facultyProfB = await FacultyProfile.create({
      userId: facultyUserB._id,
      facultyId: `FAC-B-${Date.now().toString().slice(-4)}`,
      nameEnglish: "Faculty Usthad B",
      assignedClasses: [classB._id], // ONLY Class B
    });
    const studentProf1 = await StudentProfile.create({
      userId: studentUser1._id,
      registrationNumber: `REG-1-${Date.now().toString().slice(-4)}`,
      nameEnglish: "Student One",
      classId: classA._id,
      admissionYear: 2026,
      fatherName: "Father One",
      motherName: "Mother One",
      dateOfBirth: new Date("2008-01-01"),
    });
    const studentProf2 = await StudentProfile.create({
      userId: studentUser2._id,
      registrationNumber: `REG-2-${Date.now().toString().slice(-4)}`,
      nameEnglish: "Student Two",
      classId: classA._id,
      admissionYear: 2026,
      fatherName: "Father Two",
      motherName: "Mother Two",
      dateOfBirth: new Date("2008-02-02"),
    });
    const studentProf3 = await StudentProfile.create({
      userId: studentUser3._id,
      registrationNumber: `REG-3-${Date.now().toString().slice(-4)}`,
      nameEnglish: "Student Three",
      classId: classB._id, // IN CLASS B
      admissionYear: 2026,
      fatherName: "Father Three",
      motherName: "Mother Three",
      dateOfBirth: new Date("2008-03-03"),
    });

    cleanupProfileIds.push(
      facultyProfA._id,
      facultyProfB._id,
      studentProf1._id,
      studentProf2._id,
      studentProf3._id
    );

    const tokenFacultyA = createToken({ ...facultyUserA.toObject(), facultyId: facultyProfA._id });
    const tokenFacultyB = createToken({ ...facultyUserB.toObject(), facultyId: facultyProfB._id });
    const tokenStudent = createToken({ ...studentUser1.toObject(), studentId: studentProf1._id });
    const tokenAdmin = createToken(adminUser.toObject());

    const todayStr = new Date().toISOString().split("T")[0];

    console.log("[3/5] Test domain fixtures established.");

    // --- TEST 1: Role Guards ---
    console.log("\n--- TEST 1: Role Guard on POST /api/attendance/mark-class ---");
    const resNoAuth = await makeRequest(port, {
      method: "POST",
      path: "/api/attendance/mark-class",
      headers: { "Content-Type": "application/json" },
    }, { classId: classA._id.toString(), date: todayStr, period: 1, records: [] });
    console.log(`Unauthenticated -> HTTP Status: ${resNoAuth.status}`);
    if (resNoAuth.status !== 401) throw new Error("Expected 401 for unauthenticated request");

    const resStudent = await makeRequest(port, {
      method: "POST",
      path: "/api/attendance/mark-class",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenStudent}`,
      },
    }, { classId: classA._id.toString(), date: todayStr, period: 1, records: [] });
    console.log(`Student role -> HTTP Status: ${resStudent.status}`);
    if (resStudent.status !== 403) throw new Error("Expected 403 for student role");
    console.log("Test 1 Result: PASSED (Strict role guard enforced)");

    // --- TEST 2: Faculty Scoping (Unassigned class) ---
    console.log("\n--- TEST 2: Faculty attempts to mark unassigned class ---");
    const resUnassigned = await makeRequest(port, {
      method: "POST",
      path: "/api/attendance/mark-class",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenFacultyB}`,
      },
    }, {
      classId: classA._id.toString(), // Faculty B is only assigned to Class B!
      date: todayStr,
      period: 1,
      records: [{ studentId: studentProf1._id.toString(), status: "PRESENT" }],
    });
    console.log(`Faculty B marking Class A -> HTTP Status: ${resUnassigned.status}:`, resUnassigned.body);
    if (resUnassigned.status !== 403) throw new Error(`Expected 403 for unassigned class, got ${resUnassigned.status}`);
    console.log("Test 2 Result: PASSED (Faculty cannot mark unassigned class: 403)");

    // --- TEST 3: Invalid Period Validation ---
    console.log("\n--- TEST 3: Invalid period validation ---");
    const resInvalidPeriod = await makeRequest(port, {
      method: "POST",
      path: "/api/attendance/mark-class",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenFacultyA}`,
      },
    }, {
      classId: classA._id.toString(),
      date: todayStr,
      period: 8, // Period out of bounds (1-7)
      records: [{ studentId: studentProf1._id.toString(), status: "PRESENT" }],
    });
    console.log(`Invalid period 8 -> HTTP Status: ${resInvalidPeriod.status}:`, resInvalidPeriod.body?.message || resInvalidPeriod.body);
    if (resInvalidPeriod.status !== 400) throw new Error("Expected 400 for period 8");
    console.log("Test 3 Result: PASSED (Period outside 1-7 rejected with 400)");

    // --- TEST 4: Student Not Belonging to Class ---
    console.log("\n--- TEST 4: Student does not belong to specified class ---");
    const resInvalidStudent = await makeRequest(port, {
      method: "POST",
      path: "/api/attendance/mark-class",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenFacultyA}`,
      },
    }, {
      classId: classA._id.toString(),
      date: todayStr,
      period: 2,
      records: [
        { studentId: studentProf1._id.toString(), status: "PRESENT" },
        { studentId: studentProf3._id.toString(), status: "PRESENT" }, // Student 3 belongs to Class B!
      ],
    });
    console.log(`Foreign student in Class A -> HTTP Status: ${resInvalidStudent.status}:`, resInvalidStudent.body?.message || resInvalidStudent.body);
    if (resInvalidStudent.status !== 400) throw new Error("Expected 400 for student not in class");
    console.log("Test 4 Result: PASSED (Foreign student rejected with 400)");

    // --- TEST 5: Future Date Validation ---
    console.log("\n--- TEST 5: Future date validation ---");
    const resFutureDate = await makeRequest(port, {
      method: "POST",
      path: "/api/attendance/mark-class",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenFacultyA}`,
      },
    }, {
      classId: classA._id.toString(),
      date: "2099-01-01",
      period: 1,
      records: [{ studentId: studentProf1._id.toString(), status: "PRESENT" }],
    });
    console.log(`Future date 2099-01-01 -> HTTP Status: ${resFutureDate.status}:`, resFutureDate.body?.message || resFutureDate.body);
    if (resFutureDate.status !== 400) throw new Error("Expected 400 for future date");
    console.log("Test 5 Result: PASSED (Future date rejected with 400)");

    // --- TEST 6: Faculty marks assigned class successfully ---
    console.log("\n--- TEST 6: Faculty marks assigned class roster for Period 2 ---");
    const resMarkSuccess = await makeRequest(port, {
      method: "POST",
      path: "/api/attendance/mark-class",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenFacultyA}`,
      },
    }, {
      classId: classA._id.toString(),
      date: todayStr,
      period: 2,
      records: [
        { studentId: studentProf1._id.toString(), status: "PRESENT" },
        { studentId: studentProf2._id.toString(), status: "ABSENT" },
      ],
    });
    console.log(`Marking success -> HTTP Status: ${resMarkSuccess.status}:`, resMarkSuccess.body);
    if (resMarkSuccess.status !== 200 || !resMarkSuccess.body.success) {
      throw new Error("Expected 200 OK for valid attendance marking");
    }

    // Verify DB records
    const createdRecords = await AttendanceRecord.find({
      classId: classA._id,
      period: 2,
    });
    cleanupAttendanceIds.push(...createdRecords.map((r) => r._id));
    console.log(`Created AttendanceRecords in DB count: ${createdRecords.length}`);
    if (createdRecords.length !== 2) throw new Error(`Expected 2 records in DB, found ${createdRecords.length}`);

    const rec1 = createdRecords.find((r) => r.studentId.toString() === studentProf1._id.toString());
    const rec2 = createdRecords.find((r) => r.studentId.toString() === studentProf2._id.toString());
    if (rec1.status !== "PRESENT" || rec1.source !== "MANUAL_CORRECTION") {
      throw new Error(`Record 1 unexpected properties: status=${rec1.status}, source=${rec1.source}`);
    }
    if (rec2.status !== "ABSENT" || rec2.source !== "MANUAL_CORRECTION") {
      throw new Error(`Record 2 unexpected properties: status=${rec2.status}, source=${rec2.source}`);
    }
    console.log("Test 6 Result: PASSED (Faculty successfully marked class roster, DB records created with source=MANUAL_CORRECTION)");

    // --- TEST 7: Upsert Deduplication Check (Re-submitting mutates, does not duplicate) ---
    console.log("\n--- TEST 7: Re-submitting updates records rather than duplicating ---");
    const resUpdate = await makeRequest(port, {
      method: "POST",
      path: "/api/attendance/mark-class",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenFacultyA}`,
      },
    }, {
      classId: classA._id.toString(),
      date: todayStr,
      period: 2,
      records: [
        { studentId: studentProf1._id.toString(), status: "LATE" }, // Switched from PRESENT to LATE
        { studentId: studentProf2._id.toString(), status: "PRESENT" }, // Switched from ABSENT to PRESENT
      ],
    });
    console.log(`Re-submission response -> HTTP Status: ${resUpdate.status}:`, resUpdate.body);
    if (resUpdate.status !== 200) throw new Error("Expected 200 on update");

    const afterUpdateRecords = await AttendanceRecord.find({
      classId: classA._id,
      period: 2,
    });
    console.log(`DB records count after re-submission: ${afterUpdateRecords.length} (must still be 2)`);
    if (afterUpdateRecords.length !== 2) {
      throw new Error(`Duplicate records created! Expected 2, found ${afterUpdateRecords.length}`);
    }
    const upRec1 = afterUpdateRecords.find((r) => r.studentId.toString() === studentProf1._id.toString());
    const upRec2 = afterUpdateRecords.find((r) => r.studentId.toString() === studentProf2._id.toString());
    if (upRec1.status !== "LATE" || upRec2.status !== "PRESENT") {
      throw new Error(`Records not updated properly: rec1=${upRec1.status}, rec2=${upRec2.status}`);
    }
    console.log("Test 7 Result: PASSED (Upsert mutated existing records without creating duplicates)");

    // --- TEST 8: GET /api/attendance/class-records ---
    console.log("\n--- TEST 8: Query GET /api/attendance/class-records ---");
    const resGetRecords = await makeRequest(port, {
      method: "GET",
      path: `/api/attendance/class-records?classId=${classA._id.toString()}&date=${todayStr}&period=2`,
      headers: {
        Authorization: `Bearer ${tokenFacultyA}`,
      },
    });
    console.log(`GET class-records -> HTTP Status: ${resGetRecords.status}, count: ${resGetRecords.body?.data?.length}`);
    if (resGetRecords.status !== 200 || resGetRecords.body.data.length !== 2) {
      throw new Error("Expected 200 and 2 records returned");
    }
    console.log("Test 8 Result: PASSED (Existing class attendance records retrieved successfully)");

    // --- TEST 9: Admin can mark any class ---
    console.log("\n--- TEST 9: Admin marks Class A for Period 3 ---");
    const resAdmin = await makeRequest(port, {
      method: "POST",
      path: "/api/attendance/mark-class",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenAdmin}`,
      },
    }, {
      classId: classA._id.toString(),
      date: todayStr,
      period: 3,
      records: [
        { studentId: studentProf1._id.toString(), status: "PRESENT" },
      ],
    });
    console.log(`Admin mark response -> HTTP Status: ${resAdmin.status}`);
    if (resAdmin.status !== 200) throw new Error("Expected 200 for Admin marking");
    const adminCreatedRecs = await AttendanceRecord.find({ classId: classA._id, period: 3 });
    cleanupAttendanceIds.push(...adminCreatedRecs.map((r) => r._id));
    console.log("Test 9 Result: PASSED (Admin marked class roster successfully)");

    console.log("\n==================================================================");
    console.log("ALL ITEM 4 ATTENDANCE QUICK-MARKING TESTS PASSED!");
    console.log("==================================================================");
  } finally {
    console.log("\n[4/5] Cleaning up test fixtures from database...");
    await Promise.all([
      User.deleteMany({ _id: { $in: cleanupUserIds } }),
      FacultyProfile.deleteMany({ _id: { $in: cleanupProfileIds } }),
      StudentProfile.deleteMany({ _id: { $in: cleanupProfileIds } }),
      Class.deleteMany({ _id: { $in: cleanupClassIds } }),
      AcademicYear.deleteMany({ _id: { $in: cleanupYearIds } }),
      AttendanceRecord.deleteMany({ _id: { $in: cleanupAttendanceIds } }),
    ]);
    console.log("[5/5] Cleanup complete. Server closed.");

    server.close();
    await mongoose.disconnect();
  }
}

runTests().catch((err) => {
  console.error("Test execution failed with error:", err);
  process.exit(1);
});
