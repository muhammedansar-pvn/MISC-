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

// --- LEAVE APPLICATION (PARENT ONLY) ---
router.post(
  "/",
  requireAuth,
  requireRole("PARENT"),
  validateApplyLeave,
  handleApplyLeave
);

// --- FACULTY & ADMIN LEAVE APPROVAL & REJECTION ---
router.patch(
  "/:id/approve",
  requireAuth,
  requireRole("FACULTY", "ADMIN"),
  validateReviewLeave,
  handleApproveLeave
);
router.put(
  "/:id/approve",
  requireAuth,
  requireRole("FACULTY", "ADMIN"),
  validateReviewLeave,
  handleApproveLeave
);

router.patch(
  "/:id/reject",
  requireAuth,
  requireRole("FACULTY", "ADMIN"),
  validateReviewLeave,
  handleRejectLeave
);
router.put(
  "/:id/reject",
  requireAuth,
  requireRole("FACULTY", "ADMIN"),
  validateReviewLeave,
  handleRejectLeave
);

// --- READ-ONLY LEAVE LISTING ---
router.get(
  "/",
  requireAuth,
  requireRole("PARENT", "FACULTY", "ADMIN", "STUDENT"),
  handleGetLeaves
);

module.exports = router;
