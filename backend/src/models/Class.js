const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstitutionProfile",
      required: true,
    },

    academicYear: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
    collection: "classes",
  }
);

// Same class code can exist in different institutions/years,
// but not twice within the same institution and academic year.
classSchema.index(
  {
    institutionId: 1,
    code: 1,
    academicYear: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Class", classSchema);