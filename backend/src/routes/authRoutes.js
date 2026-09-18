const express = require("express");
const {
  register,
  verifyEmailOtp,
  resendEmailOtp,
  login,
  setPassword,
  accountSetup,
  verifyAccountSetupToken,
  forgotPassword,
  resetPassword,
  sendOtp,
  verifyOtp,
} = require("../controllers/authController");
const {
  validateRegister,
  validateResendEmailOtp,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateSendOtp,
  validateVerifyOtp,
} = require("../validators/authValidator");
const { createRateLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

const registerLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many registration attempts. Please try again after 15 minutes.",
});

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: "Too many login attempts. Please try again after 15 minutes.",
});

const otpLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: "Too many OTP requests. Please wait before trying again.",
});

const passwordResetLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many password reset attempts. Please try again later.",
});

router.post("/register", registerLimiter, validateRegister, register);
router.post("/verify-email-otp", otpLimiter, verifyEmailOtp);
router.post("/resend-email-otp", otpLimiter, validateResendEmailOtp, resendEmailOtp);
router.post("/login", loginLimiter, validateLogin, login);
router.get("/account-setup/:token", verifyAccountSetupToken);
router.post("/account-setup", accountSetup);
router.post("/set-password", setPassword);
router.post("/forgot-password", passwordResetLimiter, validateForgotPassword, forgotPassword);
router.post("/reset-password", passwordResetLimiter, validateResetPassword, resetPassword);
router.post("/send-otp", otpLimiter, validateSendOtp, sendOtp);
router.post("/verify-otp", otpLimiter, validateVerifyOtp, verifyOtp);

module.exports = router;