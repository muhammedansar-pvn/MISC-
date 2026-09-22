const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
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
    if (req.user.role === "INSTITUTION") {
      filter.institutionId = req.user.institutionId;
    }
    const students = await getStudents(filter);
    return res.status(200).json({ success: true, data: students });
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
    return res.status(200).json({ success: true, message: "Student updated successfully", data: student });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to update student" });
  }
};

module.exports = {
  registerStudent,
  handleRegisterStudentWithAccount,
  getStudentProfile,
  handleGetStudents,
  handleGetStudentById,
  handleUpdateStudent,
};

