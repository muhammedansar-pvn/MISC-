const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    subject: {
      type: String,
      required: true,
      enum: [
        "GENERAL_ENQUIRY",
        "ACADEMIC_PROGRAMMES",
        "INSTITUTIONAL_COLLABORATION",
        "BOARD_EXAMINATION",
        "RESOURCES_MANUALS",
      ],
    },

    message: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["NEW", "IN_PROGRESS", "RESOLVED", "ARCHIVED"],
      default: "NEW",
    },
  },
  {
    timestamps: true,
    collection: "enquiries",
  }
);

module.exports = mongoose.model("Enquiry", enquirySchema);
