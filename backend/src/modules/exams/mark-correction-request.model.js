const mongoose = require("mongoose");

const markCorrectionRequestSchema = new mongoose.Schema(
  {
    markEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MarkEntry",
      required: true,
    },

    examScheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamSchedule",
      required: true,
    },

    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },

    oldMarks: {
      type: Number,
      required: true,
    },

    newMarks: {
      type: Number,
      required: true,
      min: 0,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
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
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "markCorrectionRequests",
  }
);

markCorrectionRequestSchema.index({ markEntryId: 1, status: 1 });
markCorrectionRequestSchema.index({ examScheduleId: 1 });
markCorrectionRequestSchema.index({ studentId: 1 });
markCorrectionRequestSchema.index({ requestedBy: 1 });

module.exports = mongoose.model("MarkCorrectionRequest", markCorrectionRequestSchema);
