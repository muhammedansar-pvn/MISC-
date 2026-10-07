process.env.NODE_ENV = "test";
const mongoose = require("mongoose");
const http = require("http");
const crypto = require("crypto");
const env = require("../src/config/env");
const app = require("../src/app");
const User = require("../src/modules/users/user.model");
const StudentProfile = require("../src/modules/students/student.model");
const AcademicYear = require("../src/modules/academics/academic-year.model");
const ClassModel = require("../src/modules/academics/class.model");
const Subject = require("../src/modules/academics/subject.model");
const Exam = require("../src/modules/exams/exam.model");
const ExamSchedule = require("../src/modules/exams/exam-schedule.model");
const ExamRegistration = require("../src/modules/exams/exam-registration.model");
const Payment = require("../src/modules/payments/payment.model");
const { generateToken } = require("../src/shared/utils/jwt");

async function run() {
  console.log("==================================================================");
  console.log("SANAVIYYA ADMIN EXAM SETUP & REGISTRATION WINDOW TEST SUITE");
  console.log("==================================================================");

  await mongoose.connect(env.MONGODB_URI);
  console.log("[1/4] Connected to MongoDB.");

  const server = http.createServer(app);
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;
  console.log(`[2/4] Test server running on port ${port}.`);

  const timestamp = Date.now();
  const cleanup = {
    users: [],
    studentProfiles: [],
    academicYears: [],
    classes: [],
    subjects: [],
    exams: [],
    examSchedules: [],
    examRegistrations: [],
    payments: [],
  };

  async function apiRequest(endpoint, { method = "GET", token, body = null } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${baseUrl}${endpoint}`, opts);
    const json = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, body: json };
  }

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    console.log("[3/4] Setting up fixtures...");

    // 1. Admin
    const adminUser = await User.create({
      name: `Admin Test ${timestamp}`,
      email: `admin_${timestamp}@sanaviyya.edu`,
      passwordHash: "hash",
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: true,
      isDeleted: false,
    });
    cleanup.users.push(adminUser._id);
    const adminToken = generateToken({
      userId: adminUser._id.toString(),
      role: "ADMIN",
      email: adminUser.email,
    });

    // 2. Academic Year
    const academicYear = await AcademicYear.create({
      yearCode: `AY-${timestamp}`,
      yearName: `Academic Year ${timestamp}`,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-05-31"),
      status: "ACTIVE",
      isCurrent: true,
    });
    cleanup.academicYears.push(academicYear._id);

    // 3. Classes: Class A (eligible) and Class B (ineligible)
    const classA = await ClassModel.create({
      name: `Sanaviyya Senior A ${timestamp}`,
      code: `SEN-A-${timestamp}`,
      academicYearId: academicYear._id,
      capacity: 40,
      status: "ACTIVE",
    });
    cleanup.classes.push(classA._id);

    const classB = await ClassModel.create({
      name: `Sanaviyya Junior B ${timestamp}`,
      code: `JUN-B-${timestamp}`,
      academicYearId: academicYear._id,
      capacity: 40,
      status: "ACTIVE",
    });
    cleanup.classes.push(classB._id);

    // 4. Subjects
    const subject1 = await Subject.create({
      subjectName: `Advanced Fiqh ${timestamp}`,
      subjectCode: `FIQH-${timestamp}`,
      category: "ISLAMIC_STUDIES",
      status: "ACTIVE",
    });
    cleanup.subjects.push(subject1._id);

    const subject2 = await Subject.create({
      subjectName: `Arabic Literature ${timestamp}`,
      subjectCode: `ARAB-${timestamp}`,
      category: "LANGUAGE",
      status: "ACTIVE",
    });
    cleanup.subjects.push(subject2._id);

    // 5. Student A (in Class A)
    const studentUserA = await User.create({
      name: `Student A ${timestamp}`,
      email: `student_a_${timestamp}@sanaviyya.edu`,
      passwordHash: "hash",
      role: "STUDENT",
      status: "ACTIVE",
      emailVerified: true,
      isDeleted: false,
    });
    cleanup.users.push(studentUserA._id);
    const studentProfileA = await StudentProfile.create({
      userId: studentUserA._id,
      nameEnglish: `Student A ${timestamp}`,
      admissionNumber: `ADM-A-${timestamp}`,
      registrationNumber: `REG-A-${timestamp}`.slice(0, 16),
      fatherName: "Father A",
      motherName: "Mother A",
      dateOfBirth: new Date("2008-01-01"),
      admissionYear: 2024,
      classId: classA._id,
      academicYearId: academicYear._id,
      status: "ACTIVE",
      isDeleted: false,
    });
    cleanup.studentProfiles.push(studentProfileA._id);
    const studentTokenA = generateToken({
      userId: studentUserA._id.toString(),
      role: "STUDENT",
      email: studentUserA.email,
      studentProfileId: studentProfileA._id.toString(),
    });

    // 6. Student B (in Class B)
    const studentUserB = await User.create({
      name: `Student B ${timestamp}`,
      email: `student_b_${timestamp}@sanaviyya.edu`,
      passwordHash: "hash",
      role: "STUDENT",
      status: "ACTIVE",
      emailVerified: true,
      isDeleted: false,
    });
    cleanup.users.push(studentUserB._id);
    const studentProfileB = await StudentProfile.create({
      userId: studentUserB._id,
      nameEnglish: `Student B ${timestamp}`,
      admissionNumber: `ADM-B-${timestamp}`,
      registrationNumber: `REG-B-${timestamp}`.slice(0, 16),
      fatherName: "Father B",
      motherName: "Mother B",
      dateOfBirth: new Date("2008-01-01"),
      admissionYear: 2024,
      classId: classB._id,
      academicYearId: academicYear._id,
      status: "ACTIVE",
      isDeleted: false,
    });
    cleanup.studentProfiles.push(studentProfileB._id);
    const studentTokenB = generateToken({
      userId: studentUserB._id.toString(),
      role: "STUDENT",
      email: studentUserB.email,
      studentProfileId: studentProfileB._id.toString(),
    });

    console.log("[4/4] Executing test scenarios...\n");

    // =========================================================================
    // SCENARIO 1: ADMIN CREATES EXAM IN DRAFT STATUS
    // =========================================================================
    console.log("--- TEST GROUP 1: Admin Creates Draft Examination ---");

    const draftExamPayload = {
      title: `Board Examination 2026 ${timestamp}`,
      code: `EXAM-${timestamp}`,
      description: "Annual centralized board examination for senior sanaviyya scholars",
      academicYearId: academicYear._id.toString(),
      startDate: new Date("2026-11-10").toISOString(),
      endDate: new Date("2026-11-20").toISOString(),
      term: "FINAL_TERM",
      examType: "ANNUAL",
      fee: 450,
      status: "DRAFT",
    };

    const createDraftRes = await apiRequest("/exams/exams", {
      method: "POST",
      token: adminToken,
      body: draftExamPayload,
    });

    assert(createDraftRes.status === 201, `Admin creates draft exam returns 201 Created (got ${createDraftRes.status})`);
    assert(createDraftRes.body.data?.status === "DRAFT", `Exam status is DRAFT`);
    assert(createDraftRes.body.data?.description === draftExamPayload.description, `Exam description is saved`);
    const examId = createDraftRes.body.data?._id;
    if (examId) cleanup.exams.push(examId);

    // Verify student cannot see draft exam in available-for-registration
    const studentCheckDraft = await apiRequest("/exams/available-for-registration", {
      token: studentTokenA,
    });
    const foundInDraft = (studentCheckDraft.body.data || []).find((e) => e._id === examId);
    assert(!foundInDraft, "Draft examination is NOT available for student registration");

    // Attempting direct registration on draft exam must fail with 400
    const registerDraftRes = await apiRequest("/exams/exam-registrations", {
      method: "POST",
      token: studentTokenA,
      body: { examId, studentId: studentProfileA._id.toString() },
    });
    assert(registerDraftRes.status === 400, `Registration on DRAFT exam is rejected with 400 (got ${registerDraftRes.status})`);

    // =========================================================================
    // SCENARIO 2: ATTEMPT TO PUBLISH INCOMPLETE EXAM MUST FAIL
    // =========================================================================
    console.log("\n--- TEST GROUP 2: Incomplete Exam Cannot Be Published ---");

    // Attempting to publish without registration window and eligible classes must fail
    const publishIncompleteRes = await apiRequest(`/exams/exams/${examId}/publish`, {
      method: "PATCH",
      token: adminToken,
      body: { status: "PUBLISHED" },
    });
    assert(publishIncompleteRes.status === 400, `Publishing incomplete exam is rejected with 400 (got ${publishIncompleteRes.status})`);

    // =========================================================================
    // SCENARIO 3: ADMIN CONFIGURES COMPLETE EXAM & PUBLISHES
    // =========================================================================
    console.log("\n--- TEST GROUP 3: Admin Configures Complete Exam & Publishes ---");

    const now = new Date();
    const regStartDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // yesterday
    const regEndDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    const updateConfigRes = await apiRequest(`/exams/exams/${examId}`, {
      method: "PUT",
      token: adminToken,
      body: {
        ...draftExamPayload,
        registrationStartDate: regStartDate.toISOString(),
        registrationEndDate: regEndDate.toISOString(),
        eligibleClassIds: [classA._id.toString()],
        subjectIds: [subject1._id.toString(), subject2._id.toString()],
        status: "PUBLISHED",
      },
    });

    assert(updateConfigRes.status === 200, `Admin successfully configures & publishes exam (got ${updateConfigRes.status})`);
    assert(updateConfigRes.body.data?.status === "PUBLISHED", `Exam status transitioned to PUBLISHED`);
    assert(Boolean(updateConfigRes.body.data?.publishedAt), `publishedAt timestamp is automatically set`);
    assert(updateConfigRes.body.data?.eligibleClassIds?.length === 1, `Eligible classes contains 1 class`);
    assert(updateConfigRes.body.data?.subjectIds?.length === 2, `Subject ids contains 2 subjects`);

    // Verify GET /exams/exams returns enriched stats
    const getExamsRes = await apiRequest(`/exams/exams`, { token: adminToken });
    const targetExamFromList = (getExamsRes.body.data || []).find((e) => e._id === examId);
    assert(Boolean(targetExamFromList), "Published exam retrieved in admin list");
    assert(targetExamFromList?.registrationState === "OPEN", `Computed registrationState is OPEN (got ${targetExamFromList?.registrationState})`);
    assert(targetExamFromList?.isRegistrationOpen === true, "Computed isRegistrationOpen is true");
    assert(targetExamFromList?.registeredStudentsCount === 0, "Initial registeredStudentsCount is 0");

    // =========================================================================
    // SCENARIO 4: CLASS ELIGIBILITY & REGISTRATION WINDOW ENFORCEMENT
    // =========================================================================
    console.log("\n--- TEST GROUP 4: Student Visibility & Class Eligibility ---");

    // Eligible Student A (Class A) should see the exam
    const studentAvailA = await apiRequest("/exams/available-for-registration", { token: studentTokenA });
    const studentAExam = (studentAvailA.body.data || []).find((e) => e._id === examId);
    assert(Boolean(studentAExam), "Eligible Student A sees the published exam");
    assert(studentAExam?.isRegistrationOpen === true, "Student A can register (isRegistrationOpen = true)");
    assert(studentAExam?.fee === 450, `Exam fee matches configured ₹450`);

    // Ineligible Student B (Class B) should NOT see the exam
    const studentAvailB = await apiRequest("/exams/available-for-registration", { token: studentTokenB });
    const studentBExam = (studentAvailB.body.data || []).find((e) => e._id === examId);
    assert(!studentBExam, "Ineligible Student B cannot see the exam in available list");

    // Ineligible Student B attempting direct registration must fail
    const studentBRegAttempt = await apiRequest("/exams/exam-registrations", {
      method: "POST",
      token: studentTokenB,
      body: { examId, studentId: studentProfileB._id.toString() },
    });
    assert(studentBRegAttempt.status === 400, `Ineligible Student B registration fails with 400 (got ${studentBRegAttempt.status})`);

    // =========================================================================
    // SCENARIO 5: REGISTRATION WINDOW BOUNDARIES (BEFORE START & AFTER END)
    // =========================================================================
    console.log("\n--- TEST GROUP 5: Registration Window Time Enforcements ---");

    // 5a. Future window (registration not started)
    const futureExamRes = await apiRequest("/exams/exams", {
      method: "POST",
      token: adminToken,
      body: {
        title: `Future Exam ${timestamp}`,
        code: `FUT-${timestamp}`,
        academicYearId: academicYear._id.toString(),
        startDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000).toISOString(),
        registrationStartDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        registrationEndDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        eligibleClassIds: [classA._id.toString()],
        status: "PUBLISHED",
      },
    });
    assert(futureExamRes.status === 201, "Future published exam created");
    const futureExamId = futureExamRes.body.data?._id;
    if (futureExamId) cleanup.exams.push(futureExamId);

    const registerFutureRes = await apiRequest("/exams/exam-registrations", {
      method: "POST",
      token: studentTokenA,
      body: { examId: futureExamId, studentId: studentProfileA._id.toString() },
    });
    assert(registerFutureRes.status === 400, `Registering before registrationStartDate fails 400 (got ${registerFutureRes.status})`);
    assert(
      (registerFutureRes.body.message || "").toLowerCase().includes("not opened"),
      `Error specifies registration not opened yet`
    );

    // 5b. Past window (registration closed)
    const pastExamRes = await apiRequest("/exams/exams", {
      method: "POST",
      token: adminToken,
      body: {
        title: `Past Exam ${timestamp}`,
        code: `PAST-${timestamp}`,
        academicYearId: academicYear._id.toString(),
        startDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        registrationStartDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        registrationEndDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        eligibleClassIds: [classA._id.toString()],
        status: "PUBLISHED",
      },
    });
    assert(pastExamRes.status === 201, "Past window published exam created");
    const pastExamId = pastExamRes.body.data?._id;
    if (pastExamId) cleanup.exams.push(pastExamId);

    const registerPastRes = await apiRequest("/exams/exam-registrations", {
      method: "POST",
      token: studentTokenA,
      body: { examId: pastExamId, studentId: studentProfileA._id.toString() },
    });
    assert(registerPastRes.status === 400, `Registering after registrationEndDate fails 400 (got ${registerPastRes.status})`);
    assert(
      (registerPastRes.body.message || "").toLowerCase().includes("closed"),
      `Error specifies registration closed`
    );

    // =========================================================================
    // SCENARIO 6: STUDENT A REGISTERS AND PAYS FEE
    // =========================================================================
    console.log("\n--- TEST GROUP 6: Student A Enrolls in Open Exam ---");

    const registerSuccessRes = await apiRequest("/exams/exam-registrations", {
      method: "POST",
      token: studentTokenA,
      body: { examId, studentId: studentProfileA._id.toString() },
    });

    assert(registerSuccessRes.status === 201, `Student A registers successfully (got ${registerSuccessRes.status})`);
    const regId = registerSuccessRes.body.data?._id;
    if (regId) cleanup.examRegistrations.push(regId);
    assert(registerSuccessRes.body.data?.registrationStatus === "REGISTERED", "Registration status is REGISTERED");

    // Verify count in admin list updated to 1
    const getExamsAfterReg = await apiRequest(`/exams/exams`, { token: adminToken });
    const targetAfterReg = (getExamsAfterReg.body.data || []).find((e) => e._id === examId);
    assert(targetAfterReg?.registeredStudentsCount === 1, `registeredStudentsCount is 1 after student registration`);

    // =========================================================================
    // SCENARIO 7: SAFE EDITING SAFEGUARDS FOR ADMIN
    // =========================================================================
    console.log("\n--- TEST GROUP 7: Admin Safe Editing Safeguards ---");

    // 7a. Attempting to remove Class A from eligible classes when Student A is registered
    const removeClassAttempt = await apiRequest(`/exams/exams/${examId}`, {
      method: "PUT",
      token: adminToken,
      body: {
        ...draftExamPayload,
        registrationStartDate: regStartDate.toISOString(),
        registrationEndDate: regEndDate.toISOString(),
        eligibleClassIds: [classB._id.toString()], // dropped Class A!
        status: "PUBLISHED",
      },
    });
    assert(removeClassAttempt.status === 400, `Removing eligible class with registered students fails with 400 (got ${removeClassAttempt.status})`);
    assert(
      (removeClassAttempt.body.message || "").toLowerCase().includes("cannot remove eligible classes"),
      `Safe editing prevented removing class with registered candidates`
    );

    // 7b. Create successful payment for Student A's exam fee
    const payment = await Payment.create({
      userId: studentUserA._id,
      studentId: studentProfileA._id,
      examRegistrationId: regId,
      amount: 450,
      currency: "INR",
      paymentType: "EXAM_FEE",
      transactionId: `tx_test_${timestamp}`,
      gatewayOrderId: `order_test_${timestamp}`,
      gatewayPaymentId: `pay_test_${timestamp}`,
      status: "SUCCESS",
      gateway: "RAZORPAY",
      description: "Exam Registration Fee",
    });
    cleanup.payments.push(payment._id);
    await ExamRegistration.findByIdAndUpdate(regId, { paymentId: payment._id });

    // 7c. Attempting to alter fee after payment exists must fail
    const alterFeeAttempt = await apiRequest(`/exams/exams/${examId}`, {
      method: "PUT",
      token: adminToken,
      body: {
        ...draftExamPayload,
        fee: 999, // altered fee!
        registrationStartDate: regStartDate.toISOString(),
        registrationEndDate: regEndDate.toISOString(),
        eligibleClassIds: [classA._id.toString()],
        status: "PUBLISHED",
      },
    });
    assert(alterFeeAttempt.status === 400, `Altering fee after successful payments fails with 400 (got ${alterFeeAttempt.status})`);
    assert(
      (alterFeeAttempt.body.message || "").toLowerCase().includes("cannot modify examination fee"),
      `Safe editing prevented altering fee after payments processed`
    );

    // =========================================================================
    // SCENARIO 8: ADMIN UNPUBLISH & RE-PUBLISH LIFECYCLE
    // =========================================================================
    console.log("\n--- TEST GROUP 8: Admin Publish / Unpublish Toggle ---");

    // Unpublish
    const unpublishRes = await apiRequest(`/exams/exams/${examId}/publish`, {
      method: "PATCH",
      token: adminToken,
      body: { status: "DRAFT" },
    });
    assert(unpublishRes.status === 200, `Admin unpublishes exam successfully (got ${unpublishRes.status})`);
    assert(unpublishRes.body.data?.status === "DRAFT", `Exam status reverted to DRAFT`);

    // Re-publish
    const republishRes = await apiRequest(`/exams/exams/${examId}/publish`, {
      method: "PATCH",
      token: adminToken,
      body: { status: "PUBLISHED" },
    });
    assert(republishRes.status === 200, `Admin re-publishes exam successfully (got ${republishRes.status})`);
    assert(republishRes.body.data?.status === "PUBLISHED", `Exam status is back to PUBLISHED`);

  } catch (err) {
    console.error("Test execution error:", err);
    failed++;
  } finally {
    console.log("\n[Cleanup] Cleaning up created test entities...");
    try {
      if (cleanup.payments.length) await Payment.deleteMany({ _id: { $in: cleanup.payments } });
      if (cleanup.examRegistrations.length) await ExamRegistration.deleteMany({ _id: { $in: cleanup.examRegistrations } });
      if (cleanup.examSchedules.length) await ExamSchedule.deleteMany({ _id: { $in: cleanup.examSchedules } });
      if (cleanup.exams.length) await Exam.deleteMany({ _id: { $in: cleanup.exams } });
      if (cleanup.subjects.length) await Subject.deleteMany({ _id: { $in: cleanup.subjects } });
      if (cleanup.classes.length) await ClassModel.deleteMany({ _id: { $in: cleanup.classes } });
      if (cleanup.academicYears.length) await AcademicYear.deleteMany({ _id: { $in: cleanup.academicYears } });
      if (cleanup.studentProfiles.length) await StudentProfile.deleteMany({ _id: { $in: cleanup.studentProfiles } });
      if (cleanup.users.length) await User.deleteMany({ _id: { $in: cleanup.users } });
      console.log("Cleanup finished.");
    } catch (e) {
      console.warn("Cleanup error:", e.message);
    }

    server.close();
    await mongoose.disconnect();

    console.log("\n==================================================================");
    console.log(`TEST RUN SUMMARY: Passed: ${passed} | Failed: ${failed}`);
    console.log("==================================================================");

    process.exit(failed > 0 ? 1 : 0);
  }
}

run();
