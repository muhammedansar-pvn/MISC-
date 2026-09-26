const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const activityController = require("./activity.controller");

const router = express.Router();

router.use(requireAuth);

// Create activity catalog item (Admin, Asatitha)
router.post(
  "/",
  requireRole("ADMIN", "ASATITHA", "FACULTY"),
  activityController.handleCreateActivity
);

// List activities
router.get("/", activityController.handleListActivities);

// Record student achievement (Student self, Asatitha, Admin)
router.post(
  "/achievements",
  requireRole("STUDENT", "ASATITHA", "FACULTY", "ADMIN"),
  activityController.handleRecordAchievement
);

// Verify achievement (Admin, Asatitha)
router.patch(
  "/achievements/:id/verify",
  requireRole("ADMIN", "ASATITHA", "FACULTY"),
  activityController.handleVerifyAchievement
);

// Student gets their own achievements
router.get(
  "/achievements/my",
  requireRole("STUDENT"),
  activityController.handleGetMyAchievements
);

// Parent / Admin / Asatitha gets student achievements
router.get(
  "/achievements/student/:studentId",
  requireRole("PARENT", "ADMIN", "ASATITHA", "FACULTY"),
  activityController.handleGetStudentAchievements
);

module.exports = router;
