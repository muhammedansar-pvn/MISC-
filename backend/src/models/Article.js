const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["NEWS", "CIRCULAR", "JOURNAL", "ANNOUNCEMENT"],
    },

    summary: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    featuredImage: {
      type: String,
      trim: true,
    },

    publishedAt: {
      type: Date,
    },

    status: {
      type: String,
      required: true,
      enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
    },
  },
  {
    timestamps: true,
    collection: "articles",
  }
);

// Indexes
articleSchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model("Article", articleSchema);
