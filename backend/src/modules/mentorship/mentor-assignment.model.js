const mongoose = require("mongoose");

const mentorAssignmentSchema = new mongoose.Schema(
  {
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacultyProfile",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    monitoringCategory: {
      type: String,
      enum: ["NORMAL", "NEED_ATTENTION", "CRITICAL"],
      default: "NORMAL",
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    notesHistory: [
      {
        note: {
          type: String,
          required: true,
          trim: true,
        },
        category: {
          type: String,
          enum: ["ACADEMIC", "BEHAVIORAL", "SPIRITUAL", "PROGRESS", "GENERAL"],
          default: "GENERAL",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    collection: "mentorAssignments",
  }
);

// One mentor assignment per student per academic year
mentorAssignmentSchema.index({ studentId: 1, academicYearId: 1 }, { unique: true });
mentorAssignmentSchema.index({ mentorId: 1, academicYearId: 1 });
mentorAssignmentSchema.index({ monitoringCategory: 1 });

module.exports = mongoose.model("MentorAssignment", mentorAssignmentSchema);
