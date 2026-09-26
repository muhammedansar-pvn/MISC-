const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const developmentController = require("./development.controller");

const router = express.Router();

router.use(requireAuth);

// Record or update student development score (Admin, Asatitha, Faculty)
router.post(
  "/scores",
  requireRole("ADMIN", "ASATITHA", "FACULTY"),
  developmentController.handleRecordScore
);

// Student gets their own scores
router.get(
  "/my-scores",
  requireRole("STUDENT"),
  developmentController.handleGetMyScores
);

// Parent / Admin / Asatitha gets scores for a student
router.get(
  "/student/:studentId",
  requireRole("PARENT", "ADMIN", "ASATITHA", "FACULTY"),
  developmentController.handleGetStudentScores
);

module.exports = router;
