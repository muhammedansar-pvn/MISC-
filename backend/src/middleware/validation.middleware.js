/**
 * Generic Joi schema validation middleware factory.
 * Sanitizes and assigns validated values to req.body.
 */
const validateSchema = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[Validation Error] ${req.method} ${req.originalUrl || req.url}:`,
        error.details.map((d) => `${d.path.join(".")}: ${d.message}`).join("; ")
      );
    }
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
  validateSchema,
};
