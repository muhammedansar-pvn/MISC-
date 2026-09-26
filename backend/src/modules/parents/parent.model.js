const mongoose = require("mongoose");

const parentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    relationType: {
      type: String,
      enum: ["FATHER", "MOTHER", "GUARDIAN"],
      default: "FATHER",
    },

    contactNumber: {
      type: String,
      trim: true,
    },

    whatsappNumber: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    studentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudentProfile",
      },
    ],

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "parentProfiles",
  }
);

// Indexes
parentProfileSchema.index({ userId: 1 }, { unique: true });
parentProfileSchema.index({ studentIds: 1 });

module.exports = mongoose.model("ParentProfile", parentProfileSchema);
