const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema(
  {
    unitNumber: {
      type: Number,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const syllabusSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },

    kitabName: {
      type: String,
      required: true,
      trim: true,
    },

    examType: {
      type: String,
      required: true,
      enum: ["HALF_YEARLY", "ANNUAL"],
      default: "ANNUAL",
    },

    units: [unitSchema],

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

    fileUrl: {
      type: String,
      trim: true,
      default: "",
    },

    fileName: {
      type: String,
      trim: true,
      default: "",
    },

    version: {
      type: String,
      trim: true,
      default: "1.0",
    },

    status: {
      type: String,
      required: true,
      enum: ["DRAFT", "PUBLISHED", "SUPERSEDED", "ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "syllabuses",
  }
);

// Fallback title to kitabName if not provided
syllabusSchema.pre("save", function (next) {
  if (!this.title && this.kitabName) {
    this.title = this.kitabName;
  }
  next();
});

module.exports = mongoose.model("Syllabus", syllabusSchema);
