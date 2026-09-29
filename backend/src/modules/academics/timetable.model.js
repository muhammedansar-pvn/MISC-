const mongoose = require("mongoose");

const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const timetableSchema = new mongoose.Schema(
  {
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstitutionProfile",
      required: false,
    },

    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    dayOfWeek: {
      type: String,
      required: true,
      enum: DAYS_OF_WEEK,
      uppercase: true,
      trim: true,
    },

    periodNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },

    startTime: {
      type: String,
      required: true,
      trim: true,
    },

    endTime: {
      type: String,
      required: true,
      trim: true,
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

    room: {
      type: String,
      trim: true,
      default: "",
    },

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
    collection: "timetables",
  }
);

// Compound Unique Index: One entry per class, academic year, day and period slot
timetableSchema.index(
  {
    classId: 1,
    academicYearId: 1,
    dayOfWeek: 1,
    periodNumber: 1,
  },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false },
  }
);

timetableSchema.index({ classId: 1, academicYearId: 1, status: 1 });
timetableSchema.index({ facultyId: 1, dayOfWeek: 1, periodNumber: 1 });

module.exports = mongoose.model("Timetable", timetableSchema);
