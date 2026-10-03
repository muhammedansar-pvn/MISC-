const leaveService = require("./leave.service");
const { parsePagination, formatPaginatedResponse } = require("../../shared/utils/pagination");

const handleApplyLeave = async (req, res) => {
  try {
    const result = await leaveService.applyLeave(req.user.userId, req.body);
    return res.status(201).json({
      success: true,
      message: "Leave application submitted successfully",
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to submit leave application",
    });
  }
};

const handleApproveLeave = async (req, res) => {
  try {
    const { reviewRemarks } = req.body;
    const result = await leaveService.approveLeave(
      req.params.id,
      req.user.userId,
      reviewRemarks
    );
    return res.status(200).json({
      success: true,
      message: "Leave request approved successfully",
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to approve leave request",
    });
  }
};

const handleRejectLeave = async (req, res) => {
  try {
    const { reviewRemarks } = req.body;
    const result = await leaveService.rejectLeave(
      req.params.id,
      req.user.userId,
      reviewRemarks
    );
    return res.status(200).json({
      success: true,
      message: "Leave request rejected",
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to reject leave request",
    });
  }
};

const handleGetLeaves = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === "PARENT") {
      filter.appliedBy = req.user.userId;
    } else if (req.user.role === "STUDENT") {
      filter.studentId = req.user.studentId;
    } else if (req.user.role === "FACULTY") {
      const { getFacultyAuthorizedClasses } = require("../academics/academic-auth.service");
      const StudentProfile = require("../students/student.model");
      const MentorAssignment = require("../mentorship/mentor-assignment.model");
      const FacultyProfile = require("../faculty/faculty.model");

      const faculty = await FacultyProfile.findOne({
        $or: [{ userId: req.user.userId || req.user.id }, { _id: req.user.facultyId }],
      }).lean();

      if (!faculty) {
        return res.status(200).json(formatPaginatedResponse({ data: [], total: 0 }));
      }

      const authorizedClasses = await getFacultyAuthorizedClasses(faculty._id);
      const classIds = authorizedClasses.map((c) => c._id);

      const [classStudents, mentees] = await Promise.all([
        StudentProfile.find({ classId: { $in: classIds }, isDeleted: { $ne: true } }).select("_id").lean(),
        MentorAssignment.find({ mentorId: faculty._id }).select("studentId").lean(),
      ]);

      const allowedStudentIds = [
        ...classStudents.map((s) => s._id.toString()),
        ...mentees.map((m) => m.studentId?.toString()).filter(Boolean),
      ];

      if (req.query.studentId) {
        if (!allowedStudentIds.includes(req.query.studentId.toString())) {
          return res.status(403).json({
            success: false,
            message: "Access denied: You are not authorized to view leaves for this student",
          });
        }
        filter.studentId = req.query.studentId;
      } else {
        filter.studentId = { $in: allowedStudentIds };
      }
    } else if (req.query.studentId) {
      filter.studentId = req.query.studentId;
    }

    if (req.query.status) {
      filter.status = req.query.status.toUpperCase();
    }

    const { page, limit, skip } = parsePagination(req.query);
    const { data, total } = await leaveService.getLeaves(filter, { page, limit, skip });
    return res.status(200).json(formatPaginatedResponse({ data, total, page, limit }));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve leaves" });
  }
};

module.exports = {
  handleApplyLeave,
  handleApproveLeave,
  handleRejectLeave,
  handleGetLeaves,
};
