const Joi = require("joi");
const { validateSchema } = require("./authValidator");

const accountSetupSchema = Joi.object({
  token: Joi.string().trim().required(),
  username: Joi.string()
    .trim()
    .lowercase()
    .min(4)
    .max(30)
    .pattern(/^[a-z0-9._-]+$/)
    .required(),
  password: Joi.string().min(6).max(100).required(),
  confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
  }),
});

module.exports = {
  validateAccountSetup: validateSchema(accountSetupSchema),
};