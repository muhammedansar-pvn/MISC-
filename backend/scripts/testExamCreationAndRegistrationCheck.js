process.env.NODE_ENV = "test";
const mongoose = require("mongoose");
const http = require("http");
const env = require("../src/config/env");
const app = require("../src/app");
const User = require("../src/modules/users/user.model");
const StudentProfile = require("../src/modules/students/student.model");
const AcademicYear = require("../src/modules/academics/academic-year.model");
const Exam = require("../src/modules/exams/exam.model");
const ExamRegistration = require("../src/modules/exams/exam-registration.model");
const Payment = require("../src/modules/payments/payment.model");
const { generateToken } = require("../src/shared/utils/jwt");

async function run() {
  console.log("==================================================================");
  console.log("SANAVIYYA EXAM CREATION & EXAM REGISTRATION CHECK TEST SUITE");
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
    console.log("[3/4] Establishing fixtures...");

    // Academic Year
    const academicYear = await AcademicYear.create({
      yearName: `AY-${timestamp}`,
      yearCode: `AY${timestamp}`.slice(0, 10).toUpperCase(),
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-03-31"),
      isCurrent: true,
      status: "ACTIVE",
    });
    cleanup.academicYears.push(academicYear._id);

    // Admin
    const adminUser = await User.create({
      name: "Super Admin",
      email: `admin_${timestamp}@sanaviyya.edu`,
      passwordHash: "hash",
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

    // Active Student
    const studentUser = await User.create({
      name: "Zaid Student",
      email: `zaid_${timestamp}@sanaviyya.edu`,
      passwordHash: "hash",
      role: "STUDENT",
      status: "ACTIVE",
      isDeleted: false,
    });
    cleanup.users.push(studentUser._id);
    const studentProfile = await StudentProfile.create({
      userId: studentUser._id,
      nameEnglish: "Zaid Student",
      fatherName: "Abdullah",
      motherName: "Amina",
      registrationNumber: `REG-${timestamp}`.slice(0, 16),
      dateOfBirth: new Date("2008-01-01"),
      admissionYear: 2024,
      academicYearId: academicYear._id,
      status: "ACTIVE",
      isDeleted: false,
    });
    cleanup.studentProfiles.push(studentProfile._id);
    const studentToken = generateToken({
      userId: studentUser._id.toString(),
      email: studentUser.email,
      role: studentUser.role,
    });

    // Inactive / Suspended Student
    const suspendedUser = await User.create({
      name: "Suspended Student",
      email: `suspended_${timestamp}@sanaviyya.edu`,
      passwordHash: "hash",
      role: "STUDENT",
      status: "ACTIVE",
      isDeleted: false,
    });
    cleanup.users.push(suspendedUser._id);
    const suspendedProfile = await StudentProfile.create({
      userId: suspendedUser._id,
      nameEnglish: "Suspended Student",
      fatherName: "Father",
      motherName: "Mother",
      registrationNumber: `SUSP-${timestamp}`.slice(0, 16),
      dateOfBirth: new Date("2008-02-02"),
      admissionYear: 2024,
      academicYearId: academicYear._id,
      status: "SUSPENDED",
      isDeleted: false,
    });
    cleanup.studentProfiles.push(suspendedProfile._id);
    const suspendedToken = generateToken({
      userId: suspendedUser._id.toString(),
      email: suspendedUser.email,
      role: suspendedUser.role,
    });

    console.log("[4/4] Executing test suite...\n");

    // ==========================================
    // SECTION A: EXAM CREATION CHECKS
    // ==========================================
    console.log("SECTION A: EXAM CREATION CHECKS");

    // Test A1: Valid Exam Creation with title
    console.log("\nTest A1: Create exam with title and valid metadata");
    const examPayload1 = {
      title: `Term 1 Examination ${timestamp}`,
      code: `EX-${timestamp}`.slice(0, 12).toUpperCase(),
      academicYearId: academicYear._id.toString(),
      startDate: new Date("2026-11-01").toISOString(),
      endDate: new Date("2026-11-15").toISOString(),
      term: "FIRST_TERM",
      examType: "ANNUAL",
      fee: 450,
      status: "SCHEDULED",
    };
    const resA1 = await apiRequest("/exams/exams", {
      method: "POST",
      token: adminToken,
      body: examPayload1,
    });
    assert(resA1.status === 201 && resA1.body.success, "Exam created successfully with title");
    assert(resA1.body.data.fee === 450, "Exam fee persisted");
    assert(resA1.body.data.name === examPayload1.title, "Exam title synchronized to name");
    const examId1 = resA1.body.data._id;
    cleanup.exams.push(examId1);

    // Test A2: Valid Exam Creation with name instead of title
    console.log("\nTest A2: Create exam using name field (frontend backward compatibility)");
    const examPayload2 = {
      name: `Mid Term Assessment ${timestamp}`,
      code: `MID-${timestamp}`.slice(0, 12).toUpperCase(),
      academicYearId: academicYear._id.toString(),
      startDate: new Date("2026-12-01").toISOString(),
      endDate: new Date("2026-12-10").toISOString(),
      status: "SCHEDULED",
    };
    const resA2 = await apiRequest("/exams/exams", {
      method: "POST",
      token: adminToken,
      body: examPayload2,
    });
    assert(resA2.status === 201 && resA2.body.success, "Exam created successfully with name field");
    assert(resA2.body.data.title === examPayload2.name, "Exam name synchronized to title");
    const examId2 = resA2.body.data._id;
    cleanup.exams.push(examId2);

    // Test A3: Rejection when End Date is before Start Date
    console.log("\nTest A3: Validation fails when endDate <= startDate");
    const resA3 = await apiRequest("/exams/exams", {
      method: "POST",
      token: adminToken,
      body: {
        title: "Invalid Date Range Exam",
        code: `INV-${timestamp}`.slice(0, 12).toUpperCase(),
        academicYearId: academicYear._id.toString(),
        startDate: new Date("2026-11-15").toISOString(),
        endDate: new Date("2026-11-10").toISOString(), // Invalid
        status: "SCHEDULED",
      },
    });
    assert(resA3.status === 400, "Rejected invalid date range with 400 Bad Request");

    // Test A4: Rejection when duplicate exam code is submitted
    console.log("\nTest A4: Duplicate exam code rejected");
    const resA4 = await apiRequest("/exams/exams", {
      method: "POST",
      token: adminToken,
      body: {
        title: "Duplicate Code Exam",
        code: examPayload1.code, // already used
        academicYearId: academicYear._id.toString(),
        startDate: new Date("2026-11-01").toISOString(),
        endDate: new Date("2026-11-15").toISOString(),
        status: "SCHEDULED",
      },
    });
    assert(resA4.status === 400 || resA4.status === 409, "Rejected duplicate exam code");

    // ==========================================
    // SECTION B: EXAM REGISTRATION CHECKS
    // ==========================================
    console.log("\nSECTION B: EXAM REGISTRATION CHECKS");

    // Test B1: Register student for valid scheduled exam
    console.log("\nTest B1: Register active student for exam");
    const resB1 = await apiRequest("/exams/exam-registrations", {
      method: "POST",
      token: studentToken,
      body: {
        examId: examId1,
      },
    });
    assert(resB1.status === 201 && resB1.body.success, "Student candidate successfully registered");
    const regId1 = resB1.body.data._id;
    cleanup.examRegistrations.push(regId1);
    assert(resB1.body.data.registrationStatus === "REGISTERED", "Registration status is REGISTERED");
    assert(resB1.body.data.rollNumber.startsWith("ROLL-"), "Auto-generated institutional roll number assigned");

    // Test B2: Duplicate registration prevention
    console.log("\nTest B2: Prevent duplicate registration for the same student & exam");
    const resB2 = await apiRequest("/exams/exam-registrations", {
      method: "POST",
      token: studentToken,
      body: {
        examId: examId1,
      },
    });
    assert(resB2.status === 409, "Duplicate registration rejected with 409 Conflict");

    // Test B3: Rejection when student is SUSPENDED or INACTIVE
    console.log("\nTest B3: Prevent registration of suspended student");
    const resB3 = await apiRequest("/exams/exam-registrations", {
      method: "POST",
      token: adminToken,
      body: {
        examId: examId1,
        studentId: suspendedProfile._id.toString(),
      },
    });
    assert(resB3.status === 400, "Suspended student registration rejected with 400 Bad Request");

    // Test B4: Rejection when registering for completed exam
    console.log("\nTest B4: Prevent registration for COMPLETED exam");
    const completedExam = await Exam.create({
      title: `Completed Session ${timestamp}`,
      code: `COMP-${timestamp}`.slice(0, 12).toUpperCase(),
      academicYearId: academicYear._id,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-01-10"),
      status: "COMPLETED",
    });
    cleanup.exams.push(completedExam._id);

    const resB4 = await apiRequest("/exams/exam-registrations", {
      method: "POST",
      token: studentToken,
      body: {
        examId: completedExam._id.toString(),
      },
    });
    assert(resB4.status === 400, "Registration for completed exam rejected with 400 Bad Request");

    // Test B5: Rejection when examId does not exist
    console.log("\nTest B5: Non-existent examId rejected");
    const fakeId = new mongoose.Types.ObjectId().toString();
    const resB5 = await apiRequest("/exams/exam-registrations", {
      method: "POST",
      token: studentToken,
      body: {
        examId: fakeId,
      },
    });
    assert(resB5.status === 404, "Non-existent exam rejected with 404 Not Found");

    // ==========================================
    // SECTION C: REGISTRATION & FEE AUDIT CHECKS
    // ==========================================
    console.log("\nSECTION C: REGISTRATION & FEE AUDIT CHECKS");

    // Test C1: Check registration payment status
    console.log("\nTest C1: Check payment status for unpaid registration");
    const resC1 = await apiRequest(`/exams/exam-registrations/${regId1}/payment`, {
      token: studentToken,
    });
    assert(resC1.status === 200, "Payment check endpoint returns 200");
    assert(resC1.body.data.isPaid === false, "isPaid is false");
    assert(resC1.body.data.status === "UNPAID", "Status is UNPAID");

    // Test C2: Fee Payment Reconciliation & Hall Ticket Issuance
    console.log("\nTest C2: Create payment and verify auto-reconciliation");
    const paymentRecord = await Payment.create({
      userId: studentUser._id,
      paymentType: "EXAM_FEE",
      examRegistrationId: regId1,
      amount: 450,
      currency: "INR",
      gateway: "MANUAL",
      transactionId: `TXN-AUDIT-${timestamp}`,
      status: "SUCCESS",
      paidAt: new Date(),
    });
    cleanup.payments.push(paymentRecord._id);

    const resC2 = await apiRequest(`/exams/exam-registrations/${regId1}/payment`, {
      token: studentToken,
    });
    assert(resC2.status === 200, "Reconciliation check returns 200");
    assert(resC2.body.data.isPaid === true, "isPaid is now true");
    assert(resC2.body.data.status === "PAID", "Status confirmed PAID");
    assert(resC2.body.data.registration.registrationStatus === "HALL_TICKET_ISSUED", "Registration status auto-transitioned to HALL_TICKET_ISSUED");

    // Test C3: Admin query of all registrations includes payment and student info
    console.log("\nTest C3: Admin retrieves registrations with populated payment & candidate data");
    const resC3 = await apiRequest(`/exams/exam-registrations?examId=${examId1}`, {
      token: adminToken,
    });
    assert(resC3.status === 200, "Admin retrieved registrations");
    assert(Array.isArray(resC3.body.data) && resC3.body.data.length >= 1, "Registrations list returned");
    const foundReg = resC3.body.data.find((r) => r._id === regId1);
    assert(foundReg != null, "Created registration found in list");
    assert(foundReg.paymentId != null && foundReg.paymentId.status === "SUCCESS", "Payment data populated in registration");
    assert(foundReg.studentId != null && foundReg.studentId.registrationNumber != null, "Student candidate data populated");

    console.log("\n==================================================================");
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================================");

  } catch (error) {
    console.error("Test execution failed with exception:", error);
    failed++;
  } finally {
    console.log("Cleaning up test records...");
    await Promise.allSettled([
      cleanup.payments.length ? Payment.deleteMany({ _id: { $in: cleanup.payments } }) : null,
      cleanup.examRegistrations.length ? ExamRegistration.deleteMany({ _id: { $in: cleanup.examRegistrations } }) : null,
      cleanup.exams.length ? Exam.deleteMany({ _id: { $in: cleanup.exams } }) : null,
      cleanup.studentProfiles.length ? StudentProfile.deleteMany({ _id: { $in: cleanup.studentProfiles } }) : null,
      cleanup.users.length ? User.deleteMany({ _id: { $in: cleanup.users } }) : null,
      cleanup.academicYears.length ? AcademicYear.deleteMany({ _id: { $in: cleanup.academicYears } }) : null,
    ]);
    await server.close();
    await mongoose.disconnect();
    console.log("Cleanup complete. DB disconnected.");
    process.exit(failed > 0 ? 1 : 0);
  }
}

run();
