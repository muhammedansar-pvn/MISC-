const Joi = require("joi");
const { validateSchema } = require("../../middleware/validation.middleware");

const createInstitutionSchema = Joi.object({
  userId: Joi.string().hex().length(24).allow(null, "").optional(),
  institutionName: Joi.string().trim().min(2).max(200).required(),
  institutionCode: Joi.string().trim().uppercase().min(2).max(20).required(),
  type: Joi.string().valid("DIRECT", "COLLABORATING", "AFFILIATED", "RECOGNIZED").required(),
  address: Joi.string().trim().required(),
  contactNumber: Joi.string().trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  status: Joi.string().valid("ACTIVE", "INACTIVE", "SUSPENDED").default("ACTIVE"),
});

const updateInstitutionSchema = Joi.object({
  institutionName: Joi.string().trim().min(2).max(200),
  institutionCode: Joi.string().trim().uppercase().min(2).max(20),
  type: Joi.string().valid("DIRECT", "COLLABORATING"),
  address: Joi.string().trim(),
  contactNumber: Joi.string().trim(),
  email: Joi.string().email().lowercase().trim(),
  status: Joi.string().valid("ACTIVE", "INACTIVE"),
});

module.exports = {
  validateCreateInstitution: validateSchema(createInstitutionSchema),
  validateUpdateInstitution: validateSchema(updateInstitutionSchema),
};
