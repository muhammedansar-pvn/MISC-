const mongoose = require("mongoose");

const examRegistrationSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
    },

    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstitutionProfile",
      required: true,
    },

    rollNumber: {
      type: String,
      required: true,
      trim: true,
    },

    registrationStatus: {
      type: String,
      required: true,
      enum: ["REGISTERED", "HALL_TICKET_ISSUED", "CANCELLED"],
    },

    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  },
  {
    timestamps: true,
    collection: "examRegistrations",
  }
);

// Indexes
examRegistrationSchema.index({ examId: 1, studentId: 1 }, { unique: true });
examRegistrationSchema.index({ rollNumber: 1 }, { unique: true });

module.exports = mongoose.model("ExamRegistration", examRegistrationSchema);
