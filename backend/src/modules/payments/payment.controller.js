const paymentService = require("./payment.service");
const { parsePagination, formatPaginatedResponse } = require("../../shared/utils/pagination");

/**
 * Handle Razorpay order creation for Exam Registration fee payment
 */
const handleCreateOrder = async (req, res) => {
  try {
    const orderData = await paymentService.createExamPaymentOrder(req.body, req.user);
    return res.status(201).json({
      success: true,
      message: "Payment order created successfully",
      data: orderData,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to create payment order",
    });
  }
};

/**
 * Direct / manual payment record creation
 */
const handleCreatePayment = async (req, res) => {
  try {
    const paymentData = { ...req.body };
    if (req.user) {
      paymentData.userId = req.user.userId;
    }
    const payment = await paymentService.createPaymentRecord(paymentData);
    return res.status(201).json({ success: true, message: "Payment recorded successfully", data: payment });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to record payment" });
  }
};

/**
 * Cryptographic payment verification (Razorpay, Stripe, or offline manual)
 */
const handleVerifyPayment = async (req, res) => {
  try {
    const payment = await paymentService.verifyAndProcessPayment(req.body, req.user);
    return res.status(200).json({ success: true, message: "Payment status verified successfully", data: payment });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: error.message || "Payment verification failed" });
  }
};

/**
 * Webhook handler for asynchronous Razorpay gateway event reconciliation
 */
const handleRazorpayWebhook = async (req, res) => {
  try {
    const rawBody = req.rawBody || JSON.stringify(req.body);
    const signature = req.headers["x-razorpay-signature"];

    const result = await paymentService.processRazorpayWebhook(rawBody, signature);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Webhook processing error",
    });
  }
};

/**
 * Get paginated list of payments with strict RBAC & IDOR scoping
 */
const handleGetPayments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.paymentType) {
      filter.paymentType = req.query.paymentType;
    }
    if (req.query.gateway) {
      filter.gateway = req.query.gateway;
    }

    const { page, limit, skip } = parsePagination(req.query);
    const { data, total } = await paymentService.getPayments(filter, { page, limit, skip }, req.user);
    return res.status(200).json(formatPaginatedResponse({ data, total, page, limit }));
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve payments",
    });
  }
};

/**
 * Admin financial overview statistics
 */
const handleGetPaymentOverview = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Financial overview requires administrator privileges",
      });
    }

    const stats = await paymentService.getPaymentOverview();
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve financial overview" });
  }
};

/**
 * Get single payment by transaction ID with access verification
 */
const handleGetPaymentByTransactionId = async (req, res) => {
  try {
    const payment = await paymentService.getPaymentByTransactionId(req.params.transactionId, req.user);
    if (!payment) return res.status(404).json({ success: false, message: "Payment record not found" });

    return res.status(200).json({ success: true, data: payment });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to retrieve payment record" });
  }
};

module.exports = {
  handleCreateOrder,
  handleCreatePayment,
  handleVerifyPayment,
  handleRazorpayWebhook,
  handleGetPayments,
  handleGetPaymentOverview,
  handleGetPaymentByTransactionId,
};
