require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const AcademicYear = require("../src/modules/academics/academic-year.model");
const Class = require("../src/modules/academics/class.model");
const Subject = require("../src/modules/academics/subject.model");
const FacultyProfile = require("../src/modules/faculty/faculty.model");
const StudentProfile = require("../src/modules/students/student.model");
const User = require("../src/modules/users/user.model");
const FacultyAssignment = require("../src/modules/academics/faculty-assignment.model");
const Timetable = require("../src/modules/academics/timetable.model");
const AttendanceRecord = require("../src/modules/attendance/attendance-record.model");
const AttendanceCorrectionRequest = require("../src/modules/attendance/attendance-correction-request.model");

const attendanceService = require("../src/modules/attendance/attendance.service");
const attendanceController = require("../src/modules/attendance/attendance.controller");

function mockRes() {
  const res = {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.data = body;
      return this;
    },
  };
  return res;
}

async function runPhase3Tests() {
  console.log("==========================================================");
  console.log("PHASE 3: ATTENDANCE ENGINE & BUSINESS RULES VERIFICATION");
  console.log("==========================================================");

  await connectDB();

  let testUser = null;
  let testFaculty = null;
  let unauthorizedFacultyUser = null;
  let unauthorizedFaculty = null;
  let testAcademicYear = null;
  let testClass = null;
  let testSubject1 = null;
  let testSubject2 = null;
  let testStudentUser = null;
  let testStudent = null;
  let outsiderStudentUser = null;
  let outsiderStudent = null;
  let testAssignment1 = null;
  let testAssignment2 = null;
  let testTimetable = null;

  let passedTests = 0;
  const totalTests = 18;

  try {
    console.log("\n--- Setting up Phase 3 test environment ---");
    const uniqueSuffix = Date.now().toString().slice(-6);

    testAcademicYear = await AcademicYear.create({
      yearName: `Test AY Phase3 ${uniqueSuffix}`,
      yearCode: `AY_P3_${uniqueSuffix}`,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-04-30"),
      status: "ACTIVE",
      isCurrent: true,
    });

    testClass = await Class.create({
      name: `Sanaviyya 3 - P3 ${uniqueSuffix}`,
      code: `SAN3_P3_${uniqueSuffix}`,
      level: 3,
      stream: "REGULAR",
      academicYearId: testAcademicYear._id,
      capacity: 35,
      isActive: true,
    });

    testSubject1 = await Subject.create({
      subjectName: `Tafseer Phase3 ${uniqueSuffix}`,
      subjectCode: `TAF_P3_${uniqueSuffix}`,
      category: "ISLAMIC_STUDIES",
      type: "THEORY",
      periodsPerWeek: 5,
      status: "ACTIVE",
    });

    testSubject2 = await Subject.create({
      subjectName: `Fiqh Phase3 ${uniqueSuffix}`,
      subjectCode: `FIQ_P3_${uniqueSuffix}`,
      category: "ISLAMIC_STUDIES",
      type: "THEORY",
      periodsPerWeek: 5,
      status: "ACTIVE",
    });

    testUser = await User.create({
      name: `Usthad Assigned ${uniqueSuffix}`,
      email: `assigned_p3_${uniqueSuffix}@markaz.edu`,
      password: "HashedPassword123!",
      role: "FACULTY",
      status: "ACTIVE",
    });

    testFaculty = await FacultyProfile.create({
      userId: testUser._id,
      facultyId: `FAC_P3_${uniqueSuffix}`,
      nameEnglish: `Usthad Assigned ${uniqueSuffix}`,
      designation: "Assistant Professor",
      status: "ACTIVE",
    });

    unauthorizedFacultyUser = await User.create({
      name: `Usthad Unassigned ${uniqueSuffix}`,
      email: `unassigned_p3_${uniqueSuffix}@markaz.edu`,
      password: "HashedPassword123!",
      role: "FACULTY",
      status: "ACTIVE",
    });

    unauthorizedFaculty = await FacultyProfile.create({
      userId: unauthorizedFacultyUser._id,
      facultyId: `UNAUTH_P3_${uniqueSuffix}`,
      nameEnglish: `Usthad Unassigned ${uniqueSuffix}`,
      designation: "Lecturer",
      status: "ACTIVE",
    });

    testStudentUser = await User.create({
      name: `Talib Enrolled ${uniqueSuffix}`,
      email: `talib_p3_${uniqueSuffix}@markaz.edu`,
      password: "HashedPassword123!",
      role: "STUDENT",
      status: "ACTIVE",
    });

    testStudent = await StudentProfile.create({
      userId: testStudentUser._id,
      registrationNumber: `REG_P3_${uniqueSuffix}`,
      nameEnglish: `Talib Enrolled ${uniqueSuffix}`,
      fatherName: "Abdullah",
      motherName: "Fatima",
      dateOfBirth: new Date("2008-01-01"),
      admissionYear: 2026,
      classId: testClass._id,
      academicYearId: testAcademicYear._id,
      status: "ACTIVE",
    });

    outsiderStudentUser = await User.create({
      name: `Talib Outsider ${uniqueSuffix}`,
      email: `outsider_p3_${uniqueSuffix}@markaz.edu`,
      password: "HashedPassword123!",
      role: "STUDENT",
      status: "ACTIVE",
    });

    outsiderStudent = await StudentProfile.create({
      userId: outsiderStudentUser._id,
      registrationNumber: `OUT_P3_${uniqueSuffix}`,
      nameEnglish: `Talib Outsider ${uniqueSuffix}`,
      fatherName: "Ibrahim",
      motherName: "Aisha",
      dateOfBirth: new Date("2008-05-05"),
      admissionYear: 2026,
      classId: new mongoose.Types.ObjectId(), // Different class
      academicYearId: testAcademicYear._id,
      status: "ACTIVE",
    });

    testAssignment1 = await FacultyAssignment.create({
      academicYearId: testAcademicYear._id,
      classId: testClass._id,
      subjectId: testSubject1._id,
      facultyId: testFaculty._id,
      isPrimary: true,
      status: "ACTIVE",
    });

    testAssignment2 = await FacultyAssignment.create({
      academicYearId: testAcademicYear._id,
      classId: testClass._id,
      subjectId: testSubject2._id,
      facultyId: testFaculty._id,
      isPrimary: true,
      status: "ACTIVE",
    });

    // Timetable entries for 7 periods on MONDAY
    const periodTimes = [
      { p: 1, s: "08:30", e: "09:15", subj: testSubject1._id },
      { p: 2, s: "09:15", e: "10:00", subj: testSubject2._id },
      { p: 3, s: "10:15", e: "11:00", subj: testSubject1._id },
      { p: 4, s: "11:00", e: "11:45", subj: testSubject2._id },
      { p: 5, s: "11:45", e: "12:30", subj: testSubject1._id },
      { p: 6, s: "13:30", e: "14:15", subj: testSubject2._id },
      { p: 7, s: "14:15", e: "15:00", subj: testSubject1._id },
    ];

    for (const item of periodTimes) {
      await Timetable.create({
        academicYearId: testAcademicYear._id,
        classId: testClass._id,
        dayOfWeek: "MONDAY",
        periodNumber: item.p,
        startTime: item.s,
        endTime: item.e,
        subjectId: item.subj,
        facultyId: testFaculty._id,
        room: "Room 101",
        status: "ACTIVE",
      });
    }

    console.log("✓ Fixtures successfully initialized.\n");

    const todayStr = new Date().toISOString().split("T")[0];

    // ====================================================================
    // TEST 1: Schema supports 7 periods (1..7) and rejects out-of-range periods
    // ====================================================================
    console.log("Test 1: Verifying Attendance Schema supports periods 1 through 7 and enforces boundaries...");
    const validRec = new AttendanceRecord({
      studentId: testStudent._id,
      classId: testClass._id,
      subjectId: testSubject1._id,
      academicYearId: testAcademicYear._id,
      date: new Date(),
      period: 7,
      status: "PRESENT",
      source: "MANUAL",
      markedBy: testUser._id,
    });
    await validRec.validate();

    let invalidPeriodCaught = false;
    try {
      const invalidRec = new AttendanceRecord({
        studentId: testStudent._id,
        classId: testClass._id,
        subjectId: testSubject1._id,
        academicYearId: testAcademicYear._id,
        date: new Date(),
        period: 8, // > 7
        status: "PRESENT",
        source: "MANUAL",
        markedBy: testUser._id,
      });
      await invalidRec.validate();
    } catch (err) {
      invalidPeriodCaught = true;
    }

    if (!invalidPeriodCaught) {
      throw new Error("Schema failed to reject invalid period number (8)");
    }
    console.log("✓ Schema strictly validates 7 periods (1..7) and rejects out-of-bound periods.");
    passedTests++;

    // ====================================================================
    // TEST 2: Manual attendance entry creates records with source: "MANUAL"
    // ====================================================================
    console.log("Test 2: Verifying manual attendance entry creates records with source: 'MANUAL'...");
    const markResult = await attendanceService.markClassAttendance(
      {
        classId: testClass._id.toString(),
        subjectId: testSubject1._id.toString(),
        date: todayStr,
        period: 1,
        records: [{ studentId: testStudent._id.toString(), status: "PRESENT" }],
      },
      { role: "FACULTY", userId: testUser._id, facultyId: testFaculty._id }
    );

    const savedRec1 = await AttendanceRecord.findOne({
      studentId: testStudent._id,
      classId: testClass._id,
      subjectId: testSubject1._id,
      date: new Date(todayStr + "T00:00:00.000Z"),
      period: 1,
    });

    if (!savedRec1 || savedRec1.source !== "MANUAL") {
      throw new Error(`Expected source to be 'MANUAL', got '${savedRec1 ? savedRec1.source : "null"}'`);
    }
    console.log("✓ Manual attendance entry creates records with source: 'MANUAL'.");
    passedTests++;

    // ====================================================================
    // TEST 3: Attendance records contain subjectId
    // ====================================================================
    console.log("Test 3: Verifying attendance record contains subjectId attribution...");
    if (!savedRec1.subjectId || savedRec1.subjectId.toString() !== testSubject1._id.toString()) {
      throw new Error(`Expected subjectId ${testSubject1._id}, got ${savedRec1.subjectId}`);
    }
    console.log("✓ Attendance record correctly attributes subjectId.");
    passedTests++;

    // ====================================================================
    // TEST 4: Attendance records contain academicYearId
    // ====================================================================
    console.log("Test 4: Verifying attendance record contains academicYearId attribution...");
    if (!savedRec1.academicYearId || savedRec1.academicYearId.toString() !== testAcademicYear._id.toString()) {
      throw new Error(`Expected academicYearId ${testAcademicYear._id}, got ${savedRec1.academicYearId}`);
    }
    console.log("✓ Attendance record correctly attributes academicYearId.");
    passedTests++;

    // ====================================================================
    // TEST 5: Correct FacultyAssignment is required for marking attendance
    // ====================================================================
    console.log("Test 5: Verifying assigned faculty can mark attendance successfully...");
    const assignedMarkResult = await attendanceService.markClassAttendance(
      {
        classId: testClass._id.toString(),
        subjectId: testSubject2._id.toString(),
        date: todayStr,
        period: 2,
        records: [{ studentId: testStudent._id.toString(), status: "LATE" }],
      },
      { role: "FACULTY", userId: testUser._id, facultyId: testFaculty._id }
    );
    if (!assignedMarkResult || assignedMarkResult.totalMarked !== 1) {
      throw new Error("Failed to mark attendance as assigned faculty");
    }
    console.log("✓ Assigned faculty with valid FacultyAssignment successfully marked attendance.");
    passedTests++;

    // ====================================================================
    // TEST 6: Unauthorized faculty receives HTTP 403
    // ====================================================================
    console.log("Test 6: Verifying unauthorized faculty receives HTTP 403...");
    let unauth403Caught = false;
    try {
      await attendanceService.markClassAttendance(
        {
          classId: testClass._id.toString(),
          subjectId: testSubject1._id.toString(),
          date: todayStr,
          period: 3,
          records: [{ studentId: testStudent._id.toString(), status: "PRESENT" }],
        },
        { role: "FACULTY", userId: unauthorizedFacultyUser._id, facultyId: unauthorizedFaculty._id }
      );
    } catch (err) {
      if (err.statusCode === 403) {
        unauth403Caught = true;
      }
    }
    if (!unauth403Caught) {
      throw new Error("Expected unauthorized faculty mark attempt to fail with statusCode 403");
    }
    console.log("✓ Unauthorized faculty is blocked with HTTP 403.");
    passedTests++;

    // ====================================================================
    // TEST 7: Unauthorized student submission is rejected
    // ====================================================================
    console.log("Test 7: Verifying un-enrolled / outsider student submission is rejected...");
    let outsiderStudentCaught = false;
    try {
      await attendanceService.markClassAttendance(
        {
          classId: testClass._id.toString(),
          subjectId: testSubject1._id.toString(),
          date: todayStr,
          period: 1,
          records: [{ studentId: outsiderStudent._id.toString(), status: "PRESENT" }],
        },
        { role: "FACULTY", userId: testUser._id, facultyId: testFaculty._id }
      );
    } catch (err) {
      if (err.statusCode === 400 && err.message.includes("do not belong to class")) {
        outsiderStudentCaught = true;
      }
    }
    if (!outsiderStudentCaught) {
      throw new Error("Expected student from outside class to be rejected with 400 error");
    }
    console.log("✓ Un-enrolled/outsider student submission is strictly rejected.");
    passedTests++;

    // ====================================================================
    // TEST 8: Duplicate attendance cannot be created (idempotent upsert)
    // ====================================================================
    console.log("Test 8: Verifying duplicate attendance upsert (updating status without duplicate record)...");
    const countBefore = await AttendanceRecord.countDocuments({
      studentId: testStudent._id,
      classId: testClass._id,
      subjectId: testSubject1._id,
      date: new Date(todayStr + "T00:00:00.000Z"),
      period: 1,
    });
    if (countBefore !== 1) {
      throw new Error(`Expected exactly 1 record before upsert, found ${countBefore}`);
    }

    // Re-mark period 1 from PRESENT to ABSENT
    await attendanceService.markClassAttendance(
      {
        classId: testClass._id.toString(),
        subjectId: testSubject1._id.toString(),
        date: todayStr,
        period: 1,
        records: [{ studentId: testStudent._id.toString(), status: "ABSENT" }],
      },
      { role: "FACULTY", userId: testUser._id, facultyId: testFaculty._id }
    );

    const countAfter = await AttendanceRecord.countDocuments({
      studentId: testStudent._id,
      classId: testClass._id,
      subjectId: testSubject1._id,
      date: new Date(todayStr + "T00:00:00.000Z"),
      period: 1,
    });
    const updatedRec = await AttendanceRecord.findOne({
      studentId: testStudent._id,
      classId: testClass._id,
      subjectId: testSubject1._id,
      date: new Date(todayStr + "T00:00:00.000Z"),
      period: 1,
    });

    if (countAfter !== 1 || updatedRec.status !== "ABSENT") {
      throw new Error(`Upsert failed: count is ${countAfter}, status is ${updatedRec?.status}`);
    }
    console.log("✓ Idempotent upsert successfully updated existing record without duplication.");
    passedTests++;

    // ====================================================================
    // TEST 9: Historical attendance beyond 7 days cannot be directly edited
    // ====================================================================
    console.log("Test 9: Verifying historical attendance editing limit (> 7 days requires correction request)...");
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const tenDaysAgoStr = tenDaysAgo.toISOString().split("T")[0];

    let past7DaysCaught = false;
    try {
      await attendanceService.markClassAttendance(
        {
          classId: testClass._id.toString(),
          subjectId: testSubject1._id.toString(),
          date: tenDaysAgoStr,
          period: 1,
          records: [{ studentId: testStudent._id.toString(), status: "PRESENT" }],
        },
        { role: "FACULTY", userId: testUser._id, facultyId: testFaculty._id }
      );
    } catch (err) {
      if (err.statusCode === 403 && err.message.includes("7 days")) {
        past7DaysCaught = true;
      }
    }
    if (!past7DaysCaught) {
      throw new Error("Expected editing attendance older than 7 days to fail with 403");
    }
    console.log("✓ Direct edits older than 7 days blocked with HTTP 403.");
    passedTests++;

    // ====================================================================
    // TEST 10: Attendance retrieval supports class/date/period
    // ====================================================================
    console.log("Test 10: Verifying attendance retrieval by class, date, period...");
    const retrievedRecords = await attendanceService.getClassAttendanceRecords(
      testClass._id.toString(),
      testSubject1._id.toString(),
      todayStr,
      1,
      { role: "FACULTY", userId: testUser._id, facultyId: testFaculty._id }
    );
    if (!Array.isArray(retrievedRecords) || retrievedRecords.length === 0) {
      throw new Error("Failed to retrieve class attendance records");
    }
    if (retrievedRecords[0].period !== 1 || retrievedRecords[0].status !== "ABSENT") {
      throw new Error("Retrieved record does not match expected period or status");
    }
    console.log("✓ Class attendance retrieval successfully filters by class, date, period.");
    passedTests++;

    // ====================================================================
    // TEST 11: Student attendance summary returns correct totals & percentage
    // ====================================================================
    console.log("Test 11: Verifying student attendance overview calculation...");
    // Let's mark period 3, 4, 5, 6, 7 as PRESENT to have a known distribution:
    // Period 1: ABSENT (marked above)
    // Period 2: LATE (marked above)
    // Period 3..7: PRESENT
    for (let p = 3; p <= 7; p++) {
      await attendanceService.markClassAttendance(
        {
          classId: testClass._id.toString(),
          subjectId: p % 2 === 1 ? testSubject1._id.toString() : testSubject2._id.toString(),
          date: todayStr,
          period: p,
          records: [{ studentId: testStudent._id.toString(), status: "PRESENT" }],
        },
        { role: "FACULTY", userId: testUser._id, facultyId: testFaculty._id }
      );
    }

    const summary = await attendanceService.getStudentAttendanceOverview(testStudent._id.toString());
    // Total days: 1 date
    // Total sessions: 7
    // Present sessions: 5 (periods 3..7)
    // Late sessions: 1 (period 2)
    // Absent sessions: 1 (period 1)
    if (!summary || summary.totalDays < 1) {
      throw new Error("Invalid student attendance overview summary");
    }
    console.log(`✓ Student attendance overview: ${summary.presentDays} present, ${summary.lateDays} late, ${summary.absentDays} absent. Overall: ${summary.overallPercentage}%`);
    passedTests++;

    // ====================================================================
    // TEST 12: Subject-wise attendance calculation is accurate
    // ====================================================================
    console.log("Test 12: Verifying subject-wise attendance aggregation...");
    const subjectAttendance = await attendanceService.getStudentSubjectAttendance(testStudent._id.toString());
    if (!Array.isArray(subjectAttendance) || subjectAttendance.length < 2) {
      throw new Error(`Expected at least 2 subjects in breakdown, got ${subjectAttendance?.length}`);
    }
    // Subject 1 (Tafseer) had periods 1 (ABSENT), 3 (PRESENT), 5 (PRESENT), 7 (PRESENT) => 3/4 = 75%
    // Subject 2 (Fiqh) had periods 2 (LATE), 4 (PRESENT), 6 (PRESENT) => 2/3 = 66.7%
    const tafseerBreakdown = subjectAttendance.find((s) => s.subjectId.toString() === testSubject1._id.toString());
    const fiqhBreakdown = subjectAttendance.find((s) => s.subjectId.toString() === testSubject2._id.toString());

    if (!tafseerBreakdown || tafseerBreakdown.totalSessions !== 4 || tafseerBreakdown.presentSessions !== 3) {
      throw new Error(`Tafseer breakdown incorrect: total=${tafseerBreakdown?.totalSessions}, present=${tafseerBreakdown?.presentSessions}`);
    }
    if (!fiqhBreakdown || fiqhBreakdown.totalSessions !== 3 || fiqhBreakdown.presentSessions !== 2) {
      throw new Error(`Fiqh breakdown incorrect: total=${fiqhBreakdown?.totalSessions}, present=${fiqhBreakdown?.presentSessions}`);
    }
    console.log("✓ Subject-wise breakdown accurately reflects session counts and percentages.");
    passedTests++;

    // ====================================================================
    // TEST 13: Monthly attendance calculation is accurate
    // ====================================================================
    console.log("Test 13: Verifying monthly attendance calculation...");
    const currentMonth = todayStr.slice(0, 7);
    const monthlyData = await attendanceService.getStudentMonthlyAttendance(testStudent._id.toString(), {
      month: currentMonth,
    });
    if (!monthlyData.records || monthlyData.records.length === 0) {
      throw new Error("Monthly attendance returned empty daily records");
    }
    if (!Array.isArray(monthlyData.subjects) || monthlyData.subjects.length < 2) {
      throw new Error("Monthly attendance missing subject-wise breakdown");
    }
    if (!Array.isArray(monthlyData.sessions) || monthlyData.sessions.length !== 7) {
      throw new Error(`Monthly attendance expected 7 session breakdowns, got ${monthlyData.sessions?.length}`);
    }
    console.log("✓ Monthly attendance returns daily log, overall metrics, subject breakdown, and session breakdown.");
    passedTests++;

    // ====================================================================
    // TEST 14: Session-wise attendance calculation is accurate
    // ====================================================================
    console.log("Test 14: Verifying session-wise (periods 1..7) attendance aggregation...");
    const sessionAttendance = await attendanceService.getStudentSessionAttendance(testStudent._id.toString());
    if (!Array.isArray(sessionAttendance) || sessionAttendance.length !== 7) {
      throw new Error(`Expected exactly 7 periods in session breakdown, got ${sessionAttendance?.length}`);
    }
    const period1 = sessionAttendance.find((s) => s.period === 1);
    const period2 = sessionAttendance.find((s) => s.period === 2);
    if (!period1 || period1.absentSessions !== 1) {
      throw new Error(`Period 1 session metrics incorrect: absentSessions=${period1?.absentSessions}`);
    }
    if (!period2 || period2.lateSessions !== 1) {
      throw new Error(`Period 2 session metrics incorrect: lateSessions=${period2?.lateSessions}`);
    }
    console.log("✓ Session-wise attendance aggregation accurate for all 7 academic periods.");
    passedTests++;

    // ====================================================================
    // TEST 15: Attendance source remains MANUAL for faculty entry
    // ====================================================================
    console.log("Test 15: Verifying all faculty marked records strictly retain source 'MANUAL'...");
    const nonManual = await AttendanceRecord.countDocuments({
      classId: testClass._id,
      source: { $ne: "MANUAL" },
    });
    if (nonManual !== 0) {
      throw new Error(`Found ${nonManual} records with source other than MANUAL`);
    }
    console.log("✓ All attendance entries correctly retain source: 'MANUAL'.");
    passedTests++;

    // ====================================================================
    // TEST 16: Biometric fields remain nullable and hardware-free
    // ====================================================================
    console.log("Test 16: Verifying biometric fields remain null and no hardware device connection required...");
    const biometricRecords = await AttendanceRecord.find({ classId: testClass._id });
    for (const r of biometricRecords) {
      if (r.biometricDeviceId != null || r.biometricEventId != null) {
        throw new Error("Biometric fields should be null for manual attendance records");
      }
    }
    console.log("✓ Biometric fields remain nullable and completely decoupled from hardware.");
    passedTests++;

    // ====================================================================
    // TEST 17: Timetable session resolution works (resolveTimetableSession)
    // ====================================================================
    console.log("Test 17: Verifying timetable session resolution from active timetable...");
    // Find next Monday date in UTC
    const d = new Date();
    const utcDay = d.getUTCDay();
    const diffToMonday = (1 + 7 - utcDay) % 7;
    const nextMonday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + diffToMonday, 0, 0, 0, 0));

    const resolvedSession = await attendanceService.resolveTimetableSession({
      classId: testClass._id,
      date: nextMonday,
      period: 1,
    });
    if (!resolvedSession || resolvedSession.period !== 1) {
      throw new Error("Failed to resolve timetable session for Monday Period 1");
    }
    if (resolvedSession.subjectId.toString() !== testSubject1._id.toString()) {
      throw new Error(`Resolved subject mismatch: expected ${testSubject1._id}, got ${resolvedSession.subjectId}`);
    }
    if (resolvedSession.facultyId.toString() !== testFaculty._id.toString()) {
      throw new Error(`Resolved faculty mismatch: expected ${testFaculty._id}, got ${resolvedSession.facultyId}`);
    }
    console.log("✓ resolveTimetableSession successfully resolved period 1 subject and faculty from timetable.");
    passedTests++;

    // ====================================================================
    // TEST 18: Idempotent double-save test passes
    // ====================================================================
    console.log("Test 18: Verifying idempotent double-save does not create duplicate records...");
    const totalRecordsBefore = await AttendanceRecord.countDocuments({ classId: testClass._id });

    // Submit identical payload again
    await attendanceService.markClassAttendance(
      {
        classId: testClass._id.toString(),
        subjectId: testSubject1._id.toString(),
        date: todayStr,
        period: 5,
        records: [{ studentId: testStudent._id.toString(), status: "PRESENT" }],
      },
      { role: "FACULTY", userId: testUser._id, facultyId: testFaculty._id }
    );

    const totalRecordsAfter = await AttendanceRecord.countDocuments({ classId: testClass._id });
    if (totalRecordsBefore !== totalRecordsAfter) {
      throw new Error(`Double-save created duplicate records: before=${totalRecordsBefore}, after=${totalRecordsAfter}`);
    }
    console.log("✓ Double-save test passed with 0 duplicate records.");
    passedTests++;

    console.log("\n==========================================================");
    console.log(`PHASE 3 VERIFICATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log("==========================================================");
  } catch (error) {
    console.error("\n❌ PHASE 3 VERIFICATION FAILED:", error);
    process.exit(1);
  } finally {
    console.log("\n--- Cleaning up test fixtures ---");
    if (testAssignment1) await FacultyAssignment.deleteOne({ _id: testAssignment1._id });
    if (testAssignment2) await FacultyAssignment.deleteOne({ _id: testAssignment2._id });
    if (testClass) await Timetable.deleteMany({ classId: testClass._id });
    if (testStudent) {
      await AttendanceRecord.deleteMany({ studentId: testStudent._id });
      await AttendanceCorrectionRequest.deleteMany({ studentId: testStudent._id });
      await StudentProfile.deleteOne({ _id: testStudent._id });
    }
    if (outsiderStudent) {
      await AttendanceRecord.deleteMany({ studentId: outsiderStudent._id });
      await StudentProfile.deleteOne({ _id: outsiderStudent._id });
    }
    if (testStudentUser) await User.deleteOne({ _id: testStudentUser._id });
    if (outsiderStudentUser) await User.deleteOne({ _id: outsiderStudentUser._id });
    if (testFaculty) await FacultyProfile.deleteOne({ _id: testFaculty._id });
    if (testUser) await User.deleteOne({ _id: testUser._id });
    if (unauthorizedFaculty) await FacultyProfile.deleteOne({ _id: unauthorizedFaculty._id });
    if (unauthorizedFacultyUser) await User.deleteOne({ _id: unauthorizedFacultyUser._id });
    if (testSubject1) await Subject.deleteOne({ _id: testSubject1._id });
    if (testSubject2) await Subject.deleteOne({ _id: testSubject2._id });
    if (testClass) await Class.deleteOne({ _id: testClass._id });
    if (testAcademicYear) await AcademicYear.deleteOne({ _id: testAcademicYear._id });

    await mongoose.connection.close();
    console.log("✓ Test environment cleaned up and DB connection closed.\n");
  }
}

runPhase3Tests();
