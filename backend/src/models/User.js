const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    department: {
      type: String,
      trim: true,
    },

    username: {
      type: String,
      trim: true,
      lowercase: true,
    },

    passwordHash: {
      type: String,
    },

    role: {
      type: String,
      enum: ["ADMIN", "STUDENT", "FACULTY", "INSTITUTION"],
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING_SETUP", "ACTIVE", "SUSPENDED", "INVITED"],
      required: true,
    },

    mobile: {
      type: String,
      trim: true,
    },

    invitationTokenHash: {
      type: String,
    },

    invitationTokenExpiresAt: {
      type: Date,
    },

    invitationUsedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

module.exports = mongoose.model("User", userSchema);