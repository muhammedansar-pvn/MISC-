const mongoose = require("mongoose");

const examScheduleSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
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
  },
  {
    timestamps: true,
    collection: "examSchedules",
  }
);

// Compound Unique Index
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

module.exports = mongoose.model("ExamSchedule", examScheduleSchema);
