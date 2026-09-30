const mongoose = require("mongoose");

const facultyAssignmentSchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacultyProfile",
      required: true,
      index: true,
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
      index: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "facultyAssignments",
  }
);

// Compound Unique Index: Prevent duplicate assignment of the same faculty to the same subject in the same class and academic year
facultyAssignmentSchema.index(
  {
    facultyId: 1,
    academicYearId: 1,
    classId: 1,
    subjectId: 1,
  },
  {
    unique: true,
  }
);

// Query optimization indexes
facultyAssignmentSchema.index({ academicYearId: 1, classId: 1, subjectId: 1 });
facultyAssignmentSchema.index({ facultyId: 1, status: 1 });
facultyAssignmentSchema.index({ classId: 1, status: 1 });
facultyAssignmentSchema.index({ academicYearId: 1, status: 1 });

module.exports = mongoose.model("FacultyAssignment", facultyAssignmentSchema);
