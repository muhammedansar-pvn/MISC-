const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    username: {
      type: String,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      select: false,
    },

    role: {
      type: String,
      required: true,
      enum: ["ADMIN", "STUDENT", "FACULTY", "INSTITUTION"],
    },

    status: {
      type: String,
      required: true,
      enum: ["PENDING_SETUP", "ACTIVE", "SUSPENDED", "INVITED", "INACTIVE"],
    },

    department: {
      type: String,
      trim: true,
    },

    mobile: {
      type: String,
      trim: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

// Indexes
userSchema.index({ username: 1 }, { unique: true, sparse: true });
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1, status: 1, isDeleted: 1 });

module.exports = mongoose.model("User", userSchema);
