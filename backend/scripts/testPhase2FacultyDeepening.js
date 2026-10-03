require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const http = require("http");
const env = require("../src/config/env");
const app = require("../src/app");

const User = require("../src/modules/users/user.model");
const FacultyProfile = require("../src/modules/faculty/faculty.model");
const StudentProfile = require("../src/modules/students/student.model");
const Class = require("../src/modules/academics/class.model");
const Subject = require("../src/modules/academics/subject.model");
const AcademicYear = require("../src/modules/academics/academic-year.model");
const FacultyAssignment = require("../src/modules/academics/faculty-assignment.model");
const Syllabus = require("../src/modules/academics/syllabus.model");
const Timetable = require("../src/modules/academics/timetable.model");
const AttendanceRecord = require("../src/modules/attendance/attendance-record.model");
const MentorAssignment = require("../src/modules/mentorship/mentor-assignment.model");
const StudentDevelopmentScore = require("../src/modules/development/student-development-score.model");
const DisciplinaryRecord = require("../src/modules/discipline/discipline-record.model");
const LeaveApplication = require("../src/modules/leaves/leave.model");
const { generateToken } = require("../src/shared/utils/jwt");

async function runPhase2DeepeningTests() {
  console.log("==================================================================");
  console.log("SANAVIYYA PHASE 2: FACULTY / ASATITHA PORTAL DEEPENING TEST SUITE");
  console.log("==================================================================");

  await mongoose.connect(env.MONGODB_URI);
  console.log("[1/4] Connected to MongoDB Atlas.");

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;
  console.log(`[2/4] Test HTTP server listening on port ${port}.`);

  const timestamp = Date.now();
  let passedTests = 0;
  const totalTests = 24;

  const cleanup = {
    academicYears: [],
    classes: [],
    subjects: [],
    users: [],
    facultyProfiles: [],
    studentProfiles: [],
    facultyAssignments: [],
    syllabuses: [],
    timetables: [],
    attendanceRecords: [],
    mentorAssignments: [],
    developmentScores: [],
    disciplineRecords: [],
    leaveApplications: [],
  };

  try {
    console.log("\n[3/4] Setting up fixtures for Phase 2 deep verification...");

    // 1. Academic Year
    const academicYear = await AcademicYear.create({
      yearName: `Sanaviyya Year ${timestamp}`,
      yearCode: `SAN-${timestamp.toString().slice(-4)}`,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-03-31"),
      isCurrent: true,
      status: "ACTIVE",
    });
    cleanup.academicYears.push(academicYear._id);

    // 2. Classes
    const classA = await Class.create({
      name: `Sanaviyya 1A-${timestamp}`,
      code: `1A-${timestamp.toString().slice(-4)}`,
      academicYearId: academicYear._id,
      department: "Sanaviyya",
      status: "ACTIVE",
    });
    cleanup.classes.push(classA._id);

    const classB = await Class.create({
      name: `Sanaviyya 1B-${timestamp}`,
      code: `1B-${timestamp.toString().slice(-4)}`,
      academicYearId: academicYear._id,
      department: "Sanaviyya",
      status: "ACTIVE",
    });
    cleanup.classes.push(classB._id);

    // 3. Subjects
    const subject1 = await Subject.create({
      subjectName: `Nahw & Sarf ${timestamp}`,
      subjectCode: `ARB-${timestamp.toString().slice(-4)}`,
      category: "ISLAMIC_STUDIES",
      status: "ACTIVE",
    });
    cleanup.subjects.push(subject1._id);

    const subject2 = await Subject.create({
      subjectName: `Balaaghah ${timestamp}`,
      subjectCode: `BAL-${timestamp.toString().slice(-4)}`,
      category: "ISLAMIC_STUDIES",
      status: "ACTIVE",
    });
    cleanup.subjects.push(subject2._id);

    // 4. Admin User
    const adminUser = await User.create({
      name: `Admin Head ${timestamp}`,
      email: `admin_p2_${timestamp}@sanaviyya.test`,
      username: `admin_p2_${timestamp}`,
      role: "ADMIN",
      status: "ACTIVE",
    });
    cleanup.users.push(adminUser._id);
    const adminToken = generateToken({ userId: adminUser._id, role: "ADMIN" });

    // 5. Faculty A (Assigned to Class A, Subject 1)
    const facultyUserA = await User.create({
      name: `Usthad Ahmad ${timestamp}`,
      email: `usthad_a_${timestamp}@sanaviyya.test`,
      username: `usthad_a_${timestamp}`,
      role: "FACULTY",
      status: "ACTIVE",
    });
    cleanup.users.push(facultyUserA._id);

    const facultyProfileA = await FacultyProfile.create({
      userId: facultyUserA._id,
      facultyId: `FAC-A-${timestamp.toString().slice(-4)}`,
      nameEnglish: `Usthad Ahmad ${timestamp}`,
      designation: "Senior Lecturer",
      status: "ACTIVE",
    });
    cleanup.facultyProfiles.push(facultyProfileA._id);
    const facultyTokenA = generateToken({ userId: facultyUserA._id, role: "FACULTY" });

    // 6. Faculty B (Assigned to Class B, Subject 2)
    const facultyUserB = await User.create({
      name: `Usthad Bilal ${timestamp}`,
      email: `usthad_b_${timestamp}@sanaviyya.test`,
      username: `usthad_b_${timestamp}`,
      role: "FACULTY",
      status: "ACTIVE",
    });
    cleanup.users.push(facultyUserB._id);

    const facultyProfileB = await FacultyProfile.create({
      userId: facultyUserB._id,
      facultyId: `FAC-B-${timestamp.toString().slice(-4)}`,
      nameEnglish: `Usthad Bilal ${timestamp}`,
      designation: "Assistant Professor",
      status: "ACTIVE",
    });
    cleanup.facultyProfiles.push(facultyProfileB._id);
    const facultyTokenB = generateToken({ userId: facultyUserB._id, role: "FACULTY" });

    // 7. Student A (Enrolled in Class A)
    const studentUserA = await User.create({
      name: `Tariq Student ${timestamp}`,
      email: `tariq_${timestamp}@sanaviyya.test`,
      username: `tariq_${timestamp}`,
      role: "STUDENT",
      status: "ACTIVE",
    });
    cleanup.users.push(studentUserA._id);

    const studentProfileA = await StudentProfile.create({
      userId: studentUserA._id,
      registrationNumber: `REG-A-${timestamp.toString().slice(-4)}`,
      nameEnglish: `Tariq Student ${timestamp}`,
      fatherName: "Abu Tariq",
      motherName: "Um Tariq",
      dateOfBirth: new Date("2008-01-01"),
      admissionYear: 2026,
      classId: classA._id,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    cleanup.studentProfiles.push(studentProfileA._id);
    const studentTokenA = generateToken({ userId: studentUserA._id, role: "STUDENT" });

    // 8. Student B (Enrolled in Class B)
    const studentUserB = await User.create({
      name: `Zayd Student ${timestamp}`,
      email: `zayd_${timestamp}@sanaviyya.test`,
      username: `zayd_${timestamp}`,
      role: "STUDENT",
      status: "ACTIVE",
    });
    cleanup.users.push(studentUserB._id);

    const studentProfileB = await StudentProfile.create({
      userId: studentUserB._id,
      registrationNumber: `REG-B-${timestamp.toString().slice(-4)}`,
      nameEnglish: `Zayd Student ${timestamp}`,
      fatherName: "Abu Zayd",
      motherName: "Um Zayd",
      dateOfBirth: new Date("2008-02-02"),
      admissionYear: 2026,
      classId: classB._id,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    cleanup.studentProfiles.push(studentProfileB._id);
    const studentTokenB = generateToken({ userId: studentUserB._id, role: "STUDENT" });

    // 9. FacultyAssignments
    const assignA = await FacultyAssignment.create({
      facultyId: facultyProfileA._id,
      classId: classA._id,
      subjectId: subject1._id,
      academicYearId: academicYear._id,
      isPrimary: true,
      status: "ACTIVE",
    });
    cleanup.facultyAssignments.push(assignA._id);

    const assignB = await FacultyAssignment.create({
      facultyId: facultyProfileB._id,
      classId: classB._id,
      subjectId: subject2._id,
      academicYearId: academicYear._id,
      isPrimary: true,
      status: "ACTIVE",
    });
    cleanup.facultyAssignments.push(assignB._id);

    // 10. Syllabuses
    const syllabusA = await Syllabus.create({
      title: `Nahw Syllabus ${timestamp}`,
      kitabName: "Al-Ajrumiyyah",
      description: "Grammar curriculum for Class 1A",
      classId: classA._id,
      subjectId: subject1._id,
      academicYearId: academicYear._id,
      units: [
        {
          unitNumber: 1,
          title: "Al-Muqaddimah",
          plannedHours: 10,
          completedHours: 0,
          isCompleted: false,
          topics: [
            { title: "Kalam definition", isCompleted: false },
            { title: "Parts of speech", isCompleted: false },
          ],
        },
        {
          unitNumber: 2,
          title: "Al-I'rab",
          plannedHours: 15,
          completedHours: 0,
          isCompleted: false,
          topics: [
            { title: "Signs of Raf'", isCompleted: false },
            { title: "Signs of Nasb", isCompleted: false },
          ],
        },
      ],
      completionPercentage: 0,
      status: "ACTIVE",
    });
    cleanup.syllabuses.push(syllabusA._id);

    const syllabusB = await Syllabus.create({
      title: `Balaaghah Syllabus ${timestamp}`,
      kitabName: "Duroos al-Balaghah",
      description: "Rhetoric curriculum for Class 1B",
      classId: classB._id,
      subjectId: subject2._id,
      academicYearId: academicYear._id,
      units: [
        {
          unitNumber: 1,
          title: "Ilm al-Bayan",
          plannedHours: 12,
          completedHours: 0,
          isCompleted: false,
          topics: [{ title: "Tashbeeh", isCompleted: false }],
        },
      ],
      completionPercentage: 0,
      status: "ACTIVE",
    });
    cleanup.syllabuses.push(syllabusB._id);

    // 11. Mentorship Assignments
    const mentorA = await MentorAssignment.create({
      mentorId: facultyProfileA._id,
      studentId: studentProfileA._id,
      academicYearId: academicYear._id,
      monitoringCategory: "NORMAL",
      notes: "Initial mentor assignment for Tariq",
      notesHistory: [
        {
          note: "Initial mentor assignment for Tariq",
          category: "GENERAL",
          createdAt: new Date(),
          createdBy: facultyUserA._id,
        },
      ],
      status: "ACTIVE",
    });
    cleanup.mentorAssignments.push(mentorA._id);

    const mentorB = await MentorAssignment.create({
      mentorId: facultyProfileB._id,
      studentId: studentProfileB._id,
      academicYearId: academicYear._id,
      monitoringCategory: "NORMAL",
      notes: "Initial mentor assignment for Zayd",
      notesHistory: [],
      status: "ACTIVE",
    });
    cleanup.mentorAssignments.push(mentorB._id);

    // 12. Timetable for Class A (all 7 periods on Wednesday)
    const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const testDate = new Date("2026-10-14"); // Wednesday
    const dayName = DAYS[testDate.getUTCDay()];

    for (let p = 1; p <= 7; p++) {
      const tt = await Timetable.create({
        academicYearId: academicYear._id,
        classId: classA._id,
        subjectId: subject1._id,
        facultyId: facultyProfileA._id,
        dayOfWeek: dayName,
        periodNumber: p,
        startTime: `0${7 + p}:00`,
        endTime: `0${7 + p}:45`,
        roomNumber: `Room 10${p}`,
        status: "ACTIVE",
      });
      cleanup.timetables.push(tt._id);
    }

    // 13. Leave Applications (Pending)
    const leaveA = await LeaveApplication.create({
      studentId: studentProfileA._id,
      appliedBy: studentUserA._id,
      dateRange: {
        startDate: testDate,
        endDate: testDate,
      },
      reason: "Family medical appointment",
      status: "PENDING",
    });
    cleanup.leaveApplications.push(leaveA._id);

    const leaveB = await LeaveApplication.create({
      studentId: studentProfileB._id,
      appliedBy: studentUserB._id,
      dateRange: {
        startDate: testDate,
        endDate: testDate,
      },
      reason: "Personal urgent travel",
      status: "PENDING",
    });
    cleanup.leaveApplications.push(leaveB._id);

    console.log("✓ Fixtures successfully prepared.");

    // Helper for HTTP requests
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

    console.log("\n==================== TEST SUITE EXECUTION (24 TESTS) ====================");

    // -------------------------------------------------------------------------
    // 1. SYLLABUS WORKFLOW & SCOPING
    // -------------------------------------------------------------------------
    console.log("\n--- [Domain 1: Syllabus & Teaching Progress] ---");

    // Test 1: Faculty views assigned syllabus list (HTTP 200)
    const t1 = await apiRequest("/academic/syllabuses", { token: facultyTokenA });
    if (t1.status === 200 && Array.isArray(t1.data.data) && t1.data.data.some((s) => s._id === syllabusA._id.toString())) {
      console.log("✓ Test 1 Passed: Faculty A views assigned syllabus (HTTP 200)");
      passedTests++;
    } else {
      throw new Error(`Test 1 Failed: Expected 200 with assigned syllabus, got ${t1.status}`);
    }

    // Test 2: Faculty attempts to view unassigned syllabus (HTTP 403)
    const t2 = await apiRequest(`/academic/syllabuses/${syllabusB._id}`, { token: facultyTokenA });
    if (t2.status === 403) {
      console.log("✓ Test 2 Passed: Faculty A blocked from unassigned Syllabus B (HTTP 403 Forbidden)");
      passedTests++;
    } else {
      throw new Error(`Test 2 Failed: Expected 403 Forbidden, got ${t2.status}`);
    }

    // Test 3: Faculty attempts to update unassigned syllabus (HTTP 403)
    const t3 = await apiRequest(`/academic/syllabuses/${syllabusB._id}`, {
      method: "PUT",
      token: facultyTokenA,
      body: { completionPercentage: 50 },
    });
    if (t3.status === 403) {
      console.log("✓ Test 3 Passed: Faculty A blocked from updating unassigned Syllabus B (HTTP 403 Forbidden)");
      passedTests++;
    } else {
      throw new Error(`Test 3 Failed: Expected 403 Forbidden, got ${t3.status}`);
    }

    // Test 4: Faculty updates teaching progress on assigned syllabus (HTTP 200)
    const updatedUnits = [
      {
        unitNumber: 1,
        title: "Al-Muqaddimah",
        plannedHours: 10,
        completedHours: 10,
        isCompleted: true,
        topics: [
          { title: "Kalam definition", isCompleted: true },
          { title: "Parts of speech", isCompleted: true },
        ],
      },
      {
        unitNumber: 2,
        title: "Al-I'rab",
        plannedHours: 15,
        completedHours: 5,
        isCompleted: false,
        topics: [
          { title: "Signs of Raf'", isCompleted: true },
          { title: "Signs of Nasb", isCompleted: false },
        ],
      },
    ];
    const t4 = await apiRequest(`/academic/syllabuses/${syllabusA._id}`, {
      method: "PUT",
      token: facultyTokenA,
      body: { units: updatedUnits, completionPercentage: 50 },
    });
    if (t4.status === 200 && t4.data.data.units[0].isCompleted === true && t4.data.data.completionPercentage === 50) {
      console.log("✓ Test 4 Passed: Faculty A updates teaching progress with unit completion (HTTP 200)");
      passedTests++;
    } else {
      throw new Error(`Test 4 Failed: Expected 200 with updated progress, got ${t4.status}`);
    }

    // Test 5: Faculty cannot create or delete syllabus framework (Admin only -> HTTP 403)
    const t5a = await apiRequest("/academic/syllabuses", {
      method: "POST",
      token: facultyTokenA,
      body: { title: "Illegal Syllabus", classId: classA._id, subjectId: subject1._id, academicYearId: academicYear._id },
    });
    const t5b = await apiRequest(`/academic/syllabuses/${syllabusA._id}`, {
      method: "DELETE",
      token: facultyTokenA,
    });
    if (t5a.status === 403 && t5b.status === 403) {
      console.log("✓ Test 5 Passed: Faculty blocked from creating or deleting syllabus framework (HTTP 403 Forbidden)");
      passedTests++;
    } else {
      throw new Error(`Test 5 Failed: Expected 403 for POST/DELETE, got ${t5a.status} / ${t5b.status}`);
    }

    // -------------------------------------------------------------------------
    // 2. MENTORSHIP WORKSPACE
    // -------------------------------------------------------------------------
    console.log("\n--- [Domain 2: Mentorship Workspace] ---");

    // Test 6: Faculty views assigned mentees list (HTTP 200)
    const t6 = await apiRequest("/mentorship/my-mentees", { token: facultyTokenA });
    if (t6.status === 200 && Array.isArray(t6.data.data) && t6.data.data.length === 1 && t6.data.data[0]._id === mentorA._id.toString()) {
      console.log("✓ Test 6 Passed: Faculty A views assigned mentees list (HTTP 200)");
      passedTests++;
    } else {
      throw new Error(`Test 6 Failed: Expected 200 with 1 mentee, got ${t6.status}`);
    }

    // Test 7: Faculty views assigned mentee details (HTTP 200)
    const t7 = await apiRequest(`/mentorship/student/${studentProfileA._id}`, { token: facultyTokenA });
    const studentIdStr = t7.data.data?.studentId?._id ? t7.data.data.studentId._id.toString() : t7.data.data?.studentId?.toString();
    if (t7.status === 200 && studentIdStr === studentProfileA._id.toString()) {
      console.log("✓ Test 7 Passed: Faculty A views assigned mentee details (HTTP 200)");
      passedTests++;
    } else {
      throw new Error(`Test 7 Failed: Expected 200 for assigned mentee details, got ${t7.status}, studentId: ${studentIdStr}`);
    }

    // Test 8: Faculty attempts to view unassigned mentee details (HTTP 403)
    const t8 = await apiRequest(`/mentorship/student/${studentProfileB._id}`, { token: facultyTokenA });
    if (t8.status === 403) {
      console.log("✓ Test 8 Passed: Faculty A blocked from viewing unassigned mentee details (HTTP 403 Forbidden)");
      passedTests++;
    } else {
      throw new Error(`Test 8 Failed: Expected 403 Forbidden, got ${t8.status}`);
    }

    // Test 9: Faculty adds observation note for assigned mentee (HTTP 200/201)
    const t9 = await apiRequest(`/mentorship/student/${studentProfileA._id}/notes`, {
      method: "POST",
      token: facultyTokenA,
      body: { note: "Excellent tajweed and classroom conduct observed today.", category: "SPIRITUAL" },
    });
    if ((t9.status === 200 || t9.status === 201) && t9.data.data.notesHistory && t9.data.data.notesHistory.length >= 2) {
      console.log("✓ Test 9 Passed: Faculty A records observation note in notesHistory (HTTP 200/201)");
      passedTests++;
    } else {
      throw new Error(`Test 9 Failed: Expected 200/201 with notesHistory updated, got ${t9.status}`);
    }

    // Test 10: Faculty attempts to add note for unassigned student (HTTP 403)
    const t10 = await apiRequest(`/mentorship/student/${studentProfileB._id}/notes`, {
      method: "POST",
      token: facultyTokenA,
      body: { note: "Unauthorized note attempt", category: "SPIRITUAL" },
    });
    if (t10.status === 403) {
      console.log("✓ Test 10 Passed: Faculty A blocked from adding note for unassigned student (HTTP 403 Forbidden)");
      passedTests++;
    } else {
      throw new Error(`Test 10 Failed: Expected 403 Forbidden, got ${t10.status}`);
    }

    // Test 11: Faculty updates monitoring category for assigned mentee (HTTP 200)
    const t11 = await apiRequest(`/mentorship/assignments/${mentorA._id}`, {
      method: "PATCH",
      token: facultyTokenA,
      body: { monitoringCategory: "NEED_ATTENTION", notes: "Review needed on study routine" },
    });
    if (t11.status === 200 && t11.data.data.monitoringCategory === "NEED_ATTENTION") {
      console.log("✓ Test 11 Passed: Faculty A updates monitoring status to NEED_ATTENTION (HTTP 200)");
      passedTests++;
    } else {
      throw new Error(`Test 11 Failed: Expected 200 with NEED_ATTENTION, got ${t11.status}`);
    }

    // -------------------------------------------------------------------------
    // 3. STUDENT HOLISTIC DEVELOPMENT SCORING
    // -------------------------------------------------------------------------
    console.log("\n--- [Domain 3: Student Development Holistic Scoring] ---");

    // Test 12: Faculty records holistic score for assigned student (HTTP 200/201)
    const t12 = await apiRequest("/development/scores", {
      method: "POST",
      token: facultyTokenA,
      body: {
        studentId: studentProfileA._id,
        academicYearId: academicYear._id,
        term: "TERM_1",
        academicScore: 88,
        linguisticScore: { arabic: 92, english: 85, urdu: 90 },
        spiritualScore: 94,
        skillScore: 80,
        leadershipScore: 85,
        remarks: "Exemplary commitment to studies and campus adab.",
      },
    });
    const devScore = t12.data.data?.overallDevelopmentScore ?? t12.data.data?.compositeScore;
    if ((t12.status === 200 || t12.status === 201) && devScore > 0) {
      console.log(`✓ Test 12 Passed: Faculty A records holistic development score (Composite: ${devScore}, HTTP 200/201)`);
      cleanup.developmentScores.push(t12.data.data._id);
      passedTests++;
    } else {
      throw new Error(`Test 12 Failed: Expected 200/201, got ${t12.status}: ${JSON.stringify(t12.data)}`);
    }

    // Test 13: Faculty attempts to record development score for unassigned student (HTTP 403)
    const t13 = await apiRequest("/development/scores", {
      method: "POST",
      token: facultyTokenA,
      body: {
        studentId: studentProfileB._id,
        academicYearId: academicYear._id,
        term: "TERM_1",
        academicScore: 70,
        spiritualScore: 70,
      },
    });
    if (t13.status === 403) {
      console.log("✓ Test 13 Passed: Faculty A blocked from scoring unassigned Student B (HTTP 403 Forbidden)");
      passedTests++;
    } else {
      throw new Error(`Test 13 Failed: Expected 403 Forbidden, got ${t13.status}`);
    }

    // Test 14: Student A views own development scores (HTTP 200)
    const t14 = await apiRequest("/development/my-scores", { token: studentTokenA });
    if (t14.status === 200 && Array.isArray(t14.data.data) && t14.data.data.length >= 1) {
      console.log("✓ Test 14 Passed: Student A views own development scores (HTTP 200)");
      passedTests++;
    } else {
      throw new Error(`Test 14 Failed: Expected 200 with own scores, got ${t14.status}`);
    }

    // Test 15: Student A attempts to view Student B's development scores (HTTP 403)
    const t15 = await apiRequest(`/development/student/${studentProfileB._id}`, { token: studentTokenA });
    if (t15.status === 403) {
      console.log("✓ Test 15 Passed: Student A blocked from viewing Student B's development scores (HTTP 403 Forbidden)");
      passedTests++;
    } else {
      throw new Error(`Test 15 Failed: Expected 403 Forbidden, got ${t15.status}`);
    }

    // -------------------------------------------------------------------------
    // 4. DISCIPLINE & CONDUCT WORKSPACE
    // -------------------------------------------------------------------------
    console.log("\n--- [Domain 4: Discipline & Conduct Workspace] ---");

    // Test 16: Faculty logs discipline incident for assigned student (HTTP 200/201)
    let createdIncidentId = null;
    const t16 = await apiRequest("/discipline/records", {
      method: "POST",
      token: facultyTokenA,
      body: {
        studentId: studentProfileA._id,
        academicYearId: academicYear._id,
        incidentDate: new Date().toISOString(),
        incidentType: "LATENESS",
        severity: "LOW",
        description: "Arrived 15 minutes late to morning assembly.",
        demeritPoints: 2,
        actionTaken: "Verbal warning and reminder of punctuality rule.",
      },
    });
    if ((t16.status === 200 || t16.status === 201) && t16.data.data.demeritPoints === 2) {
      createdIncidentId = t16.data.data._id;
      cleanup.disciplineRecords.push(createdIncidentId);
      console.log("✓ Test 16 Passed: Faculty A logs discipline incident with 2 demerit points (HTTP 200/201)");
      passedTests++;
    } else {
      throw new Error(`Test 16 Failed: Expected 200/201, got ${t16.status}: ${JSON.stringify(t16.data)}`);
    }

    // Test 17: Faculty attempts to log incident for unassigned student (HTTP 403)
    const t17 = await apiRequest("/discipline/records", {
      method: "POST",
      token: facultyTokenA,
      body: {
        studentId: studentProfileB._id,
        academicYearId: academicYear._id,
        incidentDate: new Date().toISOString(),
        incidentType: "LATENESS",
        severity: "LOW",
        description: "Unauthorized incident logging",
      },
    });
    if (t17.status === 403) {
      console.log("✓ Test 17 Passed: Faculty A blocked from logging incident for unassigned Student B (HTTP 403 Forbidden)");
      passedTests++;
    } else {
      throw new Error(`Test 17 Failed: Expected 403 Forbidden, got ${t17.status}`);
    }

    // Test 18: Faculty views discipline records for assigned student (HTTP 200)
    const t18 = await apiRequest(`/discipline/student/${studentProfileA._id}`, { token: facultyTokenA });
    if (t18.status === 200 && Array.isArray(t18.data.data) && t18.data.data.length >= 1) {
      console.log("✓ Test 18 Passed: Faculty A queries discipline records for assigned Student A (HTTP 200)");
      passedTests++;
    } else {
      throw new Error(`Test 18 Failed: Expected 200 with discipline records, got ${t18.status}`);
    }

    // Test 19: Faculty attempts to view discipline records for unassigned student (HTTP 403)
    const t19 = await apiRequest(`/discipline/student/${studentProfileB._id}`, { token: facultyTokenA });
    if (t19.status === 403) {
      console.log("✓ Test 19 Passed: Faculty A blocked from querying discipline records of unassigned Student B (HTTP 403 Forbidden)");
      passedTests++;
    } else {
      throw new Error(`Test 19 Failed: Expected 403 Forbidden, got ${t19.status}`);
    }

    // Test 20: Faculty resolves discipline incident for assigned student (HTTP 200)
    const t20 = await apiRequest(`/discipline/records/${createdIncidentId}/resolve`, {
      method: "PATCH",
      token: facultyTokenA,
      body: { resolutionRemarks: "Student expressed sincere apology and completed reflection task." },
    });
    if (t20.status === 200 && (t20.data.data.resolved === true || t20.data.data.status === "RESOLVED")) {
      console.log("✓ Test 20 Passed: Faculty A resolves discipline incident with resolution remarks (HTTP 200)");
      passedTests++;
    } else {
      throw new Error(`Test 20 Failed: Expected 200 with resolved status, got ${t20.status}: ${JSON.stringify(t20.data)}`);
    }

    // -------------------------------------------------------------------------
    // 5. LEAVE MANAGEMENT & ATTENDANCE INTEGRATION
    // -------------------------------------------------------------------------
    console.log("\n--- [Domain 5: Leave Management & Attendance Integration] ---");

    // Test 21: Faculty views pending leaves scoped to assigned students (HTTP 200)
    const t21 = await apiRequest("/leaves?status=PENDING", { token: facultyTokenA });
    if (
      t21.status === 200 &&
      Array.isArray(t21.data.data) &&
      t21.data.data.some((l) => l._id === leaveA._id.toString()) &&
      !t21.data.data.some((l) => l._id === leaveB._id.toString())
    ) {
      console.log("✓ Test 21 Passed: Faculty A views pending leaves scoped strictly to assigned students (HTTP 200)");
      passedTests++;
    } else {
      throw new Error(`Test 21 Failed: Expected 200 with leaveA and without leaveB, got ${t21.status}`);
    }

    // Test 22: Faculty attempts to approve unassigned Student B's leave (HTTP 403)
    const t22 = await apiRequest(`/leaves/${leaveB._id}/approve`, {
      method: "PATCH",
      token: facultyTokenA,
      body: { reviewRemarks: "Unauthorized approval attempt" },
    });
    if (t22.status === 403) {
      console.log("✓ Test 22 Passed: Faculty A blocked from approving unassigned Student B's leave (HTTP 403 Forbidden)");
      passedTests++;
    } else {
      throw new Error(`Test 22 Failed: Expected 403 Forbidden, got ${t22.status}`);
    }

    // Test 23: Faculty approves assigned Student A's leave -> verify status APPROVED and 7-period LEAVE attendance upserted (HTTP 200)
    const t23 = await apiRequest(`/leaves/${leaveA._id}/approve`, {
      method: "PATCH",
      token: facultyTokenA,
      body: { reviewRemarks: "Medical leave approved. Get well soon." },
    });
    if (t23.status === 200 && t23.data.data.status === "APPROVED") {
      // Query attendance records generated for this date
      const startOfDay = new Date(testDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(testDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const generatedAttendance = await AttendanceRecord.find({
        studentId: studentProfileA._id,
        date: { $gte: startOfDay, $lte: endOfDay },
      });

      if (generatedAttendance.length === 7 && generatedAttendance.every((r) => r.status === "LEAVE" && r.source === "MANUAL_CORRECTION")) {
        console.log(`✓ Test 23 Passed: Leave approved and all 7 periods automatically upserted with status LEAVE & source MANUAL_CORRECTION (HTTP 200)`);
        cleanup.attendanceRecords.push(...generatedAttendance.map((r) => r._id));
        passedTests++;
      } else {
        throw new Error(`Test 23 Failed: Expected 7 LEAVE records, got ${generatedAttendance.length} records`);
      }
    } else {
      throw new Error(`Test 23 Failed: Expected 200 for leave approval, got ${t23.status}`);
    }

    // Test 24: Faculty B rejects assigned Student B's leave with rejection remarks (HTTP 200)
    const t24 = await apiRequest(`/leaves/${leaveB._id}/reject`, {
      method: "PATCH",
      token: facultyTokenB,
      body: { reviewRemarks: "Exam scheduled on this date; leave cannot be granted." },
    });
    if (t24.status === 200 && t24.data.data.status === "REJECTED" && t24.data.data.reviewRemarks.includes("Exam scheduled")) {
      console.log("✓ Test 24 Passed: Faculty B rejects assigned Student B's leave with rejection remarks (HTTP 200)");
      passedTests++;
    } else {
      throw new Error(`Test 24 Failed: Expected 200 REJECTED, got ${t24.status}`);
    }

    console.log("\n==================================================================");
    console.log(`ALL 24 PHASE 2 TESTS PASSED PERFECTLY! (${passedTests}/${totalTests})`);
    console.log("==================================================================");
  } catch (error) {
    console.error("\n❌ PHASE 2 TEST FAILED:", error);
    process.exitCode = 1;
  } finally {
    console.log("\n[4/4] Cleaning up test fixtures from database...");
    await Promise.all([
      AcademicYear.deleteMany({ _id: { $in: cleanup.academicYears } }),
      Class.deleteMany({ _id: { $in: cleanup.classes } }),
      Subject.deleteMany({ _id: { $in: cleanup.subjects } }),
      User.deleteMany({ _id: { $in: cleanup.users } }),
      FacultyProfile.deleteMany({ _id: { $in: cleanup.facultyProfiles } }),
      StudentProfile.deleteMany({ _id: { $in: cleanup.studentProfiles } }),
      FacultyAssignment.deleteMany({ _id: { $in: cleanup.facultyAssignments } }),
      Syllabus.deleteMany({ _id: { $in: cleanup.syllabuses } }),
      Timetable.deleteMany({ _id: { $in: cleanup.timetables } }),
      AttendanceRecord.deleteMany({ _id: { $in: cleanup.attendanceRecords } }),
      MentorAssignment.deleteMany({ _id: { $in: cleanup.mentorAssignments } }),
      StudentDevelopmentScore.deleteMany({ _id: { $in: cleanup.developmentScores } }),
      DisciplinaryRecord.deleteMany({ _id: { $in: cleanup.disciplineRecords } }),
      LeaveApplication.deleteMany({ _id: { $in: cleanup.leaveApplications } }),
    ]);
    console.log("✓ Cleanup finished.");

    server.close();
    await mongoose.disconnect();
    console.log("✓ Server closed and database disconnected.");
  }
}

runPhase2DeepeningTests();
