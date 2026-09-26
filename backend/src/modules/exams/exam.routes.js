const express = require("express");
const {
  handleCreateExam,
  handleGetExams,
  handleGetExamById,
  handleUpdateExam,
  handleCreateExamSchedule,
  handleGetExamSchedules,
  handleUpdateExamSchedule,
  handleRegisterStudentForExam,
  handleGetExamRegistrations,
  handleUpdateExamRegistrationStatus,
  handleSubmitMarkEntry,
  handleGetMarkEntries,
  handleVerifyMarkEntries,
  handleGenerateExamResults,
  handleGetExamResults,
} = require("./exam.controller");
const {
  validateExam,
  validateExamSchedule,
  validateExamRegistration,
  validateMarkEntry,
} = require("./exam.validator");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");

const router = express.Router();

// --- EXAMS ---
router.post("/exams", requireAuth, requireRole("ADMIN"), validateExam, handleCreateExam);
router.get("/exams", requireAuth, handleGetExams);
router.get("/exams/:id", requireAuth, handleGetExamById);
router.put("/exams/:id", requireAuth, requireRole("ADMIN"), validateExam, handleUpdateExam);

// --- EXAM SCHEDULES ---
router.post("/exam-schedules", requireAuth, requireRole("ADMIN"), validateExamSchedule, handleCreateExamSchedule);
router.get("/exam-schedules", requireAuth, handleGetExamSchedules);
router.put("/exam-schedules/:id", requireAuth, requireRole("ADMIN"), validateExamSchedule, handleUpdateExamSchedule);

// --- EXAM REGISTRATIONS ---
router.post("/exam-registrations", requireAuth, requireRole("ADMIN", "STUDENT"), validateExamRegistration, handleRegisterStudentForExam);
router.get("/exam-registrations", requireAuth, requireRole("ADMIN", "INSTITUTION", "STUDENT"), handleGetExamRegistrations);
router.put("/exam-registrations/:id/status", requireAuth, requireRole("ADMIN"), handleUpdateExamRegistrationStatus);

// --- MARK ENTRIES ---
router.post("/mark-entries", requireAuth, requireRole("ADMIN", "FACULTY", "INSTITUTION"), validateMarkEntry, handleSubmitMarkEntry);
router.get("/mark-entries", requireAuth, requireRole("ADMIN", "FACULTY", "INSTITUTION"), handleGetMarkEntries);
router.put("/mark-entries/verify/:examScheduleId", requireAuth, requireRole("ADMIN"), handleVerifyMarkEntries);

// --- EXAM RESULTS ---
router.post("/exam-results/generate", requireAuth, requireRole("ADMIN"), handleGenerateExamResults);
router.get("/exam-results", requireAuth, handleGetExamResults);

module.exports = router;
