const mongoose = require("mongoose");

const NOTIFICATION_TYPES = [
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
  "SYSTEM",
  "SYSTEM_ALERT",
];

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      required: true,
      enum: NOTIFICATION_TYPES,
      default: "SYSTEM",
      index: true,
    },
    link: {
      type: String,
      trim: true,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "notifications",
  }
);

// Compound indexes for optimal user queries and unread counting
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
