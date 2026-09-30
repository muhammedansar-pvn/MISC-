const mongoose = require("mongoose");

const markEntrySchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    examScheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamSchedule",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
    },

    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    marksObtained: {
      type: Number,
      required: true,
      min: 0,
    },

    isAbsent: {
      type: Boolean,
      required: true,
      default: false,
    },

    evaluatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacultyProfile",
    },

    status: {
      type: String,
      required: true,
      enum: ["DRAFT", "SUBMITTED", "VERIFIED", "PUBLISHED"],
      default: "DRAFT",
    },

    remarks: {
      type: String,
      default: "",
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    submittedAt: {
      type: Date,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    verifiedAt: {
      type: Date,
    },

    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "markEntries",
  }
);

// Compound Unique Indexes
markEntrySchema.index(
  {
    examScheduleId: 1,
    studentId: 1,
  },
  {
    unique: true,
  }
);

markEntrySchema.index(
  {
    examId: 1,
    classId: 1,
    subjectId: 1,
    studentId: 1,
  },
  {
    unique: true,
  }
);

markEntrySchema.index({ examId: 1, studentId: 1 });
markEntrySchema.index({ examScheduleId: 1, status: 1 });
markEntrySchema.index({ classId: 1, academicYearId: 1, status: 1 });
markEntrySchema.index({ evaluatorId: 1, examId: 1 });

module.exports = mongoose.model("MarkEntry", markEntrySchema);
