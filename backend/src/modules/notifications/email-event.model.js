const mongoose = require("mongoose");

const EMAIL_EVENT_TYPES = [
  "EXAM_PUBLISHED",
  "EXAM_REGISTRATION",
  "PAYMENT_SUCCESS",
  "HALL_TICKET",
  "LEAVE_SUBMITTED",
  "LEAVE_APPROVED",
  "LEAVE_REJECTED",
  "RESULT_PUBLISHED",
  "ATTENDANCE_WARNING",
  "TIMETABLE_ASSIGNED",
  "TIMETABLE_UPDATED",
  "EMAIL_VERIFICATION",
  "PASSWORD_RESET",
  "ACCOUNT_SETUP",
  "PASSWORD_SETUP",
  "SYSTEM_TEST",
  "GENERIC",
];

const emailEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      enum: EMAIL_EVENT_TYPES,
      index: true,
    },
    recipientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    recipientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    dedupKey: {
      type: String,
      sparse: true,
      index: true,
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: ["SENT", "FAILED", "SKIPPED", "DUPLICATE"],
      default: "SENT",
      index: true,
    },
    providerMessageId: {
      type: String,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    sentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

emailEventSchema.index({ recipientEmail: 1, createdAt: -1 });
emailEventSchema.index({ eventType: 1, createdAt: -1 });

module.exports = mongoose.model("EmailEvent", emailEventSchema);
