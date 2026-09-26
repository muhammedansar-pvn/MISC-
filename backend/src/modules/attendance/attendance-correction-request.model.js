const mongoose = require("mongoose");

const attendanceCorrectionRequestSchema = new mongoose.Schema(
  {
    attendanceRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttendanceRecord",
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    period: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },

    currentStatus: {
      type: String,
      required: true,
      enum: ["PRESENT", "ABSENT", "LATE", "LEAVE", "EXCUSED"],
    },

    requestedStatus: {
      type: String,
      required: true,
      enum: ["PRESENT", "ABSENT", "LATE", "LEAVE", "EXCUSED"],
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedAt: {
      type: Date,
    },

    adminRemarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "attendanceCorrectionRequests",
  }
);

// Indexes
attendanceCorrectionRequestSchema.index({ studentId: 1, date: 1, period: 1 });
attendanceCorrectionRequestSchema.index({ status: 1 });
attendanceCorrectionRequestSchema.index({ requestedBy: 1 });

module.exports = mongoose.model(
  "AttendanceCorrectionRequest",
  attendanceCorrectionRequestSchema
);
