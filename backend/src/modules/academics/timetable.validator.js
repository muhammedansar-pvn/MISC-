const Joi = require("joi");

const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const createTimetableEntrySchema = Joi.object({
  academicYearId: Joi.string().hex().length(24).required().messages({
    "any.required": "Academic Year ID is required",
    "string.length": "Invalid Academic Year ID format",
  }),
  classId: Joi.string().hex().length(24).required().messages({
    "any.required": "Class ID is required",
    "string.length": "Invalid Class ID format",
  }),
  dayOfWeek: Joi.string()
    .trim()
    .uppercase()
    .valid(...DAYS_OF_WEEK)
    .required()
    .messages({
      "any.required": "Day of week is required",
      "any.only": "Day of week must be one of: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY",
    }),
  periodNumber: Joi.number().integer().min(1).max(7).required().messages({
    "any.required": "Period number is required",
    "number.min": "Period number must be between 1 and 7",
    "number.max": "Period number must be between 1 and 7",
  }),
  startTime: Joi.string().trim().required().messages({
    "any.required": "Start time is required",
    "string.empty": "Start time cannot be empty",
  }),
  endTime: Joi.string().trim().required().messages({
    "any.required": "End time is required",
    "string.empty": "End time cannot be empty",
  }),
  subjectId: Joi.string().hex().length(24).required().messages({
    "any.required": "Subject ID is required",
    "string.length": "Invalid Subject ID format",
  }),
  facultyId: Joi.string().hex().length(24).required().messages({
    "any.required": "Faculty ID is required",
    "string.length": "Invalid Faculty ID format",
  }),
  room: Joi.string().trim().allow("").optional(),
  institutionId: Joi.string().hex().length(24).allow(null, "").optional(),
  status: Joi.string().valid("ACTIVE", "INACTIVE").default("ACTIVE"),
});

const updateTimetableEntrySchema = Joi.object({
  academicYearId: Joi.string().hex().length(24).optional(),
  classId: Joi.string().hex().length(24).optional(),
  dayOfWeek: Joi.string()
    .trim()
    .uppercase()
    .valid(...DAYS_OF_WEEK)
    .optional(),
  periodNumber: Joi.number().integer().min(1).max(7).optional(),
  startTime: Joi.string().trim().optional(),
  endTime: Joi.string().trim().optional(),
  subjectId: Joi.string().hex().length(24).optional(),
  facultyId: Joi.string().hex().length(24).optional(),
  room: Joi.string().trim().allow("").optional(),
  institutionId: Joi.string().hex().length(24).allow(null, "").optional(),
  status: Joi.string().valid("ACTIVE", "INACTIVE").optional(),
});

const validateSchema = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorDetails = error.details.map((detail) => detail.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errorDetails,
    });
  }
  req.body = value;
  next();
};

module.exports = {
  validateCreateTimetableEntry: validateSchema(createTimetableEntrySchema),
  validateUpdateTimetableEntry: validateSchema(updateTimetableEntrySchema),
};
