const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
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

    description: {
      type: String,
      required: true,
    },

    eventDate: {
      type: Date,
      required: true,
    },

    venue: {
      type: String,
      required: true,
      trim: true,
    },

    registrationFee: {
      type: Number,
      required: true,
      default: 0,
    },

    registrationDeadline: {
      type: Date,
    },

    isRegistrationOpen: {
      type: Boolean,
      required: true,
      default: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"],
    },
  },
  {
    timestamps: true,
    collection: "events",
  }
);

// Indexes
eventSchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model("Event", eventSchema);
