const examService = require("../services/examService");

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

module.exports = {
  handleCreateExam,
  handleGetExams,
  handleGetExamById,
  handleUpdateExam,
};
