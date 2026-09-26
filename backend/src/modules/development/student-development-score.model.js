const mongoose = require("mongoose");

const studentDevelopmentScoreSchema = new mongoose.Schema(
  {
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
    term: {
      type: String,
      enum: ["TERM_1", "TERM_2", "TERM_3", "ANNUAL"],
      required: true,
    },
    academicScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    linguisticScore: {
      arabic: { type: Number, min: 0, max: 100, default: 0 },
      english: { type: Number, min: 0, max: 100, default: 0 },
      urdu: { type: Number, min: 0, max: 100, default: 0 },
      overall: { type: Number, min: 0, max: 100, default: 0 },
    },
    spiritualScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    skillScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    leadershipScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    overallDevelopmentScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacultyProfile",
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "studentDevelopmentScores",
  }
);

// One score record per student per academic year per term
studentDevelopmentScoreSchema.index(
  { studentId: 1, academicYearId: 1, term: 1 },
  { unique: true }
);

studentDevelopmentScoreSchema.index({ academicYearId: 1, term: 1 });

module.exports = mongoose.model(
  "StudentDevelopmentScore",
  studentDevelopmentScoreSchema
);
