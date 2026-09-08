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

// Token hash must be unique
accountSetupTokenSchema.index(
  { tokenHash: 1 },
  { unique: true }
);

// Automatically remove expired tokens
accountSetupTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

module.exports = mongoose.model(
  "AccountSetupToken",
  accountSetupTokenSchema
);