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
    },

    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstitutionProfile",
    },

    contactNumber: {
      type: String,
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

    biometricId: {
      type: String,
      trim: true,
    },

    house: {
      type: String,
      enum: ["RED", "BLUE", "GREEN", "YELLOW"],
      trim: true,
    },

    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacultyProfile",
    },

    disciplineScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },

    skills: {
      quran: { type: Number, default: 0, min: 0, max: 100 },
      arabic: { type: Number, default: 0, min: 0, max: 100 },
      english: { type: Number, default: 0, min: 0, max: 100 },
      urdu: { type: Number, default: 0, min: 0, max: 100 },
      communication: { type: Number, default: 0, min: 0, max: 100 },
      leadership: { type: Number, default: 0, min: 0, max: 100 },
    },

    parentUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED", "ALUMNI"],
      default: "ACTIVE",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "studentProfiles",
  }
);

// Indexes
studentProfileSchema.index({ userId: 1 }, { unique: true });
studentProfileSchema.index({ registrationNumber: 1 }, { unique: true });
studentProfileSchema.index({ biometricId: 1 }, { unique: true, sparse: true });
studentProfileSchema.index({ classId: 1 });
studentProfileSchema.index({ mentorId: 1 });
studentProfileSchema.index({ parentUserId: 1 });
studentProfileSchema.index({ institutionId: 1, classId: 1 }, { sparse: true });

module.exports = mongoose.model("StudentProfile", studentProfileSchema);
