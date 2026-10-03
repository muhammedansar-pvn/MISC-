const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  updateStudentStatus,
  registerStudentWithAccount,
  getStudentTeachers,
  ensureStudentProfileForUser,
} = require("./student.service");
const StudentProfile = require("./student.model");
const attendanceService = require("../attendance/attendance.service");
const { parsePagination, formatPaginatedResponse } = require("../../shared/utils/pagination");

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
    let studentProfile = await StudentProfile.findOne({
      userId: req.user.userId,
    })
      .populate("userId", "name email pendingEmail username role status mobile emailVerified")
      .populate("institutionId")
      .populate("classId");

    // Fallback path: ensure profile if newly verified student without profile
    if (!studentProfile && req.user.role === "STUDENT") {
      await ensureStudentProfileForUser(req.user.userId);
      studentProfile = await StudentProfile.findOne({
        userId: req.user.userId,
      })
        .populate("userId", "name email pendingEmail username role status mobile emailVerified")
        .populate("institutionId")
        .populate("classId");
    }

    if (!studentProfile) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    // Attach today's attendance status to profile response (covers both initial and fallback paths)
    const todayAttendance = await attendanceService.getStudentDailyAttendance(studentProfile._id);

    const profileData = studentProfile.toObject ? studentProfile.toObject() : { ...studentProfile };
    profileData.todayAttendance = todayAttendance;

    return res.status(200).json({ success: true, data: profileData });
  } catch (error) {
    console.error("Get Student Profile Error:", error);
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

    const { page, limit, skip } = parsePagination(req.query);

    const { data, total } = await getStudents(filter, search, { skip, limit });

    return res.status(200).json(formatPaginatedResponse({ data, total, page, limit }));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve students" });
  }
};

const handleGetStudentById = async (req, res) => {
  try {
    const student = await getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Role-based authorization enforcement
    if (req.user.role === "FACULTY") {
      const { isFacultyAssigned } = require("../academics/academic-auth.service");
      const isAssigned = student.classId
        ? await isFacultyAssigned({
            facultyId: req.user.facultyId || req.user.userId,
            classId: student.classId._id || student.classId,
          })
        : false;
      const isMentor =
        student.mentorId &&
        req.user.facultyId &&
        student.mentorId.toString() === req.user.facultyId.toString();

      if (!isAssigned && !isMentor) {
        return res.status(403).json({
          success: false,
          message: "Access denied: You are not authorized to view this student",
        });
      }
    } else if (req.user.role === "PARENT") {
      const parentStudentIds = (req.user.parentStudentIds || []).map((id) => id.toString());
      if (!parentStudentIds.includes(student._id.toString())) {
        return res.status(403).json({
          success: false,
          message: "Access denied: You are not authorized to view this student",
        });
      }
    } else if (req.user.role === "STUDENT") {
      if (req.user.studentId && req.user.studentId.toString() !== student._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied: Students cannot view other students' profiles",
        });
      }
    }

    return res.status(200).json({ success: true, data: student });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve student" });
  }
};

const handleUpdateStudent = async (req, res) => {
  try {
    const student = await updateStudent(req.params.id, req.body);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    return res.status(200).json({ success: true, message: "Student updated successfully", data: student });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to update student" });
  }
};

const handleUpdateStudentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    const student = await updateStudentStatus(req.params.id, status);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Student status updated to ${status}`,
      data: student,
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to update student status",
    });
  }
};

const handleUpdateMyProfile = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    const allowedUpdates = [
      "emergencyContact",
      "address",
      "phone",
      "bloodGroup",
      "dateOfBirth",
      "gender",
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const updated = await StudentProfile.findByIdAndUpdate(
      student._id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate("userId", "name email username role status")
      .populate("institutionId")
      .populate("classId");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};

const handleDeleteStudent = async (req, res) => {
  try {
    const student = await deleteStudent(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    return res.status(200).json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to delete student" });
  }
};

const handleGetMyTeachers = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    if (!student.classId) {
      return res.status(200).json({
        success: true,
        message: "No class assigned yet",
        data: [],
      });
    }

    const teachers = await getStudentTeachers(student.classId);
    return res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve assigned teachers",
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
  handleGetMyTeachers,
};
