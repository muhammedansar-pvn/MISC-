const mongoose = require("mongoose");

const eventRegistrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    participantName: {
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

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    institutionName: {
      type: String,
      trim: true,
    },

    registrationStatus: {
      type: String,
      required: true,
      enum: ["PENDING", "CONFIRMED", "CANCELLED"],
    },

    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  },
  {
    timestamps: true,
    collection: "eventRegistrations",
  }
);

module.exports = mongoose.model("EventRegistration", eventRegistrationSchema);
