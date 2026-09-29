const Payment = require("./payment.model");
const EventRegistration = require("../events/event-registration.model");
const ExamRegistration = require("../exams/exam-registration.model");
const env = require("../../config/env");

const updateTargetRegistrationStatus = async (payment) => {
  if (payment.paymentType === "EVENT_REGISTRATION" && payment.eventRegistrationId) {
    await EventRegistration.findByIdAndUpdate(payment.eventRegistrationId, {
      registrationStatus: "CONFIRMED",
      paymentId: payment._id,
    });
  } else if (payment.paymentType === "EXAM_FEE" && payment.examRegistrationId) {
    await ExamRegistration.findByIdAndUpdate(payment.examRegistrationId, {
      registrationStatus: "HALL_TICKET_ISSUED",
      paymentId: payment._id,
    });
  }
};

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
    const examRegExists = await ExamRegistration.exists({ _id: paymentData.examRegistrationId });
    if (!examRegExists) throw new Error("Target ExamRegistration record not found");
  }

  const payment = await Payment.create(paymentData);

  if (payment.status === "SUCCESS") {
    await updateTargetRegistrationStatus(payment);
  }

  return payment;
};

const crypto = require("crypto");

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

const verifyAndProcessPayment = async (
  { transactionId, gateway, gatewaySignature, razorpayPaymentId, razorpayOrderId },
  reqUser
) => {
  const payment = await Payment.findOne({ transactionId, gateway });
  if (!payment) {
    const error = new Error("Payment transaction record not found");
    error.statusCode = 404;
    throw error;
  }

  if (gateway === "RAZORPAY") {
    const orderId = razorpayOrderId || transactionId;
    const paymentId = razorpayPaymentId || (gatewaySignature && gatewaySignature.includes(":") ? gatewaySignature.split(":")[0] : null);
    const signature = gatewaySignature && gatewaySignature.includes(":") ? gatewaySignature.split(":")[1] : gatewaySignature;

    verifyRazorpaySignature({ orderId, paymentId, signature });

    payment.status = "SUCCESS";
    payment.paidAt = new Date();
  } else if (gateway === "STRIPE") {
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
  } else if (["BANK_TRANSFER", "MANUAL"].includes(gateway)) {
    // Only Administrators can manually verify offline payments
    if (!reqUser || reqUser.role !== "ADMIN") {
      const error = new Error("Access denied: only administrators can verify manual or offline bank transfer payments");
      error.statusCode = 403;
      throw error;
    }
    payment.status = "SUCCESS";
    payment.paidAt = new Date();
  } else {
    const error = new Error(`Unsupported payment gateway: ${gateway}`);
    error.statusCode = 400;
    throw error;
  }

  await payment.save();
  await updateTargetRegistrationStatus(payment);

  return payment;
};

const getPayments = async (filter = {}) => {
  return Payment.find(filter)
    .populate("userId", "name email username role")
    .populate("eventRegistrationId", "registrationStatus eventId")
    .populate("examRegistrationId", "registrationStatus rollNumber examId")
    .lean();
};

const getPaymentByTransactionId = async (transactionId) => {
  return Payment.findOne({ transactionId })
    .populate("userId", "name email username role")
    .populate("eventRegistrationId", "registrationStatus eventId")
    .populate("examRegistrationId", "registrationStatus rollNumber examId")
    .lean();
};

module.exports = {
  createPaymentRecord,
  verifyAndProcessPayment,
  getPayments,
  getPaymentByTransactionId,
};
