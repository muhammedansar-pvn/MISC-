const {
  createFaculty,
  getFacultyMembers,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
  getFacultyDashboardStats,
  getFacultyMyTimetable,
  getFacultyMyStudents,
  getFacultyStudent360,
  createFacultyRemark,
  getFacultyRemarks,
} = require("./faculty.service");

const handleCreateFaculty = async (req, res) => {
  try {
    const faculty = await createFaculty(req.body);
    return res.status(201).json({ success: true, message: "Faculty profile created successfully", data: faculty });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to create faculty profile" });
  }
};

const { parsePagination, formatPaginatedResponse } = require("../../shared/utils/pagination");

const handleGetFacultyMembers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.department) filter.department = req.query.department;
    if (req.query.status) filter.status = req.query.status.toUpperCase();
    const search = req.query.search || "";

    const { page, limit, skip } = parsePagination(req.query);
    const { data, total } = await getFacultyMembers(filter, search, { page, limit, skip });
    return res.status(200).json(formatPaginatedResponse({ data, total, page, limit }));
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve faculty members" });
  }
};

const handleGetFacultyById = async (req, res) => {
  try {
    let targetId = req.params.id;
    if (targetId === "profile" || targetId === "me" || !targetId) {
      targetId = req.user?.facultyId || req.user?.userId || req.user?.id;
    }

    const member = await getFacultyById(targetId);
    if (!member) {
      return res.status(200).json({
        success: true,
        isSetupPending: true,
        data: null,
        message: "Faculty profile not yet set up",
      });
    }
    return res.status(200).json({ success: true, isSetupPending: false, data: member });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve faculty member" });
  }
};

const handleUpdateFaculty = async (req, res) => {
  try {
    const member = await updateFaculty(req.params.id, req.body);
    if (!member) return res.status(404).json({ success: false, message: "Faculty member not found" });
    return res.status(200).json({ success: true, message: "Faculty updated successfully", data: member });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to update faculty profile" });
  }
};

const handleDeleteFaculty = async (req, res) => {
  try {
    const hardDelete = req.query.permanent === "true";
    const result = await deleteFaculty(req.params.id, hardDelete);
    if (!result) return res.status(404).json({ success: false, message: "Faculty member not found" });
    return res.status(200).json({
      success: true,
      message: hardDelete ? "Faculty profile permanently deleted" : "Faculty profile deactivated successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete faculty member" });
  }
};

const handleGetFacultyDashboard = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const stats = await getFacultyDashboardStats(userId);
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("Get Faculty Dashboard Error:", error);
    return res.status(500).json({ success: false, message: "Failed to retrieve faculty dashboard statistics" });
  }
};

const handleGetFacultyMyTimetable = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const timetable = await getFacultyMyTimetable(userId);
    return res.status(200).json({ success: true, data: timetable });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Failed to retrieve timetable" });
  }
};

const handleGetFacultyMyStudents = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const classId = req.query.classId || null;
    const students = await getFacultyMyStudents(userId, classId);
    return res.status(200).json({ success: true, data: students });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Failed to retrieve students" });
  }
};

const handleGetFacultyStudent360 = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const studentId = req.params.id;
    const result = await getFacultyStudent360(userId, studentId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Failed to retrieve student profile" });
  }
};

const handleCreateFacultyRemark = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const studentId = req.params.id;
    const remark = await createFacultyRemark(userId, studentId, req.body);
    return res.status(201).json({ success: true, message: "Remark added successfully", data: remark });
  } catch (error) {
    return res.status(error.statusCode || 400).json({ success: false, message: error.message || "Failed to add remark" });
  }
};

const handleGetFacultyRemarks = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const studentId = req.params.id;
    const remarks = await getFacultyRemarks(userId, studentId);
    return res.status(200).json({ success: true, data: remarks });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Failed to retrieve remarks" });
  }
};

module.exports = {
  handleCreateFaculty,
  handleGetFacultyMembers,
  handleGetFacultyById,
  handleUpdateFaculty,
  handleDeleteFaculty,
  handleGetFacultyDashboard,
  handleGetFacultyMyTimetable,
  handleGetFacultyMyStudents,
  handleGetFacultyStudent360,
  handleCreateFacultyRemark,
  handleGetFacultyRemarks,
};
