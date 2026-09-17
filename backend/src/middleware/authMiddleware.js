const { verifyToken } = require("../utils/jwt");
const InstitutionProfile = require("../models/InstitutionProfile");
const StudentProfile = require("../models/StudentProfile");
const FacultyProfile = require("../models/FacultyProfile");

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

    // Attach profile references if available for fine-grained authorization
    if (decoded.role === "INSTITUTION") {
      const instProfile = await InstitutionProfile.findOne({ userId: decoded.userId }).lean();
      if (instProfile) {
        req.user.institutionId = instProfile._id;
      }
    } else if (decoded.role === "STUDENT") {
      const studentProfile = await StudentProfile.findOne({ userId: decoded.userId }).lean();
      if (studentProfile) {
        req.user.studentId = studentProfile._id;
        req.user.institutionId = studentProfile.institutionId;
      }
    } else if (decoded.role === "FACULTY") {
      const facultyProfile = await FacultyProfile.findOne({ userId: decoded.userId }).lean();
      if (facultyProfile) {
        req.user.facultyId = facultyProfile._id;
        req.user.institutionId = facultyProfile.institutionId;
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

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};

// Ownership verification middleware for INSTITUTION role
const enforceInstitutionScope = (paramOrBodyKey = "institutionId") => {
  return (req, res, next) => {
    if (req.user.role === "ADMIN") {
      return next(); // ADMIN bypasses institution scope
    }

    if (req.user.role === "INSTITUTION") {
      const targetInstId = req.params[paramOrBodyKey] || req.body[paramOrBodyKey] || req.query[paramOrBodyKey];
      if (targetInstId && targetInstId.toString() !== req.user.institutionId?.toString()) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You do not have permission to access another institution's resources",
        });
      }
    }

    next();
  };
};

module.exports = {
  requireAuth,
  requireRole,
  enforceInstitutionScope,
};