const examService = require("./exam.service");
const { parsePagination, formatPaginatedResponse } = require("../../shared/utils/pagination");

// ==========================================
// 1. EXAMS
// ==========================================
const handleCreateExam = async (req, res) => {
  try {
    const exam = await examService.createExam(req.body);
    return res.status(201).json({ success: true, message: "Exam created successfully", data: exam });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to create exam" });
  }
};

const handleGetExams = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = {};
    if (req.query.academicYearId) filter.academicYearId = req.query.academicYearId;
    if (req.query.status) filter.status = req.query.status;

    const { data, total } = await examService.getExams(filter, { page, limit, skip });
    return res.status(200).json(formatPaginatedResponse({ data, total, page, limit }));
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve exams" });
  }
};

const handleGetExamById = async (req, res) => {
  try {
    const exam = await examService.getExamById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });
    return res.status(200).json({ success: true, data: exam });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve exam" });
  }
};

const handleUpdateExam = async (req, res) => {
  try {
    const exam = await examService.updateExam(req.params.id, req.body);
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });
    return res.status(200).json({ success: true, message: "Exam updated successfully", data: exam });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to update exam" });
  }
};

// ==========================================
// 2. EXAM SCHEDULES
// ==========================================
const handleCreateExamSchedule = async (req, res) => {
  try {
    const schedule = await examService.createExamSchedule(req.body);
    return res.status(201).json({ success: true, message: "Exam schedule created successfully", data: schedule });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to create exam schedule" });
  }
};

const handleGetExamSchedules = async (req, res) => {
  try {
    const filter = {};
    if (req.query.examId) filter.examId = req.query.examId;
    if (req.query.classId) filter.classId = req.query.classId;
    if (req.query.subjectId) filter.subjectId = req.query.subjectId;
    if (req.query.academicYearId) filter.academicYearId = req.query.academicYearId;

    const { page, limit, skip } = parsePagination(req.query);
    const { data, total } = await examService.getExamSchedules(filter, { page, limit, skip });
    return res.status(200).json(formatPaginatedResponse({ data, total, page, limit }));
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve exam schedules" });
  }
};

const handleGetFacultyExamSchedules = async (req, res) => {
  try {
    const filter = {};
    if (req.query.examId) filter.examId = req.query.examId;
    if (req.query.classId) filter.classId = req.query.classId;
    if (req.query.academicYearId) filter.academicYearId = req.query.academicYearId;

    const schedules = await examService.getFacultyExamSchedules(req.user.userId || req.user._id, filter);
    return res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to retrieve faculty exam schedules" });
  }
};

const handleGetExamScheduleById = async (req, res) => {
  try {
    const schedule = await examService.getExamScheduleById(req.params.id);
    if (!schedule) return res.status(404).json({ success: false, message: "Exam schedule not found" });
    return res.status(200).json({ success: true, data: schedule });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve exam schedule" });
  }
};

const handleUpdateExamSchedule = async (req, res) => {
  try {
    const schedule = await examService.updateExamSchedule(req.params.id, req.body);
    if (!schedule) return res.status(404).json({ success: false, message: "Exam schedule not found" });
    return res.status(200).json({ success: true, message: "Exam schedule updated successfully", data: schedule });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to update exam schedule" });
  }
};

const handleGetExamScheduleRoster = async (req, res) => {
  try {
    const data = await examService.getExamScheduleRoster(req.params.id, req.user);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to retrieve exam roster" });
  }
};

// ==========================================
// 3. EXAM REGISTRATIONS
// ==========================================
const handleRegisterStudentForExam = async (req, res) => {
  try {
    const regData = { ...req.body };
    if (req.user && req.user.role === "STUDENT") {
      if (!req.user.studentId) {
        return res.status(403).json({
          success: false,
          message: "No student profile associated with this account",
        });
      }
      regData.studentId = req.user.studentId;
    }
    const registration = await examService.registerStudentForExam(regData);
    return res.status(201).json({ success: true, message: "Registered student for exam successfully", data: registration });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: error.message || "Exam registration failed" });
  }
};

const handleGetExamRegistrations = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === "STUDENT") {
      filter.studentId = req.user.studentId;
    }
    if (req.query.examId) filter.examId = req.query.examId;

    const { page, limit, skip } = parsePagination(req.query);
    const { data, total } = await examService.getExamRegistrations(filter, { page, limit, skip });
    return res.status(200).json(formatPaginatedResponse({ data, total, page, limit }));
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve exam registrations" });
  }
};

const handleUpdateExamRegistrationStatus = async (req, res) => {
  try {
    const registration = await examService.updateExamRegistrationStatus(req.params.id, req.body.registrationStatus);
    if (!registration) return res.status(404).json({ success: false, message: "Exam registration not found" });
    return res.status(200).json({ success: true, message: "Exam registration status updated", data: registration });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to update registration status" });
  }
};

// ==========================================
// 4. MARK ENTRIES (SINGLE & BULK ROSTER)
// ==========================================
const handleSubmitMarkEntry = async (req, res) => {
  try {
    const record = await examService.submitOrUpdateMarkEntry(req.body, req.user);
    return res.status(200).json({ success: true, message: "Mark entry recorded successfully", data: record });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to record mark entry" });
  }
};

const handleSubmitRosterMarks = async (req, res) => {
  try {
    const { status, marks } = req.body;
    const result = await examService.submitRosterMarks(
      { examScheduleId: req.params.id, status, marks },
      req.user
    );
    return res.status(200).json({
      success: true,
      message: `Marks recorded successfully for ${result.totalProcessed} candidate(s)`,
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to record roster marks" });
  }
};

const handleGetMarkEntries = async (req, res) => {
  try {
    const filter = {};
    if (req.query.examId) filter.examId = req.query.examId;
    if (req.query.examScheduleId) filter.examScheduleId = req.query.examScheduleId;
    if (req.query.studentId) filter.studentId = req.query.studentId;
    if (req.query.classId) filter.classId = req.query.classId;

    const { page, limit, skip } = parsePagination(req.query);
    const { data, total } = await examService.getMarkEntries(filter, { page, limit, skip });
    return res.status(200).json(formatPaginatedResponse({ data, total, page, limit }));
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve mark entries" });
  }
};

const handleVerifyMarkEntries = async (req, res) => {
  try {
    const result = await examService.verifyMarkEntries(req.params.examScheduleId, req.user);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to verify mark entries" });
  }
};

// ==========================================
// 5. MARK CORRECTION REQUESTS
// ==========================================
const handleCreateMarkCorrectionRequest = async (req, res) => {
  try {
    const result = await examService.createMarkCorrectionRequest(req.body, req.user);
    return res.status(201).json({
      success: true,
      message: "Mark correction request submitted for administrative review",
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to submit correction request" });
  }
};

const handleReviewMarkCorrectionRequest = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    const result = await examService.reviewMarkCorrectionRequest(
      req.params.id,
      status,
      req.user,
      adminRemarks
    );
    return res.status(200).json({
      success: true,
      message: `Correction request ${status.toLowerCase()} successfully`,
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to review correction request" });
  }
};

const handleGetMarkCorrectionRequests = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.examId) filter.examId = req.query.examId;
    if (req.query.studentId) filter.studentId = req.query.studentId;

    const data = await examService.getMarkCorrectionRequests(filter);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve correction requests" });
  }
};

// ==========================================
// 6. EXAM RESULTS & GENERATION
// ==========================================
const handleGenerateExamResults = async (req, res) => {
  try {
    const { examId, classId } = req.body;
    if (!examId || !classId) {
      return res.status(400).json({ success: false, message: "examId and classId are required" });
    }
    const results = await examService.aggregateAndGenerateResults(examId, classId, req.user);
    return res.status(200).json({
      success: true,
      message: `Results generated and published successfully for ${results.length} students`,
      data: results,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to generate exam results" });
  }
};

const handleGetExamResults = async (req, res) => {
  try {
    const filter = {};
    if (req.query.examId) filter.examId = req.query.examId;
    if (req.query.classId) filter.classId = req.query.classId;

    const { page, limit, skip } = parsePagination(req.query);
    const { data, total } = await examService.getExamResults(filter, { page, limit, skip }, req.user);
    return res.status(200).json(formatPaginatedResponse({ data, total, page, limit }));
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to retrieve exam results" });
  }
};

module.exports = {
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
};
