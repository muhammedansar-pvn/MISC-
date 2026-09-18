const express = require("express");
const { handleResendWebhook } = require("../controllers/webhookController");

const router = express.Router();

// Raw body parser for webhook signature verification
router.post("/resend", express.raw({ type: "application/json" }), handleResendWebhook);

module.exports = router;
