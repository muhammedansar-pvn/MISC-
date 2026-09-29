const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const activityController = require("./activity.controller");

const router = express.Router();

router.use(requireAuth);

// Create activity catalog item (Admin, Faculty)
router.post(
  "/",
  requireRole("ADMIN", "FACULTY"),
  activityController.handleCreateActivity
);

// List activities
router.get("/", activityController.handleListActivities);

// Record student achievement (Student self, Faculty, Admin)
router.post(
  "/achievements",
  requireRole("STUDENT", "FACULTY", "ADMIN"),
  activityController.handleRecordAchievement
);

// Verify achievement (Admin, Faculty)
router.patch(
  "/achievements/:id/verify",
  requireRole("ADMIN", "FACULTY"),
  activityController.handleVerifyAchievement
);

// Student gets their own achievements
router.get(
  "/achievements/my",
  requireRole("STUDENT"),
  activityController.handleGetMyAchievements
);

// Parent / Admin / Faculty gets student achievements
router.get(
  "/achievements/student/:studentId",
  requireRole("PARENT", "ADMIN", "FACULTY"),
  activityController.handleGetStudentAchievements
);

module.exports = router;
