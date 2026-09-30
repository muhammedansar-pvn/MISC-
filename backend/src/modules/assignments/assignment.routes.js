const express = require("express");
const {
  handleCreateAssignment,
  handleGetAssignments,
  handleGetAssignmentById,
  handleUpdateAssignment,
  handleDeleteAssignment,
  handleSubmitAssignment,
  handleGetSubmissions,
  handleGetMySubmission,
  handleGradeSubmission,
} = require("./assignment.controller");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const { uploadArray, uploadSingle } = require("../../middleware/upload.middleware");

const router = express.Router();

// List assignments (filterable by classId, subjectId, facultyId, academicYearId; scoped by role)
router.get(
  "/",
  requireAuth,
  requireRole("ADMIN", "PRINCIPAL", "HOD", "FACULTY", "STUDENT", "PARENT"),
  handleGetAssignments
);

// Create assignment with attachments (FACULTY, ADMIN, PRINCIPAL, HOD)
router.post(
  "/",
  requireAuth,
  requireRole("FACULTY", "ADMIN", "PRINCIPAL", "HOD"),
  uploadArray("attachments", 5),
  handleCreateAssignment
);

// Get student's own submission for an assignment
router.get(
  "/:id/my-submission",
  requireAuth,
  requireRole("STUDENT"),
  handleGetMySubmission
);

// List all submissions for an assignment (FACULTY, ADMIN, PRINCIPAL, HOD)
router.get(
  "/:id/submissions",
  requireAuth,
  requireRole("FACULTY", "ADMIN", "PRINCIPAL", "HOD"),
  handleGetSubmissions
);

// Submit an assignment (STUDENT)
router.post(
  "/:id/submit",
  requireAuth,
  requireRole("STUDENT"),
  uploadSingle("file"),
  handleSubmitAssignment
);

// Grade a student submission (FACULTY, ADMIN, PRINCIPAL, HOD)
router.post(
  "/:id/submissions/:submissionId/grade",
  requireAuth,
  requireRole("FACULTY", "ADMIN", "PRINCIPAL", "HOD"),
  handleGradeSubmission
);

// Get single assignment by ID
router.get(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "PRINCIPAL", "HOD", "FACULTY", "STUDENT", "PARENT"),
  handleGetAssignmentById
);

// Update assignment details (FACULTY owner, ADMIN, PRINCIPAL, HOD)
router.put(
  "/:id",
  requireAuth,
  requireRole("FACULTY", "ADMIN", "PRINCIPAL", "HOD"),
  handleUpdateAssignment
);

// Delete assignment (FACULTY owner, ADMIN, PRINCIPAL, HOD)
router.delete(
  "/:id",
  requireAuth,
  requireRole("FACULTY", "ADMIN", "PRINCIPAL", "HOD"),
  handleDeleteAssignment
);

module.exports = router;
