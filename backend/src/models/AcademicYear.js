const mongoose = require("mongoose");

const academicYearSchema = new mongoose.Schema(
  {
    yearName: {
      type: String,
      required: true,
      trim: true,
    },

    yearCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    isCurrent: {
      type: Boolean,
      required: true,
      default: false,
    },

    status: {
      type: String,
      required: true,
      enum: ["UPCOMING", "ACTIVE", "COMPLETED", "ARCHIVED"],
    },
  },
  {
    timestamps: true,
    collection: "academicYears",
  }
);

// Indexes
academicYearSchema.index({ yearCode: 1 }, { unique: true });

module.exports = mongoose.model("AcademicYear", academicYearSchema);
