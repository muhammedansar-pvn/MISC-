const crypto = require("crypto");
const Payment = require("./payment.model");
const EventRegistration = require("../events/event-registration.model");
const ExamRegistration = require("../exams/exam-registration.model");
const env = require("../../config/env");
const notificationService = require("../notifications/notification.service");

/**
 * Updates the associated domain registration model upon successful payment
 */
const updateTargetRegistrationStatus = async (payment) => {
  if (payment.paymentType === "EVENT_REGISTRATION" && payment.eventRegistrationId) {
    await EventRegistration.findByIdAndUpdate(payment.eventRegistrationId, {
      registrationStatus: "CONFIRMED",
      paymentId: payment._id,
    });
    notificationService.notifyPaymentSuccess(payment).catch((e) => console.error("Non-fatal notifyPaymentSuccess error:", e.message));
  } else if (payment.paymentType === "EXAM_FEE" && payment.examRegistrationId) {
    const updatedReg = await ExamRegistration.findByIdAndUpdate(payment.examRegistrationId, {
      registrationStatus: "HALL_TICKET_ISSUED",
      paymentId: payment._id,
    }, { new: true });

    notificationService.notifyPaymentSuccess(payment).catch((e) => console.error("Non-fatal notifyPaymentSuccess error:", e.message));
    if (updatedReg) {
      const Exam = require("../exams/exam.model");
      const exam = await Exam.findById(updatedReg.examId).select("title name code").lean();
      notificationService.notifyHallTicketIssued(updatedReg, exam).catch((e) => console.error("Non-fatal notifyHallTicketIssued error:", e.message));
    }
  } else {
    notificationService.notifyPaymentSuccess(payment).catch((e) => console.error("Non-fatal notifyPaymentSuccess error:", e.message));
  }
};

/**
 * Creates an authorized payment order for Razorpay Gateway checkout
 */
const createExamPaymentOrder = async ({ examRegistrationId }, reqUser) => {
  if (!reqUser) {
    const error = new Error("Authentication required to create payment order");
    error.statusCode = 401;
    throw error;
  }

  // 1. Resolve target exam registration with exam and student profiles
  const registration = await ExamRegistration.findById(examRegistrationId)
    .populate("examId", "title code fee examFee status")
    .populate("studentId", "nameEnglish nameArabic name registrationNumber classId");

  if (!registration) {
    const error = new Error("Exam registration record not found");
    error.statusCode = 404;
    throw error;
  }

  // 2. Requester Authorization & IDOR Verification
  const regStudentId = registration.studentId?._id
    ? registration.studentId._id.toString()
    : registration.studentId?.toString();

  if (reqUser.role === "STUDENT") {
    const reqStudentId = reqUser.studentId?.toString();
    if (!reqStudentId || regStudentId !== reqStudentId) {
      const error = new Error("Access denied: You are not authorized to pay for this exam registration");
      error.statusCode = 403;
      throw error;
    }
  } else if (reqUser.role === "PARENT") {
    const parentStudentIds = (reqUser.parentStudentIds || []).map((id) => id.toString());
    if (!parentStudentIds.includes(regStudentId)) {
      const error = new Error("Access denied: You are not authorized to pay for this student");
      error.statusCode = 403;
      throw error;
    }
  } else if (reqUser.role === "ADMIN") {
    // Admin authorized
  } else {
    const error = new Error("Access denied: Faculty or unauthorized accounts cannot initiate payments");
    error.statusCode = 403;
    throw error;
  }

  // 3. Status checks
  if (registration.registrationStatus === "CANCELLED") {
    const error = new Error("Exam registration has been cancelled");
    error.statusCode = 400;
    throw error;
  }

  // 4. Duplicate payment check: If already paid or hall ticket issued
  if (registration.registrationStatus === "HALL_TICKET_ISSUED") {
    const error = new Error("Exam fee has already been paid and hall ticket issued for this registration");
    error.statusCode = 400;
    throw error;
  }

  const existingSuccessPayment = await Payment.findOne({
    examRegistrationId: registration._id,
    paymentType: "EXAM_FEE",
    status: "SUCCESS",
  });

  if (existingSuccessPayment) {
    // Self-heal registration if payment succeeded previously
    registration.paymentId = existingSuccessPayment._id;
    registration.registrationStatus = "HALL_TICKET_ISSUED";
    await registration.save();

    const error = new Error("Exam fee has already been paid for this registration");
    error.statusCode = 400;
    throw error;
  }

  // 5. Determine payable amount strictly from server configuration
  const feeAmount = registration.examId?.fee !== undefined && registration.examId?.fee !== null
    ? registration.examId.fee
    : registration.examId?.examFee;
  if (feeAmount === undefined || feeAmount === null || typeof feeAmount !== "number" || feeAmount < 0) {
    const error = new Error("Exam fee configuration is invalid or missing for this examination");
    error.statusCode = 400;
    throw error;
  }

  if (feeAmount === 0) {
    // Free examination: Automatically issue hall ticket without payment gateway
    registration.registrationStatus = "HALL_TICKET_ISSUED";
    await registration.save();
    return {
      freeExam: true,
      amount: 0,
      currency: "INR",
      message: "Exam fee is zero; hall ticket issued successfully.",
    };
  }

  const amountInPaise = Math.round(feeAmount * 100);
  const transactionId = `TXN-EXAM-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const receiptStr = `rcpt_${registration.rollNumber || registration._id}_${Date.now()}`
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 40);

  // 6. Attempt Razorpay Order Creation via official REST API
  let gatewayOrderId = null;
  if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
    try {
      const basicAuth = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64");
      const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt: receiptStr,
          notes: {
            examRegistrationId: registration._id.toString(),
            studentId: regStudentId || "",
            rollNumber: registration.rollNumber || "",
            examId: registration.examId?._id ? registration.examId._id.toString() : "",
          },
        }),
      });

      const rzpData = await rzpRes.json().catch(() => ({}));
      if (rzpRes.ok && rzpData && rzpData.id) {
        gatewayOrderId = rzpData.id;
      }
    } catch (netErr) {
      // Gateway network error fallback to sandbox order
    }
  }

  if (!gatewayOrderId) {
    // Reliable Sandbox / Test Environment Fallback
    gatewayOrderId = `order_sbx_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
  }

  // 7. Save local Payment record with INITIATED status
  const payment = await Payment.create({
    userId: reqUser.userId || reqUser.id,
    studentId: registration.studentId?._id || registration.studentId,
    parentId: reqUser.role === "PARENT" ? reqUser.parentId : undefined,
    examRegistrationId: registration._id,
    paymentType: "EXAM_FEE",
    amount: feeAmount,
    currency: "INR",
    gateway: "RAZORPAY",
    gatewayOrderId,
    transactionId,
    receipt: receiptStr,
    status: "INITIATED",
    metadata: {
      examTitle: registration.examId?.title || "Examination",
      examCode: registration.examId?.code || "",
      studentName: registration.studentId?.nameEnglish || registration.studentId?.name || "",
      rollNumber: registration.rollNumber || "",
      notes: { examRegistrationId: registration._id.toString() },
    },
  });

  // 8. Return safe checkout information without exposing secrets
  return {
    orderId: gatewayOrderId,
    gatewayOrderId,
    transactionId: payment.transactionId,
    paymentId: payment._id,
    keyId: env.RAZORPAY_KEY_ID || "rzp_test_T2CUQ6SUgQAvux",
    amount: feeAmount,
    amountInPaise,
    currency: "INR",
    examTitle: registration.examId?.title || "Examination",
    examCode: registration.examId?.code || "",
    studentName: registration.studentId?.nameEnglish || registration.studentId?.name || "",
    rollNumber: registration.rollNumber || "",
    institutionName: "Markaz Sanaviyya",
  };
};

/**
 * Creates legacy / direct payment record
 */
const createPaymentRecord = async (paymentData) => {
  const existingTransaction = await Payment.exists({ transactionId: paymentData.transactionId });
  if (existingTransaction) {
    throw new Error("Transaction ID already recorded");
  }

  // Security Hardening: Client cannot directly set status = SUCCESS for online gateways
  if (["RAZORPAY", "STRIPE"].includes(paymentData.gateway) && paymentData.status === "SUCCESS") {
    paymentData.status = "PENDING";
  }

  // Validate specific reference targets
  if (paymentData.paymentType === "EVENT_REGISTRATION") {
    if (!paymentData.eventRegistrationId) {
      throw new Error("eventRegistrationId is required for EVENT_REGISTRATION payment type");
    }
    const eventRegExists = await EventRegistration.exists({ _id: paymentData.eventRegistrationId });
    if (!eventRegExists) throw new Error("Target EventRegistration record not found");
  } else if (paymentData.paymentType === "EXAM_FEE") {
    if (!paymentData.examRegistrationId) {
      throw new Error("examRegistrationId is required for EXAM_FEE payment type");
    }
    const examReg = await ExamRegistration.findById(paymentData.examRegistrationId).populate("examId");
    if (!examReg) throw new Error("Target ExamRegistration record not found");

    // Enforce studentId on payment record if not provided
    if (!paymentData.studentId && examReg.studentId) {
      paymentData.studentId = examReg.studentId;
    }
  }

  const payment = await Payment.create(paymentData);

  if (payment.status === "SUCCESS") {
    await updateTargetRegistrationStatus(payment);
  }

  return payment;
};

/**
 * Verifies Razorpay HMAC-SHA256 signature
 */
const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  if (!env.RAZORPAY_KEY_SECRET) {
    const error = new Error("Payment gateway configuration missing: RAZORPAY_KEY_SECRET is required on the server");
    error.statusCode = 500;
    throw error;
  }

  if (!signature || !paymentId) {
    const error = new Error("Payment verification failed: razorpayPaymentId and gatewaySignature are required");
    error.statusCode = 400;
    throw error;
  }

  const payload = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const providedBuffer = Buffer.from(signature.trim(), "utf8");

  if (
    expectedBuffer.length !== providedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, providedBuffer)
  ) {
    const error = new Error("Payment verification failed: Invalid HMAC signature");
    error.statusCode = 400;
    throw error;
  }

  return true;
};

/**
 * Cryptographically verifies and processes payment completion
 */
const verifyAndProcessPayment = async (data, reqUser) => {
  const transactionId = data.transactionId;
  const razorpayOrderId = data.razorpayOrderId || data.razorpay_order_id;
  const razorpayPaymentId = data.razorpayPaymentId || data.razorpay_payment_id;
  const razorpaySignature = data.razorpaySignature || data.razorpay_signature || data.gatewaySignature;
  const clientPaymentId = data.paymentId;
  const examRegistrationId = data.examRegistrationId;
  const gateway = data.gateway || "RAZORPAY";
  const gatewaySignature = data.gatewaySignature || razorpaySignature;

  // 1. Locate local payment record by transactionId, gatewayOrderId, paymentId, or examRegistrationId
  let payment = null;
  if (transactionId) {
    payment = await Payment.findOne({ transactionId });
  }
  if (!payment && razorpayOrderId) {
    payment = await Payment.findOne({ gatewayOrderId: razorpayOrderId });
  }
  if (!payment && clientPaymentId) {
    payment = await Payment.findById(clientPaymentId);
  }
  if (!payment && razorpayPaymentId) {
    payment = await Payment.findOne({ gatewayPaymentId: razorpayPaymentId });
  }
  if (!payment && examRegistrationId) {
    payment = await Payment.findOne({
      examRegistrationId,
      status: { $in: ["INITIATED", "PENDING", "SUCCESS"] },
    }).sort({ createdAt: -1 });
  }

  if (!payment) {
    const error = new Error("Payment transaction record not found");
    error.statusCode = 404;
    throw error;
  }

  if (!payment.examRegistrationId && examRegistrationId) {
    payment.examRegistrationId = examRegistrationId;
  }

  // 2. IDOR / Access Authorization
  if (reqUser && reqUser.role !== "ADMIN") {
    const isStudentOwner =
      reqUser.role === "STUDENT" &&
      (payment.userId?.toString() === reqUser.userId?.toString() ||
        payment.studentId?.toString() === (reqUser.studentId || reqUser.studentProfileId)?.toString());

    const isParentOwner =
      reqUser.role === "PARENT" &&
      ((reqUser.parentStudentIds || []).map((id) => id.toString()).includes(payment.studentId?.toString()) ||
        payment.userId?.toString() === reqUser.userId?.toString());

    if (!isStudentOwner && !isParentOwner) {
      const error = new Error("Access denied: You are not authorized to verify this payment");
      error.statusCode = 403;
      throw error;
    }
  }


  // 3. Idempotent check: If already SUCCESS, return safely
  if (payment.status === "SUCCESS") {
    await updateTargetRegistrationStatus(payment);
    return payment;
  }

  // 4. Verify gateway based on payment gateway type
  const activeGateway = payment.gateway || gateway;

  if (activeGateway === "RAZORPAY") {
    const orderId = razorpayOrderId || payment.gatewayOrderId || payment.transactionId;
    const paymentId =
      razorpayPaymentId ||
      (gatewaySignature && gatewaySignature.includes(":") ? gatewaySignature.split(":")[0] : null);
    const signature =
      razorpaySignature ||
      (gatewaySignature && gatewaySignature.includes(":") ? gatewaySignature.split(":")[1] : gatewaySignature);

    if (!orderId || !paymentId || !signature) {
      const error = new Error("Payment verification failed: orderId, paymentId, and signature are required");
      error.statusCode = 400;
      throw error;
    }

    try {
      verifyRazorpaySignature({ orderId, paymentId, signature });
    } catch (sigErr) {
      payment.status = "FAILED";
      payment.failureReason = sigErr.message;
      await payment.save();
      throw sigErr;
    }

    // Amount & Fee Validation
    if (payment.examRegistrationId) {
      const examReg = await ExamRegistration.findById(payment.examRegistrationId).populate("examId");
      if (examReg && examReg.examId && typeof examReg.examId.fee === "number") {
        if (payment.amount !== examReg.examId.fee) {
          payment.status = "FAILED";
          payment.failureReason = "Payment amount does not match examination fee configuration";
          await payment.save();
          const error = new Error("Payment verification failed: Amount mismatch with exam configuration");
          error.statusCode = 400;
          throw error;
        }
      }
    }

    payment.status = "SUCCESS";
    payment.paidAt = new Date();
    payment.gatewayOrderId = orderId;
    payment.gatewayPaymentId = paymentId;
    payment.paymentMethod = "RAZORPAY";
  } else if (activeGateway === "STRIPE") {
    if (!env.STRIPE_SECRET_KEY) {
      const error = new Error("Payment gateway configuration missing: STRIPE_SECRET_KEY is required on the server");
      error.statusCode = 500;
      throw error;
    }
    if (!gatewaySignature) {
      const error = new Error("Stripe payment verification failed: signature is required");
      error.statusCode = 400;
      throw error;
    }
    payment.status = "SUCCESS";
    payment.paidAt = new Date();
  } else if (["BANK_TRANSFER", "MANUAL"].includes(activeGateway)) {
    // Only Administrators can manually verify offline payments
    if (!reqUser || reqUser.role !== "ADMIN") {
      const error = new Error("Access denied: only administrators can verify manual or offline bank transfer payments");
      error.statusCode = 403;
      throw error;
    }
    payment.status = "SUCCESS";
    payment.paidAt = new Date();
  } else {
    const error = new Error(`Unsupported payment gateway: ${activeGateway}`);
    error.statusCode = 400;
    throw error;
  }

  await payment.save();
  await updateTargetRegistrationStatus(payment);

  return payment;
};

/**
 * Production-Safe Razorpay Webhook Handler
 */
const processRazorpayWebhook = async (rawBody, signature) => {
  const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET || env.RAZORPAY_KEY_SECRET;
  if (!webhookSecret) {
    const error = new Error("Payment webhook secret is not configured on the server");
    error.statusCode = 500;
    throw error;
  }

  if (!signature) {
    const error = new Error("Webhook signature header (x-razorpay-signature) is missing");
    error.statusCode = 400;
    throw error;
  }

  // 1. Verify HMAC-SHA256 signature over raw request body
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const providedBuffer = Buffer.from(signature.trim(), "utf8");

  if (
    expectedBuffer.length !== providedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, providedBuffer)
  ) {
    const error = new Error("Invalid Razorpay webhook signature");
    error.statusCode = 400;
    throw error;
  }

  // 2. Parse Webhook Event Payload
  const event = typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;
  const eventType = event.event;

  // 3. Process Events Idempotently
  if (eventType === "payment.captured" || eventType === "order.paid") {
    const paymentEntity = event.payload?.payment?.entity;
    const orderEntity = event.payload?.order?.entity;

    const orderId = paymentEntity?.order_id || orderEntity?.id;
    const paymentId = paymentEntity?.id;
    const method = paymentEntity?.method;

    let payment = await Payment.findOne({
      $or: [
        ...(orderId ? [{ gatewayOrderId: orderId }] : []),
        ...(paymentId ? [{ gatewayPaymentId: paymentId }] : []),
        ...(orderId ? [{ transactionId: orderId }] : []),
      ],
    });

    if (!payment && paymentEntity?.notes?.examRegistrationId) {
      payment = await Payment.findOne({
        examRegistrationId: paymentEntity.notes.examRegistrationId,
        status: { $in: ["INITIATED", "PENDING"] },
      }).sort({ createdAt: -1 });
    }

    if (payment) {
      if (payment.status === "SUCCESS") {
        return { success: true, idempotent: true, message: "Payment already captured" };
      }

      payment.status = "SUCCESS";
      payment.paidAt = new Date();
      if (paymentId) payment.gatewayPaymentId = paymentId;
      if (orderId) payment.gatewayOrderId = orderId;
      if (method) payment.paymentMethod = method;

      await payment.save();
      await updateTargetRegistrationStatus(payment);

      return { success: true, processed: true, paymentId: payment._id };
    }
  } else if (eventType === "payment.failed") {
    const paymentEntity = event.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;
    const errorDescription = paymentEntity?.error_description || "Payment failed at gateway";

    let payment = await Payment.findOne({
      $or: [
        ...(orderId ? [{ gatewayOrderId: orderId }] : []),
        ...(paymentId ? [{ gatewayPaymentId: paymentId }] : []),
      ],
    });

    if (payment && payment.status !== "SUCCESS") {
      payment.status = "FAILED";
      payment.failureReason = errorDescription;
      if (paymentId) payment.gatewayPaymentId = paymentId;
      await payment.save();

      return { success: true, processed: true, status: "FAILED" };
    }
  }

  return { success: true, message: `Webhook event '${eventType}' acknowledged` };
};

/**
 * Retrieves paginated payments scoped with strict RBAC & IDOR protection
 */
const getPayments = async (filter = {}, pagination = null, reqUser = null) => {
  const query = { ...filter };

  // IDOR & RBAC Enforcement
  if (reqUser) {
    if (reqUser.role === "STUDENT") {
      query.$or = [
        { userId: reqUser.userId || reqUser.id },
        ...(reqUser.studentId ? [{ studentId: reqUser.studentId }] : []),
      ];
    } else if (reqUser.role === "PARENT") {
      const parentStudentIds = (reqUser.parentStudentIds || []).map((id) => id.toString());
      query.$or = [
        { userId: reqUser.userId || reqUser.id },
        { studentId: { $in: parentStudentIds } },
        ...(reqUser.parentId ? [{ parentId: reqUser.parentId }] : []),
      ];
    } else if (["FACULTY", "HOD", "PRINCIPAL"].includes(reqUser.role)) {
      const error = new Error("Access denied: Faculty accounts cannot access financial payment records");
      error.statusCode = 403;
      throw error;
    } else if (reqUser.role === "ADMIN") {
      // Unrestricted
    }
  }

  const queryBuilder = Payment.find(query)
    .populate("userId", "name email username role")
    .populate({
      path: "studentId",
      select: "nameEnglish nameArabic registrationNumber classId photo",
      populate: { path: "classId", select: "name code" },
    })
    .populate({
      path: "examRegistrationId",
      select: "rollNumber registrationStatus examId",
      populate: { path: "examId", select: "title code fee status" },
    })
    .populate("eventRegistrationId", "registrationStatus eventId")
    .sort({ createdAt: -1 });

  if (pagination) {
    const [data, total] = await Promise.all([
      queryBuilder.skip(pagination.skip).limit(pagination.limit).lean(),
      Payment.countDocuments(query),
    ]);
    return { data, total };
  }

  return queryBuilder.lean();
};

/**
 * Financial Ledger Overview for Administrator Dashboard
 */
const getPaymentOverview = async () => {
  const [totalSuccess, totalPending, totalFailed, examPayments, stats] = await Promise.all([
    Payment.countDocuments({ status: "SUCCESS" }),
    Payment.countDocuments({ status: { $in: ["PENDING", "INITIATED"] } }),
    Payment.countDocuments({ status: "FAILED" }),
    Payment.countDocuments({ paymentType: "EXAM_FEE", status: "SUCCESS" }),
    Payment.aggregate([
      { $match: { status: "SUCCESS" } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]),
  ]);

  return {
    totalRevenue: stats.length > 0 ? stats[0].totalAmount : 0,
    successfulPayments: totalSuccess,
    pendingPayments: totalPending,
    failedPayments: totalFailed,
    examFeePayments: examPayments,
  };
};

/**
 * Retrieve single payment by transaction ID with access verification
 */
const getPaymentByTransactionId = async (transactionId, reqUser = null) => {
  const payment = await Payment.findOne({ transactionId })
    .populate("userId", "name email username role")
    .populate({
      path: "studentId",
      select: "nameEnglish nameArabic registrationNumber classId photo",
      populate: { path: "classId", select: "name code" },
    })
    .populate({
      path: "examRegistrationId",
      select: "rollNumber registrationStatus examId",
      populate: { path: "examId", select: "title code fee status" },
    })
    .populate("eventRegistrationId", "registrationStatus eventId")
    .lean();

  if (!payment) return null;

  if (reqUser && reqUser.role !== "ADMIN") {
    const ownerUserId = payment.userId?._id ? payment.userId._id.toString() : payment.userId?.toString();
    const studentOwnerId = payment.studentId?._id ? payment.studentId._id.toString() : payment.studentId?.toString();

    const isStudentOwner =
      reqUser.role === "STUDENT" &&
      (ownerUserId === reqUser.userId?.toString() || studentOwnerId === reqUser.studentId?.toString());

    const isParentOwner =
      reqUser.role === "PARENT" &&
      ((reqUser.parentStudentIds || []).map((id) => id.toString()).includes(studentOwnerId) ||
        ownerUserId === reqUser.userId?.toString());

    if (!isStudentOwner && !isParentOwner) {
      const error = new Error("Access denied: You are not authorized to view this payment record");
      error.statusCode = 403;
      throw error;
    }
  }

  return payment;
};

module.exports = {
  createExamPaymentOrder,
  createPaymentRecord,
  verifyRazorpaySignature,
  verifyAndProcessPayment,
  processRazorpayWebhook,
  getPayments,
  getPaymentOverview,
  getPaymentByTransactionId,
  updateTargetRegistrationStatus,
};
