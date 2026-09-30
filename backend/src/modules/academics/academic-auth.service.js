const FacultyAssignment = require("./faculty-assignment.model");
const FacultyProfile = require("../faculty/faculty.model");
const StudentProfile = require("../students/student.model");
const Class = require("./class.model");
const Subject = require("./subject.model");

/**
 * Resolves FacultyProfile _id given either a FacultyProfile _id or User _id.
 */
const resolveFacultyProfileId = async (facultyIdOrUserId) => {
  if (!facultyIdOrUserId) return null;

  // First check if it's directly a FacultyProfile _id
  const profile = await FacultyProfile.findById(facultyIdOrUserId).select("_id userId");
  if (profile) return profile._id;

  // Otherwise check if it's a User _id
  const profileByUser = await FacultyProfile.findOne({ userId: facultyIdOrUserId }).select("_id");
  if (profileByUser) return profileByUser._id;

  return null;
};

/**
 * Check if a faculty member is assigned to a specific class, subject, and/or academic year.
 * @param {Object} params
 * @param {string|ObjectId} params.facultyId - FacultyProfile._id or User._id
 * @param {string|ObjectId} [params.classId]
 * @param {string|ObjectId} [params.subjectId]
 * @param {string|ObjectId} [params.academicYearId]
 * @returns {Promise<boolean>}
 */
const isFacultyAssigned = async ({ facultyId, classId, subjectId, academicYearId }) => {
  const profileId = await resolveFacultyProfileId(facultyId);
  if (!profileId) return false;

  const query = {
    facultyId: profileId,
    status: "ACTIVE",
  };

  if (classId) query.classId = classId;
  if (subjectId) query.subjectId = subjectId;
  if (academicYearId) query.academicYearId = academicYearId;

  const count = await FacultyAssignment.countDocuments(query);
  return count > 0;
};

/**
 * Get all authorized classes for a faculty member.
 * @param {string|ObjectId} facultyId - FacultyProfile._id or User._id
 * @param {string|ObjectId} [academicYearId]
 * @returns {Promise<Array>} Array of populated Class documents
 */
const getFacultyAuthorizedClasses = async (facultyId, academicYearId = null) => {
  const profileId = await resolveFacultyProfileId(facultyId);
  if (!profileId) return [];

  const query = {
    facultyId: profileId,
    status: "ACTIVE",
  };
  if (academicYearId) query.academicYearId = academicYearId;

  const classIds = await FacultyAssignment.distinct("classId", query);
  if (!classIds || classIds.length === 0) {
    // Backward-compatibility check: inspect FacultyProfile.assignedClasses
    const profile = await FacultyProfile.findById(profileId).select("assignedClasses");
    if (profile && profile.assignedClasses && profile.assignedClasses.length > 0) {
      return Class.find({ _id: { $in: profile.assignedClasses }, status: "ACTIVE" }).lean();
    }
    return [];
  }

  return Class.find({ _id: { $in: classIds }, status: "ACTIVE" }).lean();
};

/**
 * Get all authorized subjects for a faculty member in a specific class.
 * @param {string|ObjectId} facultyId - FacultyProfile._id or User._id
 * @param {string|ObjectId} classId
 * @param {string|ObjectId} [academicYearId]
 * @returns {Promise<Array>} Array of populated Subject documents
 */
const getFacultyAuthorizedSubjects = async (facultyId, classId, academicYearId = null) => {
  const profileId = await resolveFacultyProfileId(facultyId);
  if (!profileId) return [];

  const query = {
    facultyId: profileId,
    classId,
    status: "ACTIVE",
  };
  if (academicYearId) query.academicYearId = academicYearId;

  const subjectIds = await FacultyAssignment.distinct("subjectId", query);
  if (!subjectIds || subjectIds.length === 0) {
    return [];
  }

  return Subject.find({ _id: { $in: subjectIds }, status: "ACTIVE" }).lean();
};

/**
 * Get all authorized students for a faculty member in a given class.
 * Ensures the faculty is assigned to this class before returning the roster.
 * @param {string|ObjectId} facultyId - FacultyProfile._id or User._id
 * @param {string|ObjectId} classId
 * @returns {Promise<Array>}
 */
const getFacultyAuthorizedStudents = async (facultyId, classId) => {
  const isAssigned = await isFacultyAssigned({ facultyId, classId });
  if (!isAssigned) {
    const error = new Error("Access denied: You are not assigned to this class");
    error.statusCode = 403;
    throw error;
  }

  return StudentProfile.find({
    classId,
    status: "ACTIVE",
    isDeleted: { $ne: true },
  })
    .populate("userId", "name email username mobile")
    .lean();
};

/**
 * Express middleware to enforce faculty academic scope on endpoints that accept classId and/or subjectId.
 * Admins, Principals, and HODs bypass this check.
 * @param {Object} options
 * @param {string} [options.classParam="classId"] - req.params or req.body property name
 * @param {string} [options.subjectParam="subjectId"] - req.params or req.body property name
 */
const requireFacultyAcademicScope = (options = {}) => {
  const classKey = options.classParam || "classId";
  const subjectKey = options.subjectParam || "subjectId";

  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: "Authentication required" });
      }

      // Elevated roles bypass scope restriction
      if (["ADMIN", "PRINCIPAL", "HOD", "INSTITUTION"].includes(user.role)) {
        return next();
      }

      if (user.role !== "FACULTY") {
        return res.status(403).json({ success: false, message: "Forbidden: Faculty role required" });
      }

      const classId = req.params[classKey] || req.query[classKey] || req.body[classKey];
      const subjectId = req.params[subjectKey] || req.query[subjectKey] || req.body[subjectKey];

      if (!classId && !subjectId) {
        return next();
      }

      const assigned = await isFacultyAssigned({
        facultyId: user.userId || user._id,
        classId: classId || undefined,
        subjectId: subjectId || undefined,
      });

      if (!assigned) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are not authorized for this class/subject assignment",
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message || "Authorization check failed" });
    }
  };
};

module.exports = {
  resolveFacultyProfileId,
  isFacultyAssigned,
  getFacultyAuthorizedClasses,
  getFacultyAuthorizedSubjects,
  getFacultyAuthorizedStudents,
  requireFacultyAcademicScope,
};
