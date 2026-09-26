const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["SPEECH", "ESSAY", "DEBATE", "KHUTBA", "QIRAATH", "SPORTS", "OTHER"],
      default: "SPEECH",
    },
    description: {
      type: String,
      trim: true,
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "activities",
  }
);

activitySchema.index({ name: 1, category: 1 });
activitySchema.index({ academicYearId: 1 });

module.exports = mongoose.model("Activity", activitySchema);
