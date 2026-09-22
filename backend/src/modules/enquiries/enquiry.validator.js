const Joi = require("joi");
const { validateSchema } = require("../../middleware/validation.middleware");

const enquirySchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  phone: Joi.string().trim().allow(""),
  subject: Joi.string()
    .valid(
      "GENERAL_ENQUIRY",
      "ACADEMIC_PROGRAMMES",
      "INSTITUTIONAL_COLLABORATION",
      "BOARD_EXAMINATION",
      "RESOURCES_MANUALS"
    )
    .required(),
  message: Joi.string().required(),
  status: Joi.string().valid("NEW", "IN_PROGRESS", "RESOLVED", "ARCHIVED").default("NEW"),
});

module.exports = {
  validateEnquiry: validateSchema(enquirySchema),
};
