const Joi = require("joi");

const studentSchema = Joi.object({
  nameEnglish: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required(),

  nameArabic: Joi.string()
    .trim()
    .max(100)
    .allow(""),

  placeEnglish: Joi.string()
    .trim()
    .max(100)
    .allow(""),

  placeArabic: Joi.string()
    .trim()
    .max(100)
    .allow(""),

  dateOfBirth: Joi.date()
    .iso()
    .required(),

  admissionYear: Joi.number()
    .integer()
    .min(2000)
    .max(2100)
    .required(),

  classId: Joi.string()
    .hex()
    .length(24)
    .required(),

  institutionId: Joi.string()
    .hex()
    .length(24)
    .required(),

  contactNumber: Joi.string()
    .trim()
    .pattern(/^[0-9+\-\s()]{7,20}$/)
    .required(),

  fatherName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required(),

  motherName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required(),

  photo: Joi.string()
    .trim()
    .allow(""),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

const validateStudent = (req, res, next) => {
  const { error, value } = studentSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      })),
    });
  }

  req.body = value;

  next();
};

module.exports = {
  validateStudent,
};