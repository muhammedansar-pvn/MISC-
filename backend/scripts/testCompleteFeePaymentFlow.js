process.env.NODE_ENV = "test";
const mongoose = require("mongoose");
const http = require("http");
const crypto = require("crypto");
const env = require("../src/config/env");
const app = require("../src/app");
const User = require("../src/modules/users/user.model");
const StudentProfile = require("../src/modules/students/student.model");
const ParentProfile = require("../src/modules/parents/parent.model");
const FacultyProfile = require("../src/modules/faculty/faculty.model");
const AcademicYear = require("../src/modules/academics/academic-year.model");
const Exam = require("../src/modules/exams/exam.model");
const ExamRegistration = require("../src/modules/exams/exam-registration.model");
const Payment = require("../src/modules/payments/payment.model");
const { generateToken } = require("../src/shared/utils/jwt");

async function runTestFlow() {
  console.log("==================================================================");
  console.log("SANAVIYYA COMPLETE FEE PAYMENT SYSTEM END-TO-END TEST SUITE");
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
    facultyProfiles: [],
    academicYears: [],
    exams: [],
    examRegistrations: [],
    payments: [],
  };

  async function apiRequest(endpoint, { method = "GET", token, body = null, headers = {} } = {}) {
    const reqHeaders = { "Content-Type": "application/json", ...headers };
    if (token) reqHeaders["Authorization"] = `Bearer ${token}`;
    const opts = { method, headers: reqHeaders };
    if (body) {
      opts.body = typeof body === "string" ? body : JSON.stringify(body);
    }
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
      yearCode: `AY${timestamp}`.slice(0, 10).toUpperCase(),
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-03-31"),
      isCurrent: true,
      status: "ACTIVE",
    });
    cleanup.academicYears.push(academicYear._id);

    // 2. Exam with explicit fee (₹500)
    const examFeeAmount = 500;
    const exam = await Exam.create({
      title: `Sanaviyya Annual Board Exam ${timestamp}`,
      code: `EXAM-${timestamp}`.slice(0, 15).toUpperCase(),
      academicYearId: academicYear._id,
      fee: examFeeAmount,
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

    // 4. Student 1 (Candidate A)
    const studentUser1 = await User.create({
      name: "Student Candidate A",
      email: `studentA_${timestamp}@sanaviyya.edu`,
      passwordHash: "dummyhash",
      role: "STUDENT",
      status: "ACTIVE",
      isDeleted: false,
    });
    cleanup.users.push(studentUser1._id);

    const studentProfile1 = await StudentProfile.create({
      userId: studentUser1._id,
      nameEnglish: "Student Candidate A",
      fatherName: "Father A",
      motherName: "Mother A",
      dateOfBirth: new Date("2008-01-01"),
      registrationNumber: `REG-A-${timestamp}`.slice(0, 16),
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

    // 5. Parent 1 (Father of Student 1)
    const parentUser1 = await User.create({
      name: "Parent Guardian A",
      email: `parentA_${timestamp}@sanaviyya.edu`,
      passwordHash: "dummyhash",
      role: "PARENT",
      status: "EMAIL_VERIFIED",
      isDeleted: false,
    });
    cleanup.users.push(parentUser1._id);

    const parentProfile1 = await ParentProfile.create({
      userId: parentUser1._id,
      name: "Parent Guardian A",
      contactNumber: "9876543210",
      relationType: "FATHER",
      studentIds: [studentProfile1._id],
      isDeleted: false,
    });
    cleanup.parentProfiles.push(parentProfile1._id);

    studentProfile1.parentUserId = parentUser1._id;
    await studentProfile1.save();

    const parentToken1 = generateToken({
      userId: parentUser1._id.toString(),
      email: parentUser1.email,
      role: parentUser1.role,
    });

    // 6. Student 2 (Candidate B - Unrelated)
    const studentUser2 = await User.create({
      name: "Student Candidate B",
      email: `studentB_${timestamp}@sanaviyya.edu`,
      passwordHash: "dummyhash",
      role: "STUDENT",
      status: "ACTIVE",
      isDeleted: false,
    });
    cleanup.users.push(studentUser2._id);

    const studentProfile2 = await StudentProfile.create({
      userId: studentUser2._id,
      nameEnglish: "Student Candidate B",
      fatherName: "Father B",
      motherName: "Mother B",
      dateOfBirth: new Date("2008-05-05"),
      registrationNumber: `REG-B-${timestamp}`.slice(0, 16),
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

    // 7. Parent 2 (Parent of Student 2)
    const parentUser2 = await User.create({
      name: "Parent Guardian B",
      email: `parentB_${timestamp}@sanaviyya.edu`,
      passwordHash: "dummyhash",
      role: "PARENT",
      status: "EMAIL_VERIFIED",
      isDeleted: false,
    });
    cleanup.users.push(parentUser2._id);

    const parentProfile2 = await ParentProfile.create({
      userId: parentUser2._id,
      name: "Parent Guardian B",
      contactNumber: "9876543211",
      relationType: "MOTHER",
      studentIds: [studentProfile2._id],
      isDeleted: false,
    });
    cleanup.parentProfiles.push(parentProfile2._id);

    const parentToken2 = generateToken({
      userId: parentUser2._id.toString(),
      email: parentUser2.email,
      role: parentUser2.role,
    });

    // 8. Faculty User (Cannot access financial data)
    const facultyUser = await User.create({
      name: "Faculty Instructor",
      email: `faculty_${timestamp}@sanaviyya.edu`,
      passwordHash: "dummyhash",
      role: "FACULTY",
      status: "ACTIVE",
      isDeleted: false,
    });
    cleanup.users.push(facultyUser._id);

    const facultyProfile = await FacultyProfile.create({
      userId: facultyUser._id,
      facultyId: `FAC-${timestamp}`.slice(0, 10),
      designation: "Assistant Professor",
      status: "ACTIVE",
      isDeleted: false,
    });
    cleanup.facultyProfiles.push(facultyProfile._id);

    const facultyToken = generateToken({
      userId: facultyUser._id.toString(),
      email: facultyUser.email,
      role: facultyUser.role,
    });

    // 9. Register Student 1 for the Exam
    const reg1 = await ExamRegistration.create({
      examId: exam._id,
      studentId: studentProfile1._id,
      rollNumber: `ROLL-A-${timestamp}`,
      registrationStatus: "REGISTERED",
    });
    cleanup.examRegistrations.push(reg1._id);

    // 10. Register Student 2 for the Exam
    const reg2 = await ExamRegistration.create({
      examId: exam._id,
      studentId: studentProfile2._id,
      rollNumber: `ROLL-B-${timestamp}`,
      registrationStatus: "REGISTERED",
    });
    cleanup.examRegistrations.push(reg2._id);

    console.log("[4/4] Executing test phases...\n");

    // ==========================================
    // SECTION A: ORDER CREATION
    // ==========================================
    console.log("SECTION A: ORDER CREATION");

    // 1. Authorized student can create order
    const orderResStudent = await apiRequest("/payments/create-order", {
      method: "POST",
      token: studentToken1,
      body: { examRegistrationId: reg1._id.toString() },
    });
    assert(orderResStudent.status === 201 && orderResStudent.body.success, "1. Authorized student can create order");
    assert(orderResStudent.body.data.orderId != null, "1b. Order ID is returned");
    assert(orderResStudent.body.data.amount === examFeeAmount, "7. Backend determines correct amount from Exam.fee");
    assert(orderResStudent.body.data.amountInPaise === examFeeAmount * 100, "7b. Correct amount in paise generated");
    const activeStudentOrderId = orderResStudent.body.data.orderId;
    const activeStudentTxnId = orderResStudent.body.data.transactionId;
    const activeStudentPaymentId = orderResStudent.body.data.paymentId;
    cleanup.payments.push(activeStudentPaymentId);

    // 2. Authorized parent can create order for linked child
    const orderResParent = await apiRequest("/payments/create-order", {
      method: "POST",
      token: parentToken1,
      body: { examRegistrationId: reg1._id.toString() },
    });
    assert(orderResParent.status === 201 && orderResParent.body.success, "2. Authorized parent can create order for linked child");
    cleanup.payments.push(orderResParent.body.data.paymentId);

    // 3. Unauthorized student is rejected
    const orderResUnauthStudent = await apiRequest("/payments/create-order", {
      method: "POST",
      token: studentToken2, // Student 2 trying to pay for Student 1
      body: { examRegistrationId: reg1._id.toString() },
    });
    assert(orderResUnauthStudent.status === 403, "3. Unauthorized student rejected with 403 Forbidden");

    // 4. Parent accessing unrelated child is rejected
    const orderResUnauthParent = await apiRequest("/payments/create-order", {
      method: "POST",
      token: parentToken2, // Parent 2 trying to pay for Student 1
      body: { examRegistrationId: reg1._id.toString() },
    });
    assert(orderResUnauthParent.status === 403, "4. Parent accessing unrelated child rejected with 403 Forbidden");

    // 5. Invalid registration is rejected
    const orderResInvalid = await apiRequest("/payments/create-order", {
      method: "POST",
      token: studentToken1,
      body: { examRegistrationId: new mongoose.Types.ObjectId().toString() },
    });
    assert(orderResInvalid.status === 404, "5. Invalid exam registration rejected with 404");

    // 8. Frontend cannot manipulate amount (order creation does not accept client amount)
    const orderResTamperAmount = await apiRequest("/payments/create-order", {
      method: "POST",
      token: studentToken1,
      body: { examRegistrationId: reg1._id.toString(), amount: 1 }, // Trying to pay ₹1 instead of ₹500
    });
    assert(orderResTamperAmount.status === 201 && orderResTamperAmount.body.data.amount === examFeeAmount, "8. Frontend cannot manipulate amount (server enforces Exam.fee)");
    cleanup.payments.push(orderResTamperAmount.body.data.paymentId);

    // ==========================================
    // SECTION B: PAYMENT VERIFICATION
    // ==========================================
    console.log("\nSECTION B: PAYMENT VERIFICATION");

    // Generate valid and invalid HMAC signatures for activeStudentOrderId
    const validPaymentId = `pay_test_${timestamp}`;
    const validSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${activeStudentOrderId}|${validPaymentId}`)
      .digest("hex");

    const invalidSignature = crypto
      .createHmac("sha256", "wrong_secret_key")
      .update(`${activeStudentOrderId}|${validPaymentId}`)
      .digest("hex");

    // 10. Invalid signature rejected
    const verifyInvalidSig = await apiRequest("/payments/verify", {
      method: "POST",
      token: studentToken1,
      body: {
        transactionId: activeStudentTxnId,
        razorpayOrderId: activeStudentOrderId,
        razorpayPaymentId: validPaymentId,
        razorpaySignature: invalidSignature,
      },
    });
    assert(verifyInvalidSig.status === 400, "10. Invalid HMAC signature rejected with 400");

    // 11. Wrong order ID rejected
    const verifyWrongOrder = await apiRequest("/payments/verify", {
      method: "POST",
      token: studentToken1,
      body: {
        transactionId: activeStudentTxnId,
        razorpayOrderId: "order_wrong_123",
        razorpayPaymentId: validPaymentId,
        razorpaySignature: validSignature,
      },
    });
    assert(verifyWrongOrder.status === 400, "11. Wrong order ID rejected");

    // 12. Wrong payment ID rejected
    const verifyWrongPayment = await apiRequest("/payments/verify", {
      method: "POST",
      token: studentToken1,
      body: {
        transactionId: activeStudentTxnId,
        razorpayOrderId: activeStudentOrderId,
        razorpayPaymentId: "pay_tampered_id",
        razorpaySignature: validSignature,
      },
    });
    assert(verifyWrongPayment.status === 400, "12. Wrong payment ID rejected");

    // 9. Valid signature succeeds
    const verifyValid = await apiRequest("/payments/verify", {
      method: "POST",
      token: studentToken1,
      body: {
        transactionId: activeStudentTxnId,
        razorpayOrderId: activeStudentOrderId,
        razorpayPaymentId: validPaymentId,
        razorpaySignature: validSignature,
      },
    });
    assert(verifyValid.status === 200 && verifyValid.body.success, "9. Valid signature succeeds");

    // 15. Successful payment updates Payment status
    const verifiedPaymentDoc = await Payment.findById(activeStudentPaymentId);
    assert(verifiedPaymentDoc.status === "SUCCESS", "15. Payment record updated to SUCCESS");
    assert(verifiedPaymentDoc.paidAt != null, "15b. Payment record has paidAt timestamp");

    // 16. Successful payment updates Exam Registration
    const updatedReg1 = await ExamRegistration.findById(reg1._id);
    assert(updatedReg1.registrationStatus === "HALL_TICKET_ISSUED", "16. Exam registration status updated to HALL_TICKET_ISSUED");
    assert(updatedReg1.paymentId.toString() === activeStudentPaymentId.toString(), "16b. Exam registration linked to paymentId");

    // 17. Hall ticket becomes available
    const checkHallTicket = await apiRequest(`/exams/exam-registrations/${reg1._id}/payment`, {
      token: studentToken1,
    });
    assert(checkHallTicket.body.data.isPaid === true && checkHallTicket.body.data.status === "PAID", "17. Hall ticket is officially available");

    // 6. Already-paid registration does not create duplicate order
    const orderPaidAgain = await apiRequest("/payments/create-order", {
      method: "POST",
      token: studentToken1,
      body: { examRegistrationId: reg1._id.toString() },
    });
    assert(orderPaidAgain.status === 400, "6. Already-paid registration rejects new order creation");

    // ==========================================
    // SECTION C: WEBHOOK
    // ==========================================
    console.log("\nSECTION C: WEBHOOK");

    // Create an order for Student 2 to test webhook asynchronous capture
    const orderRes2 = await apiRequest("/payments/create-order", {
      method: "POST",
      token: studentToken2,
      body: { examRegistrationId: reg2._id.toString() },
    });
    const order2Id = orderRes2.body.data.orderId;
    const payment2Id = orderRes2.body.data.paymentId;
    cleanup.payments.push(payment2Id);

    const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET || env.RAZORPAY_KEY_SECRET;
    const webhookPaymentId = `pay_hook_${timestamp}`;

    const webhookPayloadObj = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: webhookPaymentId,
            order_id: order2Id,
            amount: examFeeAmount * 100,
            currency: "INR",
            status: "captured",
            method: "upi",
          },
        },
      },
    };
    const webhookPayloadStr = JSON.stringify(webhookPayloadObj);

    const validWebhookSig = crypto
      .createHmac("sha256", webhookSecret)
      .update(webhookPayloadStr)
      .digest("hex");

    const invalidWebhookSig = crypto
      .createHmac("sha256", "tampered_webhook_key")
      .update(webhookPayloadStr)
      .digest("hex");

    // 19. Invalid webhook signature rejected
    const webhookInvalid = await apiRequest("/payments/webhook/razorpay", {
      method: "POST",
      body: webhookPayloadStr,
      headers: { "x-razorpay-signature": invalidWebhookSig },
    });
    assert(webhookInvalid.status === 400, "19. Invalid webhook signature rejected");

    // 18. Valid webhook accepted
    const webhookValid = await apiRequest("/payments/webhook/razorpay", {
      method: "POST",
      body: webhookPayloadStr,
      headers: { "x-razorpay-signature": validWebhookSig },
    });
    assert(webhookValid.status === 200 && webhookValid.body.success, "18. Valid webhook accepted with 200");

    // 21. Payment captured webhook updates payment
    const payment2Doc = await Payment.findById(payment2Id);
    assert(payment2Doc.status === "SUCCESS", "21. Payment captured webhook updated local payment to SUCCESS");
    assert(payment2Doc.gatewayPaymentId === webhookPaymentId, "21b. Payment captured gatewayPaymentId updated");

    // 23. Webhook reconciles payment when frontend callback was missed
    const reg2Doc = await ExamRegistration.findById(reg2._id);
    assert(reg2Doc.registrationStatus === "HALL_TICKET_ISSUED", "23. Exam registration updated to HALL_TICKET_ISSUED via webhook");

    // 20. Duplicate webhook is idempotent
    const webhookDuplicate = await apiRequest("/payments/webhook/razorpay", {
      method: "POST",
      body: webhookPayloadStr,
      headers: { "x-razorpay-signature": validWebhookSig },
    });
    assert(webhookDuplicate.status === 200 && webhookDuplicate.body.idempotent === true, "20. Duplicate webhook is handled idempotently");

    // 22. Payment failed webhook updates payment
    // Create distinct exam fixtures for separate test scenarios
    const examFail = await Exam.create({
      title: `Fail Test Exam ${timestamp}`,
      code: `EXAM-F-${timestamp}`.slice(0, 15).toUpperCase(),
      academicYearId: academicYear._id,
      fee: examFeeAmount,
      startDate: new Date("2026-11-01"),
      endDate: new Date("2026-11-15"),
      status: "SCHEDULED",
    });
    cleanup.exams.push(examFail._id);

    const failReg = await ExamRegistration.create({
      examId: examFail._id,
      studentId: studentProfile1._id,
      rollNumber: `ROLL-F-${timestamp}`,
      registrationStatus: "REGISTERED",
    });
    cleanup.examRegistrations.push(failReg._id);

    const failPayment = await Payment.create({
      userId: studentUser1._id,
      studentId: studentProfile1._id,
      examRegistrationId: failReg._id,
      paymentType: "EXAM_FEE",
      amount: examFeeAmount,
      currency: "INR",
      gateway: "RAZORPAY",
      gatewayOrderId: `order_fail_${timestamp}`,
      transactionId: `TXN-FAIL-${timestamp}`,
      status: "INITIATED",
    });
    cleanup.payments.push(failPayment._id);

    const failWebhookPayload = JSON.stringify({
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: `pay_failed_${timestamp}`,
            order_id: failPayment.gatewayOrderId,
            error_description: "Bank server declined transaction",
          },
        },
      },
    });

    const failWebhookSig = crypto
      .createHmac("sha256", webhookSecret)
      .update(failWebhookPayload)
      .digest("hex");

    const webhookFailedRes = await apiRequest("/payments/webhook/razorpay", {
      method: "POST",
      body: failWebhookPayload,
      headers: { "x-razorpay-signature": failWebhookSig },
    });
    assert(webhookFailedRes.status === 200 && webhookFailedRes.body.status === "FAILED", "22. Payment failed webhook processed");
    const updatedFailPayment = await Payment.findById(failPayment._id);
    assert(updatedFailPayment.status === "FAILED", "22b. Local payment status transitioned to FAILED");

    // ==========================================
    // SECTION D: RECONCILIATION
    // ==========================================
    console.log("\nSECTION D: RECONCILIATION");

    // 24. Linked successful payment -> PAID
    const reconPaid = await apiRequest(`/exams/exam-registrations/${reg1._id}/payment`, {
      token: studentToken1,
    });
    assert(reconPaid.body.data.status === "PAID" && reconPaid.body.data.isPaid === true, "24. Linked successful payment reports PAID");

    // 25. Unlinked successful payment -> auto-reconcile
    const examUnlinked = await Exam.create({
      title: `Unlinked Test Exam ${timestamp}`,
      code: `EXAM-U-${timestamp}`.slice(0, 15).toUpperCase(),
      academicYearId: academicYear._id,
      fee: examFeeAmount,
      startDate: new Date("2026-11-01"),
      endDate: new Date("2026-11-15"),
      status: "SCHEDULED",
    });
    cleanup.exams.push(examUnlinked._id);

    const unlinkedReg = await ExamRegistration.create({
      examId: examUnlinked._id,
      studentId: studentProfile1._id,
      rollNumber: `ROLL-U-${timestamp}`,
      registrationStatus: "REGISTERED", // Unlinked
    });
    cleanup.examRegistrations.push(unlinkedReg._id);

    const unlinkedSuccessPayment = await Payment.create({
      userId: studentUser1._id,
      studentId: studentProfile1._id,
      examRegistrationId: unlinkedReg._id,
      paymentType: "EXAM_FEE",
      amount: examFeeAmount,
      currency: "INR",
      gateway: "MANUAL",
      transactionId: `TXN-UNLINKED-${timestamp}`,
      status: "SUCCESS",
      paidAt: new Date(),
    });
    cleanup.payments.push(unlinkedSuccessPayment._id);

    const reconAuto = await apiRequest(`/exams/exam-registrations/${unlinkedReg._id}/payment`, {
      token: studentToken1,
    });
    assert(reconAuto.body.data.status === "PAID" && reconAuto.body.data.isPaid === true, "25. Unlinked successful payment auto-reconciled");
    const reconciledRegDoc = await ExamRegistration.findById(unlinkedReg._id);
    assert(reconciledRegDoc.paymentId.toString() === unlinkedSuccessPayment._id.toString(), "25b. Registration now linked to paymentId");

    // 26. Pending payment -> PENDING
    const examPending = await Exam.create({
      title: `Pending Test Exam ${timestamp}`,
      code: `EXAM-P-${timestamp}`.slice(0, 15).toUpperCase(),
      academicYearId: academicYear._id,
      fee: examFeeAmount,
      startDate: new Date("2026-11-01"),
      endDate: new Date("2026-11-15"),
      status: "SCHEDULED",
    });
    cleanup.exams.push(examPending._id);

    const pendingReg = await ExamRegistration.create({
      examId: examPending._id,
      studentId: studentProfile1._id,
      rollNumber: `ROLL-P-${timestamp}`,
      registrationStatus: "REGISTERED",
    });
    cleanup.examRegistrations.push(pendingReg._id);

    const pendingPaymentDoc = await Payment.create({
      userId: studentUser1._id,
      studentId: studentProfile1._id,
      examRegistrationId: pendingReg._id,
      paymentType: "EXAM_FEE",
      amount: examFeeAmount,
      currency: "INR",
      gateway: "BANK_TRANSFER",
      transactionId: `TXN-PENDING-CHECK-${timestamp}`,
      status: "PENDING",
    });
    cleanup.payments.push(pendingPaymentDoc._id);
    cleanup.payments.push(pendingPaymentDoc._id);

    const reconPending = await apiRequest(`/exams/exam-registrations/${pendingReg._id}/payment`, {
      token: studentToken1,
    });
    assert(reconPending.body.data.status === "PENDING" && reconPending.body.data.isPaid === false, "26. Pending payment reports PENDING");

    // 27. Failed payment -> FAILED
    const reconFailed = await apiRequest(`/exams/exam-registrations/${failReg._id}/payment`, {
      token: studentToken1,
    });
    assert(reconFailed.body.data.status === "FAILED" && reconFailed.body.data.isPaid === false, "27. Failed payment reports FAILED");

    // 28. No payment -> UNPAID
    const examUnpaid = await Exam.create({
      title: `Unpaid Test Exam ${timestamp}`,
      code: `EXAM-UP-${timestamp}`.slice(0, 15).toUpperCase(),
      academicYearId: academicYear._id,
      fee: examFeeAmount,
      startDate: new Date("2026-11-01"),
      endDate: new Date("2026-11-15"),
      status: "SCHEDULED",
    });
    cleanup.exams.push(examUnpaid._id);

    const unpaidReg = await ExamRegistration.create({
      examId: examUnpaid._id,
      studentId: studentProfile1._id,
      rollNumber: `ROLL-NO-PAY-${timestamp}`,
      registrationStatus: "REGISTERED",
    });
    cleanup.examRegistrations.push(unpaidReg._id);

    const reconUnpaid = await apiRequest(`/exams/exam-registrations/${unpaidReg._id}/payment`, {
      token: studentToken1,
    });
    assert(reconUnpaid.body.data.status === "UNPAID" && reconUnpaid.body.data.isPaid === false, "28. Registration without payments reports UNPAID");

    // 29. Reconciliation is idempotent
    const reconRepeat = await apiRequest(`/exams/exam-registrations/${reg1._id}/payment`, {
      token: studentToken1,
    });
    assert(reconRepeat.body.data.status === "PAID", "29. Reconciliation is idempotent on repeated checks");

    // ==========================================
    // SECTION E: ACCESS CONTROL & IDOR
    // ==========================================
    console.log("\nSECTION E: ACCESS CONTROL & IDOR");

    // 30. Student A cannot view Student B payment
    const idorStudentView = await apiRequest(`/payments/${payment2Doc.transactionId}`, {
      token: studentToken1, // Student 1 viewing Student 2 payment
    });
    assert(idorStudentView.status === 403, "30. Student A cannot view Student B payment record (403)");

    // 31. Parent A cannot view Parent B payment
    const idorParentView = await apiRequest(`/payments/${payment2Doc.transactionId}`, {
      token: parentToken1, // Parent 1 viewing Student 2 payment
    });
    assert(idorParentView.status === 403, "31. Parent A cannot view unrelated Child payment (403)");

    // 32. Parent can access all linked children payments
    const parentListPayments = await apiRequest("/payments", {
      token: parentToken1,
    });
    assert(parentListPayments.status === 200 && parentListPayments.body.success, "32. Parent can list payments of linked children");

    // 33. Admin can inspect payment records & overview
    const adminOverview = await apiRequest("/payments/overview", {
      token: adminToken,
    });
    assert(adminOverview.status === 200 && adminOverview.body.data.totalRevenue > 0, "33. Admin can inspect financial overview");

    // 34. Faculty cannot access payment data
    const facultyPaymentsView = await apiRequest("/payments", {
      token: facultyToken,
    });
    assert(facultyPaymentsView.status === 403, "34. Faculty cannot access financial payment records (403)");

    // ==========================================
    // SECTION F: DUPLICATION & SAFE RETRIES
    // ==========================================
    console.log("\nSECTION F: DUPLICATION & RETRIES");

    // 35. Repeated verification is safe
    const repeatVerify = await apiRequest("/payments/verify", {
      method: "POST",
      token: studentToken1,
      body: {
        transactionId: activeStudentTxnId,
        razorpayOrderId: activeStudentOrderId,
        razorpayPaymentId: validPaymentId,
        razorpaySignature: validSignature,
      },
    });
    assert(repeatVerify.status === 200 && repeatVerify.body.success, "36. Repeated verification is safe and idempotent");

    // 38. Retry after failed payment creates a new valid attempt
    const retryOrder = await apiRequest("/payments/create-order", {
      method: "POST",
      token: studentToken1,
      body: { examRegistrationId: failReg._id.toString() },
    });
    assert(retryOrder.status === 201 && retryOrder.body.success, "38. Retry after failed payment creates new valid attempt");
    cleanup.payments.push(retryOrder.body.data.paymentId);

    console.log("\n==================================================================");
    console.log(`COMPLETE FEE PAYMENT SUITE RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================================");

  } catch (error) {
    console.error("Test execution encountered an error:", error);
    failed++;
  } finally {
    console.log("Cleaning up fixtures...");
    await Promise.allSettled([
      cleanup.payments.length ? Payment.deleteMany({ _id: { $in: cleanup.payments } }) : null,
      cleanup.examRegistrations.length ? ExamRegistration.deleteMany({ _id: { $in: cleanup.examRegistrations } }) : null,
      cleanup.exams.length ? Exam.deleteMany({ _id: { $in: cleanup.exams } }) : null,
      cleanup.studentProfiles.length ? StudentProfile.deleteMany({ _id: { $in: cleanup.studentProfiles } }) : null,
      cleanup.parentProfiles.length ? ParentProfile.deleteMany({ _id: { $in: cleanup.parentProfiles } }) : null,
      cleanup.facultyProfiles.length ? FacultyProfile.deleteMany({ _id: { $in: cleanup.facultyProfiles } }) : null,
      cleanup.users.length ? User.deleteMany({ _id: { $in: cleanup.users } }) : null,
      cleanup.academicYears.length ? AcademicYear.deleteMany({ _id: { $in: cleanup.academicYears } }) : null,
    ]);
    await server.close();
    await mongoose.disconnect();
    console.log("Cleanup finished. Disconnected from DB.");
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTestFlow();
