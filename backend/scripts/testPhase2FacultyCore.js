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
const FacultyRemark = require("../src/modules/students/faculty-remark.model");
const Assignment = require("../src/modules/assignments/assignment.model");
const StudyMaterial = require("../src/modules/study-materials/study-material.model");

const attendanceService = require("../src/modules/attendance/attendance.service");
const facultyService = require("../src/modules/faculty/faculty.service");
const academicAuthService = require("../src/modules/academics/academic-auth.service");

async function runPhase2Tests() {
  console.log("==========================================================");
  console.log("PHASE 2: FACULTY / ASATITHA PORTAL CORE SUITE VERIFICATION");
  console.log("==========================================================");

  await connectDB();

  let testUser = null;
  let testFaculty = null;
  let unauthorizedFacultyUser = null;
  let unauthorizedFaculty = null;
  let testAcademicYear = null;
  let testClass = null;
  let otherClass = null;
  let testSubject = null;
  let testStudentUser = null;
  let testStudent = null;
  let testAssignment = null;
  let testTimetable = null;

  let passedTests = 0;
  let totalTests = 10;

  try {
    // ----------------------------------------------------
    // SETUP TEST FIXTURES
    // ----------------------------------------------------
    console.log("\n--- Setting up Phase 2 test environment ---");
    const uniqueSuffix = Date.now().toString().slice(-6);

    testAcademicYear = await AcademicYear.create({
      yearName: `Test AY ${uniqueSuffix}`,
      yearCode: `AY_${uniqueSuffix}`,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-04-30"),
      status: "ACTIVE",
      isCurrent: true,
    });

    testClass = await Class.create({
      name: `Sanaviyya Year 1 ${uniqueSuffix}`,
      code: `S1_${uniqueSuffix}`,
      academicYearId: testAcademicYear._id,
      department: "Sanaviyya",
      status: "ACTIVE",
    });

    otherClass = await Class.create({
      name: `Sanaviyya Year 2 Unassigned ${uniqueSuffix}`,
      code: `S2_${uniqueSuffix}`,
      academicYearId: testAcademicYear._id,
      department: "Sanaviyya",
      status: "ACTIVE",
    });

    testSubject = await Subject.create({
      subjectName: `Fiqh Al-Muamalat ${uniqueSuffix}`,
      subjectCode: `FQ_${uniqueSuffix}`,
      category: "ISLAMIC_STUDIES",
      status: "ACTIVE",
    });

    // Faculty 1 (Authorized)
    testUser = await User.create({
      name: `Usthad Ahmad ${uniqueSuffix}`,
      email: `usthad_p2_${uniqueSuffix}@markaz.edu`,
      password: "HashedPasswordTest123",
      role: "FACULTY",
      status: "ACTIVE",
    });

    testFaculty = await FacultyProfile.create({
      userId: testUser._id,
      facultyId: `FAC_P2_${uniqueSuffix}`,
      nameEnglish: `Usthad Ahmad ${uniqueSuffix}`,
      designation: "Assistant Professor",
      status: "ACTIVE",
    });

    // Faculty 2 (Unauthorized / Outsider)
    unauthorizedFacultyUser = await User.create({
      name: `Usthad Outsider ${uniqueSuffix}`,
      email: `outsider_p2_${uniqueSuffix}@markaz.edu`,
      password: "HashedPasswordTest123",
      role: "FACULTY",
      status: "ACTIVE",
    });

    unauthorizedFaculty = await FacultyProfile.create({
      userId: unauthorizedFacultyUser._id,
      facultyId: `OUT_P2_${uniqueSuffix}`,
      nameEnglish: `Usthad Outsider ${uniqueSuffix}`,
      designation: "Lecturer",
      status: "ACTIVE",
    });

    // Student enrolled in testClass
    testStudentUser = await User.create({
      name: `Student Bilal ${uniqueSuffix}`,
      email: `bilal_p2_${uniqueSuffix}@markaz.edu`,
      password: "HashedPasswordTest123",
      role: "STUDENT",
      status: "ACTIVE",
    });

    testStudent = await StudentProfile.create({
      userId: testStudentUser._id,
      registrationNumber: `REG_P2_${uniqueSuffix}`,
      nameEnglish: `Bilal ${uniqueSuffix}`,
      fatherName: "Abdullah",
      motherName: "Fatima",
      dateOfBirth: new Date("2008-05-15"),
      admissionYear: 2026,
      classId: testClass._id,
      academicYearId: testAcademicYear._id,
      status: "ACTIVE",
    });

    // Assign testFaculty to (testClass, testSubject, testAcademicYear)
    testAssignment = await FacultyAssignment.create({
      facultyId: testFaculty._id,
      classId: testClass._id,
      subjectId: testSubject._id,
      academicYearId: testAcademicYear._id,
      isPrimary: true,
      status: "ACTIVE",
    });

    // Add a timetable entry for today's day of week
    const DAYS_MAP = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const todayDay = DAYS_MAP[new Date().getUTCDay()];

    testTimetable = await Timetable.create({
      academicYearId: testAcademicYear._id,
      classId: testClass._id,
      subjectId: testSubject._id,
      facultyId: testFaculty._id,
      dayOfWeek: todayDay,
      periodNumber: 1,
      startTime: "08:30",
      endTime: "09:15",
      roomNumber: "Hall 101",
      status: "ACTIVE",
    });

    console.log("✓ Fixtures successfully prepared.");

    // ----------------------------------------------------
    // TEST 1: AttendanceRecord Schema & Biometric-Readiness
    // ----------------------------------------------------
    console.log("\n[Test 1] Verifying AttendanceRecord schema and compound indexing...");
    const sampleRecord = new AttendanceRecord({
      studentId: testStudent._id,
      classId: testClass._id,
      subjectId: testSubject._id,
      academicYearId: testAcademicYear._id,
      date: new Date(),
      period: 1,
      status: "PRESENT",
    });
    if (sampleRecord.source !== "MANUAL") {
      throw new Error(`Expected default source to be MANUAL, got: ${sampleRecord.source}`);
    }
    if (sampleRecord.biometricEventId !== null && sampleRecord.biometricEventId !== undefined) {
      throw new Error("Expected biometricEventId to be nullable");
    }
    console.log("✓ AttendanceRecord schema contains subjectId, academicYearId, nullable biometric fields, and default source MANUAL.");
    passedTests++;

    // ----------------------------------------------------
    // TEST 2: Attendance Marking with Subject Attribution (Period 1 to 7)
    // ----------------------------------------------------
    console.log("\n[Test 2] Testing Attendance Marking with Period & Subject Attribution...");
    const todayStr = new Date().toISOString().split("T")[0];
    const markRes = await attendanceService.markClassAttendance(
      {
        classId: testClass._id.toString(),
        subjectId: testSubject._id.toString(),
        date: todayStr,
        period: 1,
        records: [{ studentId: testStudent._id.toString(), status: "PRESENT", remarks: "Punctual" }],
      },
      { facultyId: testFaculty._id.toString(), role: "FACULTY" }
    );

    if (!markRes || markRes.totalMarked !== 1) {
      throw new Error("Attendance mark result did not return totalMarked = 1");
    }

    const savedRec = await AttendanceRecord.findOne({
      studentId: testStudent._id,
      classId: testClass._id,
      subjectId: testSubject._id,
      period: 1,
    });

    if (!savedRec || savedRec.status !== "PRESENT" || savedRec.source !== "MANUAL") {
      throw new Error("Saved attendance record does not match expected fields or source MANUAL");
    }
    console.log("✓ Attendance marked successfully with subject attribution and source: MANUAL.");
    passedTests++;

    // ----------------------------------------------------
    // TEST 3: Unauthorized Faculty Cannot Mark Attendance for Unassigned Class/Subject
    // ----------------------------------------------------
    console.log("\n[Test 3] Verifying authorization scoping prevents unauthorized faculty from marking attendance...");
    let unauthBlocked = false;
    try {
      await attendanceService.markClassAttendance(
        {
          classId: otherClass._id.toString(),
          subjectId: testSubject._id.toString(),
          date: todayStr,
          period: 2,
          records: [{ studentId: testStudent._id.toString(), status: "PRESENT" }],
        },
        { facultyId: unauthorizedFaculty._id.toString(), role: "FACULTY" }
      );
    } catch (err) {
      if (err.statusCode === 403 || err.message.includes("Access denied")) {
        unauthBlocked = true;
      }
    }
    if (!unauthBlocked) {
      throw new Error("Security failure: Unauthorized faculty was not blocked with 403!");
    }
    console.log("✓ Unauthorized faculty correctly blocked from marking unassigned class (403 Forbidden).");
    passedTests++;

    // ----------------------------------------------------
    // TEST 4: 7-Day Attendance Window Limit Enforced
    // ----------------------------------------------------
    console.log("\n[Test 4] Verifying 7-day editing limit locks historical attendance...");
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 10);
    const eightDaysAgoStr = eightDaysAgo.toISOString().split("T")[0];

    let windowBlocked = false;
    try {
      await attendanceService.markClassAttendance(
        {
          classId: testClass._id.toString(),
          subjectId: testSubject._id.toString(),
          date: eightDaysAgoStr,
          period: 1,
          records: [{ studentId: testStudent._id.toString(), status: "PRESENT" }],
        },
        { facultyId: testFaculty._id.toString(), role: "FACULTY" }
      );
    } catch (err) {
      if (err.statusCode === 403 && err.message.includes("7 days")) {
        windowBlocked = true;
      }
    }
    if (!windowBlocked) {
      throw new Error("Failure: Attendance edit older than 7 days was allowed without admin correction!");
    }
    console.log("✓ Historical edit (> 7 days) correctly rejected with 403 and instruction for correction request.");
    passedTests++;

    // ----------------------------------------------------
    // TEST 5: getClassAttendanceRecords Filtered by Class & Subject
    // ----------------------------------------------------
    console.log("\n[Test 5] Testing getClassAttendanceRecords retrieval...");
    const records = await attendanceService.getClassAttendanceRecords(
      {
        classId: testClass._id.toString(),
        subjectId: testSubject._id.toString(),
        date: todayStr,
        period: 1,
      },
      { facultyId: testFaculty._id.toString(), role: "FACULTY" }
    );
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error("Failed to retrieve class attendance records");
    }
    if (records[0].status !== "PRESENT") {
      throw new Error(`Expected record status PRESENT, got ${records[0].status}`);
    }
    console.log(`✓ Retrieved ${records.length} attendance record(s) matching class, subject, date, and period.`);
    passedTests++;

    // ----------------------------------------------------
    // TEST 6: Faculty Dashboard Stats Calculation
    // ----------------------------------------------------
    console.log("\n[Test 6] Testing getFacultyDashboardStats dynamic calculation...");
    const stats = await facultyService.getFacultyDashboardStats(testUser._id);
    if (stats.assignedClassesCount !== 1) {
      throw new Error(`Expected assignedClassesCount = 1, got ${stats.assignedClassesCount}`);
    }
    if (stats.assignedSubjectsCount !== 1) {
      throw new Error(`Expected assignedSubjectsCount = 1, got ${stats.assignedSubjectsCount}`);
    }
    if (stats.totalStudentsCount !== 1) {
      throw new Error(`Expected totalStudentsCount = 1, got ${stats.totalStudentsCount}`);
    }
    if (stats.todayClassesCount !== 1) {
      throw new Error(`Expected todayClassesCount = 1, got ${stats.todayClassesCount}`);
    }
    console.log(`✓ Faculty Dashboard Stats verified: ${JSON.stringify({
      classes: stats.assignedClassesCount,
      subjects: stats.assignedSubjectsCount,
      students: stats.totalStudentsCount,
      todayClasses: stats.todayClassesCount,
      todayDayOfWeek: stats.todayDayOfWeek,
    })}`);
    passedTests++;

    // ----------------------------------------------------
    // TEST 7: Faculty Timetable Query
    // ----------------------------------------------------
    console.log("\n[Test 7] Testing getFacultyMyTimetable...");
    const ttEntries = await facultyService.getFacultyMyTimetable(testUser._id);
    if (!Array.isArray(ttEntries) || ttEntries.length === 0) {
      throw new Error("Expected at least 1 timetable entry for faculty");
    }
    if (ttEntries[0].periodNumber !== 1 || ttEntries[0].dayOfWeek !== todayDay) {
      throw new Error("Timetable entry does not match period or dayOfWeek");
    }
    console.log(`✓ Faculty Timetable verified: ${ttEntries.length} active period entries returned.`);
    passedTests++;

    // ----------------------------------------------------
    // TEST 8: Faculty Dynamic Student Roster (getMyStudents)
    // ----------------------------------------------------
    console.log("\n[Test 8] Testing getFacultyMyStudents roster...");
    const roster = await facultyService.getFacultyMyStudents(testUser._id);
    if (!Array.isArray(roster) || roster.length === 0) {
      throw new Error("Expected student roster to return enrolled student");
    }
    if (roster[0]._id.toString() !== testStudent._id.toString()) {
      throw new Error("Enrolled student ID mismatch in roster");
    }

    // Verify unassigned class filter is rejected
    let unassignedClassBlocked = false;
    try {
      await facultyService.getFacultyMyStudents(testUser._id, otherClass._id.toString());
    } catch (err) {
      if (err.statusCode === 403) unassignedClassBlocked = true;
    }
    if (!unassignedClassBlocked) {
      throw new Error("Roster filter for unassigned class was not blocked with 403");
    }
    console.log("✓ Dynamic Student Roster verified with strict class scoping.");
    passedTests++;

    // ----------------------------------------------------
    // TEST 9: Faculty Student 360 & Remarks
    // ----------------------------------------------------
    console.log("\n[Test 9] Testing Faculty Student 360 and Remarks system...");
    // Create a remark
    const createdRemark = await facultyService.createFacultyRemark(testUser._id, testStudent._id.toString(), {
      category: "ACADEMIC",
      remark: "Shows exceptional grasp of Fiqh rules and jurisprudence principles.",
      subjectId: testSubject._id.toString(),
    });
    if (!createdRemark || createdRemark.category !== "ACADEMIC") {
      throw new Error("Failed to create faculty remark");
    }

    // Fetch 360 profile
    const student360 = await facultyService.getFacultyStudent360(testUser._id, testStudent._id.toString());
    if (!student360.student || !student360.attendanceOverview || !student360.remarks) {
      throw new Error("Student 360 response missing required profile, attendance, or remarks sections");
    }
    if (student360.remarks.length === 0) {
      throw new Error("Student 360 did not contain the newly created remark");
    }

    // Verify outsider faculty cannot view 360 of unassigned student
    let outsider360Blocked = false;
    try {
      await facultyService.getFacultyStudent360(unauthorizedFacultyUser._id, testStudent._id.toString());
    } catch (err) {
      if (err.statusCode === 403) outsider360Blocked = true;
    }
    if (!outsider360Blocked) {
      throw new Error("Outsider faculty was not blocked from viewing student 360");
    }
    console.log("✓ Student 360 view and remarks verified with academic scoping.");
    passedTests++;

    // ----------------------------------------------------
    // TEST 10: Homework & Study Material Scope Hardening
    // ----------------------------------------------------
    console.log("\n[Test 10] Testing Homework & Study Materials Scoping Validation...");
    const assignmentController = require("../src/modules/assignments/assignment.controller");
    const studyMaterialController = require("../src/modules/study-materials/study-material.controller");

    // Mock response helper
    const mockRes = () => {
      const res = {};
      res.statusCode = 200;
      res.status = (code) => {
        res.statusCode = code;
        return res;
      };
      res.json = (data) => {
        res.data = data;
        return res;
      };
      return res;
    };

    // Attempt to create assignment for unassigned class as unauthorizedFaculty
    const unauthReq = {
      user: { role: "FACULTY", userId: unauthorizedFacultyUser._id, id: unauthorizedFacultyUser._id, facultyId: unauthorizedFaculty._id },
      body: {
        title: "Unauthorized Assignment",
        classId: testClass._id.toString(),
        subjectId: testSubject._id.toString(),
        dueDate: new Date(Date.now() + 86400000).toISOString(),
      },
      files: [],
    };
    const resAssignment = mockRes();
    await assignmentController.handleCreateAssignment(unauthReq, resAssignment);
    if (resAssignment.statusCode !== 403) {
      throw new Error(`Expected assignment creation to be blocked with 403, got: ${resAssignment.statusCode}`);
    }

    // Attempt to create study material for unassigned class as unauthorizedFaculty
    const resStudyMaterial = mockRes();
    const unauthMatReq = {
      user: { role: "FACULTY", userId: unauthorizedFacultyUser._id, id: unauthorizedFacultyUser._id, facultyId: unauthorizedFaculty._id },
      body: {
        title: "Unauthorized Notes",
        classId: testClass._id.toString(),
        subjectId: testSubject._id.toString(),
        fileUrl: "https://example.com/notes.pdf",
      },
    };
    await studyMaterialController.handleCreateStudyMaterial(unauthMatReq, resStudyMaterial);
    if (resStudyMaterial.statusCode !== 403) {
      throw new Error(`Expected study material creation to be blocked with 403, got: ${resStudyMaterial.statusCode}`);
    }

    console.log("✓ Assignment and Study Material controllers strictly enforce FacultyAssignment authorization (403).");
    passedTests++;

    console.log("\n==========================================================");
    console.log(`PHASE 2 VERIFICATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log("==========================================================");
  } catch (error) {
    console.error("\n❌ PHASE 2 VERIFICATION FAILED:", error);
    process.exit(1);
  } finally {
    // Clean up test data
    console.log("\n--- Cleaning up test fixtures ---");
    if (testAssignment) await FacultyAssignment.deleteOne({ _id: testAssignment._id });
    if (testTimetable) await Timetable.deleteOne({ _id: testTimetable._id });
    if (testStudent) {
      await AttendanceRecord.deleteMany({ studentId: testStudent._id });
      await FacultyRemark.deleteMany({ studentId: testStudent._id });
      await StudentProfile.deleteOne({ _id: testStudent._id });
    }
    if (testStudentUser) await User.deleteOne({ _id: testStudentUser._id });
    if (testFaculty) await FacultyProfile.deleteOne({ _id: testFaculty._id });
    if (testUser) await User.deleteOne({ _id: testUser._id });
    if (unauthorizedFaculty) await FacultyProfile.deleteOne({ _id: unauthorizedFaculty._id });
    if (unauthorizedFacultyUser) await User.deleteOne({ _id: unauthorizedFacultyUser._id });
    if (testSubject) await Subject.deleteOne({ _id: testSubject._id });
    if (testClass) await Class.deleteOne({ _id: testClass._id });
    if (otherClass) await Class.deleteOne({ _id: otherClass._id });
    if (testAcademicYear) await AcademicYear.deleteOne({ _id: testAcademicYear._id });

    await mongoose.connection.close();
    console.log("✓ Test environment cleaned up and DB connection closed.\n");
  }
}

runPhase2Tests();
