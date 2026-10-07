process.env.NODE_ENV = "test";
const mongoose = require("mongoose");
const http = require("http");
const env = require("../src/config/env");
const app = require("../src/app");
const User = require("../src/modules/users/user.model");
const StudentProfile = require("../src/modules/students/student.model");
const ParentProfile = require("../src/modules/parents/parent.model");
const AcademicYear = require("../src/modules/academics/academic-year.model");
const Exam = require("../src/modules/exams/exam.model");
const ExamRegistration = require("../src/modules/exams/exam-registration.model");
const Payment = require("../src/modules/payments/payment.model");
const { generateToken } = require("../src/shared/utils/jwt");

async function run() {
  console.log("==================================================================");
  console.log("SANAVIYYA EXAM FEE PAYMENT CHECK & RECONCILIATION TEST SUITE");
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
    parentProfiles: [],
    academicYears: [],
    exams: [],
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

    // 1. Create Academic Year
    const academicYear = await AcademicYear.create({
      yearName: `AY-${timestamp}`,
      yearCode: `AY${timestamp}`.slice(0, 10).toUpperCase(),
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-03-31"),
      isCurrent: true,
      status: "ACTIVE",
    });
    cleanup.academicYears.push(academicYear._id);

    // 2. Create Exam
    const exam = await Exam.create({
      title: `Term 1 Sanaviyya Board Exam ${timestamp}`,
      code: `EXAM-${timestamp}`.slice(0, 15).toUpperCase(),
      academicYearId: academicYear._id,
      startDate: new Date("2026-11-01"),
      endDate: new Date("2026-11-15"),
      status: "SCHEDULED",
    });
    cleanup.exams.push(exam._id);

    // 3. Admin User
    const adminUser = await User.create({
      name: "Admin User",
      email: `admin_${timestamp}@sanaviyya.edu`,
      passwordHash: "dummyhash",
      role: "ADMIN",
      status: "ACTIVE",
      isDeleted: false,
    });
    cleanup.users.push(adminUser._id);
    const adminToken = generateToken({
      userId: adminUser._id.toString(),
      email: adminUser.email,
      role: adminUser.role,
    });

    // 4. Student User 1 (The candidate)
    const studentUser1 = await User.create({
      name: "Student Candidate One",
      email: `student1_${timestamp}@sanaviyya.edu`,
      passwordHash: "dummyhash",
      role: "STUDENT",
      status: "ACTIVE",
      isDeleted: false,
    });
    cleanup.users.push(studentUser1._id);

    const studentProfile1 = await StudentProfile.create({
      userId: studentUser1._id,
      nameEnglish: "Student Candidate One",
      fatherName: "Father One",
      motherName: "Mother One",
      registrationNumber: `REG-S1-${timestamp}`.slice(0, 16),
      dateOfBirth: new Date("2008-01-01"),
      admissionYear: 2024,
      academicYearId: academicYear._id,
      status: "ACTIVE",
      isDeleted: false,
    });
    cleanup.studentProfiles.push(studentProfile1._id);

    const studentToken1 = generateToken({
      userId: studentUser1._id.toString(),
      email: studentUser1.email,
      role: studentUser1.role,
    });

    // 5. Parent User 1 (Linked to Student 1)
    const parentUser1 = await User.create({
      name: "Parent Guardian One",
      email: `parent1_${timestamp}@sanaviyya.edu`,
      passwordHash: "dummyhash",
      role: "PARENT",
      status: "EMAIL_VERIFIED",
      isDeleted: false,
    });
    cleanup.users.push(parentUser1._id);

    const parentProfile1 = await ParentProfile.create({
      userId: parentUser1._id,
      name: "Parent Guardian One",
      email: parentUser1.email,
      mobile: "9876543210",
      relationship: "FATHER",
      studentIds: [studentProfile1._id],
      isDeleted: false,
    });
    cleanup.parentProfiles.push(parentProfile1._id);

    // Link parent to student profile
    studentProfile1.parentUserId = parentUser1._id;
    await studentProfile1.save();

    const parentToken1 = generateToken({
      userId: parentUser1._id.toString(),
      email: parentUser1.email,
      role: parentUser1.role,
    });

    // 6. Student User 2 (Unrelated candidate for IDOR testing)
    const studentUser2 = await User.create({
      name: "Student Candidate Two",
      email: `student2_${timestamp}@sanaviyya.edu`,
      passwordHash: "dummyhash",
      role: "STUDENT",
      status: "ACTIVE",
      isDeleted: false,
    });
    cleanup.users.push(studentUser2._id);

    const studentProfile2 = await StudentProfile.create({
      userId: studentUser2._id,
      nameEnglish: "Student Candidate Two",
      fatherName: "Father Two",
      motherName: "Mother Two",
      registrationNumber: `REG-S2-${timestamp}`.slice(0, 16),
      dateOfBirth: new Date("2008-05-05"),
      admissionYear: 2024,
      academicYearId: academicYear._id,
      status: "ACTIVE",
      isDeleted: false,
    });
    cleanup.studentProfiles.push(studentProfile2._id);

    const studentToken2 = generateToken({
      userId: studentUser2._id.toString(),
      email: studentUser2.email,
      role: studentUser2.role,
    });

    console.log("[4/4] Running tests...\n");

    // TEST 1: Register Student 1 for the Exam
    console.log("TEST 1: Register Student 1 for Examination");
    const regRes = await apiRequest("/exams/exam-registrations", {
      method: "POST",
      token: studentToken1,
      body: {
        examId: exam._id.toString(),
      },
    });
    assert(regRes.status === 201 && regRes.body.success, "Student 1 successfully registered for exam");
    const registrationId = regRes.body.data._id;
    cleanup.examRegistrations.push(registrationId);
    assert(regRes.body.data.registrationStatus === "REGISTERED", "Initial status is REGISTERED (hall ticket withheld pending fee)");

    // TEST 2: Check initial fee payment status for unpaid registration
    console.log("\nTEST 2: Check Fee Payment on Unpaid Registration");
    const check1 = await apiRequest(`/exams/exam-registrations/${registrationId}/payment`, {
      token: studentToken1,
    });
    assert(check1.status === 200, "Payment check endpoint returns 200");
    assert(check1.body.data.isPaid === false, "isPaid is false");
    assert(check1.body.data.status === "UNPAID", "Payment status is UNPAID");
    assert(check1.body.data.payment === null, "No payment record linked");

    // TEST 3: Check via alias /payment-check endpoint
    console.log("\nTEST 3: Check Fee Payment via /payment-check alias endpoint");
    const checkAlias = await apiRequest(`/exams/exam-registrations/${registrationId}/payment-check`, {
      token: studentToken1,
    });
    assert(checkAlias.status === 200, "Alias /payment-check returns 200");
    assert(checkAlias.body.data.status === "UNPAID", "Alias correctly returns UNPAID status");

    // TEST 4: Get Exam Registration by ID
    console.log("\nTEST 4: Get Exam Registration by ID");
    const regById = await apiRequest(`/exams/exam-registrations/${registrationId}`, {
      token: studentToken1,
    });
    assert(regById.status === 200 && regById.body.success, "Retrieved exam registration by ID");
    assert(regById.body.data.rollNumber != null, "Roll number is present");

    // TEST 5: IDOR Protection - Student 2 attempting to view Student 1's registration
    console.log("\nTEST 5: IDOR Protection - Student 2 Cannot View Student 1's Registration");
    const idorView = await apiRequest(`/exams/exam-registrations/${registrationId}`, {
      token: studentToken2,
    });
    assert(idorView.status === 403, "Student 2 blocked with 403 Forbidden");

    // TEST 6: IDOR Protection - Student 2 attempting to check Student 1's fee payment
    console.log("\nTEST 6: IDOR Protection - Student 2 Cannot Check Student 1's Fee Payment");
    const idorCheck = await apiRequest(`/exams/exam-registrations/${registrationId}/payment`, {
      token: studentToken2,
    });
    assert(idorCheck.status === 403, "Student 2 fee check blocked with 403 Forbidden");

    // TEST 7: Parent 1 Authorized Access to Child's Registration & Fee Payment
    console.log("\nTEST 7: Parent 1 Authorized Access to Linked Student's Registration");
    const parentView = await apiRequest(`/exams/exam-registrations/${registrationId}`, {
      token: parentToken1,
    });
    assert(parentView.status === 200, "Parent 1 successfully accesses child's registration");

    const parentCheck = await apiRequest(`/exams/exam-registrations/${registrationId}/payment`, {
      token: parentToken1,
    });
    assert(parentCheck.status === 200, "Parent 1 successfully checks child's exam fee payment");
    assert(parentCheck.body.data.status === "UNPAID", "Parent sees accurate UNPAID status");

    // TEST 8: Pending Payment Record Check
    console.log("\nTEST 8: Pending Payment Record Check");
    const pendingTxnId = `TXN-PENDING-${timestamp}`;
    const pendingPayment = await Payment.create({
      userId: studentUser1._id,
      paymentType: "EXAM_FEE",
      examRegistrationId: registrationId,
      amount: 450,
      currency: "INR",
      gateway: "BANK_TRANSFER",
      transactionId: pendingTxnId,
      status: "PENDING",
    });
    cleanup.payments.push(pendingPayment._id);

    const checkPending = await apiRequest(`/exams/exam-registrations/${registrationId}/payment`, {
      token: studentToken1,
    });
    assert(checkPending.status === 200, "Payment check with pending payment returns 200");
    assert(checkPending.body.data.isPaid === false, "isPaid is false while pending");
    assert(checkPending.body.data.status === "PENDING", "Status is correctly reported as PENDING");
    assert(checkPending.body.data.payment.transactionId === pendingTxnId, "Pending payment transaction is returned");

    // TEST 9: Admin Verification of Offline Bank Transfer Payment
    console.log("\nTEST 9: Admin Verification of Offline Payment (Auto-Issuing Hall Ticket)");
    const verifyRes = await apiRequest("/payments/verify", {
      method: "POST",
      token: adminToken,
      body: {
        transactionId: pendingTxnId,
        gateway: "BANK_TRANSFER",
      },
    });
    assert(verifyRes.status === 200 && verifyRes.body.success, "Admin successfully verified offline bank transfer payment");

    // TEST 10: Fee Payment Check after Successful Verification
    console.log("\nTEST 10: Re-check Fee Payment after Verification");
    const checkPaid = await apiRequest(`/exams/exam-registrations/${registrationId}/payment`, {
      token: studentToken1,
    });
    assert(checkPaid.status === 200, "Payment check returns 200");
    assert(checkPaid.body.data.isPaid === true, "isPaid is now true");
    assert(checkPaid.body.data.status === "PAID", "Status is confirmed PAID");
    assert(checkPaid.body.data.registration.registrationStatus === "HALL_TICKET_ISSUED", "Registration status auto-updated to HALL_TICKET_ISSUED");

    // TEST 11: Auto-Reconciliation of Unlinked Successful Payment
    console.log("\nTEST 11: Auto-Reconciliation of Unlinked Successful Payment");
    // Create a 2nd exam registration for Student 2
    const reg2 = await ExamRegistration.create({
      examId: exam._id,
      studentId: studentProfile2._id,
      rollNumber: `ROLL-S2-${timestamp}`,
      registrationStatus: "REGISTERED", // Unlinked and still REGISTERED
    });
    cleanup.examRegistrations.push(reg2._id);

    // Directly insert an unlinked SUCCESS payment record for reg2
    const reconTxnId = `TXN-RECON-${timestamp}`;
    const reconPayment = await Payment.create({
      userId: studentUser2._id,
      paymentType: "EXAM_FEE",
      examRegistrationId: reg2._id,
      amount: 500,
      currency: "INR",
      gateway: "MANUAL",
      transactionId: reconTxnId,
      status: "SUCCESS",
      paidAt: new Date(),
    });
    cleanup.payments.push(reconPayment._id);

    // Call payment check endpoint for reg2
    const reconCheck = await apiRequest(`/exams/exam-registrations/${reg2._id}/payment`, {
      token: studentToken2,
    });
    assert(reconCheck.status === 200, "Reconciliation check returns 200");
    assert(reconCheck.body.data.isPaid === true, "Reconciliation detected successful payment");
    assert(reconCheck.body.data.status === "PAID", "Status reconciled to PAID");
    assert(reconCheck.body.data.registration.registrationStatus === "HALL_TICKET_ISSUED", "Registration status updated to HALL_TICKET_ISSUED");
    assert(reconCheck.body.data.registration.paymentId.toString() === reconPayment._id.toString(), "paymentId is linked to the registration");

    // TEST 12: Admin Can Check Any Student's Exam Fee Payment
    console.log("\nTEST 12: Admin Can Check Any Student's Exam Fee Payment");
    const adminCheck = await apiRequest(`/exams/exam-registrations/${reg2._id}/payment`, {
      token: adminToken,
    });
    assert(adminCheck.status === 200, "Admin successfully checks fee payment for reg2");
    assert(adminCheck.body.data.isPaid === true, "Admin sees confirmed payment");

    console.log("\n==================================================================");
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================================");

  } catch (error) {
    console.error("Test execution encountered an error:", error);
    failed++;
  } finally {
    console.log("Cleaning up test records...");
    await Promise.allSettled([
      cleanup.payments.length ? Payment.deleteMany({ _id: { $in: cleanup.payments } }) : null,
      cleanup.examRegistrations.length ? ExamRegistration.deleteMany({ _id: { $in: cleanup.examRegistrations } }) : null,
      cleanup.exams.length ? Exam.deleteMany({ _id: { $in: cleanup.exams } }) : null,
      cleanup.studentProfiles.length ? StudentProfile.deleteMany({ _id: { $in: cleanup.studentProfiles } }) : null,
      cleanup.parentProfiles.length ? ParentProfile.deleteMany({ _id: { $in: cleanup.parentProfiles } }) : null,
      cleanup.users.length ? User.deleteMany({ _id: { $in: cleanup.users } }) : null,
      cleanup.academicYears.length ? AcademicYear.deleteMany({ _id: { $in: cleanup.academicYears } }) : null,
    ]);
    await server.close();
    await mongoose.disconnect();
    console.log("Test cleanup completed. Disconnected from DB.");
    process.exit(failed > 0 ? 1 : 0);
  }
}

run();
