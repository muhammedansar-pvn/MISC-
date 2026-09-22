const express = require("express");
const {
  handleCreateAcademicYear,
  handleGetAcademicYears,
  handleGetAcademicYearById,
  handleUpdateAcademicYear,
  handleCreateClass,
  handleGetClasses,
  handleGetClassById,
  handleUpdateClass,
  handleCreateSubject,
  handleGetSubjects,
  handleGetSubjectById,
  handleUpdateSubject,
  handleCreateSyllabus,
  handleGetSyllabuses,
  handleGetSyllabusById,
  handleUpdateSyllabus,
} = require("./academic.controller");
const {
  validateAcademicYear,
  validateClass,
  validateSubject,
  validateSyllabus,
} = require("./academic.validator");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");

const router = express.Router();

// --- ACADEMIC YEARS ---
router.post("/academic-years", requireAuth, requireRole("ADMIN"), validateAcademicYear, handleCreateAcademicYear);
router.get("/academic-years", requireAuth, handleGetAcademicYears);
router.get("/academic-years/:id", requireAuth, handleGetAcademicYearById);
router.put("/academic-years/:id", requireAuth, requireRole("ADMIN"), validateAcademicYear, handleUpdateAcademicYear);

// --- CLASSES ---
router.post("/classes", requireAuth, requireRole("ADMIN"), validateClass, handleCreateClass);
router.get("/classes", requireAuth, requireRole("ADMIN", "INSTITUTION", "FACULTY"), handleGetClasses);
router.get("/classes/:id", requireAuth, requireRole("ADMIN", "INSTITUTION", "FACULTY"), handleGetClassById);
router.put("/classes/:id", requireAuth, requireRole("ADMIN"), validateClass, handleUpdateClass);

// --- SUBJECTS ---
router.post("/subjects", requireAuth, requireRole("ADMIN"), validateSubject, handleCreateSubject);
router.get("/subjects", requireAuth, handleGetSubjects);
router.get("/subjects/:id", requireAuth, handleGetSubjectById);
router.put("/subjects/:id", requireAuth, requireRole("ADMIN"), validateSubject, handleUpdateSubject);

// --- SYLLABUSES ---
router.post("/syllabuses", requireAuth, requireRole("ADMIN"), validateSyllabus, handleCreateSyllabus);
router.get("/syllabuses", requireAuth, handleGetSyllabuses);
router.get("/syllabuses/:id", requireAuth, handleGetSyllabusById);
router.put("/syllabuses/:id", requireAuth, requireRole("ADMIN"), validateSyllabus, handleUpdateSyllabus);

module.exports = router;
