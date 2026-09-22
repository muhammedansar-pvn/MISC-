const mongoose = require("mongoose");

const otpVerificationSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
      trim: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    verificationId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    otpHash: {
      type: String,
      required: true,
      trim: true,
    },

    purpose: {
      type: String,
      required: true,
      enum: ["LOGIN_2FA", "EMAIL_VERIFICATION", "MOBILE_VERIFICATION", "PASSWORD_RESET"],
    },

    attempts: {
      type: Number,
      required: true,
      default: 0,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "otpVerifications",
  }
);

// Indexes
otpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("OtpVerification", otpVerificationSchema);
