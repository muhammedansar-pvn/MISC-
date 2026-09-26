const mongoose = require("mongoose");

const disciplineRecordSchema = new mongoose.Schema(
  {
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
    incidentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    incidentType: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "LOW",
      required: true,
    },
    demeritPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    actionTaken: {
      type: String,
      trim: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentNotified: {
      type: Boolean,
      default: false,
    },
    parentNotifiedAt: {
      type: Date,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolutionRemarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "disciplineRecords",
  }
);

disciplineRecordSchema.index({ studentId: 1, incidentDate: -1 });
disciplineRecordSchema.index({ classId: 1, incidentDate: -1 });
disciplineRecordSchema.index({ severity: 1 });
disciplineRecordSchema.index({ resolved: 1 });

module.exports = mongoose.model("DisciplineRecord", disciplineRecordSchema);
