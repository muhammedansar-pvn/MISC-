const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const mentorController = require("./mentor.controller");

const router = express.Router();

router.use(requireAuth);

// Admin assigns mentors to students
router.post(
  "/assignments",
  requireRole("ADMIN"),
  mentorController.handleAssignMentor
);

// Faculty gets their assigned mentees
router.get(
  "/my-mentees",
  requireRole("FACULTY", "ADMIN"),
  mentorController.handleGetMyMentees
);

// Mentor or Admin updates mentee monitoring status
router.patch(
  "/assignments/:id",
  requireRole("FACULTY", "ADMIN"),
  mentorController.handleUpdateMenteeMonitoring
);

// Student gets their own mentor
router.get(
  "/my-mentor",
  requireRole("STUDENT"),
  mentorController.handleGetMyMentor
);

// Parent / Admin / Faculty gets student mentor
router.get(
  "/student/:studentId",
  requireRole("PARENT", "ADMIN", "FACULTY"),
  mentorController.handleGetStudentMentor
);

// Add mentorship note for a student (Assigned Mentor or Admin)
router.post(
  "/student/:studentId/notes",
  requireRole("FACULTY", "ADMIN"),
  mentorController.handleAddMentorshipNote
);

router.post(
  "/notes",
  requireRole("FACULTY", "ADMIN"),
  mentorController.handleAddMentorshipNote
);

module.exports = router;
