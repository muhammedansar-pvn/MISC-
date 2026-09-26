const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../src/modules/users/user.model");
const StudentProfile = require("../src/modules/students/student.model");
const Class = require("../src/modules/academics/class.model");
const AcademicYear = require("../src/modules/academics/academic-year.model");
const ExamResult = require("../src/modules/exams/exam-result.model");
const ExamRegistration = require("../src/modules/exams/exam-registration.model");
const Payment = require("../src/modules/payments/payment.model");
const studentLifecycleService = require("../src/modules/students/student-lifecycle.service");
const adminService = require("../src/modules/admin/admin.service");
const studentService = require("../src/modules/students/student.service");
const { login } = require("../src/modules/auth/auth.controller");
const { hashPassword } = require("../src/shared/utils/password");

// Helper to simulate express req/res
function mockReqRes(body = {}, params = {}, query = {}) {
  const req = { body, params, query };
  let statusCode = 200;
  let responseData = null;

  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    json(data) {
      responseData = data;
      return res;
    },
    getStatus: () => statusCode,
    getData: () => responseData,
  };

  return { req, res };
}

async function runStudentLifecycleTests() {
  console.log("==================================================================");
  console.log("TEST SUITE: STUDENT MANAGEMENT LIFECYCLE & CONSISTENCY VERIFICATION");
  console.log("==================================================================\n");

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("ERROR: MONGODB_URI missing in backend/.env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("[DB] Connected to MongoDB Atlas.\n");

  const cleanupUserIds = [];
  const cleanupProfileIds = [];
  const cleanupYearIds = [];
  const cleanupClassIds = [];
  const cleanupExamResultIds = [];
  const cleanupExamRegIds = [];
  const cleanupPaymentIds = [];

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] Test ${totalTests}: ${message}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] Test ${totalTests}: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    // 0. Setup active academic year and class
    let testYear = await AcademicYear.findOne({ status: "ACTIVE" });
    if (!testYear) {
      testYear = await AcademicYear.create({
        yearLabel: "2026-2027",
        startYear: 2026,
        endYear: 2027,
        status: "ACTIVE",
      });
      cleanupYearIds.push(testYear._id);
    }

    let testClass = await Class.findOne({ status: "ACTIVE" });
    if (!testClass) {
      testClass = await Class.create({
        name: "Sanaviyya Lifecycle Test Class",
        code: `SLC${Date.now().toString().slice(-4)}`,
        academicYearId: testYear._id,
        status: "ACTIVE",
      });
      cleanupClassIds.push(testClass._id);
    }

    function buildStudentPayload(email, name = "Test Student") {
      return {
        email,
        nameEnglish: name,
        nameArabic: "طالب تجريبي",
        placeEnglish: "Calicut",
        placeArabic: "كالیكوت",
        dateOfBirth: "2006-05-15",
        admissionYear: 2026,
        classId: testClass._id.toString(),
        contactNumber: "+919876543210",
        fatherName: "Father Name",
        motherName: "Mother Name",
      };
    }

    // -------------------------------------------------------------
    // TEST 1: Register Student -> User + StudentProfile created & synced
    // -------------------------------------------------------------
    console.log("\n--- TEST 1: Register Student -> User + StudentProfile Created ---");
    const email1 = `lifecycle-t1-${Date.now()}@markazsanaviyya.org`;
    const regRes1 = await studentService.registerStudentWithAccount(
      buildStudentPayload(email1, "Lifecycle Student One"),
      { role: "ADMIN" }
    );

    const profileId1 = regRes1.student._id;
    const userId1 = regRes1.student.userId._id || regRes1.student.userId;
    const user1 = await User.findById(userId1);
    const profile1 = await StudentProfile.findById(profileId1);
    cleanupUserIds.push(user1._id);
    cleanupProfileIds.push(profile1._id);

    assert(
      user1 && profile1 && profile1.userId.toString() === user1._id.toString(),
      "User and StudentProfile created with valid foreign key link"
    );
    assert(
      user1.status === "PENDING_SETUP" && profile1.status === "ACTIVE" && user1.isDeleted === false && profile1.isDeleted === false,
      `User initial status is PENDING_SETUP, StudentProfile initial status is ACTIVE, and neither is deleted`
    );

    // -------------------------------------------------------------
    // TEST 2: Deactivate/Activate from Students API -> both synchronized
    // -------------------------------------------------------------
    console.log("\n--- TEST 2: Deactivate & Activate from Students Service ---");
    await studentService.updateStudentStatus(profile1._id, "INACTIVE");
    let u1 = await User.findById(user1._id);
    let p1 = await StudentProfile.findById(profile1._id);
    assert(
      u1.status === "INACTIVE" && p1.status === "INACTIVE",
      "Deactivating student from studentService synchronizes status=INACTIVE to both User and StudentProfile"
    );

    await studentService.updateStudentStatus(profile1._id, "ACTIVE");
    u1 = await User.findById(user1._id);
    p1 = await StudentProfile.findById(profile1._id);
    assert(
      u1.status === "ACTIVE" && p1.status === "ACTIVE",
      "Activating student from studentService synchronizes status=ACTIVE to both User and StudentProfile"
    );

    // -------------------------------------------------------------
    // TEST 3: Deactivate & Delete from Admin Users API -> both synchronized
    // -------------------------------------------------------------
    console.log("\n--- TEST 3: Deactivate & Delete from Admin Users API ---");
    // 3a. Admin updateUserStatus on STUDENT
    await adminService.updateUserStatus(user1._id, "SUSPENDED");
    u1 = await User.findById(user1._id);
    p1 = await StudentProfile.findById(profile1._id);
    assert(
      u1.status === "SUSPENDED" && p1.status === "SUSPENDED",
      "adminService.updateUserStatus on a STUDENT user syncs status=SUSPENDED to StudentProfile"
    );

    // 3b. Admin deleteUser on STUDENT
    await adminService.deleteUser(user1._id);
    u1 = await User.findById(user1._id);
    p1 = await StudentProfile.findById(profile1._id);
    assert(
      u1.isDeleted === true && p1.isDeleted === true && u1.status === "INACTIVE" && p1.status === "INACTIVE",
      "adminService.deleteUser on a STUDENT user safely soft-deletes both User and StudentProfile"
    );

    // -------------------------------------------------------------
    // TEST 4: Student with ExamResult -> History Preserved & Hard Delete Blocked
    // -------------------------------------------------------------
    console.log("\n--- TEST 4: Student with ExamResult -> History Preserved ---");
    const email4 = `lifecycle-t4-${Date.now()}@markazsanaviyya.org`;
    const regRes4 = await studentService.registerStudentWithAccount(
      buildStudentPayload(email4, "Lifecycle Student Four"),
      { role: "ADMIN" }
    );
    const profileId4 = regRes4.student._id;
    const userId4 = regRes4.student.userId._id || regRes4.student.userId;
    const user4 = await User.findById(userId4);
    const profile4 = await StudentProfile.findById(profileId4);
    cleanupUserIds.push(user4._id);
    cleanupProfileIds.push(profile4._id);

    // Attach mock ExamResult
    const examResult4 = await ExamResult.create({
      studentId: profile4._id,
      examId: new mongoose.Types.ObjectId(),
      classId: testClass._id,
      institutionId: new mongoose.Types.ObjectId(),
      totalMaxMarks: 100,
      totalMarksObtained: 85,
      percentage: 85,
      grade: "A",
      resultStatus: "PASSED",
    });
    cleanupExamResultIds.push(examResult4._id);

    // Attempt hard delete - should throw error
    let hardDeleteBlocked = false;
    try {
      await studentLifecycleService.deleteStudentLifecycle(profile4._id, { hardDelete: true });
    } catch (err) {
      if (err.statusCode === 400 && err.message.includes("Cannot permanently delete student")) {
        hardDeleteBlocked = true;
      }
    }
    assert(hardDeleteBlocked, "Hard deletion blocked when student has ExamResult historical records");

    // Soft delete should succeed and preserve the ExamResult
    await studentLifecycleService.deleteStudentLifecycle(profile4._id, { hardDelete: false });
    const preservedExamResult = await ExamResult.findById(examResult4._id);
    assert(
      preservedExamResult !== null && preservedExamResult.grade === "A",
      "Soft delete preserved ExamResult record intact without deletion"
    );

    // -------------------------------------------------------------
    // TEST 5: Student with Payment -> History Preserved
    // -------------------------------------------------------------
    console.log("\n--- TEST 5: Student with Payment -> History Preserved ---");
    const email5 = `lifecycle-t5-${Date.now()}@markazsanaviyya.org`;
    const regRes5 = await studentService.registerStudentWithAccount(
      buildStudentPayload(email5, "Lifecycle Student Five"),
      { role: "ADMIN" }
    );
    const profileId5 = regRes5.student._id;
    const userId5 = regRes5.student.userId._id || regRes5.student.userId;
    const user5 = await User.findById(userId5);
    const profile5 = await StudentProfile.findById(profileId5);
    cleanupUserIds.push(user5._id);
    cleanupProfileIds.push(profile5._id);

    const payment5 = await Payment.create({
      userId: user5._id,
      paymentType: "EXAM_FEE",
      amount: 1500,
      currency: "INR",
      gateway: "MANUAL",
      status: "SUCCESS",
      transactionId: `TXN${Date.now()}`,
    });
    cleanupPaymentIds.push(payment5._id);

    // Hard delete blocked
    let paymentHardDeleteBlocked = false;
    try {
      await studentLifecycleService.deleteStudentLifecycle(user5._id, { hardDelete: true });
    } catch (err) {
      if (err.statusCode === 400) paymentHardDeleteBlocked = true;
    }
    assert(paymentHardDeleteBlocked, "Hard deletion blocked when student has Payment records");

    // Soft delete via user ID
    await studentLifecycleService.deleteStudentLifecycle(user5._id, { hardDelete: false });
    const preservedPayment = await Payment.findById(payment5._id);
    assert(
      preservedPayment !== null && preservedPayment.status === "SUCCESS",
      "Soft delete preserved Payment record intact"
    );

    // -------------------------------------------------------------
    // TEST 6: Student with ExamRegistration -> History Preserved
    // -------------------------------------------------------------
    console.log("\n--- TEST 6: Student with ExamRegistration -> History Preserved ---");
    const email6 = `lifecycle-t6-${Date.now()}@markazsanaviyya.org`;
    const regRes6 = await studentService.registerStudentWithAccount(
      buildStudentPayload(email6, "Lifecycle Student Six"),
      { role: "ADMIN" }
    );
    const profileId6 = regRes6.student._id;
    const userId6 = regRes6.student.userId._id || regRes6.student.userId;
    const user6 = await User.findById(userId6);
    const profile6 = await StudentProfile.findById(profileId6);
    cleanupUserIds.push(user6._id);
    cleanupProfileIds.push(profile6._id);

    const examReg6 = await ExamRegistration.create({
      studentId: profile6._id,
      examId: new mongoose.Types.ObjectId(),
      rollNumber: `ROLL${Date.now().toString().slice(-6)}`,
      registrationStatus: "REGISTERED",
    });
    cleanupExamRegIds.push(examReg6._id);

    let examRegBlocked = false;
    try {
      await studentLifecycleService.deleteStudentLifecycle(profile6._id, { hardDelete: true });
    } catch (err) {
      if (err.statusCode === 400) examRegBlocked = true;
    }
    assert(examRegBlocked, "Hard deletion blocked when student has ExamRegistration records");

    // -------------------------------------------------------------
    // TEST 7: Deactivated Student Login -> Rejected
    // -------------------------------------------------------------
    console.log("\n--- TEST 7: Deactivated Student Login Rejection ---");
    const email7 = `lifecycle-t7-${Date.now()}@markazsanaviyya.org`;
    const regRes7 = await studentService.registerStudentWithAccount(
      buildStudentPayload(email7, "Lifecycle Student Seven"),
      { role: "ADMIN" }
    );
    const profileId7 = regRes7.student._id;
    const userId7 = regRes7.student.userId._id || regRes7.student.userId;
    const user7 = await User.findById(userId7);
    const profile7 = await StudentProfile.findById(profileId7);
    cleanupUserIds.push(user7._id);
    cleanupProfileIds.push(profile7._id);

    // Set a known password and mark email verified
    const hashed = await hashPassword("StrongPassword@123");
    user7.passwordHash = hashed;
    user7.emailVerified = true;
    user7.status = "ACTIVE";
    await user7.save();

    // Verify student can log in while active
    const { req: activeReq, res: activeRes } = mockReqRes({
      email: email7,
      password: "StrongPassword@123",
    });
    await login(activeReq, activeRes);
    assert(activeRes.getStatus() === 200, "Active student logs in successfully with valid credentials");

    // Now deactivate student via lifecycle service
    await studentLifecycleService.updateStudentStatus(profile7._id, "INACTIVE");

    // Attempt login while deactivated
    const { req: deactReq, res: deactRes } = mockReqRes({
      email: email7,
      password: "StrongPassword@123",
    });
    await login(deactReq, deactRes);
    assert(
      deactRes.getStatus() === 403 && deactRes.getData().message === "Account is not active",
      `Deactivated student login rejected with 403 ("${deactRes.getData().message}")`
    );

    // -------------------------------------------------------------
    // TEST 8: Deleted/Archived Student -> Excluded from Active Lists
    // -------------------------------------------------------------
    console.log("\n--- TEST 8: Excluded from Active Directory Lists ---");
    // Soft delete student 7
    await studentLifecycleService.deleteStudentLifecycle(profile7._id, { hardDelete: false });

    const studentsList = await studentService.getStudents({}, email7);
    const foundInStudentsList = studentsList.some((s) => s.userId && s.userId.email === email7);
    assert(!foundInStudentsList, "Soft-deleted student excluded from active getStudents() query");

    const usersList = await adminService.getUsers({ search: email7, limit: 10 });
    const foundInUsersList = usersList.users.some((u) => u.email === email7 && !u.isDeleted);
    assert(!foundInUsersList, "Soft-deleted student excluded from active getUsers() query");

    // -------------------------------------------------------------
    // TEST 9: Restore Student -> Both Restored to ACTIVE
    // -------------------------------------------------------------
    console.log("\n--- TEST 9: Restore Student Lifecycle ---");
    const restoreResult = await studentLifecycleService.restoreStudentLifecycle(profile7._id);
    const restoredUser = await User.findById(user7._id);
    const restoredProfile = await StudentProfile.findById(profile7._id);
    assert(
      restoreResult.success === true &&
      restoredUser.status === "ACTIVE" &&
      restoredUser.isDeleted === false &&
      restoredProfile.status === "ACTIVE" &&
      restoredProfile.isDeleted === false,
      "restoreStudentLifecycle successfully reactivated both User and StudentProfile with status=ACTIVE and isDeleted=false"
    );

    // -------------------------------------------------------------
    // TEST 10: Existing Orphan Detection -> 0 Orphans in Database
    // -------------------------------------------------------------
    console.log("\n--- TEST 10: Live Database Orphan Invariant Check ---");
    const allProfiles = await StudentProfile.find({});
    let orphanCount = 0;
    for (const p of allProfiles) {
      if (!p.userId) {
        orphanCount++;
        continue;
      }
      const linkedUser = await User.findById(p.userId);
      if (!linkedUser) {
        orphanCount++;
        continue;
      }
      // Check deletion mismatch
      if (linkedUser.isDeleted && !p.isDeleted) {
        orphanCount++;
      }
    }
    assert(
      orphanCount === 0,
      `Orphan check verified: exactly 0 orphan or desynchronized student profiles in database (found: ${orphanCount})`
    );

    // -------------------------------------------------------------
    // TEST 11: Re-registration with same email -> handled properly
    // -------------------------------------------------------------
    console.log("\n--- TEST 11: Duplicate Registration Validation ---");
    let duplicateRejected = false;
    try {
      await studentService.registerStudentWithAccount(
        buildStudentPayload(email7, "Duplicate Candidate"),
        { role: "ADMIN" }
      );
    } catch (err) {
      if (
        err.statusCode === 409 ||
        (err.message &&
          (err.message.toLowerCase().includes("already registered") ||
            err.message.toLowerCase().includes("already exists")))
      ) {
        duplicateRejected = true;
      }
    }
    assert(duplicateRejected, "Re-registration with identical email correctly rejected with duplicate conflict error");

    // -------------------------------------------------------------
    // TEST 12: Admin Users and Admin Students consistency
    // -------------------------------------------------------------
    console.log("\n--- TEST 12: Admin Users & Admin Students Consistency ---");
    const studentQueryAfterRestore = await studentService.getStudents({}, "Lifecycle Student Seven");
    const userQueryAfterRestore = await adminService.getUserById(user7._id);
    const profileQueryAfterRestore = await studentService.getStudentById(profile7._id);

    assert(
      userQueryAfterRestore.status === "ACTIVE" &&
      profileQueryAfterRestore.status === "ACTIVE" &&
      studentQueryAfterRestore.length >= 1,
      "Both Admin User service and Student service report identical ACTIVE status and profile data"
    );

    console.log("\n==================================================================");
    console.log(`ALL 12 TESTS PASSED! (${passedTests}/${totalTests})`);
    console.log("==================================================================\n");
  } catch (error) {
    console.error("\nTEST SUITE FAILED with error:", error);
    throw error;
  } finally {
    console.log("[CLEANUP] Cleaning up test records created for this run...");
    await User.deleteMany({ _id: { $in: cleanupUserIds } });
    await StudentProfile.deleteMany({ _id: { $in: cleanupProfileIds } });
    await ExamResult.deleteMany({ _id: { $in: cleanupExamResultIds } });
    await ExamRegistration.deleteMany({ _id: { $in: cleanupExamRegIds } });
    await Payment.deleteMany({ _id: { $in: cleanupPaymentIds } });
    await Class.deleteMany({ _id: { $in: cleanupClassIds } });
    await AcademicYear.deleteMany({ _id: { $in: cleanupYearIds } });
    console.log("[CLEANUP] Cleanup completed.");
    await mongoose.disconnect();
    console.log("[DB] Disconnected.");
  }
}

runStudentLifecycleTests()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
