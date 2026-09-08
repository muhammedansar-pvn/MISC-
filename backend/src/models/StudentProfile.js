const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    registrationNumber: {
      type: String,
      required: true,
      trim: true,
    },

    nameEnglish: {
      type: String,
      required: true,
      trim: true,
    },

    nameArabic: {
      type: String,
      trim: true,
    },

    placeEnglish: {
      type: String,
      trim: true,
    },

    placeArabic: {
      type: String,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    admissionYear: {
      type: Number,
      required: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    campusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
    },

    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },

    fatherName: {
      type: String,
      required: true,
      trim: true,
    },

    motherName: {
      type: String,
      required: true,
      trim: true,
    },

    photo: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "studentProfiles",
  }
);

studentProfileSchema.index(
  { userId: 1 },
  { unique: true }
);

studentProfileSchema.index(
  { registrationNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "StudentProfile",
  studentProfileSchema
);