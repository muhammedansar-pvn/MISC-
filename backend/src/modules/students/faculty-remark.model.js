const mongoose = require("mongoose");

const facultyRemarkSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
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
      required: false,
      index: true,
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacultyProfile",
      required: true,
      index: true,
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: false,
    },
    category: {
      type: String,
      enum: ["ACADEMIC", "OBSERVATION", "PARTICIPATION", "HOMEWORK", "GENERAL"],
      default: "ACADEMIC",
    },
    remark: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    authorName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "facultyRemarks",
  }
);

facultyRemarkSchema.index({ studentId: 1, createdAt: -1 });
facultyRemarkSchema.index({ classId: 1, createdAt: -1 });
facultyRemarkSchema.index({ facultyId: 1, createdAt: -1 });

module.exports = mongoose.model("FacultyRemark", facultyRemarkSchema);
