const Leave = require("./leave.model");
const ParentProfile = require("../parents/parent.model");
const StudentProfile = require("../students/student.model");
const FacultyProfile = require("../faculty/faculty.model");
const notificationService = require("../notifications/notification.service");

/**
 * Parent applies for leave on behalf of student
 */
const applyLeave = async (userOrCallerId, payload) => {
  // Support both legacy (parentUserId, body) and modern (req.user, body)
  const isUserObj = typeof userOrCallerId === "object" && userOrCallerId !== null;
  const userRole = isUserObj ? userOrCallerId.role : "PARENT";
  const userId = isUserObj ? (userOrCallerId.userId || userOrCallerId.id) : userOrCallerId;

  if (userRole === "STUDENT") {
    const error = new Error("Students are not permitted to submit leave requests. Leave must be applied by a parent.");
    error.statusCode = 403;
    throw error;
  }

  if (userRole !== "PARENT") {
    const error = new Error("Only parents can apply for leave on behalf of their children");
    error.statusCode = 403;
    throw error;
  }

  const { studentId: reqStudentId, dateRange, startDate, endDate, reason, leaveType } = payload;

  if (!reqStudentId) {
    const error = new Error("Student ID is required when applying as parent");
    error.statusCode = 400;
    throw error;
  }

  const parent = await ParentProfile.findOne({ userId, isDeleted: { $ne: true } }).lean();
  if (!parent) {
    const error = new Error("Parent profile not found for authenticated account");
    error.statusCode = 403;
    throw error;
  }

  // Server-side parent-child linkage verification
  const isChildLinked = (parent.studentIds || []).some(
    (id) => id.toString() === reqStudentId.toString()
  );

  if (!isChildLinked) {
    const error = new Error("Unauthorized: student is not linked to this parent");
    error.statusCode = 403;
    throw error;
  }

  const targetStudentId = reqStudentId;
  const applicantRole = "PARENT";

  // Parse and validate date range
  const startRaw = dateRange?.startDate || startDate;
  const endRaw = dateRange?.endDate || endDate;

  if (!startRaw || !endRaw) {
    const error = new Error("Start date and end date are required");
    error.statusCode = 400;
    throw error;
  }

  const start = new Date(startRaw);
  const end = new Date(endRaw);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    const error = new Error("Invalid start date or end date format");
    error.statusCode = 400;
    throw error;
  }

  const startOfDay = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const endOfDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate(), 23, 59, 59, 999));

  // No backdated leave: start date cannot be before today
  const now = new Date();
  const todayUtcStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const todayLocalStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const earliestToday = todayUtcStart < todayLocalStart ? todayUtcStart : todayLocalStart;

  if (startOfDay < earliestToday) {
    const error = new Error("Leave start date cannot be before today. Leave can only be requested from today onwards.");
    error.statusCode = 400;
    throw error;
  }

  if (startOfDay > endOfDay) {
    const error = new Error("Start date cannot be after end date");
    error.statusCode = 400;
    throw error;
  }

  // Check for overlapping pending or approved leave
  const existingOverlap = await Leave.findOne({
    studentId: targetStudentId,
    status: { $in: ["PENDING", "APPROVED"] },
    "dateRange.startDate": { $lte: endOfDay },
    "dateRange.endDate": { $gte: startOfDay },
  });

  if (existingOverlap) {
    const error = new Error(
      `An overlapping ${existingOverlap.status.toLowerCase()} leave request already exists for this period`
    );
    error.statusCode = 400;
    throw error;
  }

  const leave = await Leave.create({
    studentId: targetStudentId,
    appliedBy: userId,
    applicantRole,
    leaveType: leaveType || "CASUAL",
    dateRange: {
      startDate: startOfDay,
      endDate: endOfDay,
    },
    reason: reason.trim(),
    status: "PENDING",
  });

  const createdLeave = await Leave.findById(leave._id)
    .populate("studentId", "nameEnglish registrationNumber classId")
    .populate("appliedBy", "name email mobile")
    .lean();

  if (createdLeave && createdLeave.studentId) {
    notificationService.notifyLeaveSubmitted(createdLeave, createdLeave.studentId).catch((err) => {
      console.error("Non-fatal: failed to trigger notifyLeaveSubmitted:", err.message);
    });
  }

  return createdLeave;
};

/**
 * Faculty or Admin approves leave
 */
const approveLeave = async (leaveId, userOrFacultyId, reviewRemarks) => {
  const isUserObj = typeof userOrFacultyId === "object" && userOrFacultyId !== null;
  const userRole = isUserObj ? userOrFacultyId.role : null;
  const userId = isUserObj ? (userOrFacultyId.userId || userOrFacultyId.id) : userOrFacultyId;

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

  let approverFacultyId = null;

  if (userRole === "ADMIN") {
    // Admin override: check if admin also has a faculty profile
    const faculty = await FacultyProfile.findOne({ userId }).lean();
    approverFacultyId = faculty?._id || null;
  } else {
    // Faculty review
    const faculty = await FacultyProfile.findOne({
      $or: [{ userId }, { _id: userId }],
    }).lean();
    if (!faculty) {
      const error = new Error("Faculty profile not found for authenticated account");
      error.statusCode = 403;
      throw error;
    }

    const { isFacultyAssigned } = require("../academics/academic-auth.service");
    const isAssigned = await isFacultyAssigned({
      facultyId: faculty._id,
      classId: student.classId,
    });
    const assignedClassIds = (faculty.assignedClasses || []).map((id) => id.toString());
    const isLegacyAssigned = student.classId && assignedClassIds.includes(student.classId.toString());

    // Also check mentorship assignment
    const MentorAssignment = require("../mentorship/mentor-assignment.model");
    const isMentee = await MentorAssignment.exists({
      mentorId: faculty._id,
      studentId: student._id,
    });

    if (!isAssigned && !isLegacyAssigned && !isMentee) {
      const error = new Error("Unauthorized: student does not belong to your assigned classes or mentees");
      error.statusCode = 403;
      throw error;
    }

    approverFacultyId = faculty._id;
  }

  leave.status = "APPROVED";
  if (approverFacultyId) {
    leave.approvedBy = approverFacultyId;
  }
  leave.reviewedAt = new Date();
  if (reviewRemarks) leave.reviewRemarks = reviewRemarks.trim();

  await leave.save();

  // Leave -> Attendance linkage: For each date in dateRange, upsert AttendanceRecord with status=LEAVE across periods 1-7
  try {
    const AttendanceRecord = require("../attendance/attendance-record.model");
    const Timetable = require("../academics/timetable.model");

    const DAYS_OF_WEEK = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const startDate = new Date(leave.dateRange.startDate);
    const endDate = new Date(leave.dateRange.endDate);

    const cur = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
    const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));

    const bulkOps = [];
    while (cur <= end) {
      const recordDate = new Date(cur);
      const dayOfWeek = DAYS_OF_WEEK[recordDate.getUTCDay()];

      // Look up timetable entries for this class on this day of week
      const ttEntries = await Timetable.find({
        classId: student.classId,
        dayOfWeek,
        isDeleted: { $ne: true },
      }).lean();

      const ttMap = new Map();
      ttEntries.forEach((tt) => ttMap.set(tt.periodNumber, tt));

      for (let period = 1; period <= 7; period++) {
        const tt = ttMap.get(period);
        const subjectId = tt?.subjectId;
        const academicYearId = tt?.academicYearId || student.academicYearId;

        if (subjectId && academicYearId) {
          bulkOps.push({
            updateOne: {
              filter: {
                studentId: leave.studentId,
                classId: student.classId,
                subjectId,
                academicYearId,
                date: recordDate,
                period,
              },
              update: {
                $set: {
                  studentId: leave.studentId,
                  classId: student.classId,
                  subjectId,
                  academicYearId,
                  date: recordDate,
                  period,
                  sessionName: `Period ${period}`,
                  source: "MANUAL_CORRECTION",
                  status: "LEAVE",
                  isCorrected: true,
                  remarks: `Approved leave: ${leave.reason}`,
                },
              },
              upsert: true,
            },
          });
        }
      }

      cur.setUTCDate(cur.getUTCDate() + 1);
    }

    if (bulkOps.length > 0) {
      await AttendanceRecord.bulkWrite(bulkOps);
    }
  } catch (attErr) {
    console.error("Non-fatal: failed to sync attendance records for approved leave:", attErr);
  }

  const approvedDoc = await Leave.findById(leave._id)
    .populate("studentId", "nameEnglish registrationNumber classId")
    .populate("appliedBy", "name email mobile")
    .populate("approvedBy", "nameEnglish facultyId")
    .lean();

  notificationService.notifyLeaveApproved(approvedDoc, student).catch((err) => {
    console.error("Non-fatal: failed to trigger notifyLeaveApproved:", err.message);
  });

  return approvedDoc;
};

/**
 * Faculty or Admin rejects leave
 */
const rejectLeave = async (leaveId, userOrFacultyId, reviewRemarks) => {
  const isUserObj = typeof userOrFacultyId === "object" && userOrFacultyId !== null;
  const userRole = isUserObj ? userOrFacultyId.role : null;
  const userId = isUserObj ? (userOrFacultyId.userId || userOrFacultyId.id) : userOrFacultyId;

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

  let approverFacultyId = null;

  if (userRole === "ADMIN") {
    // Admin override: check if admin also has a faculty profile
    const faculty = await FacultyProfile.findOne({ userId }).lean();
    approverFacultyId = faculty?._id || null;
  } else {
    // Faculty review
    const faculty = await FacultyProfile.findOne({
      $or: [{ userId }, { _id: userId }],
    }).lean();
    if (!faculty) {
      const error = new Error("Faculty profile not found for authenticated account");
      error.statusCode = 403;
      throw error;
    }

    const { isFacultyAssigned } = require("../academics/academic-auth.service");
    const isAssigned = await isFacultyAssigned({
      facultyId: faculty._id,
      classId: student.classId,
    });
    const assignedClassIds = (faculty.assignedClasses || []).map((id) => id.toString());
    const isLegacyAssigned = student.classId && assignedClassIds.includes(student.classId.toString());

    // Also check mentorship assignment
    const MentorAssignment = require("../mentorship/mentor-assignment.model");
    const isMentee = await MentorAssignment.exists({
      mentorId: faculty._id,
      studentId: student._id,
    });

    if (!isAssigned && !isLegacyAssigned && !isMentee) {
      const error = new Error("Unauthorized: student does not belong to your assigned classes or mentees");
      error.statusCode = 403;
      throw error;
    }

    approverFacultyId = faculty._id;
  }

  leave.status = "REJECTED";
  if (approverFacultyId) {
    leave.approvedBy = approverFacultyId;
  }
  leave.reviewedAt = new Date();
  if (reviewRemarks) leave.reviewRemarks = reviewRemarks.trim();

  await leave.save();

  const rejectedDoc = await Leave.findById(leave._id)
    .populate("studentId", "nameEnglish registrationNumber classId")
    .populate("appliedBy", "name email mobile")
    .populate("approvedBy", "nameEnglish facultyId")
    .lean();

  notificationService.notifyLeaveRejected(rejectedDoc, student).catch((err) => {
    console.error("Non-fatal: failed to trigger notifyLeaveRejected:", err.message);
  });

  return rejectedDoc;
};

/**
 * Retrieve leaves with optional filtering
 */
const getLeaves = async (filter = {}, pagination = null) => {
  if (pagination) {
    const [data, total] = await Promise.all([
      Leave.find(filter)
        .populate("studentId", "nameEnglish registrationNumber classId")
        .populate("appliedBy", "name email mobile")
        .populate("approvedBy", "nameEnglish facultyId")
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Leave.countDocuments(filter),
    ]);
    return { data, total };
  }
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
