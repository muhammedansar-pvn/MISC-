const examService = require("../services/examService");

const handleRegisterStudentForExam = async (req, res) => {
  try {
    const regData = { ...req.body };
    if (req.user.role === "INSTITUTION") {
      regData.institutionId = req.user.institutionId;
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
    if (req.user.role === "INSTITUTION") {
      filter.institutionId = req.user.institutionId;
    } else if (req.user.role === "STUDENT") {
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

module.exports = {
  handleRegisterStudentForExam,
  handleGetExamRegistrations,
  handleUpdateExamRegistrationStatus,
};
