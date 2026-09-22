const express = require("express");
const {
  handleCreatePayment,
  handleVerifyPayment,
  handleGetPayments,
  handleGetPaymentByTransactionId,
} = require("./payment.controller");
const { validateCreatePayment, validateVerifyPayment } = require("./payment.validator");
const { requireAuth } = require("../../middleware/auth.middleware");

const router = express.Router();

router.post("/", requireAuth, validateCreatePayment, handleCreatePayment);
router.post("/verify", requireAuth, validateVerifyPayment, handleVerifyPayment);
router.get("/", requireAuth, handleGetPayments);
router.get("/:transactionId", requireAuth, handleGetPaymentByTransactionId);

module.exports = router;
