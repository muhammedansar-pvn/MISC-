const mongoose = require("mongoose");

const facultyProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    facultyId: {
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

    photo: {
      type: String,
      trim: true,
    },

    campusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
    },

    designation: {
      type: String,
      required: true,
      trim: true,
    },

    islamicQualification: {
      type: String,
      required: true,
      trim: true,
    },

    academicQualification: {
      type: String,
      required: true,
      trim: true,
    },

    joiningYear: {
      type: Number,
      required: true,
    },

    previousExperience: {
      type: String,
      trim: true,
    },

    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "facultyProfiles",
  }
);

facultyProfileSchema.index(
  { userId: 1 },
  { unique: true }
);

facultyProfileSchema.index(
  { facultyId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "FacultyProfile",
  facultyProfileSchema
);