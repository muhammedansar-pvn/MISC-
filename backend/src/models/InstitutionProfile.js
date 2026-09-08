const mongoose = require("mongoose");

const institutionProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    institutionName: {
      type: String,
      required: true,
      trim: true,
    },

    institutionCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    type: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
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
    collection: "institutionProfiles",
  }
);

institutionProfileSchema.index(
  { userId: 1 },
  { unique: true }
);

institutionProfileSchema.index(
  { institutionCode: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "InstitutionProfile",
  institutionProfileSchema
);