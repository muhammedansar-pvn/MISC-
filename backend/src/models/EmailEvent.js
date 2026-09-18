const mongoose = require("mongoose");

const emailEventSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      required: true,
      default: "resend",
      trim: true,
    },

    eventId: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      trim: true,
    },

    emailId: {
      type: String,
      trim: true,
    },

    recipient: {
      type: String,
      trim: true,
      lowercase: true,
    },

    status: {
      type: String,
      trim: true,
    },

    payload: {
      type: mongoose.Schema.Types.Mixed,
    },

    receivedAt: {
      type: Date,
      default: Date.now,
    },

    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "emailEvents",
  }
);

// Idempotency unique index: provider + eventId
emailEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model("EmailEvent", emailEventSchema);
