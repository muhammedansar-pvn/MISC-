const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["DRAFT", "SCHEDULED", "ONGOING", "COMPLETED", "PUBLISHED"],
    },
  },
  {
    timestamps: true,
    collection: "exams",
  }
);

// Indexes
examSchema.index({ code: 1 }, { unique: true });

module.exports = mongoose.model("Exam", examSchema);
