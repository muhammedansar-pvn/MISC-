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

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    marksObtained: {
      type: Number,
      required: true,
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
      enum: ["DRAFT", "SUBMITTED", "VERIFIED"],
      default: "DRAFT",
    },
  },
  {
    timestamps: true,
    collection: "markEntries",
  }
);

// Compound Unique Index
markEntrySchema.index(
  {
    examScheduleId: 1,
    studentId: 1,
  },
  {
    unique: true,
  }
);
markEntrySchema.index({ examId: 1, studentId: 1 });
markEntrySchema.index({ examScheduleId: 1, status: 1 });

module.exports = mongoose.model("MarkEntry", markEntrySchema);
