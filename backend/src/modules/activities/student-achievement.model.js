const mongoose = require("mongoose");

const studentAchievementSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
    },
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    stage: {
      type: String,
      enum: ["PARTICIPATION", "PERFORMANCE", "DISTRICT", "STATE", "NATIONAL", "OTHER"],
      default: "PARTICIPATION",
      required: true,
    },
    marksObtained: {
      type: Number,
      min: 0,
      default: 0,
    },
    rankPosition: {
      type: String,
      enum: ["FIRST", "SECOND", "THIRD", "CONSOLATION", "PARTICIPATION", "NONE"],
      default: "PARTICIPATION",
    },
    certificateUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
      required: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: {
      type: Date,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "studentAchievements",
  }
);

studentAchievementSchema.index(
  { studentId: 1, activityId: 1, academicYearId: 1 },
  { unique: true }
);

studentAchievementSchema.index({ status: 1 });
studentAchievementSchema.index({ activityId: 1 });

module.exports = mongoose.model("StudentAchievement", studentAchievementSchema);
