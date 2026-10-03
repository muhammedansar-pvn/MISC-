const mongoose = require("mongoose");
const AttendanceRecord = require("./attendance-record.model");
const AttendanceCorrectionRequest = require("./attendance-correction-request.model");

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_OF_WEEK = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

/**
 * Normalizes input date to UTC Midnight (00:00:00.000)
 */
const normalizeUtcDate = (inputDate) => {
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
  return new Date(Date.UTC(year, month, date, 0, 0, 0, 0));
};

/**
 * 1. Get today's (or given date's) attendance status for a student across 7 periods
 * Priority logic:
 * - 0 records -> NOT_MARKED
 * - All records LEAVE/EXCUSED -> LEAVE
 * - All records ABSENT -> ABSENT
 * - Majority rule:
 *     If (presentCount + lateCount) >= ceil(totalMarked / 2):
 *       PRESENT if presentCount > 0, else LATE
 *     Else: ABSENT
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
      percentage: null,
      periods: [],
    };
  }

  const objectId = new mongoose.Types.ObjectId(studentId);
  const startOfDay = normalizeUtcDate(targetDate);
  const endOfDay = new Date(Date.UTC(startOfDay.getUTCFullYear(), startOfDay.getUTCMonth(), startOfDay.getUTCDate(), 23, 59, 59, 999));
  const dateStr = startOfDay.toISOString().split("T")[0];

  const records = await AttendanceRecord.find({
    studentId: objectId,
    date: { $gte: startOfDay, $lte: endOfDay },
  })
    .populate("subjectId", "name subjectName code subjectCode")
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
      percentage: null,
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
    subject: r.subjectId ? (r.subjectId.name || r.subjectId.subjectName) : undefined,
    subjectCode: r.subjectId ? (r.subjectId.code || r.subjectId.subjectCode) : undefined,
    source: r.source || "MANUAL",
    time: r.rawPunchTime ? new Date(r.rawPunchTime).toLocaleTimeString() : undefined,
    remarks: r.remarks,
  }));

  const percentage =
    records.length > 0 ? Math.round((presentCount / records.length) * 10000) / 100 : null;

  return {
    date: dateStr,
    status,
    label,
    totalMarked: records.length,
    presentCount,
    absentCount,
    lateCount,
    leaveCount,
    percentage,
    periods: formattedPeriods,
  };
};

/**
 * 2. High-level attendance overview for a student
 */
const getStudentAttendanceOverview = async (studentId, academicYearId = null) => {
  const objectId = new mongoose.Types.ObjectId(studentId);
  const match = { studentId: objectId };
  if (academicYearId && mongoose.Types.ObjectId.isValid(academicYearId)) {
    match.academicYearId = new mongoose.Types.ObjectId(academicYearId);
  }

  const stats = await AttendanceRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$date" },
        },
        hasPresent: { $max: { $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0] } },
        hasAbsent: { $max: { $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0] } },
        hasLate: { $max: { $cond: [{ $eq: ["$status", "LATE"] }, 1, 0] } },
        hasLeave: { $max: { $cond: [{ $in: ["$status", ["LEAVE", "EXCUSED"]] }, 1, 0] } },
        totalSessions: { $sum: 1 },
        presentSessions: { $sum: { $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0] } },
        absentSessions: { $sum: { $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0] } },
        lateSessions: { $sum: { $cond: [{ $eq: ["$status", "LATE"] }, 1, 0] } },
        leaveSessions: { $sum: { $cond: [{ $in: ["$status", ["LEAVE", "EXCUSED"]] }, 1, 0] } },
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
      totalSessions: 0,
      presentSessions: 0,
      absentSessions: 0,
      lateSessions: 0,
      leaveSessions: 0,
    };
  }

  const totalDays = stats.length;
  let presentDays = 0;
  let absentDays = 0;
  let lateDays = 0;
  let leaveDays = 0;
  let totalSessionsSum = 0;
  let presentSessionsSum = 0;
  let absentSessionsSum = 0;
  let lateSessionsSum = 0;
  let leaveSessionsSum = 0;

  stats.forEach((day) => {
    if (day.hasPresent) presentDays++;
    else if (day.hasLeave) leaveDays++;
    else if (day.hasAbsent) absentDays++;

    if (day.hasLate) lateDays++;
    totalSessionsSum += day.totalSessions;
    presentSessionsSum += day.presentSessions;
    absentSessionsSum += day.absentSessions;
    lateSessionsSum += day.lateSessions;
    leaveSessionsSum += day.leaveSessions;
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
    totalSessions: totalSessionsSum,
    presentSessions: presentSessionsSum,
    absentSessions: absentSessionsSum,
    lateSessions: lateSessionsSum,
    leaveSessions: leaveSessionsSum,
  };
};

/**
 * 3. Monthly Attendance: Daily sessions, Subject Breakdown, and Period Breakdown
 */
const getStudentMonthlyAttendance = async (studentId, filter = {}) => {
  const match = { studentId: new mongoose.Types.ObjectId(studentId) };

  if (filter.academicYearId && mongoose.Types.ObjectId.isValid(filter.academicYearId)) {
    match.academicYearId = new mongoose.Types.ObjectId(filter.academicYearId);
  }

  if (filter.subjectId && mongoose.Types.ObjectId.isValid(filter.subjectId)) {
    match.subjectId = new mongoose.Types.ObjectId(filter.subjectId);
  }

  if (filter.month) {
    // Expected format "YYYY-MM"
    const [year, month] = filter.month.split("-").map(Number);
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    match.date = { $gte: startDate, $lte: endDate };
  } else if (filter.startDate || filter.endDate) {
    match.date = {};
    if (filter.startDate) match.date.$gte = normalizeUtcDate(filter.startDate);
    if (filter.endDate) {
      const endNorm = normalizeUtcDate(filter.endDate);
      match.date.$lte = new Date(Date.UTC(endNorm.getUTCFullYear(), endNorm.getUTCMonth(), endNorm.getUTCDate(), 23, 59, 59, 999));
    }
  }

  const records = await AttendanceRecord.find(match)
    .populate("subjectId", "name subjectName code subjectCode category")
    .sort({ date: -1, period: 1 })
    .lean();

  const formattedRecords = records.map((r) => {
    const d = new Date(r.date);
    return {
      id: r._id.toString(),
      date: d.toISOString().split("T")[0],
      day: DAYS[d.getUTCDay()],
      session: r.sessionName || `Period ${r.period}`,
      period: r.period,
      status: r.status,
      subject: r.subjectId ? (r.subjectId.name || r.subjectId.subjectName) : undefined,
      subjectCode: r.subjectId ? (r.subjectId.code || r.subjectId.subjectCode) : undefined,
      source: r.source || "MANUAL",
      time: r.rawPunchTime ? new Date(r.rawPunchTime).toLocaleTimeString() : undefined,
      device: r.biometricDeviceId || null,
      remarks: r.remarks,
    };
  });

  // Calculate monthly overall metrics
  const totalSessions = records.length;
  const presentSessions = records.filter((r) => r.status === "PRESENT").length;
  const absentSessions = records.filter((r) => r.status === "ABSENT").length;
  const lateSessions = records.filter((r) => r.status === "LATE").length;
  const leaveSessions = records.filter((r) => r.status === "LEAVE" || r.status === "EXCUSED").length;

  const uniqueDays = new Set(records.map((r) => new Date(r.date).toISOString().split("T")[0])).size;

  const overview = {
    overallPercentage:
      totalSessions > 0
        ? Math.round((presentSessions / totalSessions) * 10000) / 100
        : null,
    totalDays: uniqueDays,
    totalSessions,
    presentDays: Math.ceil(presentSessions / 7),
    absentDays: Math.ceil(absentSessions / 7),
    lateDays: lateSessions,
    leaveDays: Math.ceil(leaveSessions / 7),
  };

  // Subject-wise Breakdown
  const subjectMap = new Map();
  records.forEach((r) => {
    if (!r.subjectId) return;
    const sId = (r.subjectId._id || r.subjectId).toString();
    const sName = r.subjectId.name || r.subjectId.subjectName || "Subject";
    const sCode = r.subjectId.code || r.subjectId.subjectCode || "SUB";

    if (!subjectMap.has(sId)) {
      subjectMap.set(sId, {
        subjectId: sId,
        subjectName: sName,
        subjectCode: sCode,
        totalSessions: 0,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        leaveCount: 0,
      });
    }

    const subStat = subjectMap.get(sId);
    subStat.totalSessions++;
    if (r.status === "PRESENT") subStat.presentCount++;
    else if (r.status === "ABSENT") subStat.absentCount++;
    else if (r.status === "LATE") subStat.lateCount++;
    else if (r.status === "LEAVE" || r.status === "EXCUSED") subStat.leaveCount++;
  });

  const subjects = Array.from(subjectMap.values()).map((sub) => ({
    ...sub,
    attendancePercentage:
      sub.totalSessions > 0
        ? Math.round((sub.presentCount / sub.totalSessions) * 10000) / 100
        : null,
  }));

  // Session-wise Breakdown (Period 1 to 7)
  const sessions = [1, 2, 3, 4, 5, 6, 7].map((pNum) => {
    const pRecords = records.filter((r) => r.period === pNum);
    const pTotal = pRecords.length;
    const pPresent = pRecords.filter((r) => r.status === "PRESENT").length;
    const pAbsent = pRecords.filter((r) => r.status === "ABSENT").length;
    const pLate = pRecords.filter((r) => r.status === "LATE").length;
    const pLeave = pRecords.filter((r) => r.status === "LEAVE" || r.status === "EXCUSED").length;

    return {
      period: pNum,
      sessionName: `Period ${pNum}`,
      totalSessions: pTotal,
      presentCount: pPresent,
      absentCount: pAbsent,
      lateCount: pLate,
      leaveCount: pLeave,
      attendancePercentage:
        pTotal > 0 ? Math.round((pPresent / pTotal) * 10000) / 100 : null,
    };
  });

  return {
    overview,
    records: formattedRecords,
    subjects,
    sessions,
  };
};

/**
 * 4. Subject-wise Attendance Breakdown for a student
 */
const getStudentSubjectAttendance = async (studentId, filter = {}) => {
  const match = { studentId: new mongoose.Types.ObjectId(studentId) };

  if (filter.academicYearId && mongoose.Types.ObjectId.isValid(filter.academicYearId)) {
    match.academicYearId = new mongoose.Types.ObjectId(filter.academicYearId);
  }

  if (filter.startDate || filter.endDate) {
    match.date = {};
    if (filter.startDate) match.date.$gte = normalizeUtcDate(filter.startDate);
    if (filter.endDate) {
      const endNorm = normalizeUtcDate(filter.endDate);
      match.date.$lte = new Date(Date.UTC(endNorm.getUTCFullYear(), endNorm.getUTCMonth(), endNorm.getUTCDate(), 23, 59, 59, 999));
    }
  }

  const results = await AttendanceRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$subjectId",
        totalSessions: { $sum: 1 },
        presentCount: { $sum: { $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0] } },
        absentCount: { $sum: { $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0] } },
        lateCount: { $sum: { $cond: [{ $eq: ["$status", "LATE"] }, 1, 0] } },
        leaveCount: { $sum: { $cond: [{ $in: ["$status", ["LEAVE", "EXCUSED"]] }, 1, 0] } },
      },
    },
    {
      $lookup: {
        from: "subjects",
        localField: "_id",
        foreignField: "_id",
        as: "subject",
      },
    },
    { $unwind: { path: "$subject", preserveNullAndEmptyArrays: true } },
    { $sort: { "subject.subjectName": 1, "subject.name": 1 } },
  ]);

  return results.map((item) => ({
    subjectId: item._id,
    subjectName: item.subject?.subjectName || item.subject?.name || "Unknown Subject",
    subjectCode: item.subject?.subjectCode || item.subject?.code || "SUB",
    category: item.subject?.category || "CORE",
    totalSessions: item.totalSessions,
    presentCount: item.presentCount,
    absentCount: item.absentCount,
    lateCount: item.lateCount,
    leaveCount: item.leaveCount,
    presentSessions: item.presentCount,
    absentSessions: item.absentCount,
    lateSessions: item.lateCount,
    leaveSessions: item.leaveCount,
    attendancePercentage:
      item.totalSessions > 0
        ? Math.round((item.presentCount / item.totalSessions) * 10000) / 100
        : null,
  }));
};

/**
 * 5. Session-wise Attendance Breakdown for a student across Periods 1 to 7
 */
const getStudentSessionAttendance = async (studentId, filter = {}) => {
  const match = { studentId: new mongoose.Types.ObjectId(studentId) };

  if (filter.academicYearId && mongoose.Types.ObjectId.isValid(filter.academicYearId)) {
    match.academicYearId = new mongoose.Types.ObjectId(filter.academicYearId);
  }

  if (filter.startDate || filter.endDate) {
    match.date = {};
    if (filter.startDate) match.date.$gte = normalizeUtcDate(filter.startDate);
    if (filter.endDate) {
      const endNorm = normalizeUtcDate(filter.endDate);
      match.date.$lte = new Date(Date.UTC(endNorm.getUTCFullYear(), endNorm.getUTCMonth(), endNorm.getUTCDate(), 23, 59, 59, 999));
    }
  }

  const results = await AttendanceRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$period",
        totalSessions: { $sum: 1 },
        presentCount: { $sum: { $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0] } },
        absentCount: { $sum: { $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0] } },
        lateCount: { $sum: { $cond: [{ $eq: ["$status", "LATE"] }, 1, 0] } },
        leaveCount: { $sum: { $cond: [{ $in: ["$status", ["LEAVE", "EXCUSED"]] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const resultMap = new Map(results.map((r) => [r._id, r]));

  return [1, 2, 3, 4, 5, 6, 7].map((pNum) => {
    const item = resultMap.get(pNum);
    const totalSessions = item ? item.totalSessions : 0;
    const presentCount = item ? item.presentCount : 0;
    const absentCount = item ? item.absentCount : 0;
    const lateCount = item ? item.lateCount : 0;
    const leaveCount = item ? item.leaveCount : 0;

    return {
      period: pNum,
      sessionName: `Period ${pNum}`,
      totalSessions,
      presentCount,
      absentCount,
      lateCount,
      leaveCount,
      presentSessions: presentCount,
      absentSessions: absentCount,
      lateSessions: lateCount,
      leaveSessions: leaveCount,
      attendancePercentage:
        totalSessions > 0
          ? Math.round((presentCount / totalSessions) * 10000) / 100
          : null,
    };
  });
};

/**
 * 6. Longitudinal monthly attendance history
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
        leaveCount: { $sum: { $cond: [{ $in: ["$status", ["LEAVE", "EXCUSED"]] }, 1, 0] } },
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
    leaveCount: item.leaveCount,
    presentSessions: item.presentCount,
    absentSessions: item.absentCount,
    lateSessions: item.lateCount,
    leaveSessions: item.leaveCount,
    attendancePercentage:
      item.totalSessions > 0
        ? Math.round((item.presentCount / item.totalSessions) * 10000) / 100
        : null,
  }));
};

/**
 * 7. Timetable Session Resolver (Resolves Period, Subject, Faculty by Class, Day, and Time/Period)
 */
const resolveTimetableSession = async ({ classId, date, time, period = null }) => {
  const Timetable = require("../academics/timetable.model");

  if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
    return null;
  }

  const normalized = normalizeUtcDate(date);
  const dayOfWeek = DAYS_OF_WEEK[normalized.getUTCDay()];

  const query = {
    classId: new mongoose.Types.ObjectId(classId),
    dayOfWeek,
    status: "ACTIVE",
    isDeleted: { $ne: true },
  };

  if (period) {
    query.periodNumber = Number(period);
  }

  if (time && !period) {
    // If exact time string (e.g., "09:30"), match entry where startTime <= time <= endTime
    const timeClean = typeof time === "string" ? time.trim() : new Date(time).toTimeString().slice(0, 5);
    query.startTime = { $lte: timeClean };
    query.endTime = { $gte: timeClean };
  }

  const entry = await Timetable.findOne(query)
    .populate("subjectId", "name subjectName code subjectCode category")
    .populate("facultyId", "nameEnglish designation")
    .lean();

  if (!entry) return null;

  return {
    period: entry.periodNumber,
    sessionName: `Period ${entry.periodNumber}`,
    subjectId: entry.subjectId?._id || entry.subjectId,
    subject: entry.subjectId,
    facultyId: entry.facultyId?._id || entry.facultyId,
    academicYearId: entry.academicYearId,
    startTime: entry.startTime,
    endTime: entry.endTime,
    room: entry.room,
  };
};

/**
 * 8. Source-Independent Biometric Event Processor (Architectural Boundary)
 */
const processAttendanceEvent = async ({
  studentId,
  timestamp = new Date(),
  source = "BIOMETRIC",
  biometricDeviceId = null,
  biometricEventId = null,
  status = "PRESENT",
  remarks = "",
}) => {
  const StudentProfile = require("../students/student.model");

  const student = await StudentProfile.findById(studentId).lean();
  if (!student) {
    const error = new Error(`Student not found for attendance event: ${studentId}`);
    error.statusCode = 404;
    throw error;
  }

  if (!student.classId) {
    const error = new Error(`Student ${studentId} is not assigned to a class cohort`);
    error.statusCode = 400;
    throw error;
  }

  const eventDate = normalizeUtcDate(timestamp);

  // Resolve session from timetable
  const sessionContext = await resolveTimetableSession({
    classId: student.classId,
    date: eventDate,
    time: timestamp,
  });

  if (!sessionContext || !sessionContext.subjectId) {
    const error = new Error("No active timetable session found for timestamp and class cohort");
    error.statusCode = 422;
    throw error;
  }

  const record = await AttendanceRecord.findOneAndUpdate(
    {
      studentId: student._id,
      classId: student.classId,
      subjectId: sessionContext.subjectId,
      academicYearId: sessionContext.academicYearId || student.academicYearId,
      date: eventDate,
      period: sessionContext.period,
    },
    {
      $set: {
        studentId: student._id,
        classId: student.classId,
        subjectId: sessionContext.subjectId,
        academicYearId: sessionContext.academicYearId || student.academicYearId,
        date: eventDate,
        period: sessionContext.period,
        sessionName: sessionContext.sessionName,
        status,
        source: source || "BIOMETRIC",
        rawPunchTime: new Date(timestamp),
        biometricDeviceId,
        biometricEventId,
        remarks: remarks || `Auto-processed event (${source})`,
      },
    },
    { upsert: true, new: true }
  );

  return record;
};

/**
 * 9. Create Attendance Correction Request (Raised by Faculty)
 */
const createCorrectionRequest = async (data, requestingUser) => {
  const StudentProfile = require("../students/student.model");
  const { isFacultyAssigned } = require("../academics/academic-auth.service");

  const student = await StudentProfile.findById(data.studentId).lean();
  if (!student) {
    const error = new Error("Student profile not found");
    error.statusCode = 404;
    throw error;
  }

  const targetClassId = data.classId || student.classId;

  if (requestingUser && requestingUser.role === "FACULTY") {
    const assigned = await isFacultyAssigned({
      facultyId: requestingUser.userId || requestingUser.id || requestingUser.facultyId,
      classId: targetClassId,
      subjectId: data.subjectId || undefined,
    });

    if (!assigned) {
      const error = new Error("Unauthorized: Student does not belong to your assigned classes/subjects");
      error.statusCode = 403;
      throw error;
    }
  }

  return AttendanceCorrectionRequest.create({
    ...data,
    classId: targetClassId,
    subjectId: data.subjectId || undefined,
    academicYearId: data.academicYearId || student.academicYearId,
    requestedBy: requestingUser.userId || requestingUser.id,
    status: "PENDING",
  });
};

/**
 * 10. Review Attendance Correction Request (Admin Approval)
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
  if (status === "APPROVED") {
    const updateFilter = request.attendanceRecordId
      ? { _id: request.attendanceRecordId }
      : {
          studentId: request.studentId,
          classId: request.classId,
          ...(request.subjectId ? { subjectId: request.subjectId } : {}),
          date: request.date,
          period: request.period,
        };

    const updateSet = {
      studentId: request.studentId,
      classId: request.classId,
      date: request.date,
      period: request.period,
      sessionName: `Period ${request.period}`,
      status: request.requestedStatus,
      isCorrected: true,
      correctionRequestId: request._id,
      source: "MANUAL_CORRECTION",
      remarks: request.reason,
    };
    if (request.subjectId) updateSet.subjectId = request.subjectId;
    if (request.academicYearId) updateSet.academicYearId = request.academicYearId;

    attendanceRecord = await AttendanceRecord.findOneAndUpdate(
      updateFilter,
      { $set: updateSet },
      { upsert: true, new: true }
    );
  }

  return { request, attendanceRecord };
};

/**
 * 11. Mark or update attendance for an entire class roster on a specific date and period
 * - Atomic bulk operation
 * - Idempotent
 * - Enforces faculty authorization, 7 periods, subject attribution, future date limit, and 7-day editing limit
 */
const markClassAttendance = async (payload, requestingUser) => {
  const { classId, subjectId, date: inputDate, period, records } = payload;
  const StudentProfile = require("../students/student.model");
  const Class = require("../academics/class.model");
  const Leave = require("../leaves/leave.model");
  const { isFacultyAssigned } = require("../academics/academic-auth.service");

  if (requestingUser?.role === "FACULTY") {
    const { assertFacultyAvailableForAssignment } = require("../faculty/faculty.service");
    await assertFacultyAvailableForAssignment(requestingUser.userId || requestingUser.id || requestingUser.facultyId);
  }

  if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
    const error = new Error("Invalid classId");
    error.statusCode = 400;
    throw error;
  }

  if (!subjectId || !mongoose.Types.ObjectId.isValid(subjectId)) {
    const error = new Error("Invalid subjectId");
    error.statusCode = 400;
    throw error;
  }

  // 1. Verify Class & resolve academicYearId
  const classDoc = await Class.findById(classId);
  if (!classDoc) {
    const error = new Error("Class not found");
    error.statusCode = 404;
    throw error;
  }
  const academicYearId = classDoc.academicYearId;

  // 2. Strict Faculty Academic Scope verification via FacultyAssignment
  if (requestingUser && requestingUser.role === "FACULTY") {
    const assigned = await isFacultyAssigned({
      facultyId: requestingUser.userId || requestingUser.id || requestingUser.facultyId,
      classId,
      subjectId,
      academicYearId,
    });

    if (!assigned) {
      const error = new Error("Unauthorized: You are not assigned to teach this subject in this class");
      error.statusCode = 403;
      throw error;
    }
  }

  // 3. Validate period (1 - 7)
  const periodNum = Number(period);
  if (!Number.isInteger(periodNum) || periodNum < 1 || periodNum > 7) {
    const error = new Error("Period must be an integer between 1 and 7");
    error.statusCode = 400;
    throw error;
  }

  // 4. Normalize date to UTC midnight
  const normalizedDate = normalizeUtcDate(inputDate);

  // Date cannot be in the future (relative to UTC day)
  const now = new Date();
  const todayUTCEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
  if (normalizedDate > todayUTCEnd) {
    const error = new Error("Cannot mark attendance for a future date");
    error.statusCode = 400;
    throw error;
  }

  // 5. Enforce controlled attendance editing window for faculty (7 days)
  if (requestingUser && requestingUser.role === "FACULTY") {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (normalizedDate < sevenDaysAgo) {
      const error = new Error(
        "Attendance modification window expired (over 7 days old). Please submit an Attendance Correction Request."
      );
      error.statusCode = 403;
      throw error;
    }
  }

  // 6. Validate records
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

  // 7. Verify every studentId belongs to this classId
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

  // 8. Check for approved leaves for this date to preserve leave status
  const approvedLeaves = await Leave.find({
    studentId: { $in: studentIds },
    status: "APPROVED",
    "dateRange.startDate": { $lte: normalizedDate },
    "dateRange.endDate": { $gte: normalizedDate },
  }).select("studentId").lean();

  const studentsOnLeaveSet = new Set(approvedLeaves.map((l) => l.studentId.toString()));

  // 9. Execute idempotent bulkWrite with upsert on compound unique index
  const bulkOps = records.map((r) => {
    // If student is on approved leave and was marked absent, elevate status to LEAVE
    let finalStatus = r.status;
    if (studentsOnLeaveSet.has(r.studentId.toString()) && finalStatus === "ABSENT") {
      finalStatus = "LEAVE";
    }

    return {
      updateOne: {
        filter: {
          studentId: new mongoose.Types.ObjectId(r.studentId),
          classId: new mongoose.Types.ObjectId(classId),
          subjectId: new mongoose.Types.ObjectId(subjectId),
          academicYearId: new mongoose.Types.ObjectId(academicYearId),
          date: normalizedDate,
          period: periodNum,
        },
        update: {
          $set: {
            studentId: new mongoose.Types.ObjectId(r.studentId),
            classId: new mongoose.Types.ObjectId(classId),
            subjectId: new mongoose.Types.ObjectId(subjectId),
            academicYearId: new mongoose.Types.ObjectId(academicYearId),
            date: normalizedDate,
            period: periodNum,
            sessionName: `Period ${periodNum}`,
            status: finalStatus,
            source: "MANUAL",
            markedBy: requestingUser && requestingUser.userId ? new mongoose.Types.ObjectId(requestingUser.userId) : undefined,
            remarks: r.remarks || "",
          },
        },
        upsert: true,
      },
    };
  });

  const bulkResult = await AttendanceRecord.bulkWrite(bulkOps);

  return {
    classId,
    subjectId,
    date: normalizedDate.toISOString().split("T")[0],
    period: periodNum,
    totalMarked: records.length,
    upsertedCount: bulkResult.upsertedCount || 0,
    modifiedCount: bulkResult.modifiedCount || 0,
    source: "MANUAL",
  };
};

/**
 * 12. Fetch existing attendance records for a class on a given date and optional period
 */
const getClassAttendanceRecords = async (classIdOrParams, subjectId, targetDate, period, requestingUser) => {
  const { isFacultyAssigned } = require("../academics/academic-auth.service");

  let classId = classIdOrParams;
  let user = requestingUser;
  let actualSubjectId = subjectId;
  let actualDate = targetDate;
  let actualPeriod = period;

  if (
    typeof classIdOrParams === "object" &&
    classIdOrParams !== null &&
    !mongoose.Types.ObjectId.isValid(classIdOrParams) &&
    classIdOrParams.classId
  ) {
    classId = classIdOrParams.classId;
    actualSubjectId = classIdOrParams.subjectId;
    actualDate = classIdOrParams.date || classIdOrParams.targetDate;
    actualPeriod = classIdOrParams.period;
    user = subjectId || requestingUser;
  }

  if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
    const error = new Error("Invalid classId");
    error.statusCode = 400;
    throw error;
  }

  // Handle case where subjectId was omitted and passed as targetDate (backward compatibility)
  if (
    typeof actualSubjectId === "string" &&
    (/^\d{4}-\d{2}-\d{2}/.test(actualSubjectId) || !mongoose.Types.ObjectId.isValid(actualSubjectId))
  ) {
    actualPeriod = actualDate;
    actualDate = actualSubjectId;
    actualSubjectId = null;
  }

  // Class-scoping for faculty via FacultyAssignment
  if (user && user.role === "FACULTY") {
    const assigned = await isFacultyAssigned({
      facultyId: user.userId || user.id || user.facultyId,
      classId,
      subjectId: actualSubjectId || undefined,
    });

    if (!assigned) {
      const error = new Error("Unauthorized: You are not assigned to this class or subject");
      error.statusCode = 403;
      throw error;
    }
  }

  const normalizedDate = normalizeUtcDate(actualDate);

  const filter = {
    classId: new mongoose.Types.ObjectId(classId),
    date: normalizedDate,
  };

  if (actualSubjectId && mongoose.Types.ObjectId.isValid(actualSubjectId)) {
    filter.subjectId = new mongoose.Types.ObjectId(actualSubjectId);
  }

  if (actualPeriod) {
    const periodNum = Number(actualPeriod);
    if (periodNum >= 1 && periodNum <= 7) {
      filter.period = periodNum;
    }
  }

  const records = await AttendanceRecord.find(filter)
    .populate("studentId", "nameEnglish registrationNumber photo house")
    .populate("subjectId", "name subjectName code subjectCode category")
    .populate("markedBy", "name")
    .sort({ period: 1 })
    .lean();

  return records;
};

/**
 * 13. Class Attendance Summary for a date/period/subject
 */
const getClassAttendanceSummary = async (classId, filter = {}, requestingUser) => {
  const StudentProfile = require("../students/student.model");
  const { isFacultyAssigned } = require("../academics/academic-auth.service");

  if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
    const error = new Error("Invalid classId");
    error.statusCode = 400;
    throw error;
  }

  if (requestingUser && requestingUser.role === "FACULTY") {
    const assigned = await isFacultyAssigned({
      facultyId: requestingUser.userId || requestingUser.id || requestingUser.facultyId,
      classId,
      subjectId: filter.subjectId || undefined,
    });

    if (!assigned) {
      const error = new Error("Unauthorized: You are not assigned to this class");
      error.statusCode = 403;
      throw error;
    }
  }

  const normalizedDate = normalizeUtcDate(filter.date || new Date());

  const totalEnrolled = await StudentProfile.countDocuments({
    classId,
    status: "ACTIVE",
    isDeleted: { $ne: true },
  });

  const query = {
    classId: new mongoose.Types.ObjectId(classId),
    date: normalizedDate,
  };

  if (filter.subjectId && mongoose.Types.ObjectId.isValid(filter.subjectId)) {
    query.subjectId = new mongoose.Types.ObjectId(filter.subjectId);
  }

  if (filter.period) {
    query.period = Number(filter.period);
  }

  const records = await AttendanceRecord.find(query).lean();

  const presentCount = records.filter((r) => r.status === "PRESENT").length;
  const absentCount = records.filter((r) => r.status === "ABSENT").length;
  const lateCount = records.filter((r) => r.status === "LATE").length;
  const leaveCount = records.filter((r) => r.status === "LEAVE" || r.status === "EXCUSED").length;

  const percentage =
    records.length > 0 ? Math.round((presentCount / records.length) * 10000) / 100 : null;

  return {
    classId,
    date: normalizedDate.toISOString().split("T")[0],
    period: filter.period ? Number(filter.period) : null,
    subjectId: filter.subjectId || null,
    totalEnrolled,
    totalMarked: records.length,
    presentCount,
    absentCount,
    lateCount,
    leaveCount,
    percentage,
  };
};

/**
 * 14. Faculty Attendance Marking Logs / History
 */
const getFacultyAttendanceSummary = async (facultyUserId, filter = {}) => {
  const FacultyProfile = require("../faculty/faculty.model");
  const User = require("../users/user.model");

  let markerUserId = facultyUserId;
  const faculty = await FacultyProfile.findOne({
    $or: [{ userId: facultyUserId }, { _id: facultyUserId }],
  }).lean();

  if (faculty && faculty.userId) {
    markerUserId = faculty.userId;
  }

  const match = { markedBy: new mongoose.Types.ObjectId(markerUserId) };

  if (filter.classId && mongoose.Types.ObjectId.isValid(filter.classId)) {
    match.classId = new mongoose.Types.ObjectId(filter.classId);
  }

  if (filter.subjectId && mongoose.Types.ObjectId.isValid(filter.subjectId)) {
    match.subjectId = new mongoose.Types.ObjectId(filter.subjectId);
  }

  if (filter.startDate || filter.endDate) {
    match.date = {};
    if (filter.startDate) match.date.$gte = normalizeUtcDate(filter.startDate);
    if (filter.endDate) {
      const endNorm = normalizeUtcDate(filter.endDate);
      match.date.$lte = new Date(Date.UTC(endNorm.getUTCFullYear(), endNorm.getUTCMonth(), endNorm.getUTCDate(), 23, 59, 59, 999));
    }
  }

  const logs = await AttendanceRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          classId: "$classId",
          subjectId: "$subjectId",
          date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          period: "$period",
          source: "$source",
        },
        studentsCount: { $sum: 1 },
        presentCount: { $sum: { $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0] } },
        absentCount: { $sum: { $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0] } },
        lateCount: { $sum: { $cond: [{ $eq: ["$status", "LATE"] }, 1, 0] } },
        leaveCount: { $sum: { $cond: [{ $in: ["$status", ["LEAVE", "EXCUSED"]] }, 1, 0] } },
        updatedAt: { $max: "$updatedAt" },
      },
    },
    {
      $lookup: {
        from: "classes",
        localField: "_id.classId",
        foreignField: "_id",
        as: "classDoc",
      },
    },
    { $unwind: { path: "$classDoc", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "subjects",
        localField: "_id.subjectId",
        foreignField: "_id",
        as: "subjectDoc",
      },
    },
    { $unwind: { path: "$subjectDoc", preserveNullAndEmptyArrays: true } },
    { $sort: { "_id.date": -1, "_id.period": 1 } },
  ]);

  return logs.map((log) => ({
    classId: log._id.classId,
    className: log.classDoc?.name || "Class",
    subjectId: log._id.subjectId,
    subjectName: log.subjectDoc?.subjectName || log.subjectDoc?.name || "Subject",
    date: log._id.date,
    period: log._id.period,
    sessionName: `Period ${log._id.period}`,
    source: log._id.source || "MANUAL",
    studentsCount: log.studentsCount,
    presentCount: log.presentCount,
    absentCount: log.absentCount,
    lateCount: log.lateCount,
    leaveCount: log.leaveCount,
    lastMarkedAt: log.updatedAt,
  }));
};

module.exports = {
  getStudentDailyAttendance,
  getStudentAttendanceOverview,
  getStudentMonthlyAttendance,
  getStudentSubjectAttendance,
  getStudentSessionAttendance,
  getStudentAttendanceHistory,
  resolveTimetableSession,
  processAttendanceEvent,
  createCorrectionRequest,
  reviewCorrectionRequest,
  markClassAttendance,
  getClassAttendanceRecords,
  getClassAttendanceSummary,
  getFacultyAttendanceSummary,
};
