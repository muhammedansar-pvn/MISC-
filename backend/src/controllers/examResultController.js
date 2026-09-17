const examService = require("../services/examService");

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
    } else if (req.user.role === "INSTITUTION") {
      filter.institutionId = req.user.institutionId;
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
  handleGenerateExamResults,
  handleGetExamResults,
};
