const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      required: true,
      default: "INR",
    },

    gateway: {
      type: String,
      required: true,
      enum: ["RAZORPAY", "STRIPE", "BANK_TRANSFER", "MANUAL"],
    },

    transactionId: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
    },

    receiptUrl: {
      type: String,
      trim: true,
    },

    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "payments",
  }
);

// Indexes
paymentSchema.index({ transactionId: 1 }, { unique: true });

module.exports = mongoose.model("Payment", paymentSchema);
