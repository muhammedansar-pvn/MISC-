const Payment = require("../models/Payment");
const EventRegistration = require("../models/EventRegistration");
const ExamRegistration = require("../models/ExamRegistration");

const createPaymentRecord = async (paymentData) => {
  const existingTransaction = await Payment.findOne({ transactionId: paymentData.transactionId });
  if (existingTransaction) {
    throw new Error("Transaction ID already recorded");
  }

  // Validate specific reference targets
  if (paymentData.paymentType === "EVENT_REGISTRATION") {
    if (!paymentData.eventRegistrationId) {
      throw new Error("eventRegistrationId is required for EVENT_REGISTRATION payment type");
    }
    const eventReg = await EventRegistration.findById(paymentData.eventRegistrationId);
    if (!eventReg) throw new Error("Target EventRegistration record not found");
  } else if (paymentData.paymentType === "EXAM_FEE") {
    if (!paymentData.examRegistrationId) {
      throw new Error("examRegistrationId is required for EXAM_FEE payment type");
    }
    const examReg = await ExamRegistration.findById(paymentData.examRegistrationId);
    if (!examReg) throw new Error("Target ExamRegistration record not found");
  }

  const payment = await Payment.create(paymentData);

  // If status is SUCCESS, immediately update related registration
  if (payment.status === "SUCCESS") {
    await updateTargetRegistrationStatus(payment);
  }

  return payment;
};

const verifyAndProcessPayment = async ({ transactionId, gateway, status }) => {
  const payment = await Payment.findOne({ transactionId, gateway });
  if (!payment) {
    throw new Error("Payment transaction record not found");
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
    .populate("eventRegistrationId")
    .populate("examRegistrationId");
};

const getPaymentByTransactionId = async (transactionId) => {
  return Payment.findOne({ transactionId })
    .populate("userId", "name email username role")
    .populate("eventRegistrationId")
    .populate("examRegistrationId");
};

module.exports = {
  createPaymentRecord,
  verifyAndProcessPayment,
  getPayments,
  getPaymentByTransactionId,
};
