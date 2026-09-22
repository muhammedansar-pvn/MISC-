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
    const payment = await paymentService.verifyAndProcessPayment(req.body);
    return res.status(200).json({ success: true, message: "Payment status verified successfully", data: payment });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Payment verification failed" });
  }
};

const handleGetPayments = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role !== "ADMIN") {
      filter.userId = req.user.userId;
    }
    const payments = await paymentService.getPayments(filter);
    return res.status(200).json({ success: true, data: payments });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve payments" });
  }
};

const handleGetPaymentByTransactionId = async (req, res) => {
  try {
    const payment = await paymentService.getPaymentByTransactionId(req.params.transactionId);
    if (!payment) return res.status(404).json({ success: false, message: "Payment record not found" });
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
