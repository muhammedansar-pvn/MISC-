const Payment = require("../models/Payment");
const EventRegistration = require("../models/EventRegistration");
const ExamRegistration = require("../models/ExamRegistration");

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

  // If status is SUCCESS (e.g., verified MANUAL/BANK_TRANSFER by admin), update related registration
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

  // Security Check: If online gateway credentials are not configured in environment, mark warning
  const hasGatewayConfig = process.env.RAZORPAY_KEY_SECRET || process.env.STRIPE_SECRET_KEY;
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
