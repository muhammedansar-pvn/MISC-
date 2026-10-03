const express = require("express");
const {
  handleGetStudentSummary,
  handleGetStudentMonthly,
  handleGetStudentHistory,
  handleGetStudentSubjectAttendance,
  handleGetStudentSessionAttendance,
  handleGetClassAttendanceSummary,
  handleGetFacultyAttendanceSummary,
  handleCreateCorrectionRequest,
  handleApproveCorrectionRequest,
  handleRejectCorrectionRequest,
  handleReviewCorrectionRequest,
  handleMarkClassAttendance,
  handleGetClassAttendanceRecords,
} = require("./attendance.controller");
const {
  validateCreateCorrectionRequest,
  validateReviewCorrectionRequest,
  validateMarkClassAttendance,
} = require("./attendance.validator");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");

const router = express.Router();

// --- CLASS ROSTER ATTENDANCE MARKING & SUMMARIES (FACULTY / ADMIN) ---
router.post(
  "/mark-class",
  requireAuth,
  requireRole("FACULTY", "ADMIN"),
  validateMarkClassAttendance,
  handleMarkClassAttendance
);

router.get(
  "/class-records",
  requireAuth,
  requireRole("FACULTY", "ADMIN"),
  handleGetClassAttendanceRecords
);

router.get(
  "/class-summary",
  requireAuth,
  requireRole("FACULTY", "ADMIN"),
  handleGetClassAttendanceSummary
);

router.get(
  "/faculty-history",
  requireAuth,
  requireRole("FACULTY"),
  handleGetFacultyAttendanceSummary
);

// --- STUDENT PORTAL READ-ONLY & 360 ATTENDANCE ENDPOINTS ---
router.get("/student/summary", requireAuth, requireRole("STUDENT", "FACULTY", "ADMIN", "PARENT"), handleGetStudentSummary);
router.get("/student/monthly", requireAuth, requireRole("STUDENT", "FACULTY", "ADMIN", "PARENT"), handleGetStudentMonthly);
router.get("/student/history", requireAuth, requireRole("STUDENT", "FACULTY", "ADMIN", "PARENT"), handleGetStudentHistory);
router.get("/student/subjects", requireAuth, requireRole("STUDENT", "FACULTY", "ADMIN", "PARENT"), handleGetStudentSubjectAttendance);
router.get("/student/sessions", requireAuth, requireRole("STUDENT", "FACULTY", "ADMIN", "PARENT"), handleGetStudentSessionAttendance);

// --- FACULTY CORRECTION REQUESTS ---
router.post(
  "/correction-requests",
  requireAuth,
  requireRole("FACULTY", "ADMIN"),
  validateCreateCorrectionRequest,
  handleCreateCorrectionRequest
);

router.post(
  "/corrections",
  requireAuth,
  requireRole("FACULTY", "ADMIN"),
  validateCreateCorrectionRequest,
  handleCreateCorrectionRequest
);

// --- ADMIN-ONLY CORRECTION REQUEST APPROVAL/REJECTION ---
router.patch(
  "/correction-requests/:id/approve",
  requireAuth,
  requireRole("ADMIN"),
  handleApproveCorrectionRequest
);

router.patch(
  "/correction-requests/:id/reject",
  requireAuth,
  requireRole("ADMIN"),
  handleRejectCorrectionRequest
);

router.patch(
  "/corrections/:id/review",
  requireAuth,
  requireRole("ADMIN"),
  validateReviewCorrectionRequest,
  handleReviewCorrectionRequest
);

module.exports = router;
