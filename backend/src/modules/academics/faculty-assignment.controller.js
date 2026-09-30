const facultyAssignmentService = require("./faculty-assignment.service");
const { parsePagination, formatPaginatedResponse } = require("../../shared/utils/pagination");

const handleCreateAssignment = async (req, res) => {
  try {
    const assignedBy = req.user?.userId || req.user?._id;
    const assignment = await facultyAssignmentService.createAssignment({
      ...req.body,
      assignedBy,
    });
    return res.status(201).json({
      success: true,
      message: "Faculty assigned successfully",
      data: assignment,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to create faculty assignment",
    });
  }
};

const handleGetAssignments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.facultyId) filter.facultyId = req.query.facultyId;
    if (req.query.academicYearId) filter.academicYearId = req.query.academicYearId;
    if (req.query.classId) filter.classId = req.query.classId;
    if (req.query.subjectId) filter.subjectId = req.query.subjectId;
    if (req.query.status) filter.status = req.query.status;

    const { page, limit, skip } = parsePagination(req.query);
    const { data, total } = await facultyAssignmentService.getAssignments(filter, {
      page,
      limit,
      skip,
    });

    return res.status(200).json(formatPaginatedResponse({ data, total, page, limit }));
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve faculty assignments",
    });
  }
};

const handleGetAssignmentById = async (req, res) => {
  try {
    const assignment = await facultyAssignmentService.getAssignmentById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Faculty assignment not found" });
    }
    return res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve faculty assignment",
    });
  }
};

const handleDeleteAssignment = async (req, res) => {
  try {
    await facultyAssignmentService.deleteAssignment(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Faculty assignment removed successfully",
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to delete faculty assignment",
    });
  }
};

const handleGetFacultyMyAssignments = async (req, res) => {
  try {
    const facultyUserId = req.user?.userId || req.user?._id;
    const academicYearId = req.query.academicYearId || null;
    const assignments = await facultyAssignmentService.getFacultyMyAssignments(
      facultyUserId,
      academicYearId
    );
    return res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve assignments",
    });
  }
};

const handleGetFacultyMyClasses = async (req, res) => {
  try {
    const facultyUserId = req.user?.userId || req.user?._id;
    const academicYearId = req.query.academicYearId || null;
    const classes = await facultyAssignmentService.getFacultyMyClasses(
      facultyUserId,
      academicYearId
    );
    return res.status(200).json({
      success: true,
      count: classes.length,
      data: classes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve faculty classes",
    });
  }
};

module.exports = {
  handleCreateAssignment,
  handleGetAssignments,
  handleGetAssignmentById,
  handleDeleteAssignment,
  handleGetFacultyMyAssignments,
  handleGetFacultyMyClasses,
};
