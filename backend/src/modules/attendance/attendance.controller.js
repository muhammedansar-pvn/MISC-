const attendanceService = require("./attendance.service");

const handleGetStudentSummary = async (req, res) => {
  try {
    const studentId = req.user.studentId;
    if (!studentId) {
      return res.status(403).json({ success: false, message: "No student profile linked to user" });
    }

    const data = await attendanceService.getStudentAttendanceOverview(studentId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve attendance overview" });
  }
};

const handleGetStudentMonthly = async (req, res) => {
  try {
    const studentId = req.user.studentId;
    if (!studentId) {
      return res.status(403).json({ success: false, message: "No student profile linked to user" });
    }

    const filter = {
      month: req.query.month,
      academicYearId: req.query.academicYearId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const data = await attendanceService.getStudentMonthlyAttendance(studentId, filter);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve monthly attendance" });
  }
};

const handleGetStudentHistory = async (req, res) => {
  try {
    const studentId = req.user.studentId;
    if (!studentId) {
      return res.status(403).json({ success: false, message: "No student profile linked to user" });
    }

    const data = await attendanceService.getStudentAttendanceHistory(studentId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve attendance history" });
  }
};

const handleCreateCorrectionRequest = async (req, res) => {
  try {
    const result = await attendanceService.createCorrectionRequest(req.body, req.user.userId);
    return res.status(201).json({ success: true, message: "Correction request submitted", data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to create correction request" });
  }
};

const handleReviewCorrectionRequest = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    const result = await attendanceService.reviewCorrectionRequest(
      req.params.id,
      status,
      req.user.userId,
      adminRemarks
    );
    return res.status(200).json({ success: true, message: `Correction request ${status.toLowerCase()}`, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to review correction request" });
  }
};

module.exports = {
  handleGetStudentSummary,
  handleGetStudentMonthly,
  handleGetStudentHistory,
  handleCreateCorrectionRequest,
  handleReviewCorrectionRequest,
};
