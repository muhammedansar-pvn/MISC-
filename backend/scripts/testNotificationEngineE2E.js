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
const Exam = require("../src/modules/exams/exam.model");
const ExamRegistration = require("../src/modules/exams/exam-registration.model");
const Leave = require("../src/modules/leaves/leave.model");
const Notification = require("../src/modules/notifications/notification.model");
const notificationService = require("../src/modules/notifications/notification.service");
const { generateToken } = require("../src/shared/utils/jwt");

async function runE2ENotificationTests() {
  console.log("==================================================================");
  console.log("PHASE 3 END-TO-END VERIFICATION: IN-APP NOTIFICATION ENGINE");
  console.log("==================================================================\n");

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("FATAL: MONGODB_URI missing from environment");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("[1/3] Connected to MongoDB Atlas.");

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;
  console.log(`[2/3] Test HTTP server listening on port ${port}.`);

  const cleanupUserIds = [];
  const cleanupProfileIds = [];
  const cleanupParentIds = [];
  const cleanupFacultyIds = [];
  const cleanupClassIds = [];
  const cleanupYearIds = [];
  const cleanupSubjectIds = [];
  const cleanupExamIds = [];
  const cleanupRegistrationIds = [];
  const cleanupLeaveIds = [];
  const cleanupNotificationIds = [];

  let testPassedCount = 0;
  let testTotalCount = 0;

  function assert(condition, message) {
    testTotalCount++;
    if (condition) {
      console.log(`  PASS: [TC-${testTotalCount}] ${message}`);
      testPassedCount++;
    } else {
      console.error(`  FAIL: [TC-${testTotalCount}] ${message}`);
    }
  }

  try {
    const ts = Date.now();

    // -------------------------------------------------------------
    // SETUP TEST FIXTURES
    // -------------------------------------------------------------
    // 1. Admin
    const adminUser = await User.create({
      username: `admin_notif_${ts}`,
      name: "Notif Admin",
      email: `admin_notif_${ts}@markaz.edu`,
      passwordHash: "hash123",
      role: "ADMIN",
      status: "ACTIVE",
    });
    cleanupUserIds.push(adminUser._id);
    const adminToken = generateToken({
      userId: adminUser._id,
      id: adminUser._id,
      role: "ADMIN",
      email: adminUser.email,
    });

    // 2. Academic Year, Class & Subject
    const academicYear = await AcademicYear.create({
      yearName: `2026-2027 Notif ${ts}`,
      yearCode: `NAY${ts.toString().slice(-4)}`,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-05-31"),
      status: "ACTIVE",
    });
    cleanupYearIds.push(academicYear._id);

    const classDoc = await Class.create({
      name: `Notif Class ${ts}`,
      code: `NC${ts.toString().slice(-4)}`,
      academicYearId: academicYear._id,
      capacity: 40,
      status: "ACTIVE",
    });
    cleanupClassIds.push(classDoc._id);

    const subjectDoc = await Subject.create({
      subjectName: `Notif Subject ${ts}`,
      subjectCode: `NS${ts.toString().slice(-4)}`,
      academicYearId: academicYear._id,
      category: "GENERAL",
      status: "ACTIVE",
    });
    cleanupSubjectIds.push(subjectDoc._id);

    // 3. Faculty
    const facultyUser = await User.create({
      username: `faculty_notif_${ts}`,
      name: "Faculty Reviewer",
      email: `faculty_notif_${ts}@markaz.edu`,
      passwordHash: "hash123",
      role: "FACULTY",
      status: "ACTIVE",
    });
    cleanupUserIds.push(facultyUser._id);

    const facultyProfile = await FacultyProfile.create({
      userId: facultyUser._id,
      facultyId: `FAC-N-${ts.toString().slice(-4)}`,
      nameEnglish: "Faculty Reviewer",
      mobile: "9876543201",
      assignedClasses: [classDoc._id],
      status: "ACTIVE",
    });
    cleanupFacultyIds.push(facultyProfile._id);
    const facultyToken = generateToken({
      userId: facultyUser._id,
      id: facultyUser._id,
      role: "FACULTY",
      email: facultyUser.email,
    });

    // 4. Student 1 & Parent 1
    const student1User = await User.create({
      username: `student1_notif_${ts}`,
      name: "Student Alpha",
      email: `student1_notif_${ts}@markaz.edu`,
      passwordHash: "hash123",
      role: "STUDENT",
      status: "ACTIVE",
    });
    cleanupUserIds.push(student1User._id);

    const student1Profile = await StudentProfile.create({
      userId: student1User._id,
      nameEnglish: "Student Alpha",
      registrationNumber: `REG-A-${ts.toString().slice(-4)}`,
      admissionNumber: `ADM-A-${ts.toString().slice(-4)}`,
      fatherName: "Father Alpha",
      motherName: "Mother Alpha",
      admissionYear: 2026,
      dateOfBirth: new Date("2008-01-01"),
      classId: classDoc._id,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    cleanupProfileIds.push(student1Profile._id);
    const student1Token = generateToken({
      userId: student1User._id,
      id: student1User._id,
      studentId: student1Profile._id,
      role: "STUDENT",
      email: student1User.email,
    });

    const parent1User = await User.create({
      username: `parent1_notif_${ts}`,
      name: "Parent Alpha",
      email: `parent1_notif_${ts}@markaz.edu`,
      passwordHash: "hash123",
      role: "PARENT",
      status: "ACTIVE",
    });
    cleanupUserIds.push(parent1User._id);

    const parent1Profile = await ParentProfile.create({
      userId: parent1User._id,
      name: "Parent Alpha",
      mobile: "9876543202",
      studentIds: [student1Profile._id],
      status: "ACTIVE",
    });
    cleanupParentIds.push(parent1Profile._id);
    const parent1Token = generateToken({
      userId: parent1User._id,
      id: parent1User._id,
      role: "PARENT",
      email: parent1User.email,
    });

    // 5. Student 2 (for multi-user isolation checks)
    const student2User = await User.create({
      username: `student2_notif_${ts}`,
      name: "Student Beta",
      email: `student2_notif_${ts}@markaz.edu`,
      passwordHash: "hash123",
      role: "STUDENT",
      status: "ACTIVE",
    });
    cleanupUserIds.push(student2User._id);

    const student2Profile = await StudentProfile.create({
      userId: student2User._id,
      nameEnglish: "Student Beta",
      registrationNumber: `REG-B-${ts.toString().slice(-4)}`,
      admissionNumber: `ADM-B-${ts.toString().slice(-4)}`,
      fatherName: "Father Beta",
      motherName: "Mother Beta",
      admissionYear: 2026,
      dateOfBirth: new Date("2008-02-02"),
      classId: classDoc._id,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    cleanupProfileIds.push(student2Profile._id);
    const student2Token = generateToken({
      userId: student2User._id,
      id: student2User._id,
      studentId: student2Profile._id,
      role: "STUDENT",
      email: student2User.email,
    });

    console.log("[3/3] Fixtures created. Running verification suites...\n");

    // =========================================================================
    // SUITE 1: MODEL & DEDUPLICATION INTEGRITY
    // =========================================================================
    console.log("--- SUITE 1: Model & Deduplication Integrity ---");

    // TC-1: Schema validation accepts valid fields
    const notif1 = await notificationService.createNotification({
      userId: student1User._id,
      title: "Test Alert",
      message: "This is a test notification message.",
      type: "SYSTEM_ALERT",
      link: "/student/dashboard",
      metadata: { dedupKey: `DEDUP_TEST_${ts}` },
    });
    cleanupNotificationIds.push(notif1._id);
    assert(notif1 && notif1.isRead === false && notif1.type === "SYSTEM_ALERT", "Notification model persists valid document with default isRead=false");

    // TC-2: Notification model rejects invalid type
    let invalidTypeFailed = false;
    try {
      await Notification.create({
        userId: student1User._id,
        title: "Bad Type",
        message: "Should fail enum validation",
        type: "INVALID_RANDOM_TYPE",
      });
    } catch {
      invalidTypeFailed = true;
    }
    assert(invalidTypeFailed, "Notification model rejects unknown enum type");

    // TC-3: Deduplication via dedupKey prevents duplicate notification
    const notifDup = await notificationService.createNotification({
      userId: student1User._id,
      title: "Duplicate Alert",
      message: "Should not create a new record due to dedupKey",
      type: "SYSTEM_ALERT",
      metadata: { dedupKey: `DEDUP_TEST_${ts}` },
    });
    assert(notifDup._id.toString() === notif1._id.toString(), "Deduplication via dedupKey safely returns existing document without duplicate insert");

    // =========================================================================
    // SUITE 2: NOTIFICATION REST API ENDPOINTS
    // =========================================================================
    console.log("\n--- SUITE 2: REST API Endpoints & RBAC Scoping ---");

    // TC-4: GET /api/notifications requires authentication
    const unauthRes = await fetch(`${baseUrl}/notifications`);
    assert(unauthRes.status === 401, "GET /api/notifications rejects unauthenticated request (401)");

    // TC-5: GET /api/notifications returns user's notifications with pagination
    const student1ListRes = await fetch(`${baseUrl}/notifications`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const student1ListData = await student1ListRes.json();
    assert(
      student1ListRes.status === 200 &&
      Array.isArray(student1ListData.data.notifications) &&
      student1ListData.data.notifications.length >= 1 &&
      student1ListData.data.unreadCount >= 1,
      "GET /api/notifications returns paginated list and unreadCount"
    );

    // TC-6: Strict User Scoping: Student 2 cannot see Student 1's notifications
    const student2ListRes = await fetch(`${baseUrl}/notifications`, {
      headers: { Authorization: `Bearer ${student2Token}` },
    });
    const student2ListData = await student2ListRes.json();
    assert(
      student2ListRes.status === 200 &&
      student2ListData.data.notifications.length === 0,
      "Strict User Scoping: User cannot see other users' notifications"
    );

    // TC-7: Query filters: isRead filtering
    const filterReadRes = await fetch(`${baseUrl}/notifications?isRead=false`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const filterReadData = await filterReadRes.json();
    assert(
      filterReadRes.status === 200 &&
      filterReadData.data.notifications.every((n) => n.isRead === false),
      "Filtering by isRead=false returns only unread items"
    );

    // TC-8: Query filters: type filtering
    const filterTypeRes = await fetch(`${baseUrl}/notifications?type=SYSTEM_ALERT`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const filterTypeData = await filterTypeRes.json();
    assert(
      filterTypeRes.status === 200 &&
      filterTypeData.data.notifications.every((n) => n.type === "SYSTEM_ALERT"),
      "Filtering by type returns only matching notification types"
    );

    // TC-9: GET /api/notifications/unread-count returns accurate unread count
    const unreadCountRes = await fetch(`${baseUrl}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const unreadCountData = await unreadCountRes.json();
    assert(
      unreadCountRes.status === 200 &&
      unreadCountData.data.unreadCount === student1ListData.data.unreadCount,
      "GET /api/notifications/unread-count returns accurate unread counter"
    );

    // TC-10: PATCH /api/notifications/:id/read marks single notification as read
    const markReadRes = await fetch(`${baseUrl}/notifications/${notif1._id}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const markReadData = await markReadRes.json();
    assert(
      markReadRes.status === 200 &&
      markReadData.data.isRead === true &&
      Boolean(markReadData.data.readAt),
      "PATCH /api/notifications/:id/read sets isRead=true and records readAt timestamp"
    );

    // TC-11: IDOR Protection: Student 2 cannot mark Student 1's notification as read
    const idorRes = await fetch(`${baseUrl}/notifications/${notif1._id}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${student2Token}` },
    });
    assert(
      idorRes.status === 403 || idorRes.status === 404,
      `IDOR Protection: User cannot mutate other user's notification (status: ${idorRes.status})`
    );

    // TC-12: PATCH /api/notifications/read-all marks all unread notifications
    // Create another unread notification first
    const extraNotif = await notificationService.createNotification({
      userId: student1User._id,
      title: "Another Alert",
      message: "Unread message",
      type: "SYSTEM_ALERT",
    });
    cleanupNotificationIds.push(extraNotif._id);

    const markAllRes = await fetch(`${baseUrl}/notifications/read-all`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const markAllData = await markAllRes.json();
    const countAfterAll = await notificationService.getUnreadCount(student1User._id);
    assert(
      markAllRes.status === 200 && countAfterAll.unreadCount === 0,
      "PATCH /api/notifications/read-all sets all user notifications to read"
    );

    // =========================================================================
    // SUITE 3: DOMAIN EVENT HOOKS VERIFICATION
    // =========================================================================
    console.log("\n--- SUITE 3: Domain Event Hooks Verification ---");

    // TC-13 & TC-14: EXAM_PUBLISHED Hook
    const examDoc = await Exam.create({
      title: `Term Exam Notif ${ts}`,
      code: `EX-N-${ts.toString().slice(-4)}`,
      academicYearId: academicYear._id,
      examType: "TERMINAL",
      eligibleClassIds: [classDoc._id],
      status: "PUBLISHED",
      registrationStartDate: new Date(Date.now() - 24 * 3600000),
      registrationEndDate: new Date(Date.now() + 5 * 24 * 3600000),
      startDate: new Date(Date.now() + 7 * 24 * 3600000),
      endDate: new Date(Date.now() + 14 * 24 * 3600000),
      examFee: 150,
      registrationFee: 50,
      createdBy: adminUser._id,
    });
    cleanupExamIds.push(examDoc._id);

    // Trigger exam published hook
    await notificationService.notifyExamPublished(examDoc);

    const studentExamNotif = await Notification.findOne({
      userId: student1User._id,
      type: "EXAM_PUBLISHED",
      "metadata.examId": examDoc._id,
    });
    if (studentExamNotif) cleanupNotificationIds.push(studentExamNotif._id);
    assert(Boolean(studentExamNotif), "Hook EXAM_PUBLISHED creates notification for eligible student");

    const parentExamNotif = await Notification.findOne({
      userId: parent1User._id,
      type: "EXAM_PUBLISHED",
      "metadata.examId": examDoc._id,
    });
    if (parentExamNotif) cleanupNotificationIds.push(parentExamNotif._id);
    assert(Boolean(parentExamNotif), "Hook EXAM_PUBLISHED creates notification for linked parent");

    // TC-15 & TC-16: EXAM_REGISTRATION Hook
    const examReg = await ExamRegistration.create({
      examId: examDoc._id,
      studentId: student1Profile._id,
      classId: classDoc._id,
      academicYearId: academicYear._id,
      status: "APPROVED",
      paymentStatus: "PAID",
      rollNumber: `ROL-${ts.toString().slice(-4)}`,
    });
    cleanupRegistrationIds.push(examReg._id);

    await notificationService.notifyExamRegistration(examReg, examDoc);

    const studentRegNotif = await Notification.findOne({
      userId: student1User._id,
      type: "EXAM_REGISTRATION",
      "metadata.registrationId": examReg._id,
    });
    if (studentRegNotif) cleanupNotificationIds.push(studentRegNotif._id);
    assert(Boolean(studentRegNotif), "Hook EXAM_REGISTRATION creates confirmation notification for student");

    const parentRegNotif = await Notification.findOne({
      userId: parent1User._id,
      type: "EXAM_REGISTRATION",
      "metadata.registrationId": examReg._id,
    });
    if (parentRegNotif) cleanupNotificationIds.push(parentRegNotif._id);
    assert(Boolean(parentRegNotif), "Hook EXAM_REGISTRATION creates confirmation notification for linked parent");

    // TC-17: PAYMENT_SUCCESS Hook
    await notificationService.notifyPaymentSuccess({
      registrationId: examReg._id,
      studentId: student1Profile._id,
      examId: examDoc._id,
      amount: 200,
      paymentId: `pay_${ts}`,
    });

    const studentPayNotif = await Notification.findOne({
      userId: student1User._id,
      type: "PAYMENT_SUCCESS",
      "metadata.paymentId": `pay_${ts}`,
    });
    if (studentPayNotif) cleanupNotificationIds.push(studentPayNotif._id);
    assert(Boolean(studentPayNotif), "Hook PAYMENT_SUCCESS notifies student with payment receipt details");

    // TC-18: HALL_TICKET Hook
    await notificationService.notifyHallTicketIssued(examReg, examDoc);
    const studentTicketNotif = await Notification.findOne({
      userId: student1User._id,
      type: "HALL_TICKET",
      "metadata.registrationId": examReg._id,
    });
    if (studentTicketNotif) cleanupNotificationIds.push(studentTicketNotif._id);
    assert(Boolean(studentTicketNotif), "Hook HALL_TICKET creates download availability notification for student");

    // TC-19: LEAVE_SUBMITTED Hook
    const leaveDoc = await Leave.create({
      studentId: student1Profile._id,
      appliedBy: student1User._id,
      applicantRole: "STUDENT",
      leaveType: "MEDICAL",
      dateRange: {
        startDate: new Date("2026-11-10"),
        endDate: new Date("2026-11-12"),
      },
      reason: "Medical consultation and treatment",
      status: "PENDING",
    });
    cleanupLeaveIds.push(leaveDoc._id);

    await notificationService.notifyLeaveSubmitted(leaveDoc, student1Profile);

    const facultyLeaveNotif = await Notification.findOne({
      userId: facultyUser._id,
      type: "LEAVE_SUBMITTED",
      "metadata.leaveId": leaveDoc._id,
    });
    if (facultyLeaveNotif) cleanupNotificationIds.push(facultyLeaveNotif._id);
    assert(Boolean(facultyLeaveNotif), "Hook LEAVE_SUBMITTED notifies assigned class faculty reviewer");

    // TC-20: LEAVE_APPROVED Hook
    leaveDoc.status = "APPROVED";
    leaveDoc.approvedBy = facultyProfile._id;
    await leaveDoc.save();

    await notificationService.notifyLeaveApproved(leaveDoc, student1Profile);
    const studentLeaveAppNotif = await Notification.findOne({
      userId: student1User._id,
      type: "LEAVE_APPROVED",
      "metadata.leaveId": leaveDoc._id,
    });
    if (studentLeaveAppNotif) cleanupNotificationIds.push(studentLeaveAppNotif._id);
    assert(Boolean(studentLeaveAppNotif), "Hook LEAVE_APPROVED notifies student");

    // TC-21: LEAVE_REJECTED Hook
    const rejectedLeave = await Leave.create({
      studentId: student1Profile._id,
      appliedBy: student1User._id,
      applicantRole: "STUDENT",
      leaveType: "CASUAL",
      dateRange: {
        startDate: new Date("2026-11-20"),
        endDate: new Date("2026-11-21"),
      },
      reason: "Personal event",
      status: "REJECTED",
      reviewRemarks: "Exam preparatory period",
    });
    cleanupLeaveIds.push(rejectedLeave._id);

    await notificationService.notifyLeaveRejected(rejectedLeave, student1Profile);
    const parentLeaveRejNotif = await Notification.findOne({
      userId: parent1User._id,
      type: "LEAVE_REJECTED",
      "metadata.leaveId": rejectedLeave._id,
    });
    if (parentLeaveRejNotif) cleanupNotificationIds.push(parentLeaveRejNotif._id);
    assert(Boolean(parentLeaveRejNotif), "Hook LEAVE_REJECTED notifies parent with remarks");

    // TC-22: RESULT_PUBLISHED Hook
    await notificationService.notifyResultPublished(examDoc, classDoc._id);
    const studentResultNotif = await Notification.findOne({
      userId: student1User._id,
      type: "RESULT_PUBLISHED",
      "metadata.examId": examDoc._id,
    });
    if (studentResultNotif) cleanupNotificationIds.push(studentResultNotif._id);
    assert(Boolean(studentResultNotif), "Hook RESULT_PUBLISHED creates scorecard availability alert for student");

    // TC-23: ATTENDANCE_WARNING Hook (<75%)
    await notificationService.notifyAttendanceWarning(student1Profile._id, 68.5, new Date());
    const studentAttWarnNotif = await Notification.findOne({
      userId: student1User._id,
      type: "ATTENDANCE_WARNING",
      "metadata.studentId": student1Profile._id,
    });
    if (studentAttWarnNotif) cleanupNotificationIds.push(studentAttWarnNotif._id);
    assert(Boolean(studentAttWarnNotif), "Hook ATTENDANCE_WARNING alerts student when attendance drops below 75%");

    // TC-24: Deduplication Safety on Domain Events
    await notificationService.notifyAttendanceWarning(student1Profile._id, 68.5, new Date());
    const countAttWarnings = await Notification.countDocuments({
      userId: student1User._id,
      type: "ATTENDANCE_WARNING",
      "metadata.studentId": student1Profile._id,
    });
    assert(countAttWarnings === 1, "Deduplication safety: Repeated domain event triggers do not generate duplicate notifications");

  } catch (err) {
    console.error("UNEXPECTED ERROR IN TEST RUN:", err);
  } finally {
    console.log("\n--- Cleaning up test fixtures ---");
    try {
      if (cleanupNotificationIds.length > 0) {
        await Notification.deleteMany({ _id: { $in: cleanupNotificationIds } });
      }
      if (cleanupLeaveIds.length > 0) {
        await Leave.deleteMany({ _id: { $in: cleanupLeaveIds } });
      }
      if (cleanupRegistrationIds.length > 0) {
        await ExamRegistration.deleteMany({ _id: { $in: cleanupRegistrationIds } });
      }
      if (cleanupExamIds.length > 0) {
        await Exam.deleteMany({ _id: { $in: cleanupExamIds } });
      }
      if (cleanupSubjectIds.length > 0) {
        await Subject.deleteMany({ _id: { $in: cleanupSubjectIds } });
      }
      if (cleanupClassIds.length > 0) {
        await Class.deleteMany({ _id: { $in: cleanupClassIds } });
      }
      if (cleanupYearIds.length > 0) {
        await AcademicYear.deleteMany({ _id: { $in: cleanupYearIds } });
      }
      if (cleanupFacultyIds.length > 0) {
        await FacultyProfile.deleteMany({ _id: { $in: cleanupFacultyIds } });
      }
      if (cleanupParentIds.length > 0) {
        await ParentProfile.deleteMany({ _id: { $in: cleanupParentIds } });
      }
      if (cleanupProfileIds.length > 0) {
        await StudentProfile.deleteMany({ _id: { $in: cleanupProfileIds } });
      }
      if (cleanupUserIds.length > 0) {
        await User.deleteMany({ _id: { $in: cleanupUserIds } });
      }
      console.log("Cleanup completed successfully.");
    } catch (cleanupErr) {
      console.error("Cleanup error:", cleanupErr.message);
    }

    server.close();
    await mongoose.disconnect();

    console.log("\n==================================================================");
    console.log(`FINAL RESULT: ${testPassedCount} / ${testTotalCount} TESTS PASSED`);
    console.log("==================================================================");

    if (testPassedCount !== testTotalCount || testTotalCount === 0) {
      process.exit(1);
    }
  }
}

runE2ENotificationTests();
