const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      index: true,
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParentProfile",
      index: true,
    },

    paymentType: {
      type: String,
      required: true,
      enum: ["EVENT_REGISTRATION", "EXAM_FEE", "INSTITUTION_FEE"],
    },

    eventRegistrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventRegistration",
    },

    examRegistrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamRegistration",
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      required: true,
      default: "INR",
      uppercase: true,
      trim: true,
    },

    gateway: {
      type: String,
      required: true,
      enum: ["RAZORPAY", "STRIPE", "BANK_TRANSFER", "MANUAL"],
    },

    gatewayOrderId: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },

    gatewayPaymentId: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },

    transactionId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    receipt: {
      type: String,
      trim: true,
    },

    receiptUrl: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["INITIATED", "PENDING", "SUCCESS", "FAILED", "CANCELLED", "REFUNDED"],
      default: "INITIATED",
      index: true,
    },

    paymentMethod: {
      type: String,
      trim: true,
    },

    paidAt: {
      type: Date,
    },

    failureReason: {
      type: String,
      trim: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "payments",
  }
);

// Compound and retrieval performance indexes
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ studentId: 1, createdAt: -1 });
paymentSchema.index({ parentId: 1, createdAt: -1 });
paymentSchema.index({ examRegistrationId: 1, createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
