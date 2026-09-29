const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const developmentController = require("./development.controller");

const router = express.Router();

router.use(requireAuth);

// Record or update student development score (Admin, Faculty)
router.post(
  "/scores",
  requireRole("ADMIN", "FACULTY"),
  developmentController.handleRecordScore
);

// Student gets their own scores
router.get(
  "/my-scores",
  requireRole("STUDENT"),
  developmentController.handleGetMyScores
);

// Parent / Admin / Faculty gets scores for a student
router.get(
  "/student/:studentId",
  requireRole("PARENT", "ADMIN", "FACULTY"),
  developmentController.handleGetStudentScores
);

module.exports = router;
