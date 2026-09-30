const express = require("express");
const {
  handleCreateExam,
  handleGetExams,
  handleGetExamById,
  handleUpdateExam,
  handleCreateExamSchedule,
  handleGetExamSchedules,
  handleGetFacultyExamSchedules,
  handleGetExamScheduleById,
  handleUpdateExamSchedule,
  handleGetExamScheduleRoster,
  handleRegisterStudentForExam,
  handleGetExamRegistrations,
  handleUpdateExamRegistrationStatus,
  handleSubmitMarkEntry,
  handleSubmitRosterMarks,
  handleGetMarkEntries,
  handleVerifyMarkEntries,
  handleCreateMarkCorrectionRequest,
  handleReviewMarkCorrectionRequest,
  handleGetMarkCorrectionRequests,
  handleGenerateExamResults,
  handleGetExamResults,
} = require("./exam.controller");
const {
  validateExam,
  validateExamSchedule,
  validateExamRegistration,
  validateMarkEntry,
  validateRosterMarks,
  validateMarkCorrectionRequest,
  validateReviewCorrectionRequest,
} = require("./exam.validator");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");

const router = express.Router();

// --- EXAMS ---
router.post("/exams", requireAuth, requireRole("ADMIN"), validateExam, handleCreateExam);
router.get("/exams", requireAuth, handleGetExams);
router.get("/exams/:id", requireAuth, handleGetExamById);
router.put("/exams/:id", requireAuth, requireRole("ADMIN"), validateExam, handleUpdateExam);

// --- EXAM SCHEDULES & FACULTY SCOPE ---
router.post("/exam-schedules", requireAuth, requireRole("ADMIN"), validateExamSchedule, handleCreateExamSchedule);
router.get("/exam-schedules", requireAuth, handleGetExamSchedules);
router.get("/faculty/schedules", requireAuth, requireRole("FACULTY", "ADMIN"), handleGetFacultyExamSchedules);
router.get("/exam-schedules/:id", requireAuth, handleGetExamScheduleById);
router.put("/exam-schedules/:id", requireAuth, requireRole("ADMIN"), validateExamSchedule, handleUpdateExamSchedule);
router.get("/exam-schedules/:id/roster", requireAuth, requireRole("FACULTY", "ADMIN"), handleGetExamScheduleRoster);
router.post("/exam-schedules/:id/roster-marks", requireAuth, requireRole("FACULTY", "ADMIN"), validateRosterMarks, handleSubmitRosterMarks);

// --- EXAM REGISTRATIONS ---
router.post("/exam-registrations", requireAuth, requireRole("ADMIN", "STUDENT"), validateExamRegistration, handleRegisterStudentForExam);
router.get("/exam-registrations", requireAuth, requireRole("ADMIN", "INSTITUTION", "STUDENT"), handleGetExamRegistrations);
router.put("/exam-registrations/:id/status", requireAuth, requireRole("ADMIN"), handleUpdateExamRegistrationStatus);

// --- MARK ENTRIES ---
router.post("/mark-entries", requireAuth, requireRole("ADMIN", "FACULTY", "INSTITUTION"), validateMarkEntry, handleSubmitMarkEntry);
router.get("/mark-entries", requireAuth, requireRole("ADMIN", "FACULTY", "INSTITUTION"), handleGetMarkEntries);
router.put("/mark-entries/verify/:examScheduleId", requireAuth, requireRole("ADMIN"), handleVerifyMarkEntries);

// --- MARK CORRECTION REQUESTS ---
router.post("/mark-corrections", requireAuth, requireRole("ADMIN", "FACULTY"), validateMarkCorrectionRequest, handleCreateMarkCorrectionRequest);
router.get("/mark-corrections", requireAuth, requireRole("ADMIN"), handleGetMarkCorrectionRequests);
router.patch("/mark-corrections/:id/review", requireAuth, requireRole("ADMIN"), validateReviewCorrectionRequest, handleReviewMarkCorrectionRequest);

// --- EXAM RESULTS ---
router.post("/exam-results/generate", requireAuth, requireRole("ADMIN"), handleGenerateExamResults);
router.get("/exam-results", requireAuth, handleGetExamResults);

module.exports = router;
