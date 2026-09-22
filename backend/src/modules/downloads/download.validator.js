const Joi = require("joi");
const { validateSchema } = require("../../middleware/validation.middleware");

const downloadResourceSchema = Joi.object({
  title: Joi.string().trim().required(),
  category: Joi.string().valid("GUIDELINES", "INFORMATION", "SYLLABUS", "FORMS_CIRCULARS").required(),
  documentType: Joi.string().trim().required(),
  fileUrl: Joi.string().trim().required(),
  fileSize: Joi.number().allow(null),
  status: Joi.string().valid("PUBLISHED", "ARCHIVED").default("PUBLISHED"),
  publishedAt: Joi.date().iso().required(),
});

module.exports = {
  validateDownloadResource: validateSchema(downloadResourceSchema),
};
