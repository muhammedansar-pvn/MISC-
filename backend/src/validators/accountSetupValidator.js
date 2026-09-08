const Joi = require("joi");

const accountSetupSchema = Joi.object({
  token: Joi.string()
    .trim()
    .length(64)
    .required(),

  username: Joi.string()
    .trim()
    .lowercase()
    .min(4)
    .max(30)
    .pattern(/^[a-z0-9._-]+$/)
    .required(),

  password: Joi.string()
    .min(8)
    .max(100)
    .required(),

  confirmPassword: Joi.any()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Passwords do not match",
    }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

const validateAccountSetup = (req, res, next) => {
  const { error, value } = accountSetupSchema.validate(req.body);

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
  validateAccountSetup,
};