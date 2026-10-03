const mongoose = require("mongoose");
const http = require("http");
const env = require("../src/config/env");
const app = require("../src/app");
const User = require("../src/modules/users/user.model");
const FacultyProfile = require("../src/modules/faculty/faculty.model");
const StudentProfile = require("../src/modules/students/student.model");
const ParentProfile = require("../src/modules/parents/parent.model");
const Class = require("../src/modules/academics/class.model");
const Subject = require("../src/modules/academics/subject.model");
const AcademicYear = require("../src/modules/academics/academic-year.model");
const FacultyAssignment = require("../src/modules/academics/faculty-assignment.model");
const AttendanceRecord = require("../src/modules/attendance/attendance-record.model");
const Exam = require("../src/modules/exams/exam.model");
const ExamSchedule = require("../src/modules/exams/exam-schedule.model");
const ExamResult = require("../src/modules/exams/exam-result.model");
const Assignment = require("../src/modules/assignments/assignment.model");
const AssignmentSubmission = require("../src/modules/assignments/assignment-submission.model");
const { generateToken } = require("../src/shared/utils/jwt");

async function run() {
  console.log("==================================================================");
  console.log("SANAVIYYA SINGLE-INSTITUTION SECURITY & ARCHITECTURE TEST SUITE");
  console.log("==================================================================");

  await mongoose.connect(env.MONGODB_URI);
  console.log("[1/4] Connected to MongoDB Atlas.");

  const server = http.createServer(app);
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;
  console.log(`[2/4] Test HTTP server listening on port ${port}.`);

  const timestamp = Date.now();

  let cleanupDocs = {
    academicYears: [],
    classes: [],
    subjects: [],
    users: [],
    facultyProfiles: [],
    studentProfiles: [],
    parentProfiles: [],
    facultyAssignments: [],
    attendanceRecords: [],
    exams: [],
    examSchedules: [],
    examResults: [],
    assignments: [],
    submissions: [],
  };

  try {
    // -------------------------------------------------------------------------
    // Setup Base Academic Entities
    // -------------------------------------------------------------------------
    const academicYear = await AcademicYear.create({
      yearName: `Sanaviyya Year ${timestamp}`,
      yearCode: `SAN-${timestamp.toString().slice(-4)}`,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-03-31"),
      isCurrent: true,
      status: "ACTIVE",
    });
    cleanupDocs.academicYears.push(academicYear._id);

    const classA = await Class.create({
      name: `Class 1A-${timestamp}`,
      code: `1A-${timestamp.toString().slice(-4)}`,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    cleanupDocs.classes.push(classA._id);

    const classB = await Class.create({
      name: `Class 1B-${timestamp}`,
      code: `1B-${timestamp.toString().slice(-4)}`,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    cleanupDocs.classes.push(classB._id);

    const subjectArabic = await Subject.create({
      subjectName: `Nahw & Sarf ${timestamp}`,
      subjectCode: `ARB-${timestamp.toString().slice(-4)}`,
      category: "ISLAMIC_STUDIES",
      status: "ACTIVE",
    });
    cleanupDocs.subjects.push(subjectArabic._id);

    const subjectFiqh = await Subject.create({
      subjectName: `Fiqh Al-Muamalat ${timestamp}`,
      subjectCode: `FIQ-${timestamp.toString().slice(-4)}`,
      category: "ISLAMIC_STUDIES",
      status: "ACTIVE",
    });
    cleanupDocs.subjects.push(subjectFiqh._id);

    // -------------------------------------------------------------------------
    // Setup Users & Profiles
    // -------------------------------------------------------------------------
    // 1. Admin
    const adminUser = await User.create({
      name: `Admin Sanaviyya ${timestamp}`,
      email: `admin_${timestamp}@sanaviyya.test`,
      username: `admin_${timestamp}`,
      role: "ADMIN",
      status: "ACTIVE",
    });
    cleanupDocs.users.push(adminUser._id);
    const adminToken = generateToken({ userId: adminUser._id, role: "ADMIN" });

    // 2. Faculty A (Assigned to Class A, Subject Arabic)
    const facultyUserA = await User.create({
      name: `Usthad Ahmad ${timestamp}`,
      email: `usthad_a_${timestamp}@sanaviyya.test`,
      username: `usthad_a_${timestamp}`,
      role: "FACULTY",
      status: "ACTIVE",
    });
    cleanupDocs.users.push(facultyUserA._id);
    const facultyProfileA = await FacultyProfile.create({
      userId: facultyUserA._id,
      facultyId: `FAC-A-${timestamp.toString().slice(-4)}`,
      nameEnglish: `Usthad Ahmad ${timestamp}`,
      status: "ACTIVE",
    });
    cleanupDocs.facultyProfiles.push(facultyProfileA._id);
    const facultyTokenA = generateToken({ userId: facultyUserA._id, role: "FACULTY" });

    // Faculty Assignment: Faculty A -> Class A -> Arabic
    const fa1 = await FacultyAssignment.create({
      facultyId: facultyProfileA._id,
      classId: classA._id,
      subjectId: subjectArabic._id,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    cleanupDocs.facultyAssignments.push(fa1._id);

    // 3. Faculty B (Assigned to Class B, Subject Fiqh)
    const facultyUserB = await User.create({
      name: `Usthad Bilal ${timestamp}`,
      email: `usthad_b_${timestamp}@sanaviyya.test`,
      username: `usthad_b_${timestamp}`,
      role: "FACULTY",
      status: "ACTIVE",
    });
    cleanupDocs.users.push(facultyUserB._id);
    const facultyProfileB = await FacultyProfile.create({
      userId: facultyUserB._id,
      facultyId: `FAC-B-${timestamp.toString().slice(-4)}`,
      nameEnglish: `Usthad Bilal ${timestamp}`,
      status: "ACTIVE",
    });
    cleanupDocs.facultyProfiles.push(facultyProfileB._id);
    const facultyTokenB = generateToken({ userId: facultyUserB._id, role: "FACULTY" });

    const fa2 = await FacultyAssignment.create({
      facultyId: facultyProfileB._id,
      classId: classB._id,
      subjectId: subjectFiqh._id,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    cleanupDocs.facultyAssignments.push(fa2._id);

    // 4. Student A (Enrolled in Class A)
    const studentUserA = await User.create({
      name: `Tariq Student ${timestamp}`,
      email: `tariq_${timestamp}@sanaviyya.test`,
      username: `tariq_${timestamp}`,
      role: "STUDENT",
      status: "ACTIVE",
    });
    cleanupDocs.users.push(studentUserA._id);
    const studentProfileA = await StudentProfile.create({
      userId: studentUserA._id,
      registrationNumber: `REG-A-${timestamp.toString().slice(-4)}`,
      nameEnglish: `Tariq Student ${timestamp}`,
      fatherName: "Father A",
      motherName: "Mother A",
      dateOfBirth: new Date("2008-01-01"),
      admissionYear: 2026,
      classId: classA._id,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    cleanupDocs.studentProfiles.push(studentProfileA._id);
    const studentTokenA = generateToken({ userId: studentUserA._id, role: "STUDENT" });

    // 5. Student B (Enrolled in Class B)
    const studentUserB = await User.create({
      name: `Zayd Student ${timestamp}`,
      email: `zayd_${timestamp}@sanaviyya.test`,
      username: `zayd_${timestamp}`,
      role: "STUDENT",
      status: "ACTIVE",
    });
    cleanupDocs.users.push(studentUserB._id);
    const studentProfileB = await StudentProfile.create({
      userId: studentUserB._id,
      registrationNumber: `REG-B-${timestamp.toString().slice(-4)}`,
      nameEnglish: `Zayd Student ${timestamp}`,
      fatherName: "Father B",
      motherName: "Mother B",
      dateOfBirth: new Date("2008-02-02"),
      admissionYear: 2026,
      classId: classB._id,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    cleanupDocs.studentProfiles.push(studentProfileB._id);
    const studentTokenB = generateToken({ userId: studentUserB._id, role: "STUDENT" });

    // 6. Parent A (Linked strictly to Student A)
    const parentUserA = await User.create({
      name: `Abu Tariq ${timestamp}`,
      email: `abutariq_${timestamp}@sanaviyya.test`,
      username: `abutariq_${timestamp}`,
      role: "PARENT",
      status: "ACTIVE",
    });
    cleanupDocs.users.push(parentUserA._id);
    const parentProfileA = await ParentProfile.create({
      userId: parentUserA._id,
      name: `Abu Tariq ${timestamp}`,
      studentIds: [studentProfileA._id],
      status: "ACTIVE",
    });
    cleanupDocs.parentProfiles.push(parentProfileA._id);
    const parentTokenA = generateToken({ userId: parentUserA._id, role: "PARENT" });

    // 7. Suspended, Inactive, and Deleted users
    const suspendedUser = await User.create({
      name: `Suspended User ${timestamp}`,
      email: `suspended_${timestamp}@sanaviyya.test`,
      username: `suspended_${timestamp}`,
      role: "STUDENT",
      status: "SUSPENDED",
    });
    cleanupDocs.users.push(suspendedUser._id);
    const suspendedToken = generateToken({ userId: suspendedUser._id, role: "STUDENT" });

    const inactiveUser = await User.create({
      name: `Inactive User ${timestamp}`,
      email: `inactive_${timestamp}@sanaviyya.test`,
      username: `inactive_${timestamp}`,
      role: "FACULTY",
      status: "INACTIVE",
    });
    cleanupDocs.users.push(inactiveUser._id);
    const inactiveToken = generateToken({ userId: inactiveUser._id, role: "FACULTY" });

    const deletedUser = await User.create({
      name: `Deleted User ${timestamp}`,
      email: `deleted_${timestamp}@sanaviyya.test`,
      username: `deleted_${timestamp}`,
      role: "ADMIN",
      status: "ACTIVE",
      isDeleted: true,
    });
    cleanupDocs.users.push(deletedUser._id);
    const deletedToken = generateToken({ userId: deletedUser._id, role: "ADMIN" });

    // Seed Attendance for Student A
    const attRec = await AttendanceRecord.create({
      studentId: studentProfileA._id,
      classId: classA._id,
      subjectId: subjectArabic._id,
      academicYearId: academicYear._id,
      date: new Date("2026-09-01T00:00:00.000Z"),
      period: 1,
      status: "PRESENT",
      source: "MANUAL",
      markedBy: facultyProfileA._id,
    });
    cleanupDocs.attendanceRecords.push(attRec._id);

    // Seed Exam and Results for Student A and Student B
    const exam = await Exam.create({
      title: `Midterm Exam ${timestamp}`,
      code: `MID-${timestamp.toString().slice(-4)}`,
      academicYearId: academicYear._id,
      startDate: new Date("2026-10-01"),
      endDate: new Date("2026-10-10"),
      status: "COMPLETED",
    });
    cleanupDocs.exams.push(exam._id);

    const examResA = await ExamResult.create({
      examId: exam._id,
      studentId: studentProfileA._id,
      classId: classA._id,
      academicYearId: academicYear._id,
      subjectResults: [
        {
          subjectId: subjectArabic._id,
          subjectName: "Arabic Grammar",
          subjectCode: "ARB101",
          marksObtained: 90,
          maxMarks: 100,
          passMarks: 40,
          grade: "A+",
          resultStatus: "PASSED",
        },
      ],
      totalMarksObtained: 90,
      totalMaxMarks: 100,
      percentage: 90,
      grade: "A+",
      resultStatus: "PASSED",
      status: "PUBLISHED",
    });
    cleanupDocs.examResults.push(examResA._id);

    const examResB = await ExamResult.create({
      examId: exam._id,
      studentId: studentProfileB._id,
      classId: classB._id,
      academicYearId: academicYear._id,
      subjectResults: [
        {
          subjectId: subjectArabic._id,
          subjectName: "Arabic Grammar",
          subjectCode: "ARB101",
          marksObtained: 75,
          maxMarks: 100,
          passMarks: 40,
          grade: "B+",
          resultStatus: "PASSED",
        },
      ],
      totalMarksObtained: 75,
      totalMaxMarks: 100,
      percentage: 75,
      grade: "B+",
      resultStatus: "PASSED",
      status: "PUBLISHED",
    });
    cleanupDocs.examResults.push(examResB._id);

    // Seed Assignment for Class A
    const assignmentA = await Assignment.create({
      title: `Nahw Assignment ${timestamp}`,
      description: "Analyze the grammatical structure",
      classId: classA._id,
      subjectId: subjectArabic._id,
      facultyId: facultyProfileA._id,
      academicYearId: academicYear._id,
      maxMarks: 50,
      dueDate: new Date(Date.now() + 86400000),
      status: "PUBLISHED",
    });
    cleanupDocs.assignments.push(assignmentA._id);

    const subA = await AssignmentSubmission.create({
      assignmentId: assignmentA._id,
      studentId: studentProfileA._id,
      submissionText: "Nahw analysis submitted",
      status: "GRADED",
      obtainedMarks: 48,
    });
    cleanupDocs.submissions.push(subA._id);

    console.log("[3/4] Base test domain fixtures established.");

    // Helper for requests
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

    console.log("\n==================== TEST SUITE EXECUTION ====================");

    // -------------------------------------------------------------------------
    // AUTHENTICATION TESTS
    // -------------------------------------------------------------------------
    // Test 1: Active Admin -> allowed
    const t1 = await apiRequest("/academic/academic-years", { token: adminToken });
    if (t1.status === 200 && t1.data.success) {
      console.log("✓ Test 1 Passed: Active Admin allowed (HTTP 200)");
    } else {
      throw new Error(`Test 1 Failed: Expected 200, got ${t1.status}`);
    }

    // Test 2: Active Faculty -> allowed
    const t2 = await apiRequest("/faculty/dashboard-stats", { token: facultyTokenA });
    if (t2.status === 200 && t2.data.success) {
      console.log("✓ Test 2 Passed: Active Faculty allowed (HTTP 200)");
    } else {
      throw new Error(`Test 2 Failed: Expected 200, got ${t2.status}`);
    }

    // Test 3: Active Student -> allowed
    const t3 = await apiRequest("/students/profile", { token: studentTokenA });
    if (t3.status === 200 && t3.data.success) {
      console.log("✓ Test 3 Passed: Active Student allowed (HTTP 200)");
    } else {
      throw new Error(`Test 3 Failed: Expected 200, got ${t3.status}`);
    }

    // Test 4: Active Parent -> allowed for linked child
    const t4 = await apiRequest(`/attendance/student/summary?studentId=${studentProfileA._id}`, { token: parentTokenA });
    if (t4.status === 200 && t4.data.success) {
      console.log("✓ Test 4 Passed: Active Parent allowed for linked child (HTTP 200)");
    } else {
      throw new Error(`Test 4 Failed: Expected 200, got ${t4.status}`);
    }

    // Test 5: Suspended user -> rejected
    const t5 = await apiRequest("/students/profile", { token: suspendedToken });
    if (t5.status === 401 && t5.data.success === false) {
      console.log("✓ Test 5 Passed: Suspended user rejected (HTTP 401: Account is not active)");
    } else {
      throw new Error(`Test 5 Failed: Expected 401, got ${t5.status}`);
    }

    // Test 6: Inactive user -> rejected
    const t6 = await apiRequest("/faculty/dashboard-stats", { token: inactiveToken });
    if (t6.status === 401 && t6.data.success === false) {
      console.log("✓ Test 6 Passed: Inactive user rejected (HTTP 401: Account is not active)");
    } else {
      throw new Error(`Test 6 Failed: Expected 401, got ${t6.status}`);
    }

    // Test 7: Deleted user -> rejected
    const t7 = await apiRequest("/academic/academic-years", { token: deletedToken });
    if (t7.status === 401 && t7.data.success === false) {
      console.log("✓ Test 7 Passed: Deleted user rejected (HTTP 401: Account is not active)");
    } else {
      throw new Error(`Test 7 Failed: Expected 401, got ${t7.status}`);
    }

    // Test 8: Invalid / expired JWT -> rejected
    const t8 = await apiRequest("/students/profile", { token: "invalid.jwt.signature" });
    if (t8.status === 401 && t8.data.success === false) {
      console.log("✓ Test 8 Passed: Invalid/expired JWT rejected (HTTP 401)");
    } else {
      throw new Error(`Test 8 Failed: Expected 401, got ${t8.status}`);
    }

    // -------------------------------------------------------------------------
    // STUDENT DATA SECURITY (IDOR PROTECTION)
    // -------------------------------------------------------------------------
    // Test 9: Student A -> own attendance -> allowed
    const t9 = await apiRequest("/attendance/student/summary", { token: studentTokenA });
    if (t9.status === 200 && t9.data.success) {
      console.log("✓ Test 9 Passed: Student A retrieves own attendance (HTTP 200)");
    } else {
      throw new Error(`Test 9 Failed: Expected 200, got ${t9.status}`);
    }

    // Test 10: Student A -> Student B attendance -> rejected (IDOR blocked)
    const t10 = await apiRequest(`/attendance/student/summary?studentId=${studentProfileB._id}`, { token: studentTokenA });
    if (t10.status === 403 && t10.data.success === false) {
      console.log("✓ Test 10 Passed: Student A querying Student B attendance rejected (HTTP 403 IDOR blocked)");
    } else {
      throw new Error(`Test 10 Failed: Expected 403, got ${t10.status}`);
    }

    // Test 11: Student A -> Student B result -> rejected / strictly scoped
    const t11 = await apiRequest(`/exams/exam-results?studentId=${studentProfileB._id}`, { token: studentTokenA });
    // In exam.service.js, requestingUser.role === 'STUDENT' forces query.studentId = requestingUser.studentId
    const t11Data = t11.data?.data || [];
    const hasStudentBResult = t11Data.some((r) => r.studentId?._id?.toString() === studentProfileB._id.toString());
    if (t11.status === 200 && !hasStudentBResult) {
      console.log("✓ Test 11 Passed: Student A cannot retrieve Student B exam result (scoped to own results)");
    } else {
      throw new Error(`Test 11 Failed: Student A retrieved Student B exam result!`);
    }

    // Test 12: Student A -> Student B assignment/submission data -> rejected
    const t12 = await apiRequest(`/assignments/${assignmentA._id}/submissions`, { token: studentTokenA });
    if (t12.status === 403) {
      console.log("✓ Test 12 Passed: Student A blocked from viewing all submissions roster (HTTP 403)");
    } else {
      throw new Error(`Test 12 Failed: Expected 403, got ${t12.status}`);
    }

    // Test 13: Student A -> Student B profile -> rejected
    const t13 = await apiRequest(`/students/${studentProfileB._id}`, { token: studentTokenA });
    if (t13.status === 403) {
      console.log("✓ Test 13 Passed: Student A blocked from viewing Student B profile (HTTP 403)");
    } else {
      throw new Error(`Test 13 Failed: Expected 403, got ${t13.status}`);
    }

    // -------------------------------------------------------------------------
    // PARENT SECURITY
    // -------------------------------------------------------------------------
    // Test 14: Parent A -> linked child (Student A) -> allowed
    const t14 = await apiRequest(`/attendance/student/summary?studentId=${studentProfileA._id}`, { token: parentTokenA });
    if (t14.status === 200 && t14.data.success) {
      console.log("✓ Test 14 Passed: Parent A accesses linked child attendance (HTTP 200)");
    } else {
      throw new Error(`Test 14 Failed: Expected 200, got ${t14.status}`);
    }

    // Test 15: Parent A -> unrelated student (Student B) -> rejected
    const t15 = await apiRequest(`/attendance/student/summary?studentId=${studentProfileB._id}`, { token: parentTokenA });
    if (t15.status === 403 && t15.data.success === false) {
      console.log("✓ Test 15 Passed: Parent A blocked from unrelated student attendance (HTTP 403)");
    } else {
      throw new Error(`Test 15 Failed: Expected 403, got ${t15.status}`);
    }

    // -------------------------------------------------------------------------
    // FACULTY SECURITY
    // -------------------------------------------------------------------------
    // Test 16: Faculty A -> assigned class (Class A) -> allowed
    const todayDateStr = new Date().toISOString().split("T")[0];
    const t16 = await apiRequest("/attendance/mark-class", {
      method: "POST",
      token: facultyTokenA,
      body: {
        classId: classA._id,
        subjectId: subjectArabic._id,
        academicYearId: academicYear._id,
        date: todayDateStr,
        period: 2,
        records: [{ studentId: studentProfileA._id, status: "PRESENT" }],
      },
    });
    if (t16.status === 200 && t16.data.success) {
      console.log("✓ Test 16 Passed: Faculty A marks attendance for assigned Class A (HTTP 200)");
    } else {
      throw new Error(`Test 16 Failed: Expected 200, got ${t16.status}: ${JSON.stringify(t16.data)}`);
    }

    // Test 17: Faculty A -> unauthorized class (Class B) -> rejected
    const t17 = await apiRequest("/attendance/mark-class", {
      method: "POST",
      token: facultyTokenA,
      body: {
        classId: classB._id,
        subjectId: subjectFiqh._id,
        academicYearId: academicYear._id,
        date: todayDateStr,
        period: 2,
        records: [{ studentId: studentProfileB._id, status: "PRESENT" }],
      },
    });
    if (t17.status === 403) {
      console.log("✓ Test 17 Passed: Faculty A blocked from marking unauthorized Class B (HTTP 403)");
    } else {
      throw new Error(`Test 17 Failed: Expected 403, got ${t17.status}`);
    }

    // Test 18: Faculty A -> unauthorized student (Student B) -> rejected
    const t18 = await apiRequest(`/students/${studentProfileB._id}`, { token: facultyTokenA });
    if (t18.status === 403) {
      console.log("✓ Test 18 Passed: Faculty A blocked from unauthorized Student B profile (HTTP 403)");
    } else {
      throw new Error(`Test 18 Failed: Expected 403, got ${t18.status}`);
    }

    // Test 19: Faculty A -> unauthorized subject (Fiqh in Class A) -> rejected
    const t19 = await apiRequest("/assignments", {
      method: "POST",
      token: facultyTokenA,
      body: {
        title: `Unauthorized Assignment ${timestamp}`,
        classId: classA._id,
        subjectId: subjectFiqh._id, // Faculty A is only assigned to Arabic in Class A!
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        maxMarks: 50,
      },
    });
    if (t19.status === 403) {
      console.log("✓ Test 19 Passed: Faculty A blocked from creating assignment for unauthorized Subject (HTTP 403)");
    } else {
      throw new Error(`Test 19 Failed: Expected 403, got ${t19.status}`);
    }

    // -------------------------------------------------------------------------
    // ADMIN ACCESS
    // -------------------------------------------------------------------------
    // Test 20: Admin -> legitimate management operations -> allowed
    const t20 = await apiRequest("/academic/classes", {
      method: "POST",
      token: adminToken,
      body: {
        name: `Class Admin Created ${timestamp}`,
        code: `ADM-${timestamp.toString().slice(-4)}`,
        academicYearId: academicYear._id,
        department: "Sanaviyya",
        status: "ACTIVE",
      },
    });
    if (t20.status === 201 && t20.data.success) {
      cleanupDocs.classes.push(t20.data.data._id);
      console.log("✓ Test 20 Passed: Admin creates academic class successfully (HTTP 201)");
    } else {
      throw new Error(`Test 20 Failed: Expected 201, got ${t20.status}`);
    }

    console.log("\n==================================================================");
    console.log("ALL 20 SINGLE-INSTITUTION SECURITY & ARCHITECTURE TESTS PASSED! ✓");
    console.log("==================================================================");
  } finally {
    console.log("\n[4/4] Cleaning up test fixtures from database...");
    await AcademicYear.deleteMany({ _id: { $in: cleanupDocs.academicYears } });
    await Class.deleteMany({ _id: { $in: cleanupDocs.classes } });
    await Subject.deleteMany({ _id: { $in: cleanupDocs.subjects } });
    await User.deleteMany({ _id: { $in: cleanupDocs.users } });
    await FacultyProfile.deleteMany({ _id: { $in: cleanupDocs.facultyProfiles } });
    await StudentProfile.deleteMany({ _id: { $in: cleanupDocs.studentProfiles } });
    await ParentProfile.deleteMany({ _id: { $in: cleanupDocs.parentProfiles } });
    await FacultyAssignment.deleteMany({ _id: { $in: cleanupDocs.facultyAssignments } });
    await AttendanceRecord.deleteMany({ _id: { $in: cleanupDocs.attendanceRecords } });
    await Exam.deleteMany({ _id: { $in: cleanupDocs.exams } });
    await ExamSchedule.deleteMany({ _id: { $in: cleanupDocs.examSchedules } });
    await ExamResult.deleteMany({ _id: { $in: cleanupDocs.examResults } });
    await Assignment.deleteMany({ _id: { $in: cleanupDocs.assignments } });
    await AssignmentSubmission.deleteMany({ _id: { $in: cleanupDocs.submissions } });
    await new Promise((r) => server.close(r));
    await mongoose.disconnect();
    console.log("Test teardown complete. Server closed.");
  }
}

run().catch((err) => {
  console.error("FATAL ERROR in test execution:", err);
  process.exit(1);
});
