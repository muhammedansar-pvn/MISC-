const express = require("express");
const {
  handleGetStudentSummary,
  handleGetStudentMonthly,
  handleGetStudentHistory,
  handleCreateCorrectionRequest,
  handleReviewCorrectionRequest,
} = require("./attendance.controller");
const {
  validateCreateCorrectionRequest,
  validateReviewCorrectionRequest,
} = require("./attendance.validator");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");

const router = express.Router();

// --- STUDENT PORTAL READ-ONLY ATTENDANCE ENDPOINTS ---
router.get("/student/summary", requireAuth, requireRole("STUDENT"), handleGetStudentSummary);
router.get("/student/monthly", requireAuth, requireRole("STUDENT"), handleGetStudentMonthly);
router.get("/student/history", requireAuth, requireRole("STUDENT"), handleGetStudentHistory);

// --- ASATITHA CORRECTION REQUESTS ---
router.post(
  "/corrections",
  requireAuth,
  requireRole("ASATITHA", "FACULTY", "ADMIN"),
  validateCreateCorrectionRequest,
  handleCreateCorrectionRequest
);

router.patch(
  "/corrections/:id/review",
  requireAuth,
  requireRole("ADMIN"),
  validateReviewCorrectionRequest,
  handleReviewCorrectionRequest
);

module.exports = router;
