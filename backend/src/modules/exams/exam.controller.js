const examService = require("./exam.service");

// Exams
const handleCreateExam = async (req, res) => {
  try {
    const exam = await examService.createExam(req.body);
    return res.status(201).json({ success: true, message: "Exam created successfully", data: exam });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to create exam" });
  }
};

const handleGetExams = async (req, res) => {
  try {
    const exams = await examService.getExams();
    return res.status(200).json({ success: true, data: exams });
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
    return res.status(400).json({ success: false, message: error.message || "Failed to update exam" });
  }
};

// Exam Schedules
const handleCreateExamSchedule = async (req, res) => {
  try {
    const schedule = await examService.createExamSchedule(req.body);
    return res.status(201).json({ success: true, message: "Exam schedule created successfully", data: schedule });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to create exam schedule" });
  }
};

const handleGetExamSchedules = async (req, res) => {
  try {
    const filter = {};
    if (req.query.examId) filter.examId = req.query.examId;
    if (req.query.classId) filter.classId = req.query.classId;

    const schedules = await examService.getExamSchedules(filter);
    return res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve exam schedules" });
  }
};

const handleUpdateExamSchedule = async (req, res) => {
  try {
    const schedule = await examService.updateExamSchedule(req.params.id, req.body);
    if (!schedule) return res.status(404).json({ success: false, message: "Exam schedule not found" });
    return res.status(200).json({ success: true, message: "Exam schedule updated successfully", data: schedule });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to update exam schedule" });
  }
};

// Exam Registrations
const handleRegisterStudentForExam = async (req, res) => {
  try {
    const regData = { ...req.body };
    if (req.user && req.user.role === "STUDENT") {
      regData.studentId = req.user.studentId || req.body.studentId;
    }
    const registration = await examService.registerStudentForExam(regData);
    return res.status(201).json({ success: true, message: "Registered student for exam successfully", data: registration });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Exam registration failed" });
  }
};

const handleGetExamRegistrations = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === "STUDENT") {
      filter.studentId = req.user.studentId;
    }
    if (req.query.examId) filter.examId = req.query.examId;

    const registrations = await examService.getExamRegistrations(filter);
    return res.status(200).json({ success: true, data: registrations });
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
    return res.status(400).json({ success: false, message: error.message || "Failed to update registration status" });
  }
};

// Mark Entries
const handleSubmitMarkEntry = async (req, res) => {
  try {
    const markData = { ...req.body };
    if (req.user.role === "FACULTY") {
      markData.evaluatorId = req.user.facultyId;
    }
    const record = await examService.submitOrUpdateMarkEntry(markData);
    return res.status(200).json({ success: true, message: "Mark entry recorded successfully", data: record });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to record mark entry" });
  }
};

const handleGetMarkEntries = async (req, res) => {
  try {
    const filter = {};
    if (req.query.examId) filter.examId = req.query.examId;
    if (req.query.examScheduleId) filter.examScheduleId = req.query.examScheduleId;
    if (req.query.studentId) filter.studentId = req.query.studentId;

    const records = await examService.getMarkEntries(filter);
    return res.status(200).json({ success: true, data: records });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve mark entries" });
  }
};

const handleVerifyMarkEntries = async (req, res) => {
  try {
    const result = await examService.verifyMarkEntries(req.params.examScheduleId);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to verify mark entries" });
  }
};

// Exam Results
const handleGenerateExamResults = async (req, res) => {
  try {
    const { examId, classId } = req.body;
    if (!examId || !classId) {
      return res.status(400).json({ success: false, message: "examId and classId are required" });
    }
    const results = await examService.aggregateAndGenerateResults(examId, classId);
    return res.status(200).json({
      success: true,
      message: `Results generated successfully for ${results.length} students`,
      data: results,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to generate exam results" });
  }
};

const handleGetExamResults = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === "STUDENT") {
      filter.studentId = req.user.studentId;
    }

    if (req.query.examId) filter.examId = req.query.examId;
    if (req.query.classId) filter.classId = req.query.classId;

    const results = await examService.getExamResults(filter);
    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve exam results" });
  }
};

module.exports = {
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
};
