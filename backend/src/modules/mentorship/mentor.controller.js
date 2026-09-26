const mentorService = require("./mentor.service");

const handleAssignMentor = async (req, res, next) => {
  try {
    const { mentorId, studentId, academicYearId, monitoringCategory, notes } = req.body;
    if (!mentorId || !studentId || !academicYearId) {
      return res.status(400).json({
        success: false,
        message: "mentorId, studentId, and academicYearId are required",
      });
    }

    const assignment = await mentorService.assignMentor({
      mentorId,
      studentId,
      academicYearId,
      monitoringCategory,
      notes,
      assignedBy: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Mentor assigned successfully",
      data: assignment,
    });
  } catch (error) {
    return next(error);
  }
};

const handleGetMyMentees = async (req, res, next) => {
  try {
    const mentees = await mentorService.getMyMentees(req.user.userId);
    return res.status(200).json({
      success: true,
      data: mentees,
    });
  } catch (error) {
    return next(error);
  }
};

const handleUpdateMenteeMonitoring = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { monitoringCategory, notes } = req.body;

    const assignment = await mentorService.updateMenteeMonitoring(id, req.user, {
      monitoringCategory,
      notes,
    });

    return res.status(200).json({
      success: true,
      message: "Mentee monitoring updated successfully",
      data: assignment,
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

const handleGetMyMentor = async (req, res, next) => {
  try {
    if (!req.user.studentId) {
      return res.status(400).json({
        success: false,
        message: "No student profile associated with your account",
      });
    }

    const assignment = await mentorService.getStudentMentor(req.user.studentId, req.user);
    return res.status(200).json({
      success: true,
      data: assignment,
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

const handleGetStudentMentor = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const assignment = await mentorService.getStudentMentor(studentId, req.user);
    return res.status(200).json({
      success: true,
      data: assignment,
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
  handleAssignMentor,
  handleGetMyMentees,
  handleUpdateMenteeMonitoring,
  handleGetMyMentor,
  handleGetStudentMentor,
};
