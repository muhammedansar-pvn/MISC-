const mongoose = require("mongoose");
const AttendanceRecord = require("./attendance-record.model");
const AttendanceCorrectionRequest = require("./attendance-correction-request.model");

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Get today's (or given date's) attendance status for a student across 7 periods
 * Priority logic:
 * 1. 0 records -> NOT_MARKED
 * 2. All records LEAVE/EXCUSED -> LEAVE
 * 3. All records ABSENT -> ABSENT
 * 4. Majority rule for mixed periods:
 *    - If (presentCount + lateCount) >= ceil(totalMarked / 2):
 *        - PRESENT if presentCount > 0, else LATE
 *    - Else: ABSENT
 */
const getStudentDailyAttendance = async (studentId, targetDate = new Date()) => {
  if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
    return {
      date: new Date().toISOString().split("T")[0],
      status: "NOT_MARKED",
      label: "Not Yet Marked",
      totalMarked: 0,
      presentCount: 0,
      absentCount: 0,
      lateCount: 0,
      leaveCount: 0,
      periods: [],
    };
  }

  const objectId = new mongoose.Types.ObjectId(studentId);

  let year, month, date;
  if (typeof targetDate === "string" && /^\d{4}-\d{2}-\d{2}/.test(targetDate)) {
    const parts = targetDate.split("T")[0].split("-").map(Number);
    year = parts[0];
    month = parts[1] - 1;
    date = parts[2];
  } else {
    const dt = new Date(targetDate);
    year = dt.getUTCFullYear();
    month = dt.getUTCMonth();
    date = dt.getUTCDate();
  }

  const startOfDay = new Date(Date.UTC(year, month, date, 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(year, month, date, 23, 59, 59, 999));
  const dateStr = startOfDay.toISOString().split("T")[0];

  const records = await AttendanceRecord.find({
    studentId: objectId,
    date: { $gte: startOfDay, $lte: endOfDay },
  })
    .sort({ period: 1 })
    .lean();

  if (!records || records.length === 0) {
    return {
      date: dateStr,
      status: "NOT_MARKED",
      label: "Not Yet Marked",
      totalMarked: 0,
      presentCount: 0,
      absentCount: 0,
      lateCount: 0,
      leaveCount: 0,
      periods: [],
    };
  }

  const presentCount = records.filter((r) => r.status === "PRESENT").length;
  const absentCount = records.filter((r) => r.status === "ABSENT").length;
  const lateCount = records.filter((r) => r.status === "LATE").length;
  const leaveCount = records.filter((r) => r.status === "LEAVE" || r.status === "EXCUSED").length;
  const attendedCount = presentCount + lateCount;

  let status = "NOT_MARKED";
  let label = "Not Yet Marked";

  if (leaveCount === records.length) {
    status = "LEAVE";
    label = "On Leave";
  } else if (absentCount === records.length) {
    status = "ABSENT";
    label = "Absent";
  } else if (attendedCount >= Math.ceil(records.length / 2)) {
    if (presentCount > 0) {
      status = "PRESENT";
      label = "Present";
    } else {
      status = "LATE";
      label = "Late";
    }
  } else {
    status = "ABSENT";
    label = "Absent";
  }

  const formattedPeriods = records.map((r) => ({
    period: r.period,
    sessionName: r.sessionName || `Period ${r.period}`,
    status: r.status,
    time: r.rawPunchTime ? new Date(r.rawPunchTime).toLocaleTimeString() : undefined,
  }));

  return {
    date: dateStr,
    status,
    label,
    totalMarked: records.length,
    presentCount,
    absentCount,
    lateCount,
    leaveCount,
    periods: formattedPeriods,
  };
};

/**
 * Get high-level attendance overview for a student
 */
const getStudentAttendanceOverview = async (studentId) => {
  const objectId = new mongoose.Types.ObjectId(studentId);

  const stats = await AttendanceRecord.aggregate([
    { $match: { studentId: objectId } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$date" },
        },
        hasPresent: { $max: { $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0] } },
        hasAbsent: { $max: { $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0] } },
        hasLate: { $max: { $cond: [{ $eq: ["$status", "LATE"] }, 1, 0] } },
        hasLeave: { $max: { $cond: [{ $eq: ["$status", "LEAVE"] }, 1, 0] } },
        totalSessions: { $sum: 1 },
        presentSessions: { $sum: { $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0] } },
      },
    },
  ]);

  if (!stats || stats.length === 0) {
    return {
      overallPercentage: null,
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      leaveDays: 0,
    };
  }

  const totalDays = stats.length;
  let presentDays = 0;
  let absentDays = 0;
  let lateDays = 0;
  let leaveDays = 0;
  let totalSessionsSum = 0;
  let presentSessionsSum = 0;

  stats.forEach((day) => {
    if (day.hasPresent) presentDays++;
    else if (day.hasLeave) leaveDays++;
    else if (day.hasAbsent) absentDays++;

    if (day.hasLate) lateDays++;
    totalSessionsSum += day.totalSessions;
    presentSessionsSum += day.presentSessions;
  });

  const overallPercentage =
    totalSessionsSum > 0
      ? Math.round((presentSessionsSum / totalSessionsSum) * 10000) / 100
      : null;

  return {
    overallPercentage,
    totalDays,
    presentDays,
    absentDays,
    lateDays,
    leaveDays,
  };
};

/**
 * Get monthly session records and summary for a given month/range
 */
const getStudentMonthlyAttendance = async (studentId, filter = {}) => {
  const objectId = new mongoose.Types.ObjectId(studentId);
  const match = { studentId: objectId };

  if (filter.month) {
    // Expected format "YYYY-MM"
    const [year, month] = filter.month.split("-").map(Number);
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    match.date = { $gte: startDate, $lte: endDate };
  } else if (filter.startDate || filter.endDate) {
    match.date = {};
    if (filter.startDate) match.date.$gte = new Date(filter.startDate);
    if (filter.endDate) match.date.$lte = new Date(filter.endDate);
  }

  const records = await AttendanceRecord.find(match)
    .sort({ date: -1, period: 1 })
    .lean();

  const formattedRecords = records.map((r) => {
    const d = new Date(r.date);
    return {
      id: r._id.toString(),
      date: d.toISOString().split("T")[0],
      day: DAYS[d.getUTCDay()],
      session: r.sessionName || `Period ${r.period}`,
      status: r.status,
      time: r.rawPunchTime ? new Date(r.rawPunchTime).toLocaleTimeString() : undefined,
      device: r.biometricDeviceId || "Terminal #1",
      remarks: r.remarks,
    };
  });

  // Calculate monthly overview
  const totalSessions = records.length;
  const presentSessions = records.filter((r) => r.status === "PRESENT").length;
  const absentSessions = records.filter((r) => r.status === "ABSENT").length;
  const lateSessions = records.filter((r) => r.status === "LATE").length;
  const leaveSessions = records.filter((r) => r.status === "LEAVE").length;

  const uniqueDays = new Set(records.map((r) => new Date(r.date).toISOString().split("T")[0])).size;

  const overview = {
    overallPercentage:
      totalSessions > 0
        ? Math.round((presentSessions / totalSessions) * 10000) / 100
        : null,
    totalDays: uniqueDays,
    presentDays: Math.ceil(presentSessions / 7),
    absentDays: Math.ceil(absentSessions / 7),
    lateDays: lateSessions,
    leaveDays: Math.ceil(leaveSessions / 7),
  };

  return {
    overview,
    records: formattedRecords,
    subjects: [], // Subject breakdown can be populated when linked to subject timetables
  };
};

/**
 * Get longitudinal monthly attendance history
 */
const getStudentAttendanceHistory = async (studentId) => {
  const objectId = new mongoose.Types.ObjectId(studentId);

  const history = await AttendanceRecord.aggregate([
    { $match: { studentId: objectId } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
        totalSessions: { $sum: 1 },
        presentCount: { $sum: { $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0] } },
        absentCount: { $sum: { $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0] } },
        lateCount: { $sum: { $cond: [{ $eq: ["$status", "LATE"] }, 1, 0] } },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  return history.map((item) => ({
    month: item._id,
    totalSessions: item.totalSessions,
    presentCount: item.presentCount,
    absentCount: item.absentCount,
    lateCount: item.lateCount,
    attendancePercentage:
      item.totalSessions > 0
        ? Math.round((item.presentCount / item.totalSessions) * 10000) / 100
        : null,
  }));
};

/**
 * Create Attendance Correction Request (Raised by Faculty)
 */
const createCorrectionRequest = async (data, requestingUser) => {
  const StudentProfile = require("../students/student.model");
  const FacultyProfile = require("../faculty/faculty.model");

  if (requestingUser && requestingUser.role === "FACULTY") {
    const student = await StudentProfile.findById(data.studentId).lean();
    if (!student) {
      const error = new Error("Student profile not found");
      error.statusCode = 404;
      throw error;
    }

    const faculty = await FacultyProfile.findOne({ userId: requestingUser.userId }).lean();
    if (!faculty) {
      const error = new Error("Faculty profile not found for authenticated account");
      error.statusCode = 403;
      throw error;
    }

    const assignedClassIds = (faculty.assignedClasses || []).map((id) => id.toString());
    if (!student.classId || !assignedClassIds.includes(student.classId.toString())) {
      const error = new Error("Unauthorized: student does not belong to your assigned classes");
      error.statusCode = 403;
      throw error;
    }
  }

  return AttendanceCorrectionRequest.create({
    ...data,
    requestedBy: requestingUser.userId,
    status: "PENDING",
  });
};

/**
 * Review Attendance Correction Request (Admin Approval)
 */
const reviewCorrectionRequest = async (requestId, status, reviewedByUserId, adminRemarks) => {
  const request = await AttendanceCorrectionRequest.findById(requestId);
  if (!request) {
    const error = new Error("Attendance correction request not found");
    error.statusCode = 404;
    throw error;
  }

  if (request.status !== "PENDING") {
    const error = new Error(`Correction request is already ${request.status}`);
    error.statusCode = 400;
    throw error;
  }

  request.status = status;
  request.reviewedBy = reviewedByUserId;
  request.reviewedAt = new Date();
  if (adminRemarks) request.adminRemarks = adminRemarks;

  await request.save();

  let attendanceRecord = null;
  // If approved, update underlying AttendanceRecord
  if (status === "APPROVED") {
    attendanceRecord = await AttendanceRecord.findOneAndUpdate(
      {
        studentId: request.studentId,
        date: request.date,
        period: request.period,
      },
      {
        $set: {
          studentId: request.studentId,
          classId: request.classId,
          date: request.date,
          period: request.period,
          sessionName: `Period ${request.period}`,
          status: request.requestedStatus,
          isCorrected: true,
          correctionRequestId: request._id,
          source: "MANUAL_CORRECTION",
        },
      },
      { upsert: true, new: true }
    );
  }

  return { request, attendanceRecord };
};

/**
 * Mark or update attendance for an entire class roster on a specific date and period
 */
const markClassAttendance = async (payload, requestingUser) => {
  const { classId, date: inputDate, period, records } = payload;
  const StudentProfile = require("../students/student.model");
  const FacultyProfile = require("../faculty/faculty.model");

  if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
    const error = new Error("Invalid classId");
    error.statusCode = 400;
    throw error;
  }

  // 1. Class-scoping: if FACULTY, verify classId is in their assignedClasses
  if (requestingUser && requestingUser.role === "FACULTY") {
    const faculty = await FacultyProfile.findOne({
      $or: [
        { userId: requestingUser.userId },
        ...(requestingUser.facultyId ? [{ _id: requestingUser.facultyId }] : []),
      ],
    }).lean();

    if (!faculty) {
      const error = new Error("Faculty profile not found for authenticated account");
      error.statusCode = 403;
      throw error;
    }

    const assignedIds = (faculty.assignedClasses || []).map((id) => id.toString());
    if (!assignedIds.includes(classId.toString())) {
      const error = new Error("Unauthorized: class is not in your assigned classes");
      error.statusCode = 403;
      throw error;
    }
  }

  // 2. Validate period (1 - 7)
  const periodNum = Number(period);
  if (!Number.isInteger(periodNum) || periodNum < 1 || periodNum > 7) {
    const error = new Error("Period must be an integer between 1 and 7");
    error.statusCode = 400;
    throw error;
  }

  // 3. Normalize date to UTC midnight
  let year, month, date;
  if (typeof inputDate === "string" && /^\d{4}-\d{2}-\d{2}/.test(inputDate)) {
    const parts = inputDate.split("T")[0].split("-").map(Number);
    year = parts[0];
    month = parts[1] - 1;
    date = parts[2];
  } else {
    const dt = new Date(inputDate);
    if (isNaN(dt.getTime())) {
      const error = new Error("Invalid date provided");
      error.statusCode = 400;
      throw error;
    }
    year = dt.getUTCFullYear();
    month = dt.getUTCMonth();
    date = dt.getUTCDate();
  }
  const normalizedDate = new Date(Date.UTC(year, month, date, 0, 0, 0, 0));

  // Date cannot be in the future (relative to UTC day)
  const now = new Date();
  const todayUTCEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
  if (normalizedDate > todayUTCEnd) {
    const error = new Error("Cannot mark attendance for a future date");
    error.statusCode = 400;
    throw error;
  }

  // 4. Validate records
  if (!Array.isArray(records) || records.length === 0) {
    const error = new Error("Records array must not be empty");
    error.statusCode = 400;
    throw error;
  }

  const validStatuses = ["PRESENT", "ABSENT", "LATE", "LEAVE", "EXCUSED"];
  const studentIds = [];

  for (const r of records) {
    if (!r.studentId || !mongoose.Types.ObjectId.isValid(r.studentId)) {
      const error = new Error(`Invalid studentId: ${r.studentId}`);
      error.statusCode = 400;
      throw error;
    }
    if (!validStatuses.includes(r.status)) {
      const error = new Error(`Invalid attendance status: ${r.status}`);
      error.statusCode = 400;
      throw error;
    }
    studentIds.push(r.studentId.toString());
  }

  // 5. Verify every studentId belongs to this classId
  const matchingStudents = await StudentProfile.find({
    _id: { $in: studentIds },
    classId: classId,
    isDeleted: { $ne: true },
  }).select("_id");

  if (matchingStudents.length !== studentIds.length) {
    const validSet = new Set(matchingStudents.map((s) => s._id.toString()));
    const invalidIds = studentIds.filter((id) => !validSet.has(id));
    const error = new Error(`One or more students do not belong to class ${classId}: ${invalidIds.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }

  // 6. Execute bulkWrite with upsert on { studentId, date, period }
  const bulkOps = records.map((r) => ({
    updateOne: {
      filter: {
        studentId: new mongoose.Types.ObjectId(r.studentId),
        date: normalizedDate,
        period: periodNum,
      },
      update: {
        $set: {
          studentId: new mongoose.Types.ObjectId(r.studentId),
          classId: new mongoose.Types.ObjectId(classId),
          date: normalizedDate,
          period: periodNum,
          sessionName: `Period ${periodNum}`,
          status: r.status,
          source: "MANUAL_CORRECTION",
          markedBy: requestingUser && requestingUser.userId ? new mongoose.Types.ObjectId(requestingUser.userId) : undefined,
        },
      },
      upsert: true,
    },
  }));

  const bulkResult = await AttendanceRecord.bulkWrite(bulkOps);

  return {
    classId,
    date: normalizedDate.toISOString().split("T")[0],
    period: periodNum,
    totalMarked: records.length,
    upsertedCount: bulkResult.upsertedCount || 0,
    modifiedCount: bulkResult.modifiedCount || 0,
  };
};

/**
 * Fetch existing attendance records for a class on a given date and optional period
 */
const getClassAttendanceRecords = async (classId, targetDate, period, requestingUser) => {
  const FacultyProfile = require("../faculty/faculty.model");

  if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
    const error = new Error("Invalid classId");
    error.statusCode = 400;
    throw error;
  }

  // Class-scoping for faculty
  if (requestingUser && requestingUser.role === "FACULTY") {
    const faculty = await FacultyProfile.findOne({
      $or: [
        { userId: requestingUser.userId },
        ...(requestingUser.facultyId ? [{ _id: requestingUser.facultyId }] : []),
      ],
    }).lean();

    if (!faculty) {
      const error = new Error("Faculty profile not found for authenticated account");
      error.statusCode = 403;
      throw error;
    }

    const assignedIds = (faculty.assignedClasses || []).map((id) => id.toString());
    if (!assignedIds.includes(classId.toString())) {
      const error = new Error("Unauthorized: class is not in your assigned classes");
      error.statusCode = 403;
      throw error;
    }
  }

  let year, month, date;
  if (typeof targetDate === "string" && /^\d{4}-\d{2}-\d{2}/.test(targetDate)) {
    const parts = targetDate.split("T")[0].split("-").map(Number);
    year = parts[0];
    month = parts[1] - 1;
    date = parts[2];
  } else {
    const dt = new Date(targetDate);
    if (isNaN(dt.getTime())) {
      const error = new Error("Invalid date provided");
      error.statusCode = 400;
      throw error;
    }
    year = dt.getUTCFullYear();
    month = dt.getUTCMonth();
    date = dt.getUTCDate();
  }
  const normalizedDate = new Date(Date.UTC(year, month, date, 0, 0, 0, 0));

  const filter = {
    classId: new mongoose.Types.ObjectId(classId),
    date: normalizedDate,
  };

  if (period) {
    const periodNum = Number(period);
    if (periodNum >= 1 && periodNum <= 7) {
      filter.period = periodNum;
    }
  }

  const records = await AttendanceRecord.find(filter)
    .populate("studentId", "nameEnglish registrationNumber")
    .sort({ period: 1 })
    .lean();

  return records;
};

module.exports = {
  getStudentDailyAttendance,
  getStudentAttendanceOverview,
  getStudentMonthlyAttendance,
  getStudentAttendanceHistory,
  createCorrectionRequest,
  reviewCorrectionRequest,
  markClassAttendance,
  getClassAttendanceRecords,
};

