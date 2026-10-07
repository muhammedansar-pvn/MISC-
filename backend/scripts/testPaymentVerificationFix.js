process.env.NODE_ENV = "test";
const mongoose = require("mongoose");
const http = require("http");
const crypto = require("crypto");
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
  console.log("SANAVIYYA — EXAM FEE PAYMENT VERIFICATION (POST /api/payments/verify) AUDIT & TEST");
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
    console.log("[3/4] Setting up fixtures matching user scenario (₹150 exam fee)...");

    const academicYear = await AcademicYear.create({
      yearName: `AY-${timestamp}`,
      yearCode: `AY${timestamp}`.slice(0, 10).toUpperCase(),
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-03-31"),
      isCurrent: true,
      status: "ACTIVE",
    });
    cleanup.academicYears.push(academicYear._id);

    // Exam: sanaviyya borde examination, fee: ₹150
    const exam = await Exam.create({
      title: "sanaviyya borde examination",
      code: `EXAM-${timestamp}`.slice(0, 15).toUpperCase(),
      academicYearId: academicYear._id,
      fee: 150,
      examFee: 150,
      registrationStartDate: new Date("2026-10-01"),
      registrationEndDate: new Date("2026-10-15"),
      startDate: new Date("2026-10-16"),
      endDate: new Date("2026-10-31"),
      status: "PUBLISHED",
    });
    cleanup.exams.push(exam._id);

    const studentUser = await User.create({
      name: "Sanaviyya Candidate",
      email: `candidate_${timestamp}@sanaviyya.edu`,
      passwordHash: "dummyhash",
      role: "STUDENT",
      status: "ACTIVE",
      isDeleted: false,
    });
    cleanup.users.push(studentUser._id);

    const studentProfile = await StudentProfile.create({
      userId: studentUser._id,
      nameEnglish: "Sanaviyya Candidate",
      fatherName: "Father Name",
      motherName: "Mother Name",
      dateOfBirth: new Date("2008-01-01"),
      registrationNumber: `REG-${timestamp}`.slice(0, 16),
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

    console.log("[4/4] Executing test steps...\n");

    // 1. Student Registers for Exam
    console.log("STEP 1: Student registers for 'sanaviyya borde examination'");
    const regRes = await apiRequest("/exams/exam-registrations", {
      method: "POST",
      token: studentToken,
      body: { examId: exam._id.toString() },
    });
    assert(regRes.status === 201 && regRes.body.success, "Exam registration created successfully");
    const registrationId = regRes.body.data._id;
    cleanup.examRegistrations.push(registrationId);
    assert(regRes.body.data.registrationStatus === "REGISTERED", "Status is REGISTERED (FEE PENDING)");

    // 2. Check Available Exams shows fee pending
    console.log("\nSTEP 2: Query Student Exam Registration status");
    const availRes = await apiRequest("/exams/available-for-registration", {
      token: studentToken,
    });
    assert(availRes.status === 200, "Fetched available exams");
    const targetExam = availRes.body.data.find((e) => e._id.toString() === exam._id.toString());
    assert(targetExam && targetExam.isRegistered === true, "Exam listed as isRegistered: true");
    assert(targetExam.isPaid === false, "Exam fee status is isPaid: false");

    // 3. Initiate Order (create-order)
    console.log("\nSTEP 3: POST /api/payments/create-order for exam registration");
    const orderRes = await apiRequest("/payments/create-order", {
      method: "POST",
      token: studentToken,
      body: {
        paymentType: "EXAM_FEE",
        examRegistrationId: registrationId,
        currency: "INR",
      },
    });
    assert((orderRes.status === 201 || orderRes.status === 200) && orderRes.body.success, "Payment order created successfully");
    const orderData = orderRes.body.data;
    assert(orderData.amount === 150, "Server-enforced amount is exactly ₹150");
    assert(orderData.gatewayOrderId && orderData.gatewayOrderId.startsWith("order_"), "Razorpay gateway order ID generated");
    assert(orderData.transactionId != null, "Internal transaction ID generated");

    const razorpayOrderId = orderData.gatewayOrderId;
    const razorpayPaymentId = `pay_mock_${timestamp}`;
    const transactionId = orderData.transactionId;

    // Generate valid HMAC signature matching Razorpay's format:
    // HMAC-SHA256(order_id + "|" + payment_id, key_secret)
    const razorpaySecret = env.RAZORPAY_KEY_SECRET || "mock_razorpay_secret";
    const validSignature = crypto
      .createHmac("sha256", razorpaySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    // 4. Verification with Razorpay native snake_case payload (THE EXACT USER ERROR SCENARIO)
    console.log("\nSTEP 4: POST /api/payments/verify with snake_case payload (Razorpay native)");
    const verifySnakeRes = await apiRequest("/payments/verify", {
      method: "POST",
      token: studentToken,
      body: {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: validSignature,
      },
    });
    assert(verifySnakeRes.status === 200, "Snake_case verification DOES NOT throw 400 Bad Request");
    assert(verifySnakeRes.body.success === true, "Verification returns success: true");
    assert(verifySnakeRes.body.data.status === "SUCCESS", "Payment status is SUCCESS");

    // Check payment record in DB
    const dbPayment = await Payment.findOne({ gatewayOrderId: razorpayOrderId });
    assert(dbPayment !== null, "Payment record found in DB");
    if (dbPayment) {
      cleanup.payments.push(dbPayment._id);
      assert(dbPayment.status === "SUCCESS", "DB payment status is SUCCESS");
      assert(dbPayment.gatewayPaymentId === razorpayPaymentId, "gatewayPaymentId saved");
    }

    // Check ExamRegistration in DB
    const dbReg = await ExamRegistration.findById(registrationId);
    assert(dbReg.registrationStatus === "HALL_TICKET_ISSUED", "Registration status updated to HALL_TICKET_ISSUED");
    assert(dbReg.paymentId && dbReg.paymentId.toString() === dbPayment._id.toString(), "paymentId linked to registration");

    // 5. Query /exams/student/available-for-registration after payment
    console.log("\nSTEP 5: Check Student Available Exams shows FEE PAID / HALL TICKET ISSUED");
    const availPaidRes = await apiRequest("/exams/available-for-registration", {
      token: studentToken,
    });
    const targetExamPaid = availPaidRes.body.data.find((e) => e._id.toString() === exam._id.toString());
    assert(targetExamPaid && targetExamPaid.isPaid === true, "Exam shows isPaid: true");
    assert(targetExamPaid.paymentStatus === "PAID", "Exam shows paymentStatus: PAID");
    assert(targetExamPaid.registrationStatus === "HALL_TICKET_ISSUED", "Exam shows registrationStatus: HALL_TICKET_ISSUED");

    // 6. Test IDEMPOTENCY: Calling verify again with same details
    console.log("\nSTEP 6: Idempotent verification re-call");
    const retryVerify = await apiRequest("/payments/verify", {
      method: "POST",
      token: studentToken,
      body: {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: validSignature,
      },
    });
    assert(retryVerify.status === 200 && retryVerify.body.success, "Idempotent repeat verification returns 200");
    assert(retryVerify.body.data.status === "SUCCESS", "Idempotent payment remains SUCCESS");

    // 7. Test camelCase payload verification with another registration
    console.log("\nSTEP 7: CamelCase payload verification with second registration");
    const exam2 = await Exam.create({
      title: "sanaviyya second board exam",
      code: `EXAM2-${timestamp}`.slice(0, 15).toUpperCase(),
      academicYearId: academicYear._id,
      fee: 200,
      examFee: 200,
      registrationStartDate: new Date("2026-10-01"),
      registrationEndDate: new Date("2026-10-15"),
      startDate: new Date("2026-10-16"),
      endDate: new Date("2026-10-31"),
      status: "PUBLISHED",
    });
    cleanup.exams.push(exam2._id);

    const regRes2 = await apiRequest("/exams/exam-registrations", {
      method: "POST",
      token: studentToken,
      body: { examId: exam2._id.toString() },
    });
    const reg2Id = regRes2.body.data._id;
    cleanup.examRegistrations.push(reg2Id);

    const orderRes2 = await apiRequest("/payments/create-order", {
      method: "POST",
      token: studentToken,
      body: {
        paymentType: "EXAM_FEE",
        examRegistrationId: reg2Id,
        currency: "INR",
      },
    });
    assert((orderRes2.status === 201 || orderRes2.status === 200) && orderRes2.body.success, "Payment order 2 created successfully");
    const order2 = orderRes2.body.data;
    const order2GatewayId = order2?.gatewayOrderId || order2?.orderId;
    const razorpayPaymentId2 = `pay_mock2_${timestamp}`;
    const validSignature2 = crypto
      .createHmac("sha256", razorpaySecret)
      .update(`${order2GatewayId}|${razorpayPaymentId2}`)
      .digest("hex");

    const verifyCamelRes = await apiRequest("/payments/verify", {
      method: "POST",
      token: studentToken,
      body: {
        transactionId: order2.transactionId,
        razorpayOrderId: order2GatewayId,
        razorpayPaymentId: razorpayPaymentId2,
        razorpaySignature: validSignature2,
      },
    });
    assert(verifyCamelRes.status === 200 && verifyCamelRes.body.success, "CamelCase verification returns 200");
    assert(verifyCamelRes.body.data.status === "SUCCESS", "Payment verified via camelCase");

    const dbReg2 = await ExamRegistration.findById(reg2Id);
    assert(dbReg2.registrationStatus === "HALL_TICKET_ISSUED", "Registration 2 auto-updated to HALL_TICKET_ISSUED");

    // 8. Negative Tests: Invalid Signature
    console.log("\nSTEP 8: Security Negative Tests");
    const badTxnId = `TXN-BAD-${timestamp}`;
    const badOrderId = `order_bad_${timestamp}`;
    const badPayment = await Payment.create({
      userId: studentUser._id,
      studentId: studentProfile._id,
      paymentType: "EXAM_FEE",
      amount: 150,
      currency: "INR",
      gateway: "RAZORPAY",
      gatewayOrderId: badOrderId,
      transactionId: badTxnId,
      status: "INITIATED",
    });
    cleanup.payments.push(badPayment._id);

    const badSigRes = await apiRequest("/payments/verify", {
      method: "POST",
      token: studentToken,
      body: {
        razorpay_order_id: badOrderId,
        razorpay_payment_id: "pay_tampered",
        razorpay_signature: "tampered_signature_hex",
      },
    });
    assert(badSigRes.status === 400, "Tampered signature rejected with 400 Bad Request");

    // Missing identifier
    const missingIdRes = await apiRequest("/payments/verify", {
      method: "POST",
      token: studentToken,
      body: {
        gateway: "RAZORPAY",
      },
    });
    assert(missingIdRes.status === 400, "Missing order/transaction identifier rejected with 400 Bad Request");

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
