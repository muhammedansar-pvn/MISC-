const mongoose = require("mongoose");

const studyMaterialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
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
    chapter: {
      type: String,
      trim: true,
      default: "",
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      trim: true,
    },
    fileType: {
      type: String,
      trim: true,
    },
    fileSize: {
      type: Number,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "study_materials",
  }
);

// Indexes for class, subject, and faculty queries
studyMaterialSchema.index({ classId: 1, isDeleted: 1 });
studyMaterialSchema.index({ subjectId: 1, isDeleted: 1 });
studyMaterialSchema.index({ facultyId: 1, isDeleted: 1 });
studyMaterialSchema.index({ uploadedAt: -1 });

module.exports = mongoose.model("StudyMaterial", studyMaterialSchema);
