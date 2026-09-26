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

async function runGapsVerification() {
  console.log("==================================================================");
  console.log("PHASE 1 GAPS VERIFICATION: CORRECTION WORKFLOW & LEAVE-ATTENDANCE");
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
  const cleanupAttendanceIds = [];
  const cleanupLeaveIds = [];
  const cleanupCorrectionIds = [];

  try {
    const timestamp = Date.now();

    // 1. Setup Academic Structure
    const academicYear = await AcademicYear.create({
      yearName: `Year ${timestamp}`,
      yearCode: `Y${timestamp.toString().slice(-4)}`,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-03-31"),
      status: "ACTIVE",
    });
    cleanupYearIds.push(academicYear._id);

    const classA = await Class.create({
      name: `Class 1A-${timestamp}`,
      code: `C1A-${timestamp.toString().slice(-4)}`,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    cleanupClassIds.push(classA._id);

    const classB = await Class.create({
      name: `Class 1B-${timestamp}`,
      code: `C1B-${timestamp.toString().slice(-4)}`,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    cleanupClassIds.push(classB._id);

    // 2. Setup Student 1 (Class A) & Student 2 (Class B)
    const userStudent1 = await User.create({
      name: "Tariq Student",
      email: `tariq.${timestamp}@markaz.in`,
      role: "STUDENT",
      status: "ACTIVE",
      emailVerified: true,
    });
    cleanupUserIds.push(userStudent1._id);

    const profileStudent1 = await StudentProfile.create({
      userId: userStudent1._id,
      registrationNumber: `REG-T-${timestamp.toString().slice(-4)}`,
      nameEnglish: "Tariq Student",
      dateOfBirth: new Date("2008-01-01"),
      admissionYear: 2026,
      classId: classA._id,
      fatherName: "Father Tariq",
      motherName: "Mother Tariq",
    });
    cleanupProfileIds.push(profileStudent1._id);

    const userStudent2 = await User.create({
      name: "Bilal Student",
      email: `bilal.${timestamp}@markaz.in`,
      role: "STUDENT",
      status: "ACTIVE",
      emailVerified: true,
    });
    cleanupUserIds.push(userStudent2._id);

    const profileStudent2 = await StudentProfile.create({
      userId: userStudent2._id,
      registrationNumber: `REG-B-${timestamp.toString().slice(-4)}`,
      nameEnglish: "Bilal Student",
      dateOfBirth: new Date("2008-02-02"),
      admissionYear: 2026,
      classId: classB._id,
      fatherName: "Father Bilal",
      motherName: "Mother Bilal",
    });
    cleanupProfileIds.push(profileStudent2._id);

    // 3. Setup Parent of Student 1
    const userParent1 = await User.create({
      name: "Parent Tariq",
      email: `parent.tariq.${timestamp}@markaz.in`,
      role: "PARENT",
      status: "ACTIVE",
      emailVerified: true,
    });
    cleanupUserIds.push(userParent1._id);

    const parentProfile1 = await ParentProfile.create({
      userId: userParent1._id,
      name: "Parent Tariq",
      studentIds: [profileStudent1._id],
    });
    cleanupParentIds.push(parentProfile1._id);

    // 4. Setup Asatitha 1 (Class A) & Asatitha 2 (Class B)
    const userUsthad1 = await User.create({
      name: "Usthad A",
      email: `usthad.a.${timestamp}@markaz.in`,
      role: "ASATITHA",
      status: "ACTIVE",
      emailVerified: true,
    });
    cleanupUserIds.push(userUsthad1._id);

    const profileUsthad1 = await FacultyProfile.create({
      userId: userUsthad1._id,
      facultyId: `FACA-${timestamp.toString().slice(-4)}`,
      assignedClasses: [classA._id],
    });
    cleanupFacultyIds.push(profileUsthad1._id);

    const userUsthad2 = await User.create({
      name: "Usthad B",
      email: `usthad.b.${timestamp}@markaz.in`,
      role: "ASATITHA",
      status: "ACTIVE",
      emailVerified: true,
    });
    cleanupUserIds.push(userUsthad2._id);

    const profileUsthad2 = await FacultyProfile.create({
      userId: userUsthad2._id,
      facultyId: `FACB-${timestamp.toString().slice(-4)}`,
      assignedClasses: [classB._id],
    });
    cleanupFacultyIds.push(profileUsthad2._id);

    // 5. Setup Admin
    const userAdmin = await User.create({
      name: "System Administrator",
      email: `admin.${timestamp}@markaz.in`,
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: true,
    });
    cleanupUserIds.push(userAdmin._id);

    // Pre-create an AttendanceRecord with ABSENT for Student 1 on Period 3
    const attendanceDate = new Date("2026-10-10T00:00:00.000Z");
    const existingAttendance = await AttendanceRecord.create({
      studentId: profileStudent1._id,
      classId: classA._id,
      date: attendanceDate,
      period: 3,
      sessionName: "Period 3",
      source: "SYSTEM_OVERRIDE",
      status: "ABSENT",
      isCorrected: false,
    });
    cleanupAttendanceIds.push(existingAttendance._id);

    console.log(`[3/5] Test domain fixtures established.`);
    console.log(`      Pre-existing AttendanceRecord on Period 3: ID=${existingAttendance._id}, status=${existingAttendance.status}`);

    // Generate JWTs
    const tokenStudent1 = generateToken({ userId: userStudent1._id.toString(), role: "STUDENT" });
    const tokenParent1 = generateToken({ userId: userParent1._id.toString(), role: "PARENT" });
    const tokenUsthad1 = generateToken({ userId: userUsthad1._id.toString(), role: "ASATITHA" });
    const tokenUsthad2 = generateToken({ userId: userUsthad2._id.toString(), role: "ASATITHA" });
    const tokenAdmin = generateToken({ userId: userAdmin._id.toString(), role: "ADMIN" });

    // =========================================================================
    // GAP 1: ATTENDANCE CORRECTION REQUEST WORKFLOW
    // =========================================================================
    console.log(`\n==================================================================`);
    console.log(`GAP 1 VERIFICATION: AttendanceCorrectionRequest Workflow`);
    console.log(`==================================================================`);

    // 1a. POST /api/attendance/correction-requests as Asatitha 2 for Student 1 (NOT in assigned class) -> MUST REJECT (403)
    console.log(`\n--- 1a. POST /correction-requests by Asatitha 2 for Student 1 (Not in assigned class) ---`);
    const resCorrUnassigned = await fetch(`${baseUrl}/attendance/correction-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenUsthad2}`,
      },
      body: JSON.stringify({
        studentId: profileStudent1._id.toString(),
        classId: classA._id.toString(),
        date: "2026-10-10",
        period: 3,
        currentStatus: "ABSENT",
        requestedStatus: "PRESENT",
        reason: "Biometric machine missed punch due to sensor timeout",
      }),
    });
    const bodyCorrUnassigned = await resCorrUnassigned.json();
    console.log(`HTTP Status: ${resCorrUnassigned.status}`);
    console.log(`Response:`, JSON.stringify(bodyCorrUnassigned, null, 2));

    const test1aPassed =
      resCorrUnassigned.status === 403 &&
      bodyCorrUnassigned.success === false &&
      bodyCorrUnassigned.message.includes("not belong to your assigned classes");
    console.log(`Result 1a: ${test1aPassed ? "PASSED (Class assignment check rejected unauthorized Asatitha)" : "FAILED"}`);
    if (!test1aPassed) throw new Error("1a Failed: Unauthorized Asatitha was allowed to submit correction request");

    // 1b. POST /api/attendance/correction-requests as Asatitha 1 for Student 1 (In assigned class) -> MUST SUCCEED (201)
    console.log(`\n--- 1b. POST /correction-requests by Asatitha 1 for Student 1 (In assigned class) ---`);
    const resCorrAssigned = await fetch(`${baseUrl}/attendance/correction-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenUsthad1}`,
      },
      body: JSON.stringify({
        attendanceRecordId: existingAttendance._id.toString(),
        studentId: profileStudent1._id.toString(),
        classId: classA._id.toString(),
        date: "2026-10-10",
        period: 3,
        currentStatus: "ABSENT",
        requestedStatus: "PRESENT",
        reason: "Biometric machine missed punch due to sensor timeout",
      }),
    });
    const bodyCorrAssigned = await resCorrAssigned.json();
    console.log(`HTTP Status: ${resCorrAssigned.status}`);
    console.log(`Response:`, JSON.stringify(bodyCorrAssigned, null, 2));

    if (bodyCorrAssigned.data && bodyCorrAssigned.data._id) {
      cleanupCorrectionIds.push(bodyCorrAssigned.data._id);
    }

    const test1bPassed =
      resCorrAssigned.status === 201 &&
      bodyCorrAssigned.success === true &&
      bodyCorrAssigned.data &&
      bodyCorrAssigned.data.status === "PENDING";
    console.log(`Result 1b: ${test1bPassed ? "PASSED (Assigned Asatitha created correction request)" : "FAILED"}`);
    if (!test1bPassed) throw new Error("1b Failed: Assigned Asatitha could not submit correction request");

    const correctionId = bodyCorrAssigned.data._id;

    // 1c. PATCH /api/attendance/correction-requests/:id/approve attempted by ASATITHA -> MUST REJECT (403)
    console.log(`\n--- 1c. PATCH /correction-requests/:id/approve attempted by ASATITHA ---`);
    const resApproveByUsthad = await fetch(`${baseUrl}/attendance/correction-requests/${correctionId}/approve`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenUsthad1}`,
      },
      body: JSON.stringify({ adminRemarks: "Usthad trying to self-approve" }),
    });
    const bodyApproveByUsthad = await resApproveByUsthad.json();
    console.log(`HTTP Status: ${resApproveByUsthad.status}`);
    console.log(`Response:`, JSON.stringify(bodyApproveByUsthad, null, 2));

    const test1cPassed = resApproveByUsthad.status === 403 && bodyApproveByUsthad.success === false;
    console.log(`Result 1c: ${test1cPassed ? "PASSED (Asatitha barred from approving correction request)" : "FAILED"}`);
    if (!test1cPassed) throw new Error("1c Failed: Asatitha was allowed to approve correction request");

    // 1d. PATCH /api/attendance/correction-requests/:id/approve attempted by STUDENT -> MUST REJECT (403)
    console.log(`\n--- 1d. PATCH /correction-requests/:id/approve attempted by STUDENT ---`);
    const resApproveByStudent = await fetch(`${baseUrl}/attendance/correction-requests/${correctionId}/approve`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenStudent1}`,
      },
      body: JSON.stringify({ adminRemarks: "Student trying to approve" }),
    });
    const bodyApproveByStudent = await resApproveByStudent.json();
    console.log(`HTTP Status: ${resApproveByStudent.status}`);
    console.log(`Response:`, JSON.stringify(bodyApproveByStudent, null, 2));

    const test1dPassed = resApproveByStudent.status === 403 && bodyApproveByStudent.success === false;
    console.log(`Result 1d: ${test1dPassed ? "PASSED (Student barred from approving correction request)" : "FAILED"}`);
    if (!test1dPassed) throw new Error("1d Failed: Student was allowed to approve correction request");

    // 1e. PATCH /api/attendance/correction-requests/:id/approve as ADMIN -> MUST SUCCEED (200) & UPDATE AttendanceRecord
    console.log(`\n--- 1e. PATCH /correction-requests/:id/approve as ADMIN ---`);
    const resApproveByAdmin = await fetch(`${baseUrl}/attendance/correction-requests/${correctionId}/approve`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenAdmin}`,
      },
      body: JSON.stringify({ adminRemarks: "Verified with classroom CCTV footage. Punch corrected." }),
    });
    const bodyApproveByAdmin = await resApproveByAdmin.json();
    console.log(`HTTP Status: ${resApproveByAdmin.status}`);
    console.log(`Response:`, JSON.stringify(bodyApproveByAdmin, null, 2));

    // Verify linked AttendanceRecord in database
    const updatedRecord = await AttendanceRecord.findOne({
      studentId: profileStudent1._id,
      date: attendanceDate,
      period: 3,
    }).lean();

    console.log(`Updated AttendanceRecord in DB:`, JSON.stringify(updatedRecord, null, 2));

    const test1ePassed =
      resApproveByAdmin.status === 200 &&
      bodyApproveByAdmin.success === true &&
      bodyApproveByAdmin.data?.request?.status === "APPROVED" &&
      updatedRecord &&
      updatedRecord.status === "PRESENT" &&
      updatedRecord.isCorrected === true &&
      updatedRecord.source === "MANUAL_CORRECTION" &&
      updatedRecord.correctionRequestId?.toString() === correctionId.toString();

    console.log(`Result 1e: ${test1ePassed ? "PASSED (Admin approved and AttendanceRecord atomically mutated to PRESENT with isCorrected=true)" : "FAILED"}`);
    if (!test1ePassed) throw new Error("1e Failed: AttendanceRecord was not properly mutated on Admin approval");

    // =========================================================================
    // GAP 2: LEAVE -> ATTENDANCE LINKAGE (LEAVE OVERRIDES ABSENCE)
    // =========================================================================
    console.log(`\n==================================================================`);
    console.log(`GAP 2 VERIFICATION: Leave -> Attendance Linkage`);
    console.log(`==================================================================`);

    // Pre-create an AttendanceRecord on 2026-11-05 Period 1 with status="ABSENT"
    const leaveStartDate = new Date("2026-11-05T00:00:00.000Z");
    const leaveEndDate = new Date("2026-11-06T00:00:00.000Z");

    const preLeaveRecord = await AttendanceRecord.create({
      studentId: profileStudent1._id,
      classId: classA._id,
      date: leaveStartDate,
      period: 1,
      sessionName: "Period 1",
      source: "SYSTEM_OVERRIDE",
      status: "ABSENT",
      isCorrected: false,
    });
    cleanupAttendanceIds.push(preLeaveRecord._id);

    console.log(`Pre-created punch/system record for 2026-11-05 Period 1: ID=${preLeaveRecord._id}, status=${preLeaveRecord.status}`);

    // Parent submits leave for 2026-11-05 to 2026-11-06 (2 days = 14 periods total)
    console.log(`\n--- 2a. Parent 1 submits leave application for 2026-11-05 to 2026-11-06 ---`);
    const resSubmitLeave = await fetch(`${baseUrl}/leaves`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenParent1}`,
      },
      body: JSON.stringify({
        studentId: profileStudent1._id.toString(),
        dateRange: { startDate: "2026-11-05", endDate: "2026-11-06" },
        reason: "Medical checkup at Kozhikode Medical College",
      }),
    });
    const bodySubmitLeave = await resSubmitLeave.json();
    console.log(`HTTP Status: ${resSubmitLeave.status}`);
    console.log(`Leave Response:`, JSON.stringify(bodySubmitLeave, null, 2));

    const testLeaveId = bodySubmitLeave.data?._id;
    if (testLeaveId) cleanupLeaveIds.push(testLeaveId);

    // Usthad 1 approves the leave
    console.log(`\n--- 2b. Usthad 1 approves leave ${testLeaveId} ---`);
    const resApproveLeave = await fetch(`${baseUrl}/leaves/${testLeaveId}/approve`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenUsthad1}`,
      },
      body: JSON.stringify({ reviewRemarks: "Medical leave approved. Please submit prescription copy." }),
    });
    const bodyApproveLeave = await resApproveLeave.json();
    console.log(`HTTP Status: ${resApproveLeave.status}`);
    console.log(`Approve Response:`, JSON.stringify(bodyApproveLeave, null, 2));

    // Query all AttendanceRecords for Student 1 on the leave date range
    const recordsOnLeaveDates = await AttendanceRecord.find({
      studentId: profileStudent1._id,
      date: { $gte: leaveStartDate, $lte: leaveEndDate },
    })
      .sort({ date: 1, period: 1 })
      .lean();

    console.log(`\n--- 2c. Querying AttendanceRecords for Student 1 across leave dates ---`);
    console.log(`Found ${recordsOnLeaveDates.length} session records across 2 dates (Expected 14: 2 days x 7 periods)`);

    // Verify all 14 records have status="LEAVE", source="MANUAL_CORRECTION", isCorrected=true
    const allLeave = recordsOnLeaveDates.every(
      (r) => r.status === "LEAVE" && r.source === "MANUAL_CORRECTION" && r.isCorrected === true
    );

    // Verify the pre-existing record on Period 1 was overridden from ABSENT to LEAVE
    const overriddenRecord = recordsOnLeaveDates.find(
      (r) => r.date.toISOString().split("T")[0] === "2026-11-05" && r.period === 1
    );

    console.log(`Sample overridden Period 1 record on 2026-11-05:`, JSON.stringify(overriddenRecord, null, 2));

    const test2Passed =
      resApproveLeave.status === 200 &&
      recordsOnLeaveDates.length === 14 &&
      allLeave === true &&
      overriddenRecord &&
      overriddenRecord.status === "LEAVE" &&
      overriddenRecord._id.toString() === preLeaveRecord._id.toString();

    console.log(`Verification:`);
    console.log(`  - Total records generated across 2 dates: ${recordsOnLeaveDates.length}/14`);
    console.log(`  - All records status is LEAVE:            ${allLeave}`);
    console.log(`  - Pre-existing ABSENT record overridden:   ${overriddenRecord?.status === "LEAVE"}`);
    console.log(`Result 2: ${test2Passed ? "PASSED (Approved leave atomically upserted all 14 session records and overrode pre-existing absence)" : "FAILED"}`);

    if (!test2Passed) throw new Error("Gap 2 Failed: Leave to attendance linkage failed");

    console.log("\n==================================================================");
    console.log("ALL PHASE 1 GAPS CLOSED AND VERIFIED SUCCESSFULLY!");
    console.log("==================================================================");
  } catch (error) {
    console.error("\nTEST FAILED WITH ERROR:", error);
    process.exitCode = 1;
  } finally {
    console.log("\n[4/5] Cleaning up test fixtures from database...");
    await Promise.all([
      User.deleteMany({ _id: { $in: cleanupUserIds } }),
      StudentProfile.deleteMany({ _id: { $in: cleanupProfileIds } }),
      ParentProfile.deleteMany({ _id: { $in: cleanupParentIds } }),
      FacultyProfile.deleteMany({ _id: { $in: cleanupFacultyIds } }),
      Class.deleteMany({ _id: { $in: cleanupClassIds } }),
      AcademicYear.deleteMany({ _id: { $in: cleanupYearIds } }),
      Leave.deleteMany({ _id: { $in: cleanupLeaveIds } }),
      AttendanceRecord.deleteMany({
        $or: [{ _id: { $in: cleanupAttendanceIds } }, { studentId: { $in: cleanupProfileIds } }],
      }),
      AttendanceCorrectionRequest.deleteMany({ _id: { $in: cleanupCorrectionIds } }),
    ]);
    console.log("[5/5] Cleanup complete. Server closed.");
    server.close();
    await mongoose.disconnect();
  }
}

runGapsVerification();
