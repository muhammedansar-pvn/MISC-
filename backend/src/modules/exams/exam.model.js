const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
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

    term: {
      type: String,
      trim: true,
      default: "FIRST_TERM",
    },

    examType: {
      type: String,
      trim: true,
      default: "ANNUAL",
    },

    fee: {
      type: Number,
      default: 0,
      min: 0,
    },

    examFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    registrationStartDate: {
      type: Date,
    },

    registrationEndDate: {
      type: Date,
    },

    eligibleClassIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],

    description: {
      type: String,
      trim: true,
    },

    subjectIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],

    publishedAt: {
      type: Date,
    },

    resultPublicationDate: {
      type: Date,
    },

    status: {
      type: String,
      required: true,
      enum: ["DRAFT", "SCHEDULED", "ONGOING", "COMPLETED", "PUBLISHED"],
      default: "SCHEDULED",
    },
  },
  {
    timestamps: true,
    collection: "exams",
  }
);

examSchema.pre("validate", function (next) {
  if (!this.title && this.name) {
    this.title = this.name;
  }
  if (!this.name && this.title) {
    this.name = this.title;
  }
  if (this.fee !== undefined && this.examFee === undefined) {
    this.examFee = this.fee;
  }
  if (this.examFee !== undefined && this.fee === undefined) {
    this.fee = this.examFee;
  }
  if (this.status === "PUBLISHED" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Indexes
examSchema.index({ code: 1 }, { unique: true });
examSchema.index({ resultPublicationDate: 1 });

module.exports = mongoose.model("Exam", examSchema);
