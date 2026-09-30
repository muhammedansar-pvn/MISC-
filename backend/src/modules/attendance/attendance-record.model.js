const mongoose = require("mongoose");

const attendanceRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
      index: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },

    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
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
      enum: ["MANUAL", "MANUAL_CORRECTION", "SYSTEM_OVERRIDE", "BIOMETRIC"],
      default: "MANUAL",
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

    // Biometric Architecture Future-Proofing (Nullable until biometric device integration)
    biometricDeviceId: {
      type: String,
      trim: true,
      default: null,
    },

    biometricEventId: {
      type: String,
      trim: true,
      default: null,
    },

    // Intentionally set to true by both admin-approved correction-requests and leave-driven attendance overrides
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

// Compound Unique Index: Prevent duplicate attendance records for the same student + class + subject + academic year + date + period
attendanceRecordSchema.index(
  {
    studentId: 1,
    classId: 1,
    subjectId: 1,
    academicYearId: 1,
    date: 1,
    period: 1,
  },
  {
    unique: true,
  }
);

// Query optimization indexes
attendanceRecordSchema.index({ classId: 1, subjectId: 1, date: 1, period: 1 });
attendanceRecordSchema.index({ studentId: 1, date: 1 });
attendanceRecordSchema.index({ studentId: 1, subjectId: 1, date: 1 });
attendanceRecordSchema.index({ classId: 1, date: 1 });
attendanceRecordSchema.index({ academicYearId: 1, classId: 1, date: 1 });
attendanceRecordSchema.index({ markedBy: 1, date: 1 });

module.exports = mongoose.model("AttendanceRecord", attendanceRecordSchema);
