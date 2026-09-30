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
 * Comprehensive Dynamic Faculty Dashboard Data
 */
const getFacultyDashboardStats = async (userId) => {
  const FacultyAssignment = require("../academics/faculty-assignment.model");
  const Timetable = require("../academics/timetable.model");
  const AttendanceRecord = require("../attendance/attendance-record.model");
  const StudentProfile = require("../students/student.model");
  const Assignment = require("../assignments/assignment.model");
  const Leave = require("../leaves/leave.model");

  const faculty = await FacultyProfile.findOne({
    userId,
    isDeleted: { $ne: true },
  }).lean();

  if (!faculty) {
    return {
      assignedClassesCount: 0,
      assignedSubjectsCount: 0,
      totalStudentsCount: 0,
      todayClassesCount: 0,
      todayTimetable: [],
      unmarkedAttendanceCount: 0,
      pendingAssignmentsCount: 0,
      pendingLeavesCount: 0,
    };
  }

  // 1. Authoritative active assignments from FacultyAssignment
  const activeAssignments = await FacultyAssignment.find({
    facultyId: faculty._id,
    status: "ACTIVE",
  })
    .populate("classId", "name code department")
    .populate("subjectId", "name subjectName code subjectCode category")
    .lean();

  const distinctClassIds = [...new Set(activeAssignments.map((a) => a.classId?._id?.toString()).filter(Boolean))];
  const distinctSubjectIds = [...new Set(activeAssignments.map((a) => a.subjectId?._id?.toString()).filter(Boolean))];

  // 2. Fallback to legacy arrays if no FacultyAssignment records yet
  if (distinctClassIds.length === 0 && Array.isArray(faculty.assignedClasses)) {
    faculty.assignedClasses.forEach((cid) => {
      const idStr = cid?._id ? cid._id.toString() : cid?.toString();
      if (idStr) distinctClassIds.push(idStr);
    });
  }
  if (distinctSubjectIds.length === 0 && Array.isArray(faculty.assignedSubjects)) {
    faculty.assignedSubjects.forEach((sid) => {
      const idStr = sid?._id ? sid._id.toString() : sid?.toString();
      if (idStr) distinctSubjectIds.push(idStr);
    });
  }

  // 3. Total Students enrolled across authorized classes
  const totalStudentsCount = await StudentProfile.countDocuments({
    classId: { $in: distinctClassIds },
    status: "ACTIVE",
    isDeleted: { $ne: true },
  });

  // 4. Today's Day of Week & Timetable
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

  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

  const todayTimetable = await Timetable.find({
    facultyId: faculty._id,
    dayOfWeek: todayDayOfWeek,
    status: "ACTIVE",
    isDeleted: { $ne: true },
  })
    .populate("classId", "name code department")
    .populate("subjectId", "name subjectName code subjectCode category")
    .sort({ periodNumber: 1 })
    .lean();

  // 5. Unmarked Attendance Count for Today's scheduled periods
  let unmarkedAttendanceCount = 0;
  for (const entry of todayTimetable) {
    if (!entry.classId || !entry.subjectId) continue;
    const isMarked = await AttendanceRecord.exists({
      classId: entry.classId._id,
      subjectId: entry.subjectId._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      period: entry.periodNumber,
    });
    if (!isMarked) {
      unmarkedAttendanceCount++;
    }
  }

  // 6. Pending Active Assignments (due in future or today)
  const pendingAssignmentsCount = await Assignment.countDocuments({
    facultyId: faculty._id,
    isDeleted: false,
    dueDate: { $gte: startOfDay },
  });

  // 7. Pending Leaves count awaiting this faculty's review
  const studentsInAssignedClasses = await StudentProfile.find({
    classId: { $in: distinctClassIds },
    isDeleted: { $ne: true },
  }).select("_id").lean();

  const studentIds = studentsInAssignedClasses.map((s) => s._id);

  const pendingLeavesCount = await Leave.countDocuments({
    studentId: { $in: studentIds },
    status: "PENDING",
  });

  return {
    assignedClassesCount: distinctClassIds.length,
    assignedSubjectsCount: distinctSubjectIds.length,
    totalStudentsCount,
    todayClassesCount: todayTimetable.length,
    todayTimetable,
    unmarkedAttendanceCount,
    pendingAssignmentsCount,
    pendingLeavesCount,
    todayDayOfWeek,
  };
};

/**
 * Get Faculty Timetable (all active schedule entries for this faculty)
 */
const getFacultyMyTimetable = async (userId) => {
  const Timetable = require("../academics/timetable.model");
  const faculty = await FacultyProfile.findOne({
    userId,
    isDeleted: { $ne: true },
  }).lean();

  if (!faculty) return [];

  const DAY_ORDER = {
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
    SUNDAY: 7,
  };

  const entries = await Timetable.find({
    facultyId: faculty._id,
    status: "ACTIVE",
    isDeleted: { $ne: true },
  })
    .populate("classId", "name code department")
    .populate("subjectId", "name subjectName code subjectCode category type credits")
    .populate("academicYearId", "yearName yearCode")
    .lean();

  return entries.sort((a, b) => {
    const dayDiff = (DAY_ORDER[a.dayOfWeek] || 99) - (DAY_ORDER[b.dayOfWeek] || 99);
    if (dayDiff !== 0) return dayDiff;
    return a.periodNumber - b.periodNumber;
  });
};

/**
 * Get Dynamic Student Roster for Authorized Classes
 */
const getFacultyMyStudents = async (userId, classId = null) => {
  const StudentProfile = require("../students/student.model");
  const { isFacultyAssigned, getFacultyAuthorizedClasses } = require("../academics/academic-auth.service");

  const faculty = await FacultyProfile.findOne({
    userId,
    isDeleted: { $ne: true },
  }).lean();

  if (!faculty) return [];

  let targetClassIds = [];

  if (classId) {
    const isAssigned = await isFacultyAssigned({
      facultyId: faculty._id,
      classId,
    });
    if (!isAssigned) {
      const error = new Error("Access denied: You are not assigned to this class");
      error.statusCode = 403;
      throw error;
    }
    targetClassIds = [classId];
  } else {
    const authClasses = await getFacultyAuthorizedClasses(faculty._id);
    targetClassIds = authClasses.map((c) => c._id);
  }

  if (targetClassIds.length === 0) return [];

  const students = await StudentProfile.find({
    classId: { $in: targetClassIds },
    status: "ACTIVE",
    isDeleted: { $ne: true },
  })
    .populate("classId", "name code department")
    .populate("userId", "name email mobile")
    .sort({ nameEnglish: 1 })
    .lean();

  return students;
};

/**
 * Basic Faculty Student 360 View
 */
const getFacultyStudent360 = async (userId, studentId) => {
  const StudentProfile = require("../students/student.model");
  const AttendanceRecord = require("../attendance/attendance-record.model");
  const Assignment = require("../assignments/assignment.model");
  const FacultyRemark = require("../students/faculty-remark.model");
  const { isFacultyAssigned } = require("../academics/academic-auth.service");
  const { getStudentAttendanceOverview } = require("../attendance/attendance.service");
  const { getStudentTeachers } = require("../students/student.service");

  const faculty = await FacultyProfile.findOne({
    userId,
    isDeleted: { $ne: true },
  }).lean();

  if (!faculty) {
    const error = new Error("Faculty profile not found");
    error.statusCode = 404;
    throw error;
  }

  const student = await StudentProfile.findOne({
    _id: studentId,
    isDeleted: { $ne: true },
  })
    .populate("classId", "name code department academicYearId")
    .populate("userId", "name email mobile status")
    .lean();

  if (!student) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    throw error;
  }

  // Verify Faculty Academic Scope
  if (student.classId) {
    const isAssigned = await isFacultyAssigned({
      facultyId: faculty._id,
      classId: student.classId._id,
    });
    if (!isAssigned) {
      const error = new Error("Access denied: You are not assigned to teach this student's class");
      error.statusCode = 403;
      throw error;
    }
  }

  // 1. Attendance Overview & Recent 10 Records
  const attendanceOverview = await getStudentAttendanceOverview(student._id);
  const recentAttendance = await AttendanceRecord.find({ studentId: student._id })
    .populate("subjectId", "name subjectName code subjectCode")
    .sort({ date: -1, period: 1 })
    .limit(10)
    .lean();

  // 2. Faculty Remarks
  const remarks = await FacultyRemark.find({ studentId: student._id })
    .populate("subjectId", "name subjectName code subjectCode")
    .populate("facultyId", "nameEnglish designation")
    .sort({ createdAt: -1 })
    .lean();

  // 3. Class Teachers & Subjects
  const teachers = student.classId ? await getStudentTeachers(student.classId._id) : [];

  // 4. Recent Class Assignments
  const recentAssignments = student.classId
    ? await Assignment.find({ classId: student.classId._id, isDeleted: false })
        .populate("subjectId", "name subjectName code subjectCode")
        .sort({ dueDate: -1 })
        .limit(5)
        .lean()
    : [];

  return {
    student,
    attendanceOverview,
    recentAttendance,
    remarks,
    teachers,
    recentAssignments,
  };
};

/**
 * Add a Faculty Remark for an authorized student
 */
const createFacultyRemark = async (userId, studentId, data) => {
  const StudentProfile = require("../students/student.model");
  const FacultyRemark = require("../students/faculty-remark.model");
  const { isFacultyAssigned } = require("../academics/academic-auth.service");

  const faculty = await FacultyProfile.findOne({
    userId,
    isDeleted: { $ne: true },
  }).lean();

  if (!faculty) {
    const error = new Error("Faculty profile not found");
    error.statusCode = 404;
    throw error;
  }

  const student = await StudentProfile.findById(studentId).lean();
  if (!student) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    throw error;
  }

  // Authorization check
  const isAssigned = await isFacultyAssigned({
    facultyId: faculty._id,
    classId: student.classId,
    subjectId: data.subjectId || undefined,
  });

  if (!isAssigned) {
    const error = new Error("Access denied: You are not authorized to add remarks for this student");
    error.statusCode = 403;
    throw error;
  }

  const remarkDoc = await FacultyRemark.create({
    studentId: student._id,
    classId: student.classId,
    subjectId: data.subjectId || undefined,
    facultyId: faculty._id,
    academicYearId: student.academicYearId || undefined,
    category: data.category || "ACADEMIC",
    remark: data.remark.trim(),
    authorName: faculty.nameEnglish || "Faculty Member",
  });

  return FacultyRemark.findById(remarkDoc._id)
    .populate("subjectId", "name subjectName code subjectCode")
    .populate("facultyId", "nameEnglish designation")
    .lean();
};

/**
 * List remarks for an authorized student
 */
const getFacultyRemarks = async (userId, studentId) => {
  const StudentProfile = require("../students/student.model");
  const FacultyRemark = require("../students/faculty-remark.model");
  const { isFacultyAssigned } = require("../academics/academic-auth.service");

  const faculty = await FacultyProfile.findOne({
    userId,
    isDeleted: { $ne: true },
  }).lean();

  if (!faculty) return [];

  const student = await StudentProfile.findById(studentId).lean();
  if (!student) return [];

  const isAssigned = await isFacultyAssigned({
    facultyId: faculty._id,
    classId: student.classId,
  });

  if (!isAssigned) {
    const error = new Error("Access denied: You are not authorized to view remarks for this student");
    error.statusCode = 403;
    throw error;
  }

  return FacultyRemark.find({ studentId })
    .populate("subjectId", "name subjectName code subjectCode")
    .populate("facultyId", "nameEnglish designation")
    .sort({ createdAt: -1 })
    .lean();
};

module.exports = {
  createFaculty,
  getFacultyMembers,
  getFacultyById,
  ensureFacultyProfileForUser,
  updateFaculty,
  deleteFaculty,
  getFacultyDashboardStats,
  getFacultyMyTimetable,
  getFacultyMyStudents,
  getFacultyStudent360,
  createFacultyRemark,
  getFacultyRemarks,
};
