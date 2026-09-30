const mongoose = require("mongoose");

const examScheduleSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
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

    examDate: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
      trim: true,
    },

    endTime: {
      type: String,
      required: true,
      trim: true,
    },

    maxMarks: {
      type: Number,
      required: true,
    },

    passMarks: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["SCHEDULED", "ONGOING", "COMPLETED", "CANCELLED"],
      default: "SCHEDULED",
    },
  },
  {
    timestamps: true,
    collection: "examSchedules",
  }
);

// Compound Unique Index: One schedule per exam, class, and subject
examScheduleSchema.index(
  {
    examId: 1,
    classId: 1,
    subjectId: 1,
  },
  {
    unique: true,
  }
);

examScheduleSchema.index({ academicYearId: 1, classId: 1 });
examScheduleSchema.index({ classId: 1, subjectId: 1 });
examScheduleSchema.index({ examDate: 1 });

module.exports = mongoose.model("ExamSchedule", examScheduleSchema);
