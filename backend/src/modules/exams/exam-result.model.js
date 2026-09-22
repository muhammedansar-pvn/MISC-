const mongoose = require("mongoose");

const examResultSchema = new mongoose.Schema(
  {
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

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstitutionProfile",
      required: true,
    },

    totalMaxMarks: {
      type: Number,
      required: true,
    },

    totalMarksObtained: {
      type: Number,
      required: true,
    },

    percentage: {
      type: Number,
      required: true,
    },

    grade: {
      type: String,
      required: true,
      trim: true,
    },

    resultStatus: {
      type: String,
      required: true,
      enum: ["PASSED", "FAILED", "WITHHELD"],
    },

    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "examResults",
  }
);

// Compound Unique Index
examResultSchema.index(
  {
    examId: 1,
    studentId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("ExamResult", examResultSchema);
