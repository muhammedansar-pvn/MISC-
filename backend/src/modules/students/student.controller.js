const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  updateStudentStatus,
  registerStudentWithAccount,
} = require("./student.service");
const StudentProfile = require("./student.model");

const handleRegisterStudentWithAccount = async (req, res) => {
  try {
    const result = await registerStudentWithAccount(req.body, req.user);
    return res.status(201).json({
      success: true,
      message: "Student registered successfully. Verification email dispatched.",
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || (error.code === 11000 ? 409 : 400);
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to register student",
    });
  }
};

const registerStudent = async (req, res) => {
  try {
    const studentProfile = await createStudent(req.body);
    return res.status(201).json({
      success: true,
      message: "Student profile created successfully",
      data: studentProfile,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Student profile creation failed",
    });
  }
};

const getStudentProfile = async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({
      userId: req.user.userId,
    })
      .populate("userId", "name email pendingEmail username role status mobile emailVerified")
      .populate("institutionId")
      .populate("classId");

    if (!studentProfile) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    return res.status(200).json({ success: true, data: studentProfile });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve student profile" });
  }
};

const handleGetStudents = async (req, res) => {
  try {
    const filter = {};
    if (req.query.classId) {
      filter.classId = req.query.classId;
    }
    if (req.query.admissionYear) {
      filter.admissionYear = req.query.admissionYear;
    }
    if (req.query.status) {
      filter.status = req.query.status.toUpperCase();
    }
    const search = req.query.search || "";

    const students = await getStudents(filter, search);
    return res.status(200).json({ success: true, count: students.length, data: students });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve students" });
  }
};

const handleGetStudentById = async (req, res) => {
  try {
    const student = await getStudentById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    return res.status(200).json({ success: true, data: student });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve student" });
  }
};

const handleUpdateStudent = async (req, res) => {
  try {
    const student = await updateStudent(req.params.id, req.body);
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    const requiresOtp = !!student.requiresEmailVerification;
    return res.status(200).json({
      success: true,
      message: requiresOtp
        ? "Student profile updated. Verification code sent to the new email address."
        : "Student updated successfully",
      data: student,
      requiresEmailVerification: requiresOtp,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to update student" });
  }
};

const handleUpdateMyProfile = async (req, res) => {
  try {
    const targetUserId = req.user.userId || req.user._id || req.user.id;
    const studentProfile = await StudentProfile.findOne({ userId: targetUserId });
    if (!studentProfile) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    const result = await updateStudent(studentProfile._id, req.body);
    const requiresOtp = !!result.requiresEmailVerification;
    return res.status(200).json({
      success: true,
      message: requiresOtp
        ? "Email change requested. Verification code sent to your new email address."
        : "Profile updated successfully",
      data: result,
      requiresEmailVerification: requiresOtp,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to update profile" });
  }
};

const handleUpdateStudentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }
    const result = await updateStudentStatus(req.params.id, status, req.user?.userId);
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update student status",
    });
  }
};

const handleDeleteStudent = async (req, res) => {
  try {
    const hardDelete = req.query.permanent === "true";
    const result = await deleteStudent(req.params.id, hardDelete, req.user?.userId);
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to delete/deactivate student",
    });
  }
};

module.exports = {
  registerStudent,
  handleRegisterStudentWithAccount,
  getStudentProfile,
  handleGetStudents,
  handleGetStudentById,
  handleUpdateStudent,
  handleUpdateStudentStatus,
  handleUpdateMyProfile,
  handleDeleteStudent,
};

