const { createStudent } = require("../services/studentService");
const StudentProfile = require("../models/StudentProfile");

const registerStudent = async (req, res) => {
  try {
    const result = await createStudent(req.body);

    return res.status(201).json({
      success: true,
      message: "Student registered successfully",
      data: {
        registrationNumber: result.studentProfile.registrationNumber,
        studentId: result.studentProfile._id,
        userId: result.user._id,
        status: result.user.status,
        setupLink: result.setupLink,
        setupExpiresAt: result.setupExpiresAt,
      },
    });
  } catch (error) {
    console.error("Student registration error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Student registration failed",
    });
  }
};

const getStudentProfile = async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({
      userId: req.user.userId,
    })
      .populate("campusId", "name code")
      .populate("classId", "name code academicYear");

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student profile retrieved successfully",
      data: studentProfile,
    });
  } catch (error) {
    console.error("Get student profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve student profile",
    });
  }
};

module.exports = {
  registerStudent,
  getStudentProfile,
};