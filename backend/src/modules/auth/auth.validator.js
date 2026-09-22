const Joi = require("joi");
const { validateSchema } = require("../../middleware/validation.middleware");

const loginSchema = Joi.object({
  username: Joi.string().trim().allow(""),
  email: Joi.string().trim().allow(""),
  password: Joi.string().required(),
  requires2FA: Joi.boolean().optional(),
}).or("username", "email");

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
    .valid("LOGIN_2FA", "EMAIL_VERIFICATION", "MOBILE_VERIFICATION", "PASSWORD_RESET")
    .required(),
});

const verifyOtpSchema = Joi.object({
  verificationId: Joi.string().trim().allow("", null),
  otp: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
  identifier: Joi.string().trim().allow("", null),
  purpose: Joi.string()
    .valid("LOGIN_2FA", "EMAIL_VERIFICATION", "MOBILE_VERIFICATION", "PASSWORD_RESET")
    .allow("", null),
});

const resendOtpSchema = Joi.object({
  verificationId: Joi.string().trim().allow("", null),
  identifier: Joi.string().trim().allow("", null),
  purpose: Joi.string().allow("", null),
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

const accountSetupSchema = Joi.object({
  token: Joi.string().trim().required(),
  username: Joi.string().trim().min(3).max(30).allow("", null),
  password: Joi.string().min(6).max(100).required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).allow("", null),
});

module.exports = {
  validateLogin: validateSchema(loginSchema),
  validateForgotPassword: validateSchema(forgotPasswordSchema),
  validateResetPassword: validateSchema(resetPasswordSchema),
  validateSendOtp: validateSchema(sendOtpSchema),
  validateVerifyOtp: validateSchema(verifyOtpSchema),
  validateResendOtp: validateSchema(resendOtpSchema),
  validateRegister: validateSchema(registerSchema),
  validateResendEmailOtp: validateSchema(resendEmailOtpSchema),
  validateAccountSetup: validateSchema(accountSetupSchema),
};
