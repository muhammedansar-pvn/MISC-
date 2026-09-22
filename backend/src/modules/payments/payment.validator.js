const Joi = require("joi");
const { validateSchema } = require("../../middleware/validation.middleware");

const createPaymentSchema = Joi.object({
  userId: Joi.string().hex().length(24).allow(null, ""),
  paymentType: Joi.string().valid("EVENT_REGISTRATION", "EXAM_FEE", "INSTITUTION_FEE").required(),
  eventRegistrationId: Joi.string().hex().length(24).allow(null, ""),
  examRegistrationId: Joi.string().hex().length(24).allow(null, ""),
  amount: Joi.number().greater(0).required(),
  currency: Joi.string().default("INR"),
  gateway: Joi.string().valid("RAZORPAY", "STRIPE", "BANK_TRANSFER", "MANUAL").required(),
  transactionId: Joi.string().trim().required(),
  status: Joi.string().valid("PENDING", "SUCCESS", "FAILED", "REFUNDED").required(),
  receiptUrl: Joi.string().trim().allow(""),
  paidAt: Joi.date().iso().allow(null),
});

const verifyPaymentSchema = Joi.object({
  transactionId: Joi.string().trim().required(),
  gateway: Joi.string().valid("RAZORPAY", "STRIPE", "BANK_TRANSFER", "MANUAL").required(),
  gatewaySignature: Joi.string().trim().allow(""),
  status: Joi.string().valid("SUCCESS", "FAILED", "REFUNDED").required(),
});

module.exports = {
  validateCreatePayment: validateSchema(createPaymentSchema),
  validateVerifyPayment: validateSchema(verifyPaymentSchema),
};
