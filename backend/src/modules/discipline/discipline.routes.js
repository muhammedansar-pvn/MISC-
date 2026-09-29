const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const disciplineController = require("./discipline.controller");

const router = express.Router();

router.use(requireAuth);

// Record disciplinary incident (Admin, Faculty)
router.post(
  "/records",
  requireRole("ADMIN", "FACULTY"),
  disciplineController.handleRecordIncident
);

// Resolve disciplinary incident (Admin, Faculty)
router.patch(
  "/records/:id/resolve",
  requireRole("ADMIN", "FACULTY"),
  disciplineController.handleResolveIncident
);

// Student gets their own discipline records
router.get(
  "/my-records",
  requireRole("STUDENT"),
  disciplineController.handleGetMyDisciplineRecords
);

// Parent / Admin / Faculty gets student discipline records
router.get(
  "/student/:studentId",
  requireRole("PARENT", "ADMIN", "FACULTY"),
  disciplineController.handleGetStudentDisciplineRecords
);

module.exports = router;
