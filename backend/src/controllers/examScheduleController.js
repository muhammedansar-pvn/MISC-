const examService = require("../services/examService");

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

module.exports = {
  handleCreateExamSchedule,
  handleGetExamSchedules,
  handleUpdateExamSchedule,
};
