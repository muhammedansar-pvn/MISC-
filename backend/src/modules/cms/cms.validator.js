const Joi = require("joi");
const { validateSchema } = require("../../middleware/validation.middleware");

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

module.exports = {
  validateArticle: validateSchema(articleSchema),
};
