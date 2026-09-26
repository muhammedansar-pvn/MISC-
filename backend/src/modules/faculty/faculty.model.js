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

    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstitutionProfile",
    },

    nameEnglish: {
      type: String,
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

    designation: {
      type: String,
      trim: true,
    },

    islamicQualification: {
      type: String,
      trim: true,
    },

    academicQualification: {
      type: String,
      trim: true,
    },

    joiningYear: {
      type: Number,
    },

    previousExperience: {
      type: String,
      trim: true,
    },

    contactNumber: {
      type: String,
      trim: true,
    },

    photo: {
      type: String,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },

    assignedClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      }
    ],

    assignedSubjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      }
    ],

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "facultyProfiles",
  }
);

// Indexes
facultyProfileSchema.index({ userId: 1 }, { unique: true });
facultyProfileSchema.index({ facultyId: 1 }, { unique: true });

module.exports = mongoose.model("FacultyProfile", facultyProfileSchema);
