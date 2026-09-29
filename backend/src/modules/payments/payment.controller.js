const paymentService = require("./payment.service");

const handleCreatePayment = async (req, res) => {
  try {
    const paymentData = { ...req.body };
    if (req.user) {
      paymentData.userId = req.user.userId;
    }
    const payment = await paymentService.createPaymentRecord(paymentData);
    return res.status(201).json({ success: true, message: "Payment recorded successfully", data: payment });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to record payment" });
  }
};

const handleVerifyPayment = async (req, res) => {
  try {
    const payment = await paymentService.verifyAndProcessPayment(req.body, req.user);
    return res.status(200).json({ success: true, message: "Payment status verified successfully", data: payment });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: error.message || "Payment verification failed" });
  }
};

const { parsePagination, formatPaginatedResponse } = require("../../shared/utils/pagination");

const handleGetPayments = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role !== "ADMIN") {
      filter.userId = req.user.userId;
    }
    const { page, limit, skip } = parsePagination(req.query);
    const { data, total } = await paymentService.getPayments(filter, { page, limit, skip });
    return res.status(200).json(formatPaginatedResponse({ data, total, page, limit }));
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve payments" });
  }
};

const handleGetPaymentByTransactionId = async (req, res) => {
  try {
    const payment = await paymentService.getPaymentByTransactionId(req.params.transactionId);
    if (!payment) return res.status(404).json({ success: false, message: "Payment record not found" });

    const ownerId = payment.userId?._id ? payment.userId._id.toString() : payment.userId?.toString();
    if (req.user?.role !== "ADMIN" && ownerId !== req.user?.userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You can only view your own payment records",
      });
    }

    return res.status(200).json({ success: true, data: payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve payment record" });
  }
};

module.exports = {
  handleCreatePayment,
  handleVerifyPayment,
  handleGetPayments,
  handleGetPaymentByTransactionId,
};
