const mongoose = require("mongoose");

const assignmentAttachmentSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true, trim: true },
    fileType: { type: String, trim: true },
    fileSize: { type: Number },
  },
  { _id: false }
);

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacultyProfile",
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    maxMarks: {
      type: Number,
      default: 100,
      min: 1,
    },
    attachments: [assignmentAttachmentSchema],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "assignments",
  }
);

// Indexes for query performance (filter by class, subject, faculty, academicYear)
assignmentSchema.index({ classId: 1, isDeleted: 1 });
assignmentSchema.index({ classId: 1, academicYearId: 1, isDeleted: 1 });
assignmentSchema.index({ classId: 1, subjectId: 1, isDeleted: 1 });
assignmentSchema.index({ facultyId: 1, isDeleted: 1 });
assignmentSchema.index({ dueDate: 1 });

module.exports = mongoose.model("Assignment", assignmentSchema);
