const mongoose = require("mongoose");

const downloadResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["GUIDELINES", "INFORMATION", "SYLLABUS", "FORMS_CIRCULARS"],
    },

    documentType: {
      type: String,
      required: true,
      trim: true,
    },

    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },

    fileSize: {
      type: Number,
    },

    status: {
      type: String,
      required: true,
      enum: ["PUBLISHED", "ARCHIVED"],
      default: "PUBLISHED",
    },

    publishedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "downloadResources",
  }
);

module.exports = mongoose.model("DownloadResource", downloadResourceSchema);
