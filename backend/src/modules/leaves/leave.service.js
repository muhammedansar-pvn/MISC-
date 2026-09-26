const Leave = require("./leave.model");
const ParentProfile = require("../parents/parent.model");
const StudentProfile = require("../students/student.model");
const FacultyProfile = require("../faculty/faculty.model");

/**
 * Parent applies for leave for their linked child
 */
const applyLeave = async (parentUserId, { studentId, dateRange, reason }) => {
  const parent = await ParentProfile.findOne({ userId: parentUserId }).lean();
  if (!parent) {
    const error = new Error("Parent profile not found for authenticated account");
    error.statusCode = 403;
    throw error;
  }

  // Enforce server-side parent-child linkage verification
  const isChildLinked = (parent.studentIds || []).some(
    (id) => id.toString() === studentId.toString()
  );

  if (!isChildLinked) {
    const error = new Error("Unauthorized: student is not linked to this parent");
    error.statusCode = 403;
    throw error;
  }

  const start = new Date(dateRange.startDate);
  const end = new Date(dateRange.endDate);

  if (start > end) {
    const error = new Error("Start date cannot be after end date");
    error.statusCode = 400;
    throw error;
  }

  const leave = await Leave.create({
    studentId,
    appliedBy: parentUserId,
    dateRange: {
      startDate: start,
      endDate: end,
    },
    reason: reason.trim(),
    status: "PENDING",
  });

  return Leave.findById(leave._id)
    .populate("studentId", "nameEnglish registrationNumber classId")
    .populate("appliedBy", "name email mobile")
    .lean();
};

/**
 * Asatitha approves leave for a student in their assigned class
 */
const approveLeave = async (leaveId, facultyUserId, reviewRemarks) => {
  const leave = await Leave.findById(leaveId);
  if (!leave) {
    const error = new Error("Leave request not found");
    error.statusCode = 404;
    throw error;
  }

  const student = await StudentProfile.findById(leave.studentId).lean();
  if (!student) {
    const error = new Error("Student profile not found for this leave request");
    error.statusCode = 404;
    throw error;
  }

  const faculty = await FacultyProfile.findOne({ userId: facultyUserId }).lean();
  if (!faculty) {
    const error = new Error("Faculty profile not found for authenticated account");
    error.statusCode = 403;
    throw error;
  }

  // Enforce class-assignment verification
  const assignedClassIds = (faculty.assignedClasses || []).map((id) => id.toString());
  if (!student.classId || !assignedClassIds.includes(student.classId.toString())) {
    const error = new Error("Unauthorized: student does not belong to your assigned classes");
    error.statusCode = 403;
    throw error;
  }

  leave.status = "APPROVED";
  leave.approvedBy = faculty._id;
  leave.reviewedAt = new Date();
  if (reviewRemarks) leave.reviewRemarks = reviewRemarks.trim();

  await leave.save();

  return Leave.findById(leave._id)
    .populate("studentId", "nameEnglish registrationNumber classId")
    .populate("appliedBy", "name email mobile")
    .populate("approvedBy", "nameEnglish facultyId")
    .lean();
};

/**
 * Asatitha rejects leave for a student in their assigned class
 */
const rejectLeave = async (leaveId, facultyUserId, reviewRemarks) => {
  const leave = await Leave.findById(leaveId);
  if (!leave) {
    const error = new Error("Leave request not found");
    error.statusCode = 404;
    throw error;
  }

  const student = await StudentProfile.findById(leave.studentId).lean();
  if (!student) {
    const error = new Error("Student profile not found for this leave request");
    error.statusCode = 404;
    throw error;
  }

  const faculty = await FacultyProfile.findOne({ userId: facultyUserId }).lean();
  if (!faculty) {
    const error = new Error("Faculty profile not found for authenticated account");
    error.statusCode = 403;
    throw error;
  }

  // Enforce class-assignment verification
  const assignedClassIds = (faculty.assignedClasses || []).map((id) => id.toString());
  if (!student.classId || !assignedClassIds.includes(student.classId.toString())) {
    const error = new Error("Unauthorized: student does not belong to your assigned classes");
    error.statusCode = 403;
    throw error;
  }

  leave.status = "REJECTED";
  leave.approvedBy = faculty._id;
  leave.reviewedAt = new Date();
  if (reviewRemarks) leave.reviewRemarks = reviewRemarks.trim();

  await leave.save();

  return Leave.findById(leave._id)
    .populate("studentId", "nameEnglish registrationNumber classId")
    .populate("appliedBy", "name email mobile")
    .populate("approvedBy", "nameEnglish facultyId")
    .lean();
};

/**
 * Retrieve leaves with optional filtering
 */
const getLeaves = async (filter = {}) => {
  return Leave.find(filter)
    .populate("studentId", "nameEnglish registrationNumber classId")
    .populate("appliedBy", "name email mobile")
    .populate("approvedBy", "nameEnglish facultyId")
    .sort({ createdAt: -1 })
    .lean();
};

module.exports = {
  applyLeave,
  approveLeave,
  rejectLeave,
  getLeaves,
};
