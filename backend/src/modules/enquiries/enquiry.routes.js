const express = require("express");
const {
  handleCreateEnquiry,
  handleGetEnquiries,
  handleUpdateEnquiryStatus,
} = require("./enquiry.controller");
const { validateEnquiry } = require("./enquiry.validator");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");

const router = express.Router();

router.post("/enquiries", validateEnquiry, handleCreateEnquiry);
router.get("/enquiries", requireAuth, requireRole("ADMIN"), handleGetEnquiries);
router.put("/enquiries/:id/status", requireAuth, requireRole("ADMIN"), handleUpdateEnquiryStatus);

module.exports = router;
