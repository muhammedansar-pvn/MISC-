process.env.NODE_ENV = "test";
const mongoose = require("mongoose");
const http = require("http");
const crypto = require("crypto");
const env = require("../src/config/env");
const app = require("../src/app");
const User = require("../src/modules/users/user.model");
const StudentProfile = require("../src/modules/students/student.model");
const ParentProfile = require("../src/modules/parents/parent.model");
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
  console.log("SANAVIYYA STUDENT EXAM REGISTRATION COMPLETE TEST SUITE");
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

    // 1. Academic Year
    const academicYear = await AcademicYear.create({
      yearName: `AY-${timestamp}`,
      yearCode: `AY${timestamp}`.slice(0, 10),
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-03-31"),
      isCurrent: true,
      status: "ACTIVE",
    });
    cleanup.academicYears.push(academicYear._id);

    // 2. Classes (Class A & Class B)
    const classA = await ClassModel.create({
      name: `Class 10A-${timestamp}`,
      className: "10A",
      code: `C10A-${timestamp}`.slice(0, 10).toUpperCase(),
      academicYearId: academicYear._id,
      capacity: 40,
      status: "ACTIVE",
    });
    cleanup.classes.push(classA._id);

    const classB = await ClassModel.create({
      name: `Class 10B-${timestamp}`,
      className: "10B",
      code: `C10B-${timestamp}`.slice(0, 10).toUpperCase(),
      academicYearId: academicYear._id,
      capacity: 40,
      status: "ACTIVE",
    });
    cleanup.classes.push(classB._id);

    // 3. Subject
    const subject = await Subject.create({
      name: `Islamic Jurisprudence ${timestamp}`,
      subjectName: "Islamic Jurisprudence",
      code: `FIQH-${timestamp}`.slice(0, 10).toUpperCase(),
      subjectCode: `FIQH${timestamp}`.slice(0, 8),
      academicYearId: academicYear._id,
      category: "ISLAMIC_STUDIES",
      status: "ACTIVE",
    });
    cleanup.subjects.push(subject._id);

    // 4. Admin User
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

    // 5. Student 1 (in Class A)
    const studentUser1 = await User.create({
      name: "Ahmad Ali",
      email: `ahmad_${timestamp}@sanaviyya.edu`,
      passwordHash: "hash",
      role: "STUDENT",
      status: "ACTIVE",
      isDeleted: false,
    });
    cleanup.users.push(studentUser1._id);

    const studentProfile1 = await StudentProfile.create({
      userId: studentUser1._id,
      nameEnglish: "Ahmad Ali",
      fatherName: "Ali",
      motherName: "Fatima",
      registrationNumber: `REG-A-${timestamp}`.slice(0, 16),
      dateOfBirth: new Date("2008-01-01"),
      admissionYear: 2024,
      academicYearId: academicYear._id,
      classId: classA._id,
      status: "ACTIVE",
      isDeleted: false,
    });
    cleanup.studentProfiles.push(studentProfile1._id);

    const studentToken1 = generateToken({
      userId: studentUser1._id.toString(),
      email: studentUser1.email,
      role: studentUser1.role,
      studentId: studentProfile1._id.toString(),
    });

    // 6. Student 2 (in Class B)
    const studentUser2 = await User.create({
      name: "Bilal Hassan",
      email: `bilal_${timestamp}@sanaviyya.edu`,
      passwordHash: "hash",
      role: "STUDENT",
      status: "ACTIVE",
      isDeleted: false,
    });
    cleanup.users.push(studentUser2._id);

    const studentProfile2 = await StudentProfile.create({
      userId: studentUser2._id,
      nameEnglish: "Bilal Hassan",
      fatherName: "Hassan",
      motherName: "Amina",
      registrationNumber: `REG-B-${timestamp}`.slice(0, 16),
      dateOfBirth: new Date("2008-05-15"),
      admissionYear: 2024,
      academicYearId: academicYear._id,
      classId: classB._id,
      status: "ACTIVE",
      isDeleted: false,
    });
    cleanup.studentProfiles.push(studentProfile2._id);

    const studentToken2 = generateToken({
      userId: studentUser2._id.toString(),
      email: studentUser2.email,
      role: studentUser2.role,
      studentId: studentProfile2._id.toString(),
    });

    // 7. Suspended Student (in Class A)
    const suspendedUser = await User.create({
      name: "Suspended Student",
      email: `susp_${timestamp}@sanaviyya.edu`,
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
      classId: classA._id,
      status: "SUSPENDED",
      isDeleted: false,
    });
    cleanup.studentProfiles.push(suspendedProfile._id);

    const suspendedToken = generateToken({
      userId: suspendedUser._id.toString(),
      email: suspendedUser.email,
      role: suspendedUser.role,
      studentId: suspendedProfile._id.toString(),
    });

    // 8. Parent 1 (Linked to Student 1)
    const parentUser1 = await User.create({
      name: "Ali Parent",
      email: `parent1_${timestamp}@sanaviyya.edu`,
      passwordHash: "hash",
      role: "PARENT",
      status: "ACTIVE",
      emailVerified: true,
      isDeleted: false,
    });
    cleanup.users.push(parentUser1._id);

    const parentProfile1 = await ParentProfile.create({
      userId: parentUser1._id,
      name: "Ali Parent",
      contactNumber: "9876543210",
      relationType: "FATHER",
      studentIds: [studentProfile1._id],
      status: "ACTIVE",
      isDeleted: false,
    });
    cleanup.parentProfiles.push(parentProfile1._id);

    const parentToken1 = generateToken({
      userId: parentUser1._id.toString(),
      email: parentUser1.email,
      role: parentUser1.role,
    });

    // 9. Parent 2 (Linked to Student 2, NOT Student 1)
    const parentUser2 = await User.create({
      name: "Hassan Parent",
      email: `parent2_${timestamp}@sanaviyya.edu`,
      passwordHash: "hash",
      role: "PARENT",
      status: "ACTIVE",
      emailVerified: true,
      isDeleted: false,
    });
    cleanup.users.push(parentUser2._id);

    const parentProfile2 = await ParentProfile.create({
      userId: parentUser2._id,
      name: "Hassan Parent",
      contactNumber: "9876543211",
      relationType: "FATHER",
      studentIds: [studentProfile2._id],
      status: "ACTIVE",
      isDeleted: false,
    });
    cleanup.parentProfiles.push(parentProfile2._id);

    const parentToken2 = generateToken({
      userId: parentUser2._id.toString(),
      email: parentUser2.email,
      role: parentUser2.role,
    });

    // 10. Exam Fixtures
    const now = new Date();
    const pastDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
    const futureDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // in 10 days
    const farFutureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // in 30 days
    const futureOpenDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // in 5 days

    // Exam 1: Open for Class A, fee ₹500
    const exam1 = await Exam.create({
      title: `Annual Exam Class A ${timestamp}`,
      code: `EX1-${timestamp}`.slice(0, 12).toUpperCase(),
      academicYearId: academicYear._id,
      eligibleClassIds: [classA._id],
      startDate: farFutureDate,
      endDate: new Date(farFutureDate.getTime() + 10 * 24 * 60 * 60 * 1000),
      registrationStartDate: pastDate,
      registrationEndDate: futureDate,
      fee: 500,
      term: "ANNUAL",
      examType: "ANNUAL",
      status: "SCHEDULED",
    });
    cleanup.exams.push(exam1._id);

    // Schedule for Exam 1 & Class A
    const sched1 = await ExamSchedule.create({
      examId: exam1._id,
      classId: classA._id,
      subjectId: subject._id,
      academicYearId: academicYear._id,
      examDate: farFutureDate,
      startTime: "09:30 AM",
      endTime: "12:30 PM",
      maxMarks: 100,
      passMarks: 40,
      status: "SCHEDULED",
    });
    cleanup.examSchedules.push(sched1._id);

    // Exam 2: Registration closed (registrationEndDate in past)
    const exam2 = await Exam.create({
      title: `Closed Registration Exam ${timestamp}`,
      code: `EX2-${timestamp}`.slice(0, 12).toUpperCase(),
      academicYearId: academicYear._id,
      eligibleClassIds: [classA._id],
      startDate: farFutureDate,
      endDate: new Date(farFutureDate.getTime() + 10 * 24 * 60 * 60 * 1000),
      registrationStartDate: new Date(pastDate.getTime() - 5 * 24 * 60 * 60 * 1000),
      registrationEndDate: pastDate,
      fee: 300,
      status: "SCHEDULED",
    });
    cleanup.exams.push(exam2._id);

    // Exam 3: Registration opening in future
    const exam3 = await Exam.create({
      title: `Upcoming Registration Exam ${timestamp}`,
      code: `EX3-${timestamp}`.slice(0, 12).toUpperCase(),
      academicYearId: academicYear._id,
      eligibleClassIds: [classA._id],
      startDate: farFutureDate,
      endDate: new Date(farFutureDate.getTime() + 10 * 24 * 60 * 60 * 1000),
      registrationStartDate: futureOpenDate,
      registrationEndDate: futureDate,
      fee: 350,
      status: "SCHEDULED",
    });
    cleanup.exams.push(exam3._id);

    // Exam 4: Restricted to Class B only
    const exam4 = await Exam.create({
      title: `Class B Special Exam ${timestamp}`,
      code: `EX4-${timestamp}`.slice(0, 12).toUpperCase(),
      academicYearId: academicYear._id,
      eligibleClassIds: [classB._id],
      startDate: farFutureDate,
      endDate: new Date(farFutureDate.getTime() + 10 * 24 * 60 * 60 * 1000),
      registrationStartDate: pastDate,
      registrationEndDate: futureDate,
      fee: 400,
      status: "SCHEDULED",
    });
    cleanup.exams.push(exam4._id);

    // Exam 5: Free Exam (₹0 fee) for Class A
    const exam5 = await Exam.create({
      title: `Free Academic Assessment ${timestamp}`,
      code: `EX5-${timestamp}`.slice(0, 12).toUpperCase(),
      academicYearId: academicYear._id,
      eligibleClassIds: [classA._id],
      startDate: farFutureDate,
      endDate: new Date(farFutureDate.getTime() + 10 * 24 * 60 * 60 * 1000),
      registrationStartDate: pastDate,
      registrationEndDate: futureDate,
      fee: 0,
      status: "SCHEDULED",
    });
    cleanup.exams.push(exam5._id);

    // Exam 6: Completed Exam
    const exam6 = await Exam.create({
      title: `Past Completed Exam ${timestamp}`,
      code: `EX6-${timestamp}`.slice(0, 12).toUpperCase(),
      academicYearId: academicYear._id,
      eligibleClassIds: [classA._id],
      startDate: pastDate,
      endDate: new Date(pastDate.getTime() + 5 * 24 * 60 * 60 * 1000),
      fee: 250,
      status: "COMPLETED",
    });
    cleanup.exams.push(exam6._id);

    // Exam 7: Draft Exam
    const exam7 = await Exam.create({
      title: `Draft Unreleased Exam ${timestamp}`,
      code: `EX7-${timestamp}`.slice(0, 12).toUpperCase(),
      academicYearId: academicYear._id,
      eligibleClassIds: [classA._id],
      startDate: farFutureDate,
      endDate: new Date(farFutureDate.getTime() + 10 * 24 * 60 * 60 * 1000),
      fee: 200,
      status: "DRAFT",
    });
    cleanup.exams.push(exam7._id);

    console.log("[4/4] Fixtures ready. Running test cases...\n");

    // ==========================================
    // TEST 1: Browse Available Exams for Student 1
    // ==========================================
    console.log("TEST 1: Student 1 browses available examinations");
    const res1 = await apiRequest("/exams/available-for-registration", {
      token: studentToken1,
    });
    assert(res1.status === 200 && res1.body.success, "Endpoint returns 200 OK");
    const available1 = res1.body.data;
    assert(Array.isArray(available1), "Returns an array of available exams");

    const foundExam1 = available1.find((e) => e._id.toString() === exam1._id.toString());
    const foundExam4 = available1.find((e) => e._id.toString() === exam4._id.toString());
    const foundExam6 = available1.find((e) => e._id.toString() === exam6._id.toString());
    const foundExam7 = available1.find((e) => e._id.toString() === exam7._id.toString());

    assert(foundExam1 && foundExam1.isRegistrationOpen === true, "Exam 1 is open for registration");
    assert(foundExam1.fee === 500, "Exam 1 fee is correctly reflected as ₹500");
    assert(foundExam1.schedulesCount === 1, "Exam 1 schedules count populated");
    assert(!foundExam4, "Exam 4 (exclusive to Class B) is excluded for Student 1");
    assert(!foundExam6, "Exam 6 (COMPLETED) is omitted");
    assert(!foundExam7, "Exam 7 (DRAFT) is omitted");

    const foundExam2 = available1.find((e) => e._id.toString() === exam2._id.toString());
    assert(foundExam2 && foundExam2.isRegistrationOpen === false, "Exam 2 registration is flagged as closed");

    const foundExam3 = available1.find((e) => e._id.toString() === exam3._id.toString());
    assert(foundExam3 && foundExam3.isRegistrationOpen === false, "Exam 3 registration is not yet open");

    // ==========================================
    // TEST 2: Student 1 Registers for Eligible Exam 1
    // ==========================================
    console.log("\nTEST 2: Student 1 registers for Exam 1");
    const res2 = await apiRequest("/exams/exam-registrations", {
      method: "POST",
      token: studentToken1,
      body: { examId: exam1._id.toString() },
    });
    assert(res2.status === 201 && res2.body.success, "Registration created with 201 Created");
    assert(res2.body.data.registrationStatus === "REGISTERED", "Initial status is REGISTERED (hall ticket withheld pending fee)");
    assert(res2.body.data.rollNumber.startsWith("ROLL-"), "Candidate roll number generated automatically");
    const reg1Id = res2.body.data._id;
    cleanup.examRegistrations.push(reg1Id);

    // ==========================================
    // TEST 3: Duplicate Registration Prevention
    // ==========================================
    console.log("\nTEST 3: Duplicate registration prevention");
    const res3 = await apiRequest("/exams/exam-registrations", {
      method: "POST",
      token: studentToken1,
      body: { examId: exam1._id.toString() },
    });
    assert(res3.status === 409, "Duplicate registration rejected with 409 Conflict");

    // ==========================================
    // TEST 4: Available Exams Reflects Registered State
    // ==========================================
    console.log("\nTEST 4: Available exams endpoint reflects registered status");
    const res4 = await apiRequest("/exams/available-for-registration", {
      token: studentToken1,
    });
    const regCheck1 = res4.body.data.find((e) => e._id.toString() === exam1._id.toString());
    assert(regCheck1.isRegistered === true, "isRegistered flag is true");
    assert(regCheck1.isRegistrationOpen === false, "isRegistrationOpen is false after registering");
    assert(regCheck1.registration.registrationStatus === "REGISTERED", "Registration status reported accurately");
    assert(regCheck1.registration.paymentStatus === "UNPAID", "Payment status reported as UNPAID");

    // ==========================================
    // TEST 5: IDOR Protection on Student Registration
    // ==========================================
    console.log("\nTEST 5: IDOR protection - Student 2 cannot register Student 1");
    const res5 = await apiRequest("/exams/exam-registrations", {
      method: "POST",
      token: studentToken2,
      body: {
        examId: exam4._id.toString(),
        studentId: studentProfile1._id.toString(), // Student 2 attempts to spoof Student 1
      },
    });
    assert(res5.status === 201 && res5.body.success, "Registration processed");
    // Verify that the registration was created for Student 2, NOT Student 1
    const reg2Id = res5.body.data._id;
    cleanup.examRegistrations.push(reg2Id);
    const reg2Record = await ExamRegistration.findById(reg2Id).lean();
    assert(
      reg2Record.studentId.toString() === studentProfile2._id.toString(),
      "IDOR thwarted: Registration assigned strictly to authenticated Student 2"
    );

    // ==========================================
    // TEST 6: Class Ineligibility Rejection
    // ==========================================
    console.log("\nTEST 6: Class ineligibility rejection");
    const res6 = await apiRequest("/exams/exam-registrations", {
      method: "POST",
      token: studentToken1,
      body: { examId: exam4._id.toString() }, // Exam 4 is exclusive to Class B
    });
    assert(res6.status === 400, "Ineligible class registration rejected with 400 Bad Request");
    assert(res6.body.message.includes("eligible"), "Informative error message returned");

    // ==========================================
    // TEST 7: Expired Registration Window Rejection
    // ==========================================
    console.log("\nTEST 7: Expired registration window rejection");
    const res7 = await apiRequest("/exams/exam-registrations", {
      method: "POST",
      token: studentToken1,
      body: { examId: exam2._id.toString() },
    });
    assert(res7.status === 400, "Registration rejected when window has closed");

    // ==========================================
    // TEST 8: Future Registration Window Rejection
    // ==========================================
    console.log("\nTEST 8: Future registration window rejection");
    const res8 = await apiRequest("/exams/exam-registrations", {
      method: "POST",
      token: studentToken1,
      body: { examId: exam3._id.toString() },
    });
    assert(res8.status === 400, "Registration rejected before window opens");

    // ==========================================
    // TEST 9: Completed Exam Rejection
    // ==========================================
    console.log("\nTEST 9: Completed exam rejection");
    const res9 = await apiRequest("/exams/exam-registrations", {
      method: "POST",
      token: studentToken1,
      body: { examId: exam6._id.toString() },
    });
    assert(res9.status === 400, "Registration for completed exam rejected");

    // ==========================================
    // TEST 10: Draft Exam Rejection
    // ==========================================
    console.log("\nTEST 10: Draft exam rejection");
    const res10 = await apiRequest("/exams/exam-registrations", {
      method: "POST",
      token: studentToken1,
      body: { examId: exam7._id.toString() },
    });
    assert(res10.status === 400, "Registration for draft exam rejected");

    // ==========================================
    // TEST 11: Suspended Student Rejection
    // ==========================================
    console.log("\nTEST 11: Suspended student rejection");
    // 11a: Admin attempting to register suspended student rejected by exam registration service
    const res11a = await apiRequest("/exams/exam-registrations", {
      method: "POST",
      token: adminToken,
      body: {
        examId: exam5._id.toString(),
        studentId: suspendedProfile._id.toString(),
      },
    });
    assert(res11a.status === 400, "Admin registration of suspended student rejected with 400 Bad Request");

    // 11b: Suspended student attempting self-service is blocked by auth middleware
    const res11b = await apiRequest("/exams/exam-registrations", {
      method: "POST",
      token: suspendedToken,
      body: { examId: exam5._id.toString() },
    });
    assert(res11b.status === 401, "Suspended student self-service blocked by auth middleware with 401 Unauthorized");

    // ==========================================
    // TEST 12: Zero-Fee Exam Auto-Issues Hall Ticket
    // ==========================================
    console.log("\nTEST 12: Zero-fee exam auto-issues hall ticket");
    const res12 = await apiRequest("/exams/exam-registrations", {
      method: "POST",
      token: studentToken1,
      body: { examId: exam5._id.toString() }, // Exam 5 fee is 0
    });
    assert(res12.status === 201 && res12.body.success, "Zero-fee registration created");
    cleanup.examRegistrations.push(res12.body.data._id);

    // Call create-order on zero-fee registration: auto-clears to HALL_TICKET_ISSUED
    const res12Order = await apiRequest("/payments/create-order", {
      method: "POST",
      token: studentToken1,
      body: { examRegistrationId: res12.body.data._id },
    });
    assert(res12Order.status === 201 && res12Order.body.data.freeExam === true, "Free exam detected and auto-cleared");
    const reg5Doc = await ExamRegistration.findById(res12.body.data._id).lean();
    assert(
      reg5Doc.registrationStatus === "HALL_TICKET_ISSUED",
      "Zero-fee exam auto-issues hall ticket without external payment gateway step"
    );

    // ==========================================
    // TEST 13: Parent Access to Ward's Available Exams
    // ==========================================
    console.log("\nTEST 13: Parent 1 views linked child's available exams");
    const res13 = await apiRequest(
      `/exams/available-for-registration?studentId=${studentProfile1._id.toString()}`,
      { token: parentToken1 }
    );
    assert(res13.status === 200 && res13.body.success, "Parent 1 successfully accesses child's available exams");
    assert(Array.isArray(res13.body.data), "Parent receives array of child's available exams");

    // ==========================================
    // TEST 14: Parent IDOR Protection
    // ==========================================
    console.log("\nTEST 14: Parent IDOR protection");
    const res14 = await apiRequest(
      `/exams/available-for-registration?studentId=${studentProfile1._id.toString()}`,
      { token: parentToken2 } // Parent 2 is NOT linked to Student 1
    );
    assert(res14.status === 403, "Unlinked parent blocked with 403 Forbidden");

    // ==========================================
    // TEST 15: Fee Payment & Hall Ticket Activation Flow
    // ==========================================
    console.log("\nTEST 15: Fee payment and hall ticket issuance for Exam 1");
    // 15a. Create order
    const resOrder = await apiRequest("/payments/create-order", {
      method: "POST",
      token: studentToken1,
      body: { examRegistrationId: reg1Id },
    });
    assert(resOrder.status === 201 && resOrder.body.success, "Payment order created successfully with 201 Created");
    const orderData = resOrder.body.data;
    assert(orderData.amount === 500, "Order amount is ₹500");
    const orderId = orderData.orderId;
    cleanup.payments.push(orderData.paymentId);

    // 15b. Verify payment using cryptographic HMAC
    const fakePaymentId = `pay_test_${timestamp}`;
    const signPayload = `${orderId}|${fakePaymentId}`;
    const generatedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(signPayload)
      .digest("hex");

    const resVerify = await apiRequest("/payments/verify", {
      method: "POST",
      token: studentToken1,
      body: {
        razorpayOrderId: orderId,
        razorpayPaymentId: fakePaymentId,
        razorpaySignature: generatedSignature,
      },
    });
    assert(resVerify.status === 200 && resVerify.body.success, "Payment verified successfully with HMAC signature");
    cleanup.payments.push(resVerify.body.data._id);

    // 15c. Check Registration Status Updated to HALL_TICKET_ISSUED
    const regUpdated = await ExamRegistration.findById(reg1Id).lean();
    assert(
      regUpdated.registrationStatus === "HALL_TICKET_ISSUED",
      "Registration status updated to HALL_TICKET_ISSUED upon payment confirmation"
    );

    // 15d. Available Exams now reports PAID
    const res15d = await apiRequest("/exams/available-for-registration", {
      token: studentToken1,
    });
    const exam1AfterPay = res15d.body.data.find((e) => e._id.toString() === exam1._id.toString());
    assert(exam1AfterPay.registration.isPaid === true, "Available exams endpoint reports isPaid: true");
    assert(exam1AfterPay.registration.paymentStatus === "PAID", "Available exams endpoint reports paymentStatus: PAID");

    // ==========================================
    // TEST 16: Hall Ticket Record Retrieval
    // ==========================================
    console.log("\nTEST 16: Hall ticket record retrieval");
    const res16 = await apiRequest(`/exams/exam-registrations/${reg1Id}`, {
      token: studentToken1,
    });
    assert(res16.status === 200 && res16.body.success, "Hall ticket record retrieved by student");
    assert(res16.body.data.registrationStatus === "HALL_TICKET_ISSUED", "Registration status confirmed");
    assert(res16.body.data.paymentId !== null, "Payment transaction linked to hall ticket");

    console.log("\n==================================================================");
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================================");

  } catch (err) {
    console.error("Test execution encountered an error:", err);
    failed++;
  } finally {
    console.log("Cleaning up test records...");
    await Promise.all([
      User.deleteMany({ _id: { $in: cleanup.users } }),
      StudentProfile.deleteMany({ _id: { $in: cleanup.studentProfiles } }),
      ParentProfile.deleteMany({ _id: { $in: cleanup.parentProfiles } }),
      AcademicYear.deleteMany({ _id: { $in: cleanup.academicYears } }),
      ClassModel.deleteMany({ _id: { $in: cleanup.classes } }),
      Subject.deleteMany({ _id: { $in: cleanup.subjects } }),
      Exam.deleteMany({ _id: { $in: cleanup.exams } }),
      ExamSchedule.deleteMany({ _id: { $in: cleanup.examSchedules } }),
      ExamRegistration.deleteMany({ _id: { $in: cleanup.examRegistrations } }),
      Payment.deleteMany({ _id: { $in: cleanup.payments } }),
    ]);
    console.log("Test cleanup completed. Disconnected from DB.");
    await server.close();
    await mongoose.disconnect();
  }
}

run();
