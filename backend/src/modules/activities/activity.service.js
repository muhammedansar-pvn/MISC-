const Activity = require("./activity.model");
const StudentAchievement = require("./student-achievement.model");
const StudentProfile = require("../students/student.model");
const FacultyProfile = require("../faculty/faculty.model");
const ParentProfile = require("../parents/parent.model");

const createActivity = async (activityData) => {
  return Activity.create(activityData);
};

const listActivities = async (query = {}) => {
  const filter = { isActive: true };
  if (query.category) filter.category = query.category;
  if (query.academicYearId) filter.academicYearId = query.academicYearId;
  return Activity.find(filter).sort({ name: 1 });
};

/**
 * Records a student achievement.
 * STRICT RBAC:
 * - If STUDENT role: ignores/overrides client studentId with reqUser.studentId; sets status=PENDING.
 * - If ASATITHA role: checks that student belongs to Asatitha's assigned classes.
 */
const recordAchievement = async (achievementData, reqUser) => {
  let targetStudentId;
  let status = "PENDING";
  let verifiedBy = null;
  let verifiedAt = null;

  if (reqUser.role === "STUDENT") {
    if (!reqUser.studentId) {
      const err = new Error("No student profile linked to your user account");
      err.statusCode = 404;
      throw err;
    }
    // Anti-spoofing: ignore client studentId
    targetStudentId = reqUser.studentId;
  } else if (reqUser.role === "ASATITHA" || reqUser.role === "FACULTY") {
    if (!achievementData.studentId) {
      const err = new Error("studentId is required");
      err.statusCode = 400;
      throw err;
    }
    const faculty = await FacultyProfile.findOne({ userId: reqUser.userId });
    const student = await StudentProfile.findById(achievementData.studentId);
    if (!faculty || !student) {
      const err = new Error("Profile not found");
      err.statusCode = 404;
      throw err;
    }

    const isClassTeacher =
      student.classId &&
      faculty.assignedClasses &&
      faculty.assignedClasses.some((cId) => cId.toString() === student.classId.toString());

    if (!isClassTeacher) {
      const err = new Error("Unauthorized: student does not belong to your assigned classes");
      err.statusCode = 403;
      throw err;
    }

    targetStudentId = student._id;
    if (achievementData.status === "VERIFIED") {
      status = "VERIFIED";
      verifiedBy = reqUser.userId;
      verifiedAt = new Date();
    }
  } else if (reqUser.role === "ADMIN") {
    if (!achievementData.studentId) {
      const err = new Error("studentId is required");
      err.statusCode = 400;
      throw err;
    }
    targetStudentId = achievementData.studentId;
    if (achievementData.status === "VERIFIED") {
      status = "VERIFIED";
      verifiedBy = reqUser.userId;
      verifiedAt = new Date();
    }
  } else {
    const err = new Error("Unauthorized role for recording achievements");
    err.statusCode = 403;
    throw err;
  }

  const payload = {
    studentId: targetStudentId,
    activityId: achievementData.activityId,
    academicYearId: achievementData.academicYearId,
    stage: achievementData.stage || "PARTICIPATION",
    marksObtained: Number(achievementData.marksObtained) || 0,
    rankPosition: achievementData.rankPosition || "PARTICIPATION",
    certificateUrl: achievementData.certificateUrl,
    remarks: achievementData.remarks,
    status,
  };

  if (verifiedBy) {
    payload.verifiedBy = verifiedBy;
    payload.verifiedAt = verifiedAt;
  }

  const achievement = await StudentAchievement.findOneAndUpdate(
    {
      studentId: targetStudentId,
      activityId: achievementData.activityId,
      academicYearId: achievementData.academicYearId,
    },
    payload,
    { upsert: true, new: true, runValidators: true }
  ).populate("activityId", "name category")
   .populate("studentId", "nameEnglish registrationNumber classId house");

  return achievement;
};

/**
 * Verifies or rejects an achievement.
 * ADMIN or assigned ASATITHA only.
 */
const verifyAchievement = async (achievementId, reqUser, { status, remarks }) => {
  const achievement = await StudentAchievement.findById(achievementId).populate("studentId");
  if (!achievement) {
    const err = new Error("Achievement record not found");
    err.statusCode = 404;
    throw err;
  }

  if (reqUser.role !== "ADMIN") {
    const faculty = await FacultyProfile.findOne({ userId: reqUser.userId });
    if (!faculty) {
      const err = new Error("Faculty profile not found");
      err.statusCode = 403;
      throw err;
    }
    const student = achievement.studentId;
    const isClassTeacher =
      student &&
      student.classId &&
      faculty.assignedClasses &&
      faculty.assignedClasses.some((cId) => cId.toString() === student.classId.toString());

    if (!isClassTeacher) {
      const err = new Error("Unauthorized: student does not belong to your assigned classes");
      err.statusCode = 403;
      throw err;
    }
  }

  achievement.status = status || "VERIFIED";
  achievement.verifiedBy = reqUser.userId;
  achievement.verifiedAt = new Date();
  if (remarks) achievement.remarks = remarks;

  await achievement.save();
  return achievement;
};

const getMyAchievements = async (studentId) => {
  return StudentAchievement.find({ studentId })
    .populate("activityId", "name category description")
    .populate("academicYearId", "yearName yearCode")
    .sort({ createdAt: -1 });
};

const getStudentAchievements = async (studentId, reqUser) => {
  if (reqUser.role === "STUDENT") {
    if (!reqUser.studentId || reqUser.studentId.toString() !== studentId.toString()) {
      const err = new Error("Access denied: students can only access their own achievements");
      err.statusCode = 403;
      throw err;
    }
  } else if (reqUser.role === "PARENT") {
    const parent = await ParentProfile.findOne({ userId: reqUser.userId });
    if (!parent || !parent.studentIds.map((id) => id.toString()).includes(studentId.toString())) {
      const err = new Error("Access denied: student is not linked to your parent account");
      err.statusCode = 403;
      throw err;
    }
  }

  return StudentAchievement.find({ studentId })
    .populate("activityId", "name category description")
    .populate("academicYearId", "yearName yearCode")
    .populate("verifiedBy", "name email")
    .sort({ createdAt: -1 });
};

module.exports = {
  createActivity,
  listActivities,
  recordAchievement,
  verifyAchievement,
  getMyAchievements,
  getStudentAchievements,
};
