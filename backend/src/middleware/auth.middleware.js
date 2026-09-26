const { verifyToken } = require("../shared/utils/jwt");

// Lazy model accessor to avoid premature loading or circular dependency risks
const getModels = () => ({
  InstitutionProfile: require("../modules/institutions/institution.model"),
  StudentProfile: require("../modules/students/student.model"),
  FacultyProfile: require("../modules/faculty/faculty.model"),
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

    const { InstitutionProfile, StudentProfile, FacultyProfile } = getModels();

    // Attach profile references if available for fine-grained authorization
    if (decoded.role === "STUDENT") {
      const studentProfile = await StudentProfile.findOne({ userId: decoded.userId }).lean();
      if (studentProfile) {
        req.user.studentId = studentProfile._id;
        if (studentProfile.institutionId) {
          req.user.institutionId = studentProfile.institutionId;
        }
      }
    } else if (decoded.role === "FACULTY" || decoded.role === "ASATITHA") {
      const facultyProfile = await FacultyProfile.findOne({ userId: decoded.userId }).lean();
      if (facultyProfile) {
        req.user.facultyId = facultyProfile._id;
        if (facultyProfile.institutionId) {
          req.user.institutionId = facultyProfile.institutionId;
        }
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
