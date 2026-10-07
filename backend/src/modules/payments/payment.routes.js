const express = require("express");
const {
  handleCreateOrder,
  handleCreatePayment,
  handleVerifyPayment,
  handleRazorpayWebhook,
  handleGetPayments,
  handleGetPaymentOverview,
  handleGetPaymentByTransactionId,
} = require("./payment.controller");
const {
  validateCreateOrder,
  validateCreatePayment,
  validateVerifyPayment,
} = require("./payment.validator");
const { requireAuth } = require("../../middleware/auth.middleware");

const router = express.Router();

// Razorpay asynchronous webhook (verified via HMAC x-razorpay-signature header)
router.post("/webhook/razorpay", handleRazorpayWebhook);

// Protected payment endpoints
router.post("/create-order", requireAuth, validateCreateOrder, handleCreateOrder);
router.post("/verify", requireAuth, validateVerifyPayment, handleVerifyPayment);
router.get("/overview", requireAuth, handleGetPaymentOverview);

router.post("/", requireAuth, validateCreatePayment, handleCreatePayment);
router.get("/", requireAuth, handleGetPayments);
router.get("/:transactionId", requireAuth, handleGetPaymentByTransactionId);

module.exports = router;
