const mongoose = require("mongoose");

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
    },
    submittedFile: {
      fileName: { type: String, trim: true },
      fileUrl: { type: String, trim: true },
      fileType: { type: String, trim: true },
      fileSize: { type: Number },
    },
    link: {
      type: String,
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["PENDING", "SUBMITTED", "LATE", "GRADED"],
      default: "SUBMITTED",
    },
    marks: {
      type: Number,
      min: 0,
    },
    feedback: {
      type: String,
      trim: true,
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacultyProfile",
    },
    gradedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "assignment_submissions",
  }
);

// One active submission per student per assignment
assignmentSubmissionSchema.index(
  { assignmentId: 1, studentId: 1 },
  { unique: true }
);

module.exports = mongoose.model("AssignmentSubmission", assignmentSubmissionSchema);
