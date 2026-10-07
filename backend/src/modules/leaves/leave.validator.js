const Joi = require("joi");
const { validateSchema } = require("../../middleware/validation.middleware");

const applyLeaveSchema = Joi.object({
  studentId: Joi.string().hex().length(24).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  dateRange: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
  }).optional(),
  leaveType: Joi.string()
    .valid("CASUAL", "MEDICAL", "DUTY", "FAMILY_EMERGENCY", "OTHER")
    .optional(),
  reason: Joi.string().trim().min(3).max(500).required(),
}).or("startDate", "dateRange");

const reviewLeaveSchema = Joi.object({
  reviewRemarks: Joi.string().trim().max(500).allow("").optional(),
});

module.exports = {
  validateApplyLeave: validateSchema(applyLeaveSchema),
  validateReviewLeave: validateSchema(reviewLeaveSchema),
};
