const { verifyToken } = require("../shared/utils/jwt");
const User = require("../modules/users/user.model");

// Lazy model accessor to avoid premature loading or circular dependency risks
const getModels = () => ({
  InstitutionProfile: require("../modules/institutions/institution.model"),
  StudentProfile: require("../modules/students/student.model"),
  FacultyProfile: require("../modules/faculty/faculty.model"),
  ParentProfile: require("../modules/parents/parent.model"),
});

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    req.user = decoded;
    req.user.id = decoded.userId; // Ensure req.user.id is consistently populated across controllers
    req.user.userId = decoded.userId;

    // Database-backed verification: Enforce that user exists, is not deleted, and is active for ALL roles
    const user = await User.findById(decoded.userId).select("role status isDeleted name email username");
    if (!user || user.isDeleted === true || user.status !== "ACTIVE" || user.role !== decoded.role) {
      return res.status(401).json({
        success: false,
        message: "Account is not active or has been deactivated",
      });
    }

    const { InstitutionProfile, StudentProfile, FacultyProfile, ParentProfile } = getModels();

    // Attach profile references and verify profile-level active status
    if (decoded.role === "STUDENT") {
      let studentProfile = await StudentProfile.findOne({ userId: decoded.userId }).lean();
      if (!studentProfile) {
        try {
          const { ensureStudentProfileForUser } = require("../modules/students/student.service");
          const doc = await ensureStudentProfileForUser(decoded.userId);
          if (doc) studentProfile = doc.toObject ? doc.toObject() : doc;
        } catch (e) {
          // Non-fatal fallback
        }
      }
      if (studentProfile) {
        if (studentProfile.isDeleted === true || studentProfile.status === "INACTIVE" || studentProfile.status === "SUSPENDED") {
          return res.status(401).json({
            success: false,
            message: "Student account is not active",
          });
        }
        req.user.studentId = studentProfile._id;
        if (studentProfile.classId) {
          req.user.classId = studentProfile.classId;
        }
        if (studentProfile.institutionId) {
          req.user.institutionId = studentProfile.institutionId;
        }
      }
    } else if (["FACULTY", "HOD", "PRINCIPAL"].includes(decoded.role)) {
      const facultyProfile = await FacultyProfile.findOne({ userId: decoded.userId }).lean();
      if (facultyProfile && (facultyProfile.isDeleted === true || facultyProfile.status === "INACTIVE")) {
        return res.status(401).json({
          success: false,
          message: "Faculty account is not active",
        });
      }
      if (facultyProfile) {
        req.user.facultyId = facultyProfile._id;
        if (facultyProfile.institutionId) {
          req.user.institutionId = facultyProfile.institutionId;
        }
      }
    } else if (decoded.role === "PARENT") {
      const parentProfile = await ParentProfile.findOne({ userId: decoded.userId }).lean();
      if (parentProfile && (parentProfile.isDeleted === true || parentProfile.status === "INACTIVE")) {
        return res.status(401).json({
          success: false,
          message: "Parent account is not active",
        });
      }
      if (parentProfile) {
        req.user.parentId = parentProfile._id;
        req.user.parentStudentIds = (parentProfile.studentIds || []).map((id) => id.toString());
      }
    } else if (decoded.role === "INSTITUTION") {
      // Legacy backward-compatibility for existing sessions
      const instProfile = await InstitutionProfile.findOne({ userId: decoded.userId }).lean();
      if (instProfile) {
        req.user.institutionId = instProfile._id;
      }
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/**
 * Legacy institution scope middleware:
 * Single-institute Markaz Sanaviyya architecture does not enforce multi-tenant isolation.
 * Preserved as pass-through for backwards compatibility with any remaining route declarations.
 */
const enforceInstitutionScope = () => {
  return (req, res, next) => {
    next();
  };
};

module.exports = {
  requireAuth,
  enforceInstitutionScope,
};
