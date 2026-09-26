const developmentService = require("./development.service");

const handleRecordScore = async (req, res, next) => {
  try {
    const { studentId, academicYearId, term } = req.body;
    if (!studentId || !academicYearId || !term) {
      return res.status(400).json({
        success: false,
        message: "studentId, academicYearId, and term are required",
      });
    }

    const scoreDoc = await developmentService.recordDevelopmentScore(req.body, req.user);
    return res.status(201).json({
      success: true,
      message: "Student development score recorded successfully",
      data: scoreDoc,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return next(error);
  }
};

const handleGetMyScores = async (req, res, next) => {
  try {
    if (!req.user.studentId) {
      return res.status(400).json({
        success: false,
        message: "No student profile associated with your account",
      });
    }

    const scores = await developmentService.getMyDevelopmentScores(req.user.studentId);
    return res.status(200).json({
      success: true,
      data: scores,
    });
  } catch (error) {
    return next(error);
  }
};

const handleGetStudentScores = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const scores = await developmentService.getStudentDevelopmentScores(studentId, req.user);
    return res.status(200).json({
      success: true,
      data: scores,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return next(error);
  }
};

module.exports = {
  handleRecordScore,
  handleGetMyScores,
  handleGetStudentScores,
};
