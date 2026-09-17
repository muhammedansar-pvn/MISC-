const express = require("express");
const {
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
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateSendOtp,
  validateVerifyOtp,
} = require("../validators/authValidator");

const router = express.Router();

router.post("/login", validateLogin, login);
router.get("/account-setup/:token", verifyAccountSetupToken);
router.post("/account-setup", accountSetup);
router.post("/set-password", setPassword);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/reset-password", validateResetPassword, resetPassword);
router.post("/send-otp", validateSendOtp, sendOtp);
router.post("/verify-otp", validateVerifyOtp, verifyOtp);

module.exports = router;