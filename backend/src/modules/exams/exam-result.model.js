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

    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstitutionProfile",
      required: false,
    },

    subjectResults: [
      {
        subjectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subject",
          required: true,
        },
        subjectName: {
          type: String,
          required: true,
        },
        subjectCode: {
          type: String,
          default: "",
        },
        marksObtained: {
          type: Number,
          required: true,
        },
        maxMarks: {
          type: Number,
          required: true,
        },
        passMarks: {
          type: Number,
          required: true,
        },
        grade: {
          type: String,
          required: true,
        },
        isAbsent: {
          type: Boolean,
          default: false,
        },
        resultStatus: {
          type: String,
          enum: ["PASSED", "FAILED"],
          required: true,
        },
      },
    ],

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

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED"],
      default: "PUBLISHED",
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
examResultSchema.index({ studentId: 1 });

module.exports = mongoose.model("ExamResult", examResultSchema);
