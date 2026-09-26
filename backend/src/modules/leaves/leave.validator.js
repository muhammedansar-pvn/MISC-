const Joi = require("joi");
const { validateSchema } = require("../../middleware/validation.middleware");

const applyLeaveSchema = Joi.object({
  studentId: Joi.string().hex().length(24).required(),
  dateRange: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
  }).required(),
  reason: Joi.string().trim().min(3).max(500).required(),
});

const reviewLeaveSchema = Joi.object({
  reviewRemarks: Joi.string().trim().max(500).allow("").optional(),
});

module.exports = {
  validateApplyLeave: validateSchema(applyLeaveSchema),
  validateReviewLeave: validateSchema(reviewLeaveSchema),
};
