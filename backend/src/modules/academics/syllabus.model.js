const mongoose = require("mongoose");
require("../institutions/institution.model");

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
  },
  { _id: true }
);

const unitSchema = new mongoose.Schema(
  {
    unitNumber: {
      type: Number,
    },
    order: {
      type: Number,
      default: 0,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    topics: [topicSchema],
    plannedHours: {
      type: Number,
      default: 0,
    },
    completedHours: {
      type: Number,
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
  },
  { _id: true }
);

const syllabusSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
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

    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstitutionProfile",
      default: null,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },

    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
      index: true,
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
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "syllabuses",
  }
);

// Compound Indexes for fast academic querying
syllabusSchema.index({ classId: 1, subjectId: 1 });
syllabusSchema.index({ classId: 1, academicYearId: 1 });
syllabusSchema.index({ subjectId: 1, academicYearId: 1 });
syllabusSchema.index({ institutionId: 1, academicYearId: 1 });
syllabusSchema.index({ classId: 1, status: 1 });

// Uniqueness rule: A class can have only one active syllabus per subject, academic year, and examType
syllabusSchema.index(
  { classId: 1, subjectId: 1, academicYearId: 1, examType: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

// Fallback title to kitabName if not provided
syllabusSchema.pre("save", function (next) {
  if (!this.title && this.kitabName) {
    this.title = this.kitabName;
  }
  if (this.lastUpdatedBy && !this.updatedBy) {
    this.updatedBy = this.lastUpdatedBy;
  }
  next();
});

module.exports = mongoose.model("Syllabus", syllabusSchema);
