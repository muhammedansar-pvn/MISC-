const express = require("express");
const {
  registerStudent,
  getStudentProfile,
  handleGetStudents,
  handleGetStudentById,
  handleUpdateStudent,
} = require("../controllers/studentController");
const { validateStudent, validateUpdateStudent } = require("../validators/studentValidator");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  requireAuth,
  requireRole("ADMIN", "INSTITUTION"),
  validateStudent,
  registerStudent
);

router.get(
  "/profile",
  requireAuth,
  requireRole("STUDENT"),
  getStudentProfile
);

router.get(
  "/",
  requireAuth,
  requireRole("ADMIN", "INSTITUTION"),
  handleGetStudents
);

router.get(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "INSTITUTION"),
  handleGetStudentById
);

router.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "INSTITUTION"),
  validateUpdateStudent,
  handleUpdateStudent
);

module.exports = router;