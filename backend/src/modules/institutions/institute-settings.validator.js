const Joi = require("joi");
const { validateSchema } = require("../../middleware/validation.middleware");

const updateInstituteSettingsSchema = Joi.object({
  name: Joi.string().trim(),
  code: Joi.string().trim().uppercase(),
  tagline: Joi.string().trim().allow(""),
  description: Joi.string().trim().allow(""),
  affiliation: Joi.string().trim().allow(""),
  establishedYear: Joi.number().integer().min(1800).max(2100).allow(null),
  principalName: Joi.string().trim().allow(""),
  contactNumber: Joi.string().trim().allow(""),
  email: Joi.string().email().trim().allow(""),
  website: Joi.string().trim().allow(""),
  address: Joi.object({
    street: Joi.string().trim().allow(""),
    city: Joi.string().trim().allow(""),
    district: Joi.string().trim().allow(""),
    state: Joi.string().trim().allow(""),
    country: Joi.string().trim().allow(""),
    postalCode: Joi.string().trim().allow(""),
  }).optional(),
  academicSettings: Joi.object({
    currentAcademicYearId: Joi.string().hex().length(24).allow(null, ""),
    evaluationSystem: Joi.string().valid("TRIMESTER", "SEMESTER", "ANNUAL"),
    attendanceMode: Joi.string().valid("DAILY", "SESSION_WISE", "SUBJECT_WISE"),
  }).optional(),
  branding: Joi.object({
    logoUrl: Joi.string().trim().allow(""),
    faviconUrl: Joi.string().trim().allow(""),
    themePrimaryColor: Joi.string().trim().allow(""),
  }).optional(),
});

module.exports = {
  validateUpdateInstituteSettings: validateSchema(updateInstituteSettingsSchema),
};
