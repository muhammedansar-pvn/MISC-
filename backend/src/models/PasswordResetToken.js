const mongoose = require("mongoose");

const passwordResetTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tokenHash: {
      type: String,
      required: true,
      trim: true,
    },

    attempts: {
      type: Number,
      required: true,
      default: 0,
      max: 5,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    usedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "passwordResetTokens",
  }
);

// Indexes
passwordResetTokenSchema.index({ tokenHash: 1 }, { unique: true });
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("PasswordResetToken", passwordResetTokenSchema);
