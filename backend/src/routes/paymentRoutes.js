const express = require("express");
const {
  handleCreatePayment,
  handleVerifyPayment,
  handleGetPayments,
  handleGetPaymentByTransactionId,
} = require("../controllers/paymentController");
const { validateCreatePayment, validateVerifyPayment } = require("../validators/paymentValidator");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", requireAuth, validateCreatePayment, handleCreatePayment);
router.post("/verify", requireAuth, validateVerifyPayment, handleVerifyPayment);
router.get("/", requireAuth, handleGetPayments);
router.get("/:transactionId", requireAuth, handleGetPaymentByTransactionId);

module.exports = router;
