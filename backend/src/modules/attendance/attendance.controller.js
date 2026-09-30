const attendanceService = require("./attendance.service");

const handleGetStudentSummary = async (req, res) => {
  try {
    const studentId = req.query.studentId || req.user.studentId;
    if (!studentId) {
      return res.status(400).json({ success: false, message: "studentId is required" });
    }

    const data = await attendanceService.getStudentAttendanceOverview(studentId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve attendance overview" });
  }
};

const handleGetStudentMonthly = async (req, res) => {
  try {
    const studentId = req.query.studentId || req.user.studentId;
    if (!studentId) {
      return res.status(400).json({ success: false, message: "studentId is required" });
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
    const studentId = req.query.studentId || req.user.studentId;
    if (!studentId) {
      return res.status(400).json({ success: false, message: "studentId is required" });
    }

    const data = await attendanceService.getStudentAttendanceHistory(studentId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve attendance history" });
  }
};

const handleGetStudentSubjectAttendance = async (req, res) => {
  try {
    const studentId = req.query.studentId || req.user.studentId;
    if (!studentId) {
      return res.status(400).json({ success: false, message: "studentId is required" });
    }

    const filter = {
      academicYearId: req.query.academicYearId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const data = await attendanceService.getStudentSubjectAttendance(studentId, filter);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve subject attendance" });
  }
};

const handleGetStudentSessionAttendance = async (req, res) => {
  try {
    const studentId = req.query.studentId || req.user.studentId;
    if (!studentId) {
      return res.status(400).json({ success: false, message: "studentId is required" });
    }

    const filter = {
      academicYearId: req.query.academicYearId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const data = await attendanceService.getStudentSessionAttendance(studentId, filter);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve session attendance" });
  }
};

const handleGetClassAttendanceSummary = async (req, res) => {
  try {
    const classId = req.query.classId || req.params.classId;
    if (!classId) {
      return res.status(400).json({ success: false, message: "classId is required" });
    }

    const data = await attendanceService.getClassAttendanceSummary(classId, req.query, req.user);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to retrieve class attendance summary" });
  }
};

const handleGetFacultyAttendanceSummary = async (req, res) => {
  try {
    const facultyUserId = req.user.userId;
    const data = await attendanceService.getFacultyAttendanceSummary(facultyUserId, req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to retrieve faculty attendance summary" });
  }
};

const handleCreateCorrectionRequest = async (req, res) => {
  try {
    const result = await attendanceService.createCorrectionRequest(req.body, req.user);
    return res.status(201).json({ success: true, message: "Correction request submitted", data: result });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to create correction request" });
  }
};

const handleApproveCorrectionRequest = async (req, res) => {
  try {
    const { adminRemarks } = req.body;
    const result = await attendanceService.reviewCorrectionRequest(
      req.params.id,
      "APPROVED",
      req.user.userId,
      adminRemarks
    );
    return res.status(200).json({
      success: true,
      message: "Correction request approved and attendance record updated",
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to approve correction request" });
  }
};

const handleRejectCorrectionRequest = async (req, res) => {
  try {
    const { adminRemarks } = req.body;
    const result = await attendanceService.reviewCorrectionRequest(
      req.params.id,
      "REJECTED",
      req.user.userId,
      adminRemarks
    );
    return res.status(200).json({
      success: true,
      message: "Correction request rejected",
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to reject correction request" });
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
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to review correction request" });
  }
};

const handleMarkClassAttendance = async (req, res) => {
  try {
    const result = await attendanceService.markClassAttendance(req.body, req.user);
    return res.status(200).json({
      success: true,
      message: "Attendance marked successfully",
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to mark class attendance",
    });
  }
};

const handleGetClassAttendanceRecords = async (req, res) => {
  try {
    const { classId, subjectId, date, period } = req.query;
    if (!classId || !date) {
      return res.status(400).json({
        success: false,
        message: "classId and date query parameters are required",
      });
    }

    const records = await attendanceService.getClassAttendanceRecords(
      classId,
      subjectId,
      date,
      period,
      req.user
    );
    return res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve class attendance records",
    });
  }
};

module.exports = {
  handleGetStudentSummary,
  handleGetStudentMonthly,
  handleGetStudentHistory,
  handleGetStudentSubjectAttendance,
  handleGetStudentSessionAttendance,
  handleGetClassAttendanceSummary,
  handleGetFacultyAttendanceSummary,
  handleCreateCorrectionRequest,
  handleApproveCorrectionRequest,
  handleRejectCorrectionRequest,
  handleReviewCorrectionRequest,
  handleMarkClassAttendance,
  handleGetClassAttendanceRecords,
};

