const examService = require("./exam.service");
const StudentProfile = require("../students/student.model");
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

const handlePublishExam = async (req, res) => {
  try {
    const shouldPublish = req.body.status
      ? req.body.status === "PUBLISHED"
      : req.body.isPublished !== undefined
      ? Boolean(req.body.isPublished)
      : true;
    const exam = await examService.publishExam(req.params.id, shouldPublish);
    return res.status(200).json({
      success: true,
      message: shouldPublish ? "Examination published successfully" : "Examination unpublished and reverted to draft",
      data: exam,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to update examination publication status" });
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
const handleGetAvailableExamsForStudent = async (req, res) => {
  try {
    let studentProfileId = null;

    if (req.user.role === "STUDENT") {
      studentProfileId = req.user.studentId;
      if (!studentProfileId) {
        const profile = await StudentProfile.findOne({ userId: req.user.userId || req.user._id }).select("_id");
        if (profile) studentProfileId = profile._id;
      }
      if (!studentProfileId) {
        return res.status(403).json({
          success: false,
          message: "No student profile associated with this account",
        });
      }
    } else if (req.user.role === "PARENT") {
      const parentStudents = (req.user.parentStudentIds || []).map((id) => id.toString());
      if (req.query.studentId) {
        if (!parentStudents.includes(req.query.studentId.toString())) {
          return res.status(403).json({
            success: false,
            message: "Access denied: You are not authorized to view examinations for this student",
          });
        }
        studentProfileId = req.query.studentId;
      } else if (parentStudents.length > 0) {
        studentProfileId = parentStudents[0];
      } else {
        return res.status(400).json({
          success: false,
          message: "No student linked to this parent account",
        });
      }
    } else if (["ADMIN", "INSTITUTION"].includes(req.user.role)) {
      studentProfileId = req.query.studentId;
      if (!studentProfileId) {
        return res.status(400).json({
          success: false,
          message: "studentId query parameter is required for administrative lookup",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to access student available examinations",
      });
    }

    const availableExams = await examService.getAvailableExamsForStudent(studentProfileId);
    return res.status(200).json({
      success: true,
      data: availableExams,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve available examinations",
    });
  }
};

const handleRegisterStudentForExam = async (req, res) => {
  try {
    const regData = { ...req.body };
    if (req.user && req.user.role === "STUDENT") {
      let studentProfileId = req.user.studentId;
      if (!studentProfileId) {
        const profile = await StudentProfile.findOne({ userId: req.user.userId || req.user._id }).select("_id");
        if (profile) studentProfileId = profile._id;
      }
      if (!studentProfileId) {
        return res.status(403).json({
          success: false,
          message: "No student profile associated with this account",
        });
      }
      regData.studentId = studentProfileId;
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
    } else if (req.user.role === "PARENT") {
      const parentStudents = (req.user.parentStudentIds || []).map((id) => id.toString());
      if (req.query.studentId) {
        if (!parentStudents.includes(req.query.studentId.toString())) {
          return res.status(403).json({
            success: false,
            message: "Access denied: You are not authorized to view registrations for this student",
          });
        }
        filter.studentId = req.query.studentId;
      } else {
        filter.studentId = { $in: req.user.parentStudentIds || [] };
      }
    } else if (req.query.studentId && ["ADMIN", "INSTITUTION"].includes(req.user.role)) {
      filter.studentId = req.query.studentId;
    }
    if (req.query.examId) filter.examId = req.query.examId;

    const { page, limit, skip } = parsePagination(req.query);
    const { data, total } = await examService.getExamRegistrations(filter, { page, limit, skip });
    return res.status(200).json(formatPaginatedResponse({ data, total, page, limit }));
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve exam registrations" });
  }
};

const handleGetExamRegistrationById = async (req, res) => {
  try {
    const registration = await examService.getExamRegistrationById(req.params.id, req.user);
    return res.status(200).json({ success: true, data: registration });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to retrieve exam registration" });
  }
};

const handleCheckExamFeePayment = async (req, res) => {
  try {
    const result = await examService.checkExamFeePaymentStatus(req.params.id, req.user);
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to check exam fee payment status",
    });
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
    if (req.query.studentId) filter.studentId = req.query.studentId;

    const { page, limit, skip } = parsePagination(req.query);
    const resultObj = await examService.getExamResults(filter, { page, limit, skip }, req.user);
    if (resultObj && Array.isArray(resultObj.data)) {
      const { data, total, ...extra } = resultObj;
      return res.status(200).json(formatPaginatedResponse({ data, total, page, limit, ...extra }));
    }
    const data = Array.isArray(resultObj) ? resultObj : [];
    return res.status(200).json(formatPaginatedResponse({ data, total: data.length, page, limit }));
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to retrieve exam results" });
  }
};

const handleGetExamResultById = async (req, res) => {
  try {
    const result = await examService.getExamResultById(req.params.id, req.user);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      isPublished: error.isPublished !== undefined ? error.isPublished : undefined,
      resultPublicationDate: error.resultPublicationDate,
      message: error.message || "Failed to retrieve exam result",
    });
  }
};

module.exports = {
  handleCreateExam,
  handleGetExams,
  handleGetExamById,
  handleUpdateExam,
  handlePublishExam,
  handleCreateExamSchedule,
  handleGetExamSchedules,
  handleGetFacultyExamSchedules,
  handleGetExamScheduleById,
  handleUpdateExamSchedule,
  handleGetExamScheduleRoster,
  handleGetAvailableExamsForStudent,
  handleRegisterStudentForExam,
  handleGetExamRegistrations,
  handleGetExamRegistrationById,
  handleCheckExamFeePayment,
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
  handleGetExamResultById,
};
