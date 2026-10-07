const analyticsService = require("./analytics.service");

/**
 * Admin Analytics Overview
 */
const handleGetAdminAnalytics = async (req, res) => {
  try {
    const filters = {
      academicYearId: req.query.academicYearId,
      classId: req.query.classId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const data = await analyticsService.getAdminAnalytics(filters);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Admin Analytics Error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to retrieve admin analytics data",
    });
  }
};

/**
 * Faculty Analytics (strictly scoped to assigned classes & subjects)
 */
const handleGetFacultyAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const filters = {
      academicYearId: req.query.academicYearId,
      classId: req.query.classId,
    };

    const data = await analyticsService.getFacultyAnalytics(userId, filters);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Faculty Analytics Error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to retrieve faculty analytics data",
    });
  }
};

/**
 * Student Personal Academic & Attendance Analytics
 */
const handleGetStudentAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const data = await analyticsService.getStudentAnalytics(userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Student Analytics Error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to retrieve student analytics data",
    });
  }
};

/**
 * Parent Analytics with Child Selector support
 */
const handleGetParentAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const requestedStudentId = req.query.studentId;

    const data = await analyticsService.getParentAnalytics(userId, requestedStudentId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Parent Analytics Error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to retrieve parent analytics data",
    });
  }
};

/**
 * Exportable Reports endpoint
 */
const handleGetExportReport = async (req, res) => {
  try {
    const reportType = req.query.type || "STUDENT_ATTENDANCE";
    const filters = {
      classId: req.query.classId,
      academicYearId: req.query.academicYearId,
    };

    const report = await analyticsService.getExportReport(reportType, filters, req.user);

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Export Report Error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to generate report",
    });
  }
};

module.exports = {
  handleGetAdminAnalytics,
  handleGetFacultyAnalytics,
  handleGetStudentAnalytics,
  handleGetParentAnalytics,
  handleGetExportReport,
};
