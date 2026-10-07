const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const {
  getMyProfile,
  getMyStudents,
  getLinkedStudentById,
  getLinkedStudentSyllabus,
} = require("./parent.controller");

const router = express.Router();

// All parent routes require authentication and PARENT role
router.use(requireAuth);
router.use(requireRole("PARENT"));

router.get("/me", getMyProfile);
router.get("/students", getMyStudents);
router.get("/students/:studentId", getLinkedStudentById);
router.get("/students/:studentId/syllabus", getLinkedStudentSyllabus);

module.exports = router;
