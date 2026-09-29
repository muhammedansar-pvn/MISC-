const express = require("express");
const {
  handleCreateAssignment,
  handleGetAssignments,
  handleGetAssignmentById,
  handleDeleteAssignment,
  handleSubmitAssignment,
  handleGetSubmissions,
  handleGetMySubmission,
} = require("./assignment.controller");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const { uploadArray, uploadSingle } = require("../../middleware/upload.middleware");

const router = express.Router();

// List assignments (filterable by classId, subjectId, facultyId)
router.get(
  "/",
  requireAuth,
  requireRole("ADMIN", "FACULTY", "STUDENT", "PARENT"),
  handleGetAssignments
);

// Create assignment with attachments (FACULTY, ADMIN)
router.post(
  "/",
  requireAuth,
  requireRole("FACULTY", "ADMIN"),
  uploadArray("attachments", 5),
  handleCreateAssignment
);

// Get student's own submission for an assignment (must precede /:id to avoid collision if named)
router.get(
  "/:id/my-submission",
  requireAuth,
  requireRole("STUDENT"),
  handleGetMySubmission
);

// List all submissions for an assignment (FACULTY, ADMIN)
router.get(
  "/:id/submissions",
  requireAuth,
  requireRole("FACULTY", "ADMIN"),
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

// Get single assignment by ID
router.get(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "FACULTY", "STUDENT", "PARENT"),
  handleGetAssignmentById
);

// Delete assignment (FACULTY owner, ADMIN)
router.delete(
  "/:id",
  requireAuth,
  requireRole("FACULTY", "ADMIN"),
  handleDeleteAssignment
);

module.exports = router;
