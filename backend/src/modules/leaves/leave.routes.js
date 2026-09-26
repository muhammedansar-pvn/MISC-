const express = require("express");
const {
  handleApplyLeave,
  handleApproveLeave,
  handleRejectLeave,
  handleGetLeaves,
} = require("./leave.controller");
const {
  validateApplyLeave,
  validateReviewLeave,
} = require("./leave.validator");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");

const router = express.Router();

// --- PARENT LEAVE APPLICATION (STRICTLY RESTRICTED TO PARENT ROLE) ---
router.post(
  "/",
  requireAuth,
  requireRole("PARENT"),
  validateApplyLeave,
  handleApplyLeave
);

// --- ASATITHA LEAVE APPROVAL & REJECTION ---
router.patch(
  "/:id/approve",
  requireAuth,
  requireRole("ASATITHA", "FACULTY"),
  validateReviewLeave,
  handleApproveLeave
);

router.patch(
  "/:id/reject",
  requireAuth,
  requireRole("ASATITHA", "FACULTY"),
  validateReviewLeave,
  handleRejectLeave
);

// --- READ-ONLY LEAVE LISTING ---
router.get(
  "/",
  requireAuth,
  requireRole("PARENT", "ASATITHA", "FACULTY", "ADMIN", "STUDENT"),
  handleGetLeaves
);

module.exports = router;
