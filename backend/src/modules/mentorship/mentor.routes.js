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

// Asatitha / Faculty gets their assigned mentees
router.get(
  "/my-mentees",
  requireRole("ASATITHA", "FACULTY", "ADMIN"),
  mentorController.handleGetMyMentees
);

// Mentor or Admin updates mentee monitoring status
router.patch(
  "/assignments/:id",
  requireRole("ASATITHA", "FACULTY", "ADMIN"),
  mentorController.handleUpdateMenteeMonitoring
);

// Student gets their own mentor
router.get(
  "/my-mentor",
  requireRole("STUDENT"),
  mentorController.handleGetMyMentor
);

// Parent / Admin / Asatitha gets student mentor
router.get(
  "/student/:studentId",
  requireRole("PARENT", "ADMIN", "ASATITHA", "FACULTY"),
  mentorController.handleGetStudentMentor
);

module.exports = router;
