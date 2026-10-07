const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
    },

    appliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    applicantRole: {
      type: String,
      enum: ["STUDENT", "PARENT"],
      default: "STUDENT",
    },

    leaveType: {
      type: String,
      enum: ["CASUAL", "MEDICAL", "DUTY", "FAMILY_EMERGENCY", "OTHER"],
      default: "CASUAL",
    },

    dateRange: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
      default: "PENDING",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacultyProfile",
    },

    reviewedAt: {
      type: Date,
    },

    reviewRemarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "leaves",
  }
);

// Indexes
leaveSchema.index({ studentId: 1, status: 1 });
leaveSchema.index({ studentId: 1, "dateRange.startDate": 1, "dateRange.endDate": 1 });
leaveSchema.index({ appliedBy: 1 });
leaveSchema.index({ status: 1 });

module.exports = mongoose.model("Leave", leaveSchema);
