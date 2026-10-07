const Joi = require("joi");
const { validateSchema } = require("../../middleware/validation.middleware");

const createOrderSchema = Joi.object({
  examRegistrationId: Joi.string().hex().length(24).required().messages({
    "any.required": "examRegistrationId is required to create a payment order",
  }),
});

const createPaymentSchema = Joi.object({
  userId: Joi.string().hex().length(24).allow(null, ""),
  studentId: Joi.string().hex().length(24).allow(null, ""),
  parentId: Joi.string().hex().length(24).allow(null, ""),
  paymentType: Joi.string().valid("EVENT_REGISTRATION", "EXAM_FEE", "INSTITUTION_FEE").required(),
  eventRegistrationId: Joi.string().hex().length(24).allow(null, ""),
  examRegistrationId: Joi.string().hex().length(24).allow(null, ""),
  amount: Joi.number().greater(0).required(),
  currency: Joi.string().default("INR"),
  gateway: Joi.string().valid("RAZORPAY", "STRIPE", "BANK_TRANSFER", "MANUAL").required(),
  transactionId: Joi.string().trim().required(),
  status: Joi.string().valid("INITIATED", "PENDING", "SUCCESS", "FAILED", "CANCELLED", "REFUNDED").required(),
  receipt: Joi.string().trim().allow(""),
  receiptUrl: Joi.string().trim().allow(""),
  paidAt: Joi.date().iso().allow(null),
});

const verifyPaymentSchema = Joi.object({
  transactionId: Joi.string().trim().allow("", null).optional(),
  paymentId: Joi.string().hex().length(24).allow("", null).optional(),
  examRegistrationId: Joi.string().hex().length(24).allow("", null).optional(),
  gateway: Joi.string().valid("RAZORPAY", "STRIPE", "BANK_TRANSFER", "MANUAL").default("RAZORPAY"),
  gatewaySignature: Joi.string().trim().allow("").optional(),
  razorpayPaymentId: Joi.string().trim().allow("").optional(),
  razorpayOrderId: Joi.string().trim().allow("").optional(),
  razorpaySignature: Joi.string().trim().allow("").optional(),
  razorpay_payment_id: Joi.string().trim().allow("").optional(),
  razorpay_order_id: Joi.string().trim().allow("").optional(),
  razorpay_signature: Joi.string().trim().allow("").optional(),
  status: Joi.string().valid("SUCCESS", "FAILED", "REFUNDED").optional(),
})
  .or("transactionId", "razorpayOrderId", "razorpay_order_id", "paymentId")
  .custom((value, helpers) => {
    const orderId = value.razorpayOrderId || value.razorpay_order_id;
    const paymentId = value.razorpayPaymentId || value.razorpay_payment_id;
    const signature = value.razorpaySignature || value.razorpay_signature || value.gatewaySignature;

    if (orderId) {
      value.razorpayOrderId = orderId;
      value.razorpay_order_id = orderId;
    }
    if (paymentId) {
      value.razorpayPaymentId = paymentId;
      value.razorpay_payment_id = paymentId;
    }
    if (signature) {
      value.razorpaySignature = signature;
      value.razorpay_signature = signature;
      value.gatewaySignature = signature;
    }

    if (value.gateway === "RAZORPAY") {
      if (!value.transactionId && !orderId) {
        return helpers.message("Either transactionId, razorpayOrderId, or razorpay_order_id is required");
      }
      if (!paymentId) {
        return helpers.message("razorpay_payment_id (or razorpayPaymentId) is required for Razorpay payment verification");
      }
      if (!signature) {
        return helpers.message("razorpay_signature (or razorpaySignature) is required for Razorpay payment verification");
      }
    }
    return value;
  });


module.exports = {
  validateCreateOrder: validateSchema(createOrderSchema),
  validateCreatePayment: validateSchema(createPaymentSchema),
  validateVerifyPayment: validateSchema(verifyPaymentSchema),
};
