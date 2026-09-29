const FacultyProfile = require("./faculty.model");
const User = require("../users/user.model");
const { escapeRegex } = require("../../shared/utils/regex");

const createFaculty = async (facultyData) => {
  const user = await User.findById(facultyData.userId);
  if (!user || user.isDeleted) {
    const err = new Error("User account not found");
    err.statusCode = 404;
    throw err;
  }

  const allowedRoles = ["FACULTY", "HOD", "PRINCIPAL"];
  if (!allowedRoles.includes(user.role)) {
    const err = new Error(`Selected user must have one of the following roles: ${allowedRoles.join(", ")}`);
    err.statusCode = 400;
    throw err;
  }

  const existingProfileByUser = await FacultyProfile.findOne({ userId: facultyData.userId });
  if (existingProfileByUser) {
    const err = new Error("This user already has a faculty profile.");
    err.statusCode = 409;
    throw err;
  }

  const existingFaculty = await FacultyProfile.exists({ facultyId: facultyData.facultyId });
  if (existingFaculty) {
    const err = new Error("Faculty ID already exists");
    err.statusCode = 409;
    throw err;
  }

  const createdFaculty = await FacultyProfile.create(facultyData);
  return FacultyProfile.findById(createdFaculty._id)
    .populate("userId", "name email username role status mobile")
    .populate("institutionId", "name code")
    .populate("assignedClasses", "name code")
    .populate("assignedSubjects", "subjectName subjectCode category")
    .lean();
};

const getFacultyMembers = async (filter = {}, search = "", pagination = null) => {
  const query = { isDeleted: { $ne: true }, ...filter };

  if (search) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
    query.$or = [
      { facultyId: searchRegex },
      { nameEnglish: searchRegex },
      { nameArabic: searchRegex },
      { contactNumber: searchRegex },
      { department: searchRegex },
    ];
  }

  if (pagination) {
    const [data, total] = await Promise.all([
      FacultyProfile.find(query)
        .populate("userId", "name email username role status mobile")
        .populate("institutionId", "name code")
        .populate("assignedClasses", "name code")
        .populate("assignedSubjects", "subjectName subjectCode category")
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      FacultyProfile.countDocuments(query),
    ]);
    return { data, total };
  }

  return FacultyProfile.find(query)
    .populate("userId", "name email username role status mobile")
    .populate("institutionId", "name code")
    .populate("assignedClasses", "name code")
    .populate("assignedSubjects", "subjectName subjectCode category")
    .sort({ createdAt: -1 })
    .lean();
};

const getFacultyById = async (id) => {
  if (!id) return null;
  const mongoose = require("mongoose");
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  return FacultyProfile.findOne({
    $or: [{ _id: id }, { userId: id }],
    isDeleted: { $ne: true },
  })
    .populate("userId", "name email username role status mobile")
    .populate("institutionId", "name code")
    .populate("assignedClasses", "name code")
    .populate("assignedSubjects", "subjectName subjectCode category")
    .lean();
};

const ensureFacultyProfileForUser = async (userId) => {
  let profile = await FacultyProfile.findOne({ userId, isDeleted: { $ne: true } });
  if (profile) return profile;

  const user = await User.findById(userId);
  if (!user || user.role !== "FACULTY" || user.isDeleted === true) {
    return null;
  }

  const facultyId = `FAC-${user._id.toString().slice(-6).toUpperCase()}`;

  try {
    profile = await FacultyProfile.create({
      userId: user._id,
      facultyId,
      nameEnglish: user.name || "Faculty Member",
      department: user.department || undefined,
      contactNumber: user.mobile || undefined,
      status: user.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
      assignedClasses: [],
      assignedSubjects: [],
      isDeleted: false,
    });
    return profile;
  } catch (err) {
    if (err.code === 11000) {
      profile = await FacultyProfile.findOne({ userId: user._id, isDeleted: { $ne: true } });
      if (profile) return profile;
    }
    throw err;
  }
};

const updateFaculty = async (id, updateData) => {
  return FacultyProfile.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
    .populate("userId", "name email username role status mobile")
    .populate("institutionId", "name code")
    .populate("assignedClasses", "name code")
    .populate("assignedSubjects", "subjectName subjectCode category")
    .lean();
};

const deleteFaculty = async (id, hardDelete = false) => {
  if (hardDelete) {
    return FacultyProfile.findByIdAndDelete(id);
  }
  return FacultyProfile.findByIdAndUpdate(
    id,
    { status: "INACTIVE", isDeleted: true },
    { new: true }
  );
};

/**
 * Compute faculty dashboard action counters:
 * 1. Today's scheduled periods not yet marked for attendance across assigned classes
 * 2. Pending leave requests awaiting this faculty's approval
 */
const getFacultyDashboardStats = async (userId) => {
  const faculty = await FacultyProfile.findOne({
    userId,
    isDeleted: { $ne: true },
  }).lean();

  if (!faculty || !Array.isArray(faculty.assignedClasses) || faculty.assignedClasses.length === 0) {
    return {
      unmarkedAttendanceCount: 0,
      pendingLeavesCount: 0,
      assignedClassesCount: 0,
    };
  }

  const assignedClassIds = faculty.assignedClasses.map((id) =>
    id._id ? id._id : id
  );

  // Day of week determination matching TimetableEntry DAYS_OF_WEEK enum exactly
  // TimetableEntry enum: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]
  const DAYS_OF_WEEK_MAP = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  const now = new Date();
  const todayDayOfWeek = DAYS_OF_WEEK_MAP[now.getUTCDay()];

  // Start and end of today in UTC matching AttendanceRecord storage convention
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

  const Timetable = require("../academics/timetable.model");
  const AttendanceRecord = require("../attendance/attendance-record.model");
  const StudentProfile = require("../students/student.model");
  const Leave = require("../leaves/leave.model");

  let unmarkedAttendanceCount = 0;

  for (const classId of assignedClassIds) {
    // Query actual scheduled periods for this class on today's day of week
    const scheduledEntries = await Timetable.find({
      classId,
      dayOfWeek: todayDayOfWeek,
      status: "ACTIVE",
      isDeleted: { $ne: true },
    }).select("periodNumber").lean();

    if (!scheduledEntries || scheduledEntries.length === 0) {
      continue; // 0 scheduled periods today -> contributes 0
    }

    const scheduledPeriods = [...new Set(scheduledEntries.map((e) => e.periodNumber))];

    // Query periods already marked in AttendanceRecord for this class today
    const markedPeriods = await AttendanceRecord.distinct("period", {
      classId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const unmarkedForClass = scheduledPeriods.filter(
      (p) => !markedPeriods.includes(p)
    ).length;

    unmarkedAttendanceCount += Math.max(0, unmarkedForClass);
  }

  // Pending Leaves count awaiting this faculty's approval
  const studentsInAssignedClasses = await StudentProfile.find({
    classId: { $in: assignedClassIds },
    isDeleted: { $ne: true },
  }).select("_id").lean();

  const studentIds = studentsInAssignedClasses.map((s) => s._id);

  const pendingLeavesCount = await Leave.countDocuments({
    studentId: { $in: studentIds },
    status: "PENDING",
  });

  return {
    unmarkedAttendanceCount,
    pendingLeavesCount,
    assignedClassesCount: assignedClassIds.length,
  };
};

module.exports = {
  createFaculty,
  getFacultyMembers,
  getFacultyById,
  ensureFacultyProfileForUser,
  updateFaculty,
  deleteFaculty,
  getFacultyDashboardStats,
};
