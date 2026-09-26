const mongoose = require("mongoose");

const instituteSettingsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      default: "Markaz Sanaviyya",
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      default: "SANAVIYYA",
    },
    tagline: {
      type: String,
      trim: true,
      default: "Centre for Secondary & Higher Secondary Islamic Education",
    },
    description: {
      type: String,
      trim: true,
      default:
        "Markaz Sanaviyya is a premier integrated institution combining classical Islamic scholarship with contemporary secondary academic excellence under Jamia Markaz.",
    },
    affiliation: {
      type: String,
      trim: true,
      default: "Jamia Markaz (Markazu Ssaqafathi Ssunniyya)",
    },
    establishedYear: {
      type: Number,
      default: 1978,
    },
    principalName: {
      type: String,
      trim: true,
      default: "Dr. Muhammad Abdul Hakim Azhari",
    },
    contactNumber: {
      type: String,
      trim: true,
      default: "+91 495 2800 400",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "sanaviyya@markaz.in",
    },
    website: {
      type: String,
      trim: true,
      default: "https://markaz.in",
    },
    address: {
      street: { type: String, trim: true, default: "Karanthur, Kunnamangalam" },
      city: { type: String, trim: true, default: "Kozhikode" },
      district: { type: String, trim: true, default: "Kozhikode" },
      state: { type: String, trim: true, default: "Kerala" },
      country: { type: String, trim: true, default: "India" },
      postalCode: { type: String, trim: true, default: "673571" },
    },
    academicSettings: {
      currentAcademicYearId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AcademicYear",
      },
      evaluationSystem: {
        type: String,
        enum: ["TRIMESTER", "SEMESTER", "ANNUAL"],
        default: "TRIMESTER",
      },
      attendanceMode: {
        type: String,
        enum: ["DAILY", "SESSION_WISE", "SUBJECT_WISE"],
        default: "DAILY",
      },
    },
    branding: {
      logoUrl: { type: String, trim: true, default: "/images/misc-logo.png" },
      faviconUrl: { type: String, trim: true, default: "/favicon.ico" },
      themePrimaryColor: { type: String, trim: true, default: "#2F7C7A" },
    },
  },
  {
    timestamps: true,
    collection: "instituteSettings",
  }
);

module.exports = mongoose.model("InstituteSettings", instituteSettingsSchema);
