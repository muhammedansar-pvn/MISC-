const mongoose = require("mongoose");
const AttendanceRecord = require("./attendance-record.model");
const AttendanceCorrectionRequest = require("./attendance-correction-request.model");

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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
const createCorrectionRequest = async (data, requestedByUserId) => {
  return AttendanceCorrectionRequest.create({
    ...data,
    requestedBy: requestedByUserId,
    status: "PENDING",
  });
};

/**
 * Review Attendance Correction Request (Admin Approval)
 */
const reviewCorrectionRequest = async (requestId, status, reviewedByUserId, adminRemarks) => {
  const request = await AttendanceCorrectionRequest.findById(requestId);
  if (!request) {
    throw new Error("Attendance correction request not found");
  }

  if (request.status !== "PENDING") {
    throw new Error(`Correction request is already ${request.status}`);
  }

  request.status = status;
  request.reviewedBy = reviewedByUserId;
  request.reviewedAt = new Date();
  if (adminRemarks) request.adminRemarks = adminRemarks;

  await request.save();

  // If approved, update underlying AttendanceRecord
  if (status === "APPROVED") {
    await AttendanceRecord.findOneAndUpdate(
      {
        studentId: request.studentId,
        date: request.date,
        period: request.period,
      },
      {
        $set: {
          status: request.requestedStatus,
          isCorrected: true,
          correctionRequestId: request._id,
          source: "MANUAL_CORRECTION",
        },
      },
      { upsert: true, new: true }
    );
  }

  return request;
};

module.exports = {
  getStudentAttendanceOverview,
  getStudentMonthlyAttendance,
  getStudentAttendanceHistory,
  createCorrectionRequest,
  reviewCorrectionRequest,
};
