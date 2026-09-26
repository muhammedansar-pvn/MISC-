const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const disciplineController = require("./discipline.controller");

const router = express.Router();

router.use(requireAuth);

// Record disciplinary incident (Admin, Asatitha, Faculty)
router.post(
  "/records",
  requireRole("ADMIN", "ASATITHA", "FACULTY"),
  disciplineController.handleRecordIncident
);

// Resolve disciplinary incident (Admin, Asatitha, Faculty)
router.patch(
  "/records/:id/resolve",
  requireRole("ADMIN", "ASATITHA", "FACULTY"),
  disciplineController.handleResolveIncident
);

// Student gets their own discipline records
router.get(
  "/my-records",
  requireRole("STUDENT"),
  disciplineController.handleGetMyDisciplineRecords
);

// Parent / Admin / Asatitha gets student discipline records
router.get(
  "/student/:studentId",
  requireRole("PARENT", "ADMIN", "ASATITHA", "FACULTY"),
  disciplineController.handleGetStudentDisciplineRecords
);

module.exports = router;
