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

const markClassAttendanceSchema = Joi.object({
  classId: Joi.string().hex().length(24).required(),
  subjectId: Joi.string().hex().length(24).required(),
  date: Joi.alternatives().try(Joi.date().iso(), Joi.string().regex(/^\d{4}-\d{2}-\d{2}/)).required(),
  period: Joi.number().integer().min(1).max(7).required(),
  records: Joi.array()
    .items(
      Joi.object({
        studentId: Joi.string().hex().length(24).required(),
        status: Joi.string().valid("PRESENT", "ABSENT", "LATE", "LEAVE", "EXCUSED").required(),
        remarks: Joi.string().trim().allow("").optional(),
      })
    )
    .min(1)
    .required(),
});

module.exports = {
  validateCreateCorrectionRequest: validateSchema(createCorrectionRequestSchema),
  validateReviewCorrectionRequest: validateSchema(reviewCorrectionRequestSchema),
  validateMarkClassAttendance: validateSchema(markClassAttendanceSchema),
};

