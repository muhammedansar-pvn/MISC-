const mongoose = require("mongoose");

const accountSetupTokenSchema = new mongoose.Schema(
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

    purpose: {
      type: String,
      required: true,
      enum: ["ACCOUNT_SETUP", "ADMIN_INVITATION"],
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
    collection: "accountSetupTokens",
  }
);

// Indexes
accountSetupTokenSchema.index({ tokenHash: 1 }, { unique: true });
accountSetupTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("AccountSetupToken", accountSetupTokenSchema);
