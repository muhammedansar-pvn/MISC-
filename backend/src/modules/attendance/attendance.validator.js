const Joi = require("joi");
const { validateSchema } = require("../../middleware/validation.middleware");

const createCorrectionRequestSchema = Joi.object({
  attendanceRecordId: Joi.string().hex().length(24).allow(null, "").optional(),
  studentId: Joi.string().hex().length(24).required(),
  classId: Joi.string().hex().length(24).required(),
  date: Joi.date().iso().required(),
  period: Joi.number().integer().min(1).max(7).required(),
  currentStatus: Joi.string().valid("PRESENT", "ABSENT", "LATE", "LEAVE", "EXCUSED").required(),
  requestedStatus: Joi.string().valid("PRESENT", "ABSENT", "LATE", "LEAVE", "EXCUSED").required(),
  reason: Joi.string().trim().min(3).max(500).required(),
});

const reviewCorrectionRequestSchema = Joi.object({
  status: Joi.string().valid("APPROVED", "REJECTED").required(),
  adminRemarks: Joi.string().trim().max(500).allow("").optional(),
});

module.exports = {
  validateCreateCorrectionRequest: validateSchema(createCorrectionRequestSchema),
  validateReviewCorrectionRequest: validateSchema(reviewCorrectionRequestSchema),
};
