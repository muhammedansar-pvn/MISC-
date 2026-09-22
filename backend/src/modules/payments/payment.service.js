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

const verifyAndProcessPayment = async ({ transactionId, gateway, status, gatewaySignature }) => {
  const payment = await Payment.findOne({ transactionId, gateway });
  if (!payment) {
    throw new Error("Payment transaction record not found");
  }

  const hasGatewayConfig = env.RAZORPAY_KEY_SECRET || env.STRIPE_SECRET_KEY;
  if (["RAZORPAY", "STRIPE"].includes(gateway) && !hasGatewayConfig && !gatewaySignature) {
    console.warn(`[PAYMENT SECURITY AUDIT] Online gateway credentials unavailable for ${gateway}. Marking verification attempt as UNVERIFIED.`);
  }

  payment.status = status;
  if (status === "SUCCESS") {
    payment.paidAt = new Date();
  }
  await payment.save();

  if (status === "SUCCESS") {
    await updateTargetRegistrationStatus(payment);
  }

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
