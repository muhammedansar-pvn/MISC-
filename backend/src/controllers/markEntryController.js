const examService = require("../services/examService");

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

module.exports = {
  handleSubmitMarkEntry,
  handleGetMarkEntries,
  handleVerifyMarkEntries,
};
