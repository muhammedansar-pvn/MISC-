const Joi = require("joi");

const validateSchema = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

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

const loginSchema = Joi.object({
  username: Joi.string().trim().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().trim().required(),
  password: Joi.string().min(6).max(100).required(),
  confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
  }),
});

const sendOtpSchema = Joi.object({
  identifier: Joi.string().trim().required(),
  purpose: Joi.string()
    .valid("EMAIL_VERIFICATION", "MOBILE_VERIFICATION", "PASSWORD_RESET")
    .required(),
});

const verifyOtpSchema = Joi.object({
  identifier: Joi.string().trim().required(),
  otp: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
  purpose: Joi.string()
    .valid("EMAIL_VERIFICATION", "MOBILE_VERIFICATION", "PASSWORD_RESET")
    .required(),
});

const userInvitationSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().lowercase().trim().required(),
  role: Joi.string().valid("ADMIN", "STUDENT", "FACULTY", "INSTITUTION").required(),
  department: Joi.string().trim().allow(""),
  mobile: Joi.string().trim().allow(""),
});

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(6).max(100).required(),
  mobile: Joi.string().trim().allow("", null),
  role: Joi.string().valid("STUDENT", "FACULTY", "INSTITUTION").default("STUDENT"),
});

const resendEmailOtpSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
});

module.exports = {
  validateLogin: validateSchema(loginSchema),
  validateForgotPassword: validateSchema(forgotPasswordSchema),
  validateResetPassword: validateSchema(resetPasswordSchema),
  validateSendOtp: validateSchema(sendOtpSchema),
  validateVerifyOtp: validateSchema(verifyOtpSchema),
  validateUserInvitation: validateSchema(userInvitationSchema),
  validateRegister: validateSchema(registerSchema),
  validateResendEmailOtp: validateSchema(resendEmailOtpSchema),
  validateSchema,
};
