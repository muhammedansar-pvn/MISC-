const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
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
      enum: ["PENDING_SETUP", "ACTIVE", "SUSPENDED"],
      required: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

module.exports = mongoose.model("User", userSchema);