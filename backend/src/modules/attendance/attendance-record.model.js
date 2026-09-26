const mongoose = require("mongoose");

const attendanceRecordSchema = new mongoose.Schema(
  {
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

    sessionName: {
      type: String,
      trim: true,
      default: function () {
        return `Period ${this.period}`;
      },
    },

    source: {
      type: String,
      required: true,
      enum: ["MANUAL_CORRECTION", "SYSTEM_OVERRIDE", "BIOMETRIC"],
      default: "SYSTEM_OVERRIDE",
    },

    status: {
      type: String,
      required: true,
      enum: ["PRESENT", "ABSENT", "LATE", "LEAVE", "EXCUSED"],
      default: "PRESENT",
    },

    rawPunchTime: {
      type: Date,
    },

    biometricDeviceId: {
      type: String,
      trim: true,
    },

    isCorrected: {
      type: Boolean,
      default: false,
    },

    correctionRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttendanceCorrectionRequest",
    },

    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "attendanceRecords",
  }
);

// Compound Unique Index: One record per student per period per day
attendanceRecordSchema.index(
  {
    studentId: 1,
    date: 1,
    period: 1,
  },
  {
    unique: true,
  }
);

attendanceRecordSchema.index({ classId: 1, date: 1, period: 1 });
attendanceRecordSchema.index({ studentId: 1, date: 1 });

module.exports = mongoose.model("AttendanceRecord", attendanceRecordSchema);
