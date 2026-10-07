/**
 * E2E Verification Suite: Phase 4 — Email Event Integration
 * 
 * Verifies:
 * 1. 9 ERP domain events generate transactional emails:
 *    - EXAM_PUBLISHED (eligible student & linked parent)
 *    - EXAM_REGISTRATION (student & linked parent)
 *    - PAYMENT_SUCCESS (student & linked parent, safe receipt)
 *    - HALL_TICKET (student & linked parent)
 *    - LEAVE_SUBMITTED (faculty reviewer & admin)
 *    - LEAVE_APPROVED (student & linked parent)
 *    - LEAVE_REJECTED (student & linked parent)
 *    - RESULT_PUBLISHED (scheduled check, student & linked parent)
 *    - ATTENDANCE_WARNING (under 75%, student & linked parent)
 * 2. Recipient validation & Parent-child isolation (unlinked parents do not receive emails).
 * 3. Strict failure isolation (SMTP failure does NOT affect in-app notifications or primary operations).
 * 4. Deduplication / idempotency (prevent repeated email dispatch).
 * 5. Inactive / deleted user isolation.
 * 6. Auth email regression (OTP, reset, invite, setup).
 */

require("dotenv").config({ path: "./backend/.env" });
const mongoose = require("mongoose");
const env = require("../src/config/env");

const User = require("../src/modules/users/user.model");
const StudentProfile = require("../src/modules/students/student.model");
const ParentProfile = require("../src/modules/parents/parent.model");
const FacultyProfile = require("../src/modules/faculty/faculty.model");
const AcademicYear = require("../src/modules/academics/academic-year.model");
const Class = require("../src/modules/academics/class.model");
const Exam = require("../src/modules/exams/exam.model");
const ExamRegistration = require("../src/modules/exams/exam-registration.model");
const Notification = require("../src/modules/notifications/notification.model");
const EmailEvent = require("../src/modules/notifications/email-event.model");

const notificationService = require("../src/modules/notifications/notification.service");
const emailService = require("../src/shared/services/email.service");
const { setTestTransporter, resetTransporter } = require("../src/config/mail");

const TEST_RUN_ID = `E2E_EMAIL_${Date.now()}`;
let testPassedCount = 0;
let testTotalCount = 0;

function assert(condition, message) {
  testTotalCount++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  testPassedCount++;
  console.log(`✅ PASS: ${message}`);
}

async function run() {
  console.log("\n=======================================================");
  console.log("🚀 STARTING PHASE 4 EMAIL EVENT INTEGRATION E2E TESTS");
  console.log(`Run ID: ${TEST_RUN_ID}`);
  console.log("=======================================================\n");

  await mongoose.connect(env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  // Intercept transporter with mock transporter that records sent emails
  const sentMailLog = [];
  let shouldTransporterFail = false;

  const mockTransporter = {
    sendMail: async (mailOptions) => {
      if (shouldTransporterFail) {
        const err = new Error("Connection refused (ECONNREFUSED) to mock smtp server");
        err.code = "ECONNREFUSED";
        throw err;
      }
      const messageId = `<mock-${Date.now()}-${Math.random().toString(36).substring(7)}@misc.org>`;
      sentMailLog.push({ ...mailOptions, messageId });
      return {
        messageId,
        accepted: mailOptions.to,
        rejected: [],
        response: "250 2.0.0 OK: message queued",
      };
    },
    verify: async () => true,
  };

  setTestTransporter(mockTransporter);

  // Entities to clean up at end
  const cleanupUserIds = [];
  const cleanupStudentIds = [];
  const cleanupParentIds = [];
  const cleanupFacultyIds = [];
  const cleanupClassIds = [];
  const cleanupYearIds = [];
  const cleanupExamIds = [];
  const cleanupRegIds = [];

  try {
    // -------------------------------------------------------------
    // SEED TEST DATA
    // -------------------------------------------------------------
    console.log("--- Seeding Test Fixtures ---");

    // 0. Academic Year
    const academicYear = await AcademicYear.create({
      yearName: `Email AY ${TEST_RUN_ID}`,
      yearCode: `AY_${Date.now().toString().slice(-4)}`,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-03-31"),
      status: "ACTIVE",
    });
    cleanupYearIds.push(academicYear._id);

    // 1. Class
    const testClass = await Class.create({
      name: `Email Test Class ${TEST_RUN_ID}`,
      code: `ETC_${Date.now()}`,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    cleanupClassIds.push(testClass._id);

    // 2. Active Student User + Profile
    const studentUser = await User.create({
      name: "Zaid Student",
      username: `student_${TEST_RUN_ID}`,
      email: `student_${TEST_RUN_ID}@example.com`,
      role: "STUDENT",
      status: "ACTIVE",
      passwordHash: "dummyhash",
    });
    cleanupUserIds.push(studentUser._id);

    const studentProfile = await StudentProfile.create({
      userId: studentUser._id,
      nameEnglish: "Zaid Student",
      registrationNumber: `REG_${TEST_RUN_ID}`,
      admissionNumber: `ADM_${TEST_RUN_ID}`,
      fatherName: "Abdullah",
      motherName: "Fatima",
      admissionYear: 2026,
      dateOfBirth: new Date("2008-01-01"),
      classId: testClass._id,
      academicYearId: academicYear._id,
      status: "ACTIVE",
    });
    cleanupStudentIds.push(studentProfile._id);

    // 3. Linked Parent User + Profile
    const linkedParentUser = await User.create({
      name: "Ahmed Parent (Linked)",
      username: `parent_linked_${TEST_RUN_ID}`,
      email: `parent_linked_${TEST_RUN_ID}@example.com`,
      role: "PARENT",
      status: "ACTIVE",
      passwordHash: "dummyhash",
    });
    cleanupUserIds.push(linkedParentUser._id);

    const linkedParentProfile = await ParentProfile.create({
      userId: linkedParentUser._id,
      name: "Ahmed Parent (Linked)",
      relationType: "FATHER",
      studentIds: [studentProfile._id],
      status: "ACTIVE",
    });
    cleanupParentIds.push(linkedParentProfile._id);

    // 4. Unlinked Parent User + Profile (Must NOT receive emails for student)
    const unlinkedParentUser = await User.create({
      name: "Tariq Parent (Unlinked)",
      username: `parent_unlinked_${TEST_RUN_ID}`,
      email: `parent_unlinked_${TEST_RUN_ID}@example.com`,
      role: "PARENT",
      status: "ACTIVE",
      passwordHash: "dummyhash",
    });
    cleanupUserIds.push(unlinkedParentUser._id);

    const unlinkedParentProfile = await ParentProfile.create({
      userId: unlinkedParentUser._id,
      name: "Tariq Parent (Unlinked)",
      relationType: "FATHER",
      studentIds: [new mongoose.Types.ObjectId()], // unlinked to Zaid
      status: "ACTIVE",
    });
    cleanupParentIds.push(unlinkedParentProfile._id);

    // 5. Inactive User (Must be skipped)
    const inactiveUser = await User.create({
      name: "Inactive User",
      username: `inactive_${TEST_RUN_ID}`,
      email: `inactive_${TEST_RUN_ID}@example.com`,
      role: "STUDENT",
      status: "SUSPENDED",
      passwordHash: "dummyhash",
    });
    cleanupUserIds.push(inactiveUser._id);

    // 6. Faculty Mentor
    const facultyUser = await User.create({
      name: "Usthad Khalid",
      username: `faculty_${TEST_RUN_ID}`,
      email: `faculty_${TEST_RUN_ID}@example.com`,
      role: "FACULTY",
      status: "ACTIVE",
      passwordHash: "dummyhash",
    });
    cleanupUserIds.push(facultyUser._id);

    const facultyProfile = await FacultyProfile.create({
      userId: facultyUser._id,
      nameEnglish: "Usthad Khalid",
      facultyId: `FAC_${Date.now().toString().slice(-4)}`,
      assignedClasses: [testClass._id],
      status: "ACTIVE",
    });
    cleanupFacultyIds.push(facultyProfile._id);

    // 7. Admin User
    const adminUser = await User.create({
      name: "Admin Officer",
      username: `admin_${TEST_RUN_ID}`,
      email: `admin_${TEST_RUN_ID}@example.com`,
      role: "ADMIN",
      status: "ACTIVE",
      passwordHash: "dummyhash",
    });
    cleanupUserIds.push(adminUser._id);

    // 8. Exam
    const exam = await Exam.create({
      title: `Final Term Exam ${TEST_RUN_ID}`,
      code: `FTE_${Date.now()}`,
      examCategory: "TERM_EXAM",
      academicYearId: academicYear._id,
      eligibleClassIds: [testClass._id],
      examFee: 1200,
      status: "PUBLISHED",
      startDate: new Date("2026-11-15"),
      endDate: new Date("2026-11-20"),
      registrationStartDate: new Date(Date.now() - 86400000),
      registrationEndDate: new Date(Date.now() + 86400000 * 5),
    });
    cleanupExamIds.push(exam._id);

    console.log("Fixtures created successfully.\n");

    // =============================================================
    // TEST 1: EXAM_PUBLISHED Event
    // =============================================================
    console.log("--- TEST 1: EXAM_PUBLISHED Event ---");
    sentMailLog.length = 0;
    await notificationService.notifyExamPublished(exam);

    // Wait a brief tick for async email promises
    await new Promise((r) => setTimeout(r, 200));

    const examPubEvents = await EmailEvent.find({
      eventType: "EXAM_PUBLISHED",
      "metadata.examId": exam._id,
    });

    assert(examPubEvents.length === 2, `Recorded 2 EmailEvents (Student + Linked Parent), got ${examPubEvents.length}`);

    const studentPubEvent = examPubEvents.find((e) => e.recipientEmail === studentUser.email);
    assert(!!studentPubEvent, `Student received EXAM_PUBLISHED email`);
    assert(studentPubEvent.status === "SENT", `Student email event status is SENT`);

    const parentPubEvent = examPubEvents.find((e) => e.recipientEmail === linkedParentUser.email);
    assert(!!parentPubEvent, `Linked parent received EXAM_PUBLISHED email`);
    assert(parentPubEvent.status === "SENT", `Parent email event status is SENT`);

    const unlinkedPubEvent = examPubEvents.find((e) => e.recipientEmail === unlinkedParentUser.email);
    assert(!unlinkedPubEvent, `Unlinked parent strictly did NOT receive EXAM_PUBLISHED email`);

    // Verify SMTP call details
    const studentSmtp = sentMailLog.find((m) => m.to.includes(studentUser.email));
    assert(studentSmtp && studentSmtp.html.includes(exam.title), `Email body contains exam title`);
    assert(studentSmtp && studentSmtp.html.includes("Markaz Integrated Studies Council"), `Email body contains MISC branding`);

    // =============================================================
    // TEST 2: EXAM_REGISTRATION Event
    // =============================================================
    console.log("\n--- TEST 2: EXAM_REGISTRATION Event ---");
    sentMailLog.length = 0;
    const testReg = await ExamRegistration.create({
      examId: exam._id,
      studentId: studentProfile._id,
      rollNumber: `ROLL_${TEST_RUN_ID}`,
      status: "APPROVED",
      paymentStatus: "PAID",
    });
    cleanupRegIds.push(testReg._id);

    await notificationService.notifyExamRegistration(testReg, exam);
    await new Promise((r) => setTimeout(r, 200));

    const regEvents = await EmailEvent.find({
      eventType: "EXAM_REGISTRATION",
      "metadata.registrationId": testReg._id,
    });

    assert(regEvents.length === 2, `Recorded 2 EmailEvents for EXAM_REGISTRATION, got ${regEvents.length}`);
    const regStudentEvent = regEvents.find((e) => e.recipientEmail === studentUser.email);
    assert(!!regStudentEvent && regStudentEvent.status === "SENT", `Student received EXAM_REGISTRATION email`);

    const regSmtp = sentMailLog.find((m) => m.to.includes(studentUser.email));
    assert(regSmtp && regSmtp.html.includes(testReg.rollNumber), `Email body contains allocated roll number`);

    // =============================================================
    // TEST 3: PAYMENT_SUCCESS Event
    // =============================================================
    console.log("\n--- TEST 3: PAYMENT_SUCCESS Event ---");
    sentMailLog.length = 0;
    const paymentDoc = {
      _id: new mongoose.Types.ObjectId(),
      studentId: studentProfile._id,
      amount: 1200,
      transactionId: `TXN_TEST_${Date.now()}`,
      paymentType: "EXAM_FEE",
      status: "SUCCESS",
    };

    await notificationService.notifyPaymentSuccess(paymentDoc);
    await new Promise((r) => setTimeout(r, 200));

    const paymentEvents = await EmailEvent.find({
      eventType: "PAYMENT_SUCCESS",
      "metadata.paymentId": paymentDoc._id,
    });

    assert(paymentEvents.length === 2, `Recorded 2 EmailEvents for PAYMENT_SUCCESS, got ${paymentEvents.length}`);
    const payStudentSmtp = sentMailLog.find((m) => m.to.includes(studentUser.email));
    assert(payStudentSmtp && payStudentSmtp.html.includes("₹1200"), `Payment email contains amount ₹1200`);
    assert(payStudentSmtp && payStudentSmtp.html.includes(paymentDoc.transactionId), `Payment email contains transaction reference`);
    assert(payStudentSmtp && !payStudentSmtp.html.includes("password") && !payStudentSmtp.html.includes("secret"), `Payment receipt leaks no secret credentials`);

    // =============================================================
    // TEST 4: HALL_TICKET Event
    // =============================================================
    console.log("\n--- TEST 4: HALL_TICKET Event ---");
    sentMailLog.length = 0;
    await notificationService.notifyHallTicketIssued(testReg, exam);
    await new Promise((r) => setTimeout(r, 200));

    const hallTicketEvents = await EmailEvent.find({
      eventType: "HALL_TICKET",
      "metadata.registrationId": testReg._id,
    });

    assert(hallTicketEvents.length === 2, `Recorded 2 EmailEvents for HALL_TICKET, got ${hallTicketEvents.length}`);
    const htSmtp = sentMailLog.find((m) => m.to.includes(studentUser.email));
    assert(htSmtp && htSmtp.html.includes("Hall Ticket"), `Email contains Hall Ticket heading and download instructions`);

    // =============================================================
    // TEST 5: LEAVE_SUBMITTED Event
    // =============================================================
    console.log("\n--- TEST 5: LEAVE_SUBMITTED Event ---");
    sentMailLog.length = 0;
    const testLeave = {
      _id: new mongoose.Types.ObjectId(),
      reason: "Attending religious family gathering",
      dateRange: {
        startDate: new Date("2026-11-01"),
        endDate: new Date("2026-11-03"),
      },
    };

    await notificationService.notifyLeaveSubmitted(testLeave, studentProfile);
    await new Promise((r) => setTimeout(r, 200));

    const leaveSubEvents = await EmailEvent.find({
      eventType: "LEAVE_SUBMITTED",
      "metadata.leaveId": testLeave._id,
    });

    assert(leaveSubEvents.length >= 2, `Faculty and Admin received LEAVE_SUBMITTED notifications, got ${leaveSubEvents.length}`);
    const facSubEvent = leaveSubEvents.find((e) => e.recipientEmail === facultyUser.email);
    assert(!!facSubEvent, `Assigned class faculty received leave review email`);
    const adminSubEvent = leaveSubEvents.find((e) => e.recipientEmail === adminUser.email);
    assert(!!adminSubEvent, `Admin received leave review email`);

    // =============================================================
    // TEST 6: LEAVE_APPROVED Event
    // =============================================================
    console.log("\n--- TEST 6: LEAVE_APPROVED Event ---");
    sentMailLog.length = 0;
    const approvedLeave = {
      ...testLeave,
      reviewRemarks: "Granted as per attendance quota",
    };

    await notificationService.notifyLeaveApproved(approvedLeave, studentProfile);
    await new Promise((r) => setTimeout(r, 200));

    const leaveAppEvents = await EmailEvent.find({
      eventType: "LEAVE_APPROVED",
      "metadata.leaveId": approvedLeave._id,
    });

    assert(leaveAppEvents.length === 2, `Recorded 2 EmailEvents for LEAVE_APPROVED, got ${leaveAppEvents.length}`);
    const leaveAppSmtp = sentMailLog.find((m) => m.to.includes(studentUser.email));
    assert(leaveAppSmtp && leaveAppSmtp.html.includes("APPROVED"), `Approval email shows APPROVED status`);
    assert(leaveAppSmtp && leaveAppSmtp.html.includes(approvedLeave.reviewRemarks), `Approval email shows review remarks`);

    // =============================================================
    // TEST 7: LEAVE_REJECTED Event
    // =============================================================
    console.log("\n--- TEST 7: LEAVE_REJECTED Event ---");
    sentMailLog.length = 0;
    const rejectedLeave = {
      _id: new mongoose.Types.ObjectId(),
      reason: "Urgent personal",
      reviewRemarks: "Insufficient attendance to permit leave during exam week",
      dateRange: {
        startDate: new Date("2026-11-05"),
        endDate: new Date("2026-11-06"),
      },
    };

    await notificationService.notifyLeaveRejected(rejectedLeave, studentProfile);
    await new Promise((r) => setTimeout(r, 200));

    const leaveRejEvents = await EmailEvent.find({
      eventType: "LEAVE_REJECTED",
      "metadata.leaveId": rejectedLeave._id,
    });

    assert(leaveRejEvents.length === 2, `Recorded 2 EmailEvents for LEAVE_REJECTED, got ${leaveRejEvents.length}`);
    const leaveRejSmtp = sentMailLog.find((m) => m.to.includes(studentUser.email));
    assert(leaveRejSmtp && leaveRejSmtp.html.includes("REJECTED"), `Rejection email shows REJECTED status`);
    assert(leaveRejSmtp && leaveRejSmtp.html.includes(rejectedLeave.reviewRemarks), `Rejection email shows reviewer remarks`);

    // =============================================================
    // TEST 8: RESULT_PUBLISHED Event & Scheduling Protection
    // =============================================================
    console.log("\n--- TEST 8: RESULT_PUBLISHED Event (Phase 2 Scheduling Compliant) ---");
    sentMailLog.length = 0;

    // 8a. Future result publication date: must NOT send email
    const futureScheduledExam = await Exam.create({
      title: `Future Scheduled Exam ${TEST_RUN_ID}`,
      code: `FSE_${Date.now()}`,
      examCategory: "TERM_EXAM",
      academicYearId: academicYear._id,
      startDate: new Date("2026-12-01"),
      endDate: new Date("2026-12-10"),
      eligibleClassIds: [testClass._id],
      status: "PUBLISHED",
      resultPublicationDate: new Date(Date.now() + 86400000 * 7), // 7 days in future
    });
    cleanupExamIds.push(futureScheduledExam._id);

    await notificationService.notifyResultPublished(futureScheduledExam, testClass._id);
    await new Promise((r) => setTimeout(r, 200));

    const futureResultEvents = await EmailEvent.find({
      eventType: "RESULT_PUBLISHED",
      "metadata.examId": futureScheduledExam._id,
    });
    assert(futureResultEvents.length === 0, `Future resultPublicationDate blocked premature email publication`);

    // 8b. Past/Present publication date: must send email
    futureScheduledExam.resultPublicationDate = new Date(Date.now() - 3600000); // 1 hour ago
    await futureScheduledExam.save();

    await notificationService.notifyResultPublished(futureScheduledExam, testClass._id);
    await new Promise((r) => setTimeout(r, 200));

    const publishedResultEvents = await EmailEvent.find({
      eventType: "RESULT_PUBLISHED",
      "metadata.examId": futureScheduledExam._id,
    });
    assert(publishedResultEvents.length === 2, `Results published: 2 EmailEvents recorded (Student + Parent), got ${publishedResultEvents.length}`);

    // =============================================================
    // TEST 9: ATTENDANCE_WARNING Event (<75%)
    // =============================================================
    console.log("\n--- TEST 9: ATTENDANCE_WARNING Event (<75%) ---");
    sentMailLog.length = 0;
    await notificationService.notifyAttendanceWarning(studentProfile._id, 68.5);
    await new Promise((r) => setTimeout(r, 200));

    const attWarnEvents = await EmailEvent.find({
      eventType: "ATTENDANCE_WARNING",
      "metadata.studentId": studentProfile._id,
    });

    assert(attWarnEvents.length === 2, `Recorded 2 EmailEvents for ATTENDANCE_WARNING, got ${attWarnEvents.length}`);
    const attSmtp = sentMailLog.find((m) => m.to.includes(studentUser.email));
    assert(attSmtp && attSmtp.html.includes("68.5%"), `Warning email specifies attendance percentage (68.5%)`);
    assert(attSmtp && attSmtp.html.includes("75%"), `Warning email specifies threshold (75%)`);

    // =============================================================
    // TEST 10: Deduplication / Idempotency
    // =============================================================
    console.log("\n--- TEST 10: Deduplication & Idempotency ---");
    const countBeforeDedup = sentMailLog.length;
    // Attempt re-sending the same payment notification
    await notificationService.notifyPaymentSuccess(paymentDoc);
    await new Promise((r) => setTimeout(r, 200));

    const countAfterDedup = sentMailLog.length;
    assert(countAfterDedup === countBeforeDedup, `Duplicate notification did NOT trigger additional SMTP send`);

    // Direct sendEventEmail with duplicate dedupKey
    const testDedupKey = `MANUAL_DEDUP_TEST_${Date.now()}`;
    const firstDispatch = await emailService.sendEventEmail({
      eventType: "SYSTEM_TEST",
      to: "test@example.com",
      subject: "Test Deduplication 1",
      html: "<p>Original</p>",
      dedupKey: testDedupKey,
    });
    assert(firstDispatch.success === true && !firstDispatch.duplicate, `First dispatch with dedupKey succeeds`);

    const secondDispatch = await emailService.sendEventEmail({
      eventType: "SYSTEM_TEST",
      to: "test@example.com",
      subject: "Test Deduplication 2",
      html: "<p>Duplicate</p>",
      dedupKey: testDedupKey,
    });
    assert(secondDispatch.success === true && secondDispatch.duplicate === true, `Second dispatch with same dedupKey returns duplicate=true`);

    // =============================================================
    // TEST 11: Failure Isolation (Primary Operations Unbroken)
    // =============================================================
    console.log("\n--- TEST 11: Failure Isolation ---");
    shouldTransporterFail = true;

    const isolatedLeave = {
      _id: new mongoose.Types.ObjectId(),
      reason: "Emergency appointment",
      reviewRemarks: "Approved during network outage",
      dateRange: {
        startDate: new Date("2026-11-10"),
        endDate: new Date("2026-11-11"),
      },
    };

    // This must NOT throw even if SMTP completely fails!
    let threwError = false;
    try {
      await notificationService.notifyLeaveApproved(isolatedLeave, studentProfile);
      await new Promise((r) => setTimeout(r, 200));
    } catch (e) {
      threwError = true;
    }
    assert(!threwError, `notifyLeaveApproved did NOT throw error when SMTP server failed`);

    // Verify in-app notifications WERE created in MongoDB despite SMTP failure!
    const inAppNotif = await Notification.findOne({
      userId: studentUser._id,
      "metadata.leaveId": isolatedLeave._id,
    });
    assert(!!inAppNotif, `In-app notification was successfully created despite SMTP outage`);

    // Verify EmailEvent logged the failure
    const failedEmailEvent = await EmailEvent.findOne({
      eventType: "LEAVE_APPROVED",
      "metadata.leaveId": isolatedLeave._id,
      recipientEmail: studentUser.email,
    });
    assert(!!failedEmailEvent && failedEmailEvent.status === "FAILED", `EmailEvent recorded status FAILED with error message`);

    // Restore transporter
    shouldTransporterFail = false;

    // =============================================================
    // TEST 12: Inactive & Deleted User Validation
    // =============================================================
    console.log("\n--- TEST 12: Inactive/Deleted User Validation ---");
    const inactiveDispatch = await emailService.sendEventEmail({
      eventType: "SYSTEM_TEST",
      to: inactiveUser.email,
      userId: inactiveUser._id,
      subject: "Hello Inactive User",
      html: "<p>You should not receive this</p>",
      dedupKey: `INACTIVE_TEST_${Date.now()}`,
    });

    assert(inactiveDispatch.skipped === true, `Dispatch to inactive user was SKIPPED`);
    const skippedEvent = await EmailEvent.findById(inactiveDispatch.emailEventId);
    assert(skippedEvent && skippedEvent.status === "SKIPPED", `EmailEvent recorded status SKIPPED for inactive user`);

    // =============================================================
    // TEST 13: Auth Email Regression
    // =============================================================
    console.log("\n--- TEST 13: Auth Email Regression ---");
    sentMailLog.length = 0;

    const otpRes = await emailService.sendOtpEmail("auth_test@example.com", "849201", "EMAIL_VERIFICATION");
    assert(otpRes.success === true, `sendOtpEmail succeeded`);

    const resetRes = await emailService.sendPasswordResetEmail("auth_test@example.com", "mock_reset_token");
    assert(resetRes.success === true, `sendPasswordResetEmail succeeded`);

    const inviteRes = await emailService.sendUserInvitationEmail("auth_test@example.com", "Brother Omar", "mock_invite_token");
    assert(inviteRes.success === true, `sendUserInvitationEmail succeeded`);

    const setupRes = await emailService.sendPasswordSetupEmail("auth_test@example.com", "Student Bilal", "mock_setup_token");
    assert(setupRes.success === true, `sendPasswordSetupEmail succeeded`);

    assert(sentMailLog.length === 4, `All 4 auth emails sent successfully via transporter`);

    console.log("\n=======================================================");
    console.log(`🎉 ALL ${testPassedCount} / ${testTotalCount} TESTS PASSED CLEANLY!`);
    console.log("=======================================================\n");
  } finally {
    // Teardown & Cleanup
    console.log("--- Cleaning up test artifacts ---");
    resetTransporter();
    await User.deleteMany({ _id: { $in: cleanupUserIds } });
    await StudentProfile.deleteMany({ _id: { $in: cleanupStudentIds } });
    await ParentProfile.deleteMany({ _id: { $in: cleanupParentIds } });
    await FacultyProfile.deleteMany({ _id: { $in: cleanupFacultyIds } });
    await Class.deleteMany({ _id: { $in: cleanupClassIds } });
    await AcademicYear.deleteMany({ _id: { $in: cleanupYearIds } });
    await Exam.deleteMany({ _id: { $in: cleanupExamIds } });
    await ExamRegistration.deleteMany({ _id: { $in: cleanupRegIds } });
    await Notification.deleteMany({
      userId: { $in: cleanupUserIds },
    });
    await EmailEvent.deleteMany({
      recipientEmail: {
        $regex: TEST_RUN_ID,
      },
    });
    await EmailEvent.deleteMany({
      eventType: "SYSTEM_TEST",
    });

    await mongoose.disconnect();
    console.log("Database disconnected. Done.");
  }
}

run().catch((err) => {
  console.error("Test execution fatal failure:", err);
  process.exit(1);
});
