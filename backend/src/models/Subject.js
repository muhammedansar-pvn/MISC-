const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: true,
      trim: true,
    },

    subjectCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["ISLAMIC_STUDIES", "CONTEMPORARY", "LANGUAGE", "GENERAL"],
    },

    description: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
    collection: "subjects",
  }
);

// Indexes
subjectSchema.index({ subjectCode: 1 }, { unique: true });

module.exports = mongoose.model("Subject", subjectSchema);
