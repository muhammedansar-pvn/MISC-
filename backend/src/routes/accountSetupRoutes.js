const express = require("express");

const {
  verifyAccountSetupToken,
  setupAccount,
} = require("../controllers/accountSetupController");

const {
  validateAccountSetup,
} = require("../validators/accountSetupValidator");

const router = express.Router();

// Verify setup link
router.get(
  "/account-setup/:token",
  verifyAccountSetupToken
);

// Complete account setup
router.post(
  "/account-setup",
  validateAccountSetup,
  setupAccount
);

module.exports = router;