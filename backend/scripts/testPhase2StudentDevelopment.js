const mongoose = require("mongoose");
const http = require("http");
const app = require("../src/app");
const env = require("../src/config/env");
const { generateToken } = require("../src/shared/utils/jwt");

// Models
const User = require("../src/modules/users/user.model");
const StudentProfile = require("../src/modules/students/student.model");
const FacultyProfile = require("../src/modules/faculty/faculty.model");
const ParentProfile = require("../src/modules/parents/parent.model");
const AcademicYear = require("../src/modules/academics/academic-year.model");
const Class = require("../src/modules/academics/class.model");
const MentorAssignment = require("../src/modules/mentorship/mentor-assignment.model");
const StudentDevelopmentScore = require("../src/modules/development/student-development-score.model");
const Activity = require("../src/modules/activities/activity.model");
const StudentAchievement = require("../src/modules/activities/student-achievement.model");
const DisciplineRecord = require("../src/modules/discipline/discipline-record.model");

async function runPhase2Verification() {
  console.log("==================================================================");
  console.log("PHASE 2 VERIFICATION: STUDENT DEVELOPMENT, MENTORSHIP, DISCIPLINE");
  console.log("==================================================================");

  // 1. Connect DB
  await mongoose.connect(env.MONGODB_URI, { dbName: env.DB_NAME });
  console.log("[1/5] Connected to MongoDB Atlas.");

  // 2. Start HTTP server
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;
  console.log(`[2/5] Test HTTP server listening on port ${port}.`);

  // Tracking arrays for cleanup
  const cleanupUserIds = [];
  const cleanupStudentIds = [];
  const cleanupFacultyIds = [];
  const cleanupParentIds = [];
  const cleanupAcademicYearIds = [];
  const cleanupClassIds = [];
  const cleanupMentorAssignmentIds = [];
  const cleanupDevelopmentScoreIds = [];
  const cleanupActivityIds = [];
  const cleanupAchievementIds = [];
  const cleanupDisciplineIds = [];

  try {
    const timestamp = Date.now();

    // 3. Establish fixtures
    const academicYear = await AcademicYear.create({
      yearName: `Sanaviyya Year ${timestamp}`,
      yearCode: `AY-${timestamp.toString().slice(-4)}`,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-03-31"),
      status: "ACTIVE",
    });
    cleanupAcademicYearIds.push(academicYear._id);

    const classA = await Class.create({
      name: `Class 10-A ${timestamp}`,
      code: `C10A-${timestamp.toString().slice(-4)}`,
      academicYearId: academicYear._id,
      capacity: 30,
    });
    cleanupClassIds.push(classA._id);

    const classB = await Class.create({
      name: `Class 10-B ${timestamp}`,
      code: `C10B-${timestamp.toString().slice(-4)}`,
      academicYearId: academicYear._id,
      capacity: 30,
    });
    cleanupClassIds.push(classB._id);

    // Student 1 & 2
    const userStudent1 = await User.create({
      name: "Zaid Student",
      email: `zaid.${timestamp}@markaz.in`,
      role: "STUDENT",
      status: "ACTIVE",
      emailVerified: true,
    });
    cleanupUserIds.push(userStudent1._id);

    const profileStudent1 = await StudentProfile.create({
      userId: userStudent1._id,
      registrationNumber: `REG-Z-${timestamp.toString().slice(-4)}`,
      nameEnglish: "Zaid Student",
      dateOfBirth: new Date("2010-01-15"),
      admissionYear: 2026,
      fatherName: "Father of Zaid",
      motherName: "Mother of Zaid",
      classId: classA._id,
      house: "GREEN",
      disciplineScore: 100,
    });
    cleanupStudentIds.push(profileStudent1._id);

    const userStudent2 = await User.create({
      name: "Omar Student",
      email: `omar.${timestamp}@markaz.in`,
      role: "STUDENT",
      status: "ACTIVE",
      emailVerified: true,
    });
    cleanupUserIds.push(userStudent2._id);

    const profileStudent2 = await StudentProfile.create({
      userId: userStudent2._id,
      registrationNumber: `REG-O-${timestamp.toString().slice(-4)}`,
      nameEnglish: "Omar Student",
      dateOfBirth: new Date("2010-05-20"),
      admissionYear: 2026,
      fatherName: "Father of Omar",
      motherName: "Mother of Omar",
      classId: classB._id,
      house: "RED",
      disciplineScore: 100,
    });
    cleanupStudentIds.push(profileStudent2._id);

    // Parent
    const userParent1 = await User.create({
      name: "Parent of Zaid",
      email: `parent.zaid.${timestamp}@markaz.in`,
      role: "PARENT",
      status: "ACTIVE",
      emailVerified: true,
    });
    cleanupUserIds.push(userParent1._id);

    const profileParent1 = await ParentProfile.create({
      userId: userParent1._id,
      name: "Parent of Zaid",
      studentIds: [profileStudent1._id],
    });
    cleanupParentIds.push(profileParent1._id);

    // Asatitha 1 (assigned to Class A)
    const userUsthad1 = await User.create({
      name: "Usthad Ahmad",
      email: `ahmad.${timestamp}@markaz.in`,
      role: "ASATITHA",
      status: "ACTIVE",
      emailVerified: true,
    });
    cleanupUserIds.push(userUsthad1._id);

    const profileUsthad1 = await FacultyProfile.create({
      userId: userUsthad1._id,
      facultyId: `UST-A-${timestamp.toString().slice(-4)}`,
      assignedClasses: [classA._id],
    });
    cleanupFacultyIds.push(profileUsthad1._id);

    // Asatitha 2 (assigned to Class B)
    const userUsthad2 = await User.create({
      name: "Usthad Bilal",
      email: `bilal.${timestamp}@markaz.in`,
      role: "ASATITHA",
      status: "ACTIVE",
      emailVerified: true,
    });
    cleanupUserIds.push(userUsthad2._id);

    const profileUsthad2 = await FacultyProfile.create({
      userId: userUsthad2._id,
      facultyId: `UST-B-${timestamp.toString().slice(-4)}`,
      assignedClasses: [classB._id],
    });
    cleanupFacultyIds.push(profileUsthad2._id);

    // Admin
    const userAdmin = await User.create({
      name: "Admin Officer",
      email: `admin.p2.${timestamp}@markaz.in`,
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: true,
    });
    cleanupUserIds.push(userAdmin._id);

    console.log(`[3/5] Test domain fixtures established.`);

    // Generate JWTs
    const tokenStudent1 = generateToken({ userId: userStudent1._id.toString(), role: "STUDENT" });
    const tokenParent1 = generateToken({ userId: userParent1._id.toString(), role: "PARENT" });
    const tokenUsthad1 = generateToken({ userId: userUsthad1._id.toString(), role: "ASATITHA" });
    const tokenUsthad2 = generateToken({ userId: userUsthad2._id.toString(), role: "ASATITHA" });
    const tokenAdmin = generateToken({ userId: userAdmin._id.toString(), role: "ADMIN" });

    // =========================================================================
    // ITEM 13: MENTOR ASSIGNMENT
    // =========================================================================
    console.log(`\n==================================================================`);
    console.log(`ITEM 13 VERIFICATION: MentorAssignment`);
    console.log(`==================================================================`);

    // 13a. Admin assigns Usthad 1 as mentor to Student 1
    console.log(`\n--- 13a. POST /api/mentorship/assignments as ADMIN ---`);
    const resAssign = await fetch(`${baseUrl}/mentorship/assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenAdmin}` },
      body: JSON.stringify({
        mentorId: profileUsthad1._id,
        studentId: profileStudent1._id,
        academicYearId: academicYear._id,
        monitoringCategory: "NORMAL",
        notes: "Initial mentor allocation for AY 2026-27",
      }),
    });
    const bodyAssign = await resAssign.json();
    console.log(`HTTP Status: ${resAssign.status}`);
    console.log(`Response:`, JSON.stringify(bodyAssign, null, 2));
    if (bodyAssign.data?._id) cleanupMentorAssignmentIds.push(bodyAssign.data._id);

    // Verify StudentProfile.mentorId was updated
    const updatedStudentAfterMentor = await StudentProfile.findById(profileStudent1._id);
    const mentorIdSynced = updatedStudentAfterMentor.mentorId?.toString() === profileUsthad1._id.toString();
    console.log(`StudentProfile.mentorId synced: ${mentorIdSynced}`);

    // 13b. Usthad 1 checks my mentees
    console.log(`\n--- 13b. GET /api/mentorship/my-mentees as ASATITHA 1 ---`);
    const resMyMentees = await fetch(`${baseUrl}/mentorship/my-mentees`, {
      headers: { Authorization: `Bearer ${tokenUsthad1}` },
    });
    const bodyMyMentees = await resMyMentees.json();
    console.log(`HTTP Status: ${resMyMentees.status}`);
    console.log(`Found ${bodyMyMentees.data?.length} mentees for Usthad 1`);

    // 13c. Usthad 2 (not mentor) attempts to modify monitoring category
    console.log(`\n--- 13c. PATCH /assignments/:id by Usthad 2 (Unassigned Mentor) ---`);
    const resUnauthorizedMentorPatch = await fetch(`${baseUrl}/mentorship/assignments/${bodyAssign.data._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenUsthad2}` },
      body: JSON.stringify({ monitoringCategory: "CRITICAL" }),
    });
    const bodyUnauthorizedMentorPatch = await resUnauthorizedMentorPatch.json();
    console.log(`HTTP Status: ${resUnauthorizedMentorPatch.status}`);
    console.log(`Response:`, JSON.stringify(bodyUnauthorizedMentorPatch, null, 2));

    // 13d. Usthad 1 (assigned mentor) updates monitoring category
    console.log(`\n--- 13d. PATCH /assignments/:id by Usthad 1 (Assigned Mentor) ---`);
    const resAuthorizedMentorPatch = await fetch(`${baseUrl}/mentorship/assignments/${bodyAssign.data._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenUsthad1}` },
      body: JSON.stringify({
        monitoringCategory: "NEED_ATTENTION",
        notes: "Requires additional support in Arabic Nahw fundamentals",
      }),
    });
    const bodyAuthorizedMentorPatch = await resAuthorizedMentorPatch.json();
    console.log(`HTTP Status: ${resAuthorizedMentorPatch.status}`);
    console.log(`Response:`, JSON.stringify(bodyAuthorizedMentorPatch, null, 2));

    // 13e. Student 1 queries my mentor
    console.log(`\n--- 13e. GET /api/mentorship/my-mentor as STUDENT 1 ---`);
    const resMyMentor = await fetch(`${baseUrl}/mentorship/my-mentor`, {
      headers: { Authorization: `Bearer ${tokenStudent1}` },
    });
    const bodyMyMentor = await resMyMentor.json();
    console.log(`HTTP Status: ${resMyMentor.status}`);
    console.log(`Response:`, JSON.stringify(bodyMyMentor, null, 2));

    const test13Passed =
      resAssign.status === 201 &&
      mentorIdSynced &&
      resMyMentees.status === 200 &&
      bodyMyMentees.data?.length === 1 &&
      resUnauthorizedMentorPatch.status === 403 &&
      resAuthorizedMentorPatch.status === 200 &&
      bodyAuthorizedMentorPatch.data?.monitoringCategory === "NEED_ATTENTION" &&
      resMyMentor.status === 200;

    console.log(`Result 13: ${test13Passed ? "PASSED (MentorAssignment workflow & RBAC verified)" : "FAILED"}`);
    if (!test13Passed) throw new Error("Item 13 failed");

    // =========================================================================
    // ITEM 14: STUDENT DEVELOPMENT SCORE
    // =========================================================================
    console.log(`\n==================================================================`);
    console.log(`ITEM 14 VERIFICATION: StudentDevelopmentScore`);
    console.log(`==================================================================`);

    // 14a. Usthad 2 (not class teacher and not mentor) attempts to enter development score
    console.log(`\n--- 14a. POST /api/development/scores by Usthad 2 (Unassigned) ---`);
    const resDevUnauthorized = await fetch(`${baseUrl}/development/scores`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenUsthad2}` },
      body: JSON.stringify({
        studentId: profileStudent1._id,
        academicYearId: academicYear._id,
        term: "TERM_1",
        academicScore: 85,
      }),
    });
    const bodyDevUnauthorized = await resDevUnauthorized.json();
    console.log(`HTTP Status: ${resDevUnauthorized.status}`);
    console.log(`Response:`, JSON.stringify(bodyDevUnauthorized, null, 2));

    // 14b. Usthad 1 (assigned class teacher / mentor) enters development score across 5 areas
    console.log(`\n--- 14b. POST /api/development/scores by Usthad 1 (Assigned) ---`);
    const devPayload = {
      studentId: profileStudent1._id,
      academicYearId: academicYear._id,
      term: "TERM_1",
      academicScore: 88,
      linguisticScore: {
        arabic: 85,
        english: 90,
        urdu: 80,
      },
      spiritualScore: 92,
      skillScore: 84,
      leadershipScore: 86,
      remarks: "Demonstrating excellent tarbiyya and peer leadership",
    };
    const resDevRecord = await fetch(`${baseUrl}/development/scores`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenUsthad1}` },
      body: JSON.stringify(devPayload),
    });
    const bodyDevRecord = await resDevRecord.json();
    console.log(`HTTP Status: ${resDevRecord.status}`);
    console.log(`Response:`, JSON.stringify(bodyDevRecord, null, 2));
    if (bodyDevRecord.data?._id) cleanupDevelopmentScoreIds.push(bodyDevRecord.data._id);

    // Verify skills synchronized to StudentProfile
    const studentAfterScore = await StudentProfile.findById(profileStudent1._id);
    console.log(`Synchronized StudentProfile.skills:`, JSON.stringify(studentAfterScore.skills, null, 2));

    // 14c. Student 1 queries my development scores
    console.log(`\n--- 14c. GET /api/development/my-scores as STUDENT 1 ---`);
    const resMyDev = await fetch(`${baseUrl}/development/my-scores`, {
      headers: { Authorization: `Bearer ${tokenStudent1}` },
    });
    const bodyMyDev = await resMyDev.json();
    console.log(`HTTP Status: ${resMyDev.status}`);
    console.log(`Response:`, JSON.stringify(bodyMyDev, null, 2));

    // 14d. Parent queries their student's scores
    console.log(`\n--- 14d. GET /api/development/student/:id as PARENT 1 ---`);
    const resParentDev = await fetch(`${baseUrl}/development/student/${profileStudent1._id}`, {
      headers: { Authorization: `Bearer ${tokenParent1}` },
    });
    const bodyParentDev = await resParentDev.json();
    console.log(`HTTP Status: ${resParentDev.status}`);
    console.log(`Found ${bodyParentDev.data?.length} score records for child`);

    const test14Passed =
      resDevUnauthorized.status === 403 &&
      resDevRecord.status === 201 &&
      bodyDevRecord.data?.linguisticScore?.overall === 85 && // (85 + 90 + 80) / 3 = 85
      bodyDevRecord.data?.overallDevelopmentScore === 87 && // (88 + 85 + 92 + 84 + 86) / 5 = 87
      studentAfterScore.skills?.quran === 92 &&
      studentAfterScore.skills?.arabic === 85 &&
      studentAfterScore.skills?.leadership === 86 &&
      resMyDev.status === 200 &&
      resParentDev.status === 200;

    console.log(`Result 14: ${test14Passed ? "PASSED (StudentDevelopmentScore 5 areas calculated, skills synced, RBAC enforced)" : "FAILED"}`);
    if (!test14Passed) throw new Error("Item 14 failed");

    // =========================================================================
    // ITEM 15: ACTIVITY & STUDENT ACHIEVEMENT
    // =========================================================================
    console.log(`\n==================================================================`);
    console.log(`ITEM 15 VERIFICATION: Activity & StudentAchievement`);
    console.log(`==================================================================`);

    // 15a. Admin creates Activity
    console.log(`\n--- 15a. POST /api/activities as ADMIN ---`);
    const resCreateAct = await fetch(`${baseUrl}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenAdmin}` },
      body: JSON.stringify({
        name: "All Kerala Arabic Speech & Debate Competition",
        category: "DEBATE",
        description: "State-level debate in classical Arabic",
        academicYearId: academicYear._id,
      }),
    });
    const bodyCreateAct = await resCreateAct.json();
    console.log(`HTTP Status: ${resCreateAct.status}`);
    console.log(`Response:`, JSON.stringify(bodyCreateAct, null, 2));
    if (bodyCreateAct.data?._id) cleanupActivityIds.push(bodyCreateAct.data._id);
    const activityId = bodyCreateAct.data._id;

    // 15b. Student 1 records achievement with spoofed studentId in body (pointing to Student 2)
    console.log(`\n--- 15b. POST /api/activities/achievements as STUDENT 1 (Spoof attempt) ---`);
    const resStudentAchieve = await fetch(`${baseUrl}/activities/achievements`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenStudent1}` },
      body: JSON.stringify({
        studentId: profileStudent2._id, // Attempt to log for Student 2!
        activityId,
        academicYearId: academicYear._id,
        stage: "STATE",
        rankPosition: "FIRST",
        marksObtained: 95,
        certificateUrl: "https://markaz.edu/certificates/arabic-debate-first.pdf",
        remarks: "First prize winner in State competition",
      }),
    });
    const bodyStudentAchieve = await resStudentAchieve.json();
    console.log(`HTTP Status: ${resStudentAchieve.status}`);
    console.log(`Response:`, JSON.stringify(bodyStudentAchieve, null, 2));
    if (bodyStudentAchieve.data?._id) cleanupAchievementIds.push(bodyStudentAchieve.data._id);

    const spoofThwarted =
      bodyStudentAchieve.data?.studentId?._id?.toString() === profileStudent1._id.toString() &&
      bodyStudentAchieve.data?.status === "PENDING";
    console.log(`Anti-spoofing check: forced to student's own ID (${spoofThwarted})`);

    // 15c. Usthad 2 (unassigned class) attempts to verify achievement
    console.log(`\n--- 15c. PATCH /achievements/:id/verify by Usthad 2 (Unassigned) ---`);
    const resVerifyUnauth = await fetch(`${baseUrl}/activities/achievements/${bodyStudentAchieve.data._id}/verify`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenUsthad2}` },
      body: JSON.stringify({ status: "VERIFIED" }),
    });
    const bodyVerifyUnauth = await resVerifyUnauth.json();
    console.log(`HTTP Status: ${resVerifyUnauth.status}`);
    console.log(`Response:`, JSON.stringify(bodyVerifyUnauth, null, 2));

    // 15d. Usthad 1 (assigned class teacher) verifies achievement
    console.log(`\n--- 15d. PATCH /achievements/:id/verify by Usthad 1 (Assigned) ---`);
    const resVerifyAuth = await fetch(`${baseUrl}/activities/achievements/${bodyStudentAchieve.data._id}/verify`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenUsthad1}` },
      body: JSON.stringify({
        status: "VERIFIED",
        remarks: "Certificate verified with organizing committee",
      }),
    });
    const bodyVerifyAuth = await resVerifyAuth.json();
    console.log(`HTTP Status: ${resVerifyAuth.status}`);
    console.log(`Response:`, JSON.stringify(bodyVerifyAuth, null, 2));

    const test15Passed =
      resCreateAct.status === 201 &&
      resStudentAchieve.status === 201 &&
      spoofThwarted &&
      resVerifyUnauth.status === 403 &&
      resVerifyAuth.status === 200 &&
      bodyVerifyAuth.data?.status === "VERIFIED";

    console.log(`Result 15: ${test15Passed ? "PASSED (Activity & Achievement workflow, anti-spoofing, and verification verified)" : "FAILED"}`);
    if (!test15Passed) throw new Error("Item 15 failed");

    // =========================================================================
    // ITEM 16: DISCIPLINE RECORD
    // =========================================================================
    console.log(`\n==================================================================`);
    console.log(`ITEM 16 VERIFICATION: DisciplineRecord`);
    console.log(`==================================================================`);

    // 16a. Usthad 2 (unassigned) attempts to record discipline incident for Student 1
    console.log(`\n--- 16a. POST /api/discipline/records by Usthad 2 (Unassigned) ---`);
    const resDiscUnauth = await fetch(`${baseUrl}/discipline/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenUsthad2}` },
      body: JSON.stringify({
        studentId: profileStudent1._id,
        incidentType: "Late Return from Break",
        severity: "LOW",
        demeritPoints: 5,
        description: "Arrived 15 minutes late after Asr break",
      }),
    });
    const bodyDiscUnauth = await resDiscUnauth.json();
    console.log(`HTTP Status: ${resDiscUnauth.status}`);
    console.log(`Response:`, JSON.stringify(bodyDiscUnauth, null, 2));

    // 16b. Usthad 1 (assigned class teacher) records discipline incident with 5 demerit points
    console.log(`\n--- 16b. POST /api/discipline/records by Usthad 1 (Assigned) ---`);
    const resDiscAuth = await fetch(`${baseUrl}/discipline/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenUsthad1}` },
      body: JSON.stringify({
        studentId: profileStudent1._id,
        incidentType: "Late Return from Break",
        severity: "LOW",
        demeritPoints: 5,
        description: "Arrived 15 minutes late after Asr break",
        actionTaken: "Verbal warning and reminder of Sanaviyya discipline code",
      }),
    });
    const bodyDiscAuth = await resDiscAuth.json();
    console.log(`HTTP Status: ${resDiscAuth.status}`);
    console.log(`Response:`, JSON.stringify(bodyDiscAuth, null, 2));
    if (bodyDiscAuth.data?._id) cleanupDisciplineIds.push(bodyDiscAuth.data._id);

    // Verify StudentProfile.disciplineScore deducted from 100 to 95
    const studentAfterDisc = await StudentProfile.findById(profileStudent1._id);
    const scoreDeducted = studentAfterDisc.disciplineScore === 95;
    console.log(`Student discipline score deducted (100 -> ${studentAfterDisc.disciplineScore}): ${scoreDeducted}`);

    // 16c. Usthad 1 resolves incident
    console.log(`\n--- 16c. PATCH /api/discipline/records/:id/resolve by Usthad 1 ---`);
    const resResolveDisc = await fetch(`${baseUrl}/discipline/records/${bodyDiscAuth.data._id}/resolve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenUsthad1}` },
      body: JSON.stringify({
        resolutionRemarks: "Student acknowledged mistake; completed reflection task satisfactorily",
      }),
    });
    const bodyResolveDisc = await resResolveDisc.json();
    console.log(`HTTP Status: ${resResolveDisc.status}`);
    console.log(`Response:`, JSON.stringify(bodyResolveDisc, null, 2));

    // 16d. Student 1 queries my discipline records
    console.log(`\n--- 16d. GET /api/discipline/my-records as STUDENT 1 ---`);
    const resMyDisc = await fetch(`${baseUrl}/discipline/my-records`, {
      headers: { Authorization: `Bearer ${tokenStudent1}` },
    });
    const bodyMyDisc = await resMyDisc.json();
    console.log(`HTTP Status: ${resMyDisc.status}`);
    console.log(`Found ${bodyMyDisc.data?.length} discipline record(s) for Student 1`);

    const test16Passed =
      resDiscUnauth.status === 403 &&
      resDiscAuth.status === 201 &&
      scoreDeducted &&
      resResolveDisc.status === 200 &&
      bodyResolveDisc.data?.resolved === true &&
      resMyDisc.status === 200;

    console.log(`Result 16: ${test16Passed ? "PASSED (Discipline incident, demerit score deduction, resolution, and RBAC verified)" : "FAILED"}`);
    if (!test16Passed) throw new Error("Item 16 failed");

    console.log(`\n==================================================================`);
    console.log(`ALL PHASE 2 SCHEMAS AND RBAC CONTROLS VERIFIED SUCCESSFULLY!`);
    console.log(`==================================================================`);
  } finally {
    // 4. Cleanup
    console.log(`\n[4/5] Cleaning up test fixtures from database...`);
    await Promise.all([
      User.deleteMany({ _id: { $in: cleanupUserIds } }),
      StudentProfile.deleteMany({ _id: { $in: cleanupStudentIds } }),
      FacultyProfile.deleteMany({ _id: { $in: cleanupFacultyIds } }),
      ParentProfile.deleteMany({ _id: { $in: cleanupParentIds } }),
      AcademicYear.deleteMany({ _id: { $in: cleanupAcademicYearIds } }),
      Class.deleteMany({ _id: { $in: cleanupClassIds } }),
      MentorAssignment.deleteMany({ _id: { $in: cleanupMentorAssignmentIds } }),
      StudentDevelopmentScore.deleteMany({ _id: { $in: cleanupDevelopmentScoreIds } }),
      Activity.deleteMany({ _id: { $in: cleanupActivityIds } }),
      StudentAchievement.deleteMany({ _id: { $in: cleanupAchievementIds } }),
      DisciplineRecord.deleteMany({ _id: { $in: cleanupDisciplineIds } }),
    ]);
    console.log(`[5/5] Cleanup complete. Server closed.`);
    server.close();
    await mongoose.disconnect();
  }
}

runPhase2Verification().catch((err) => {
  console.error("FATAL ERROR in Phase 2 Verification:", err);
  process.exit(1);
});
