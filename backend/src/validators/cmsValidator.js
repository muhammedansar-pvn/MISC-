const Joi = require("joi");
const { validateSchema } = require("./authValidator");

const articleSchema = Joi.object({
  title: Joi.string().trim().required(),
  slug: Joi.string().trim().lowercase().required(),
  category: Joi.string().valid("NEWS", "CIRCULAR", "JOURNAL", "ANNOUNCEMENT").required(),
  summary: Joi.string().trim().required(),
  content: Joi.string().required(),
  featuredImage: Joi.string().trim().allow(""),
  publishedAt: Joi.date().iso().allow(null),
  status: Joi.string().valid("DRAFT", "PUBLISHED", "ARCHIVED").required(),
});

const downloadResourceSchema = Joi.object({
  title: Joi.string().trim().required(),
  category: Joi.string().valid("GUIDELINES", "INFORMATION", "SYLLABUS", "FORMS_CIRCULARS").required(),
  documentType: Joi.string().trim().required(),
  fileUrl: Joi.string().trim().required(),
  fileSize: Joi.number().allow(null),
  status: Joi.string().valid("PUBLISHED", "ARCHIVED").default("PUBLISHED"),
  publishedAt: Joi.date().iso().required(),
});

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
  validateArticle: validateSchema(articleSchema),
  validateDownloadResource: validateSchema(downloadResourceSchema),
  validateEnquiry: validateSchema(enquirySchema),
};
