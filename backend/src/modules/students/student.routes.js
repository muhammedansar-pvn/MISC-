const express = require("express");
const {
  registerStudent,
  getStudentProfile,
  handleGetStudents,
  handleGetStudentById,
  handleUpdateStudent,
  handleUpdateStudentStatus,
  handleUpdateMyProfile,
  handleDeleteStudent,
} = require("./student.controller");
const { validateStudent, validateUpdateStudent } = require("./student.validator");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");

const router = express.Router();

router.post(
  "/",
  requireAuth,
  requireRole("ADMIN", "PRINCIPAL", "INSTITUTION"),
  validateStudent,
  registerStudent
);

router.get(
  "/profile",
  requireAuth,
  requireRole("STUDENT"),
  getStudentProfile
);

router.put(
  "/profile",
  requireAuth,
  requireRole("STUDENT"),
  validateUpdateStudent,
  handleUpdateMyProfile
);

router.get(
  "/",
  requireAuth,
  requireRole("ADMIN", "PRINCIPAL", "HOD", "ASATITHA", "FACULTY", "INSTITUTION"),
  handleGetStudents
);

router.get(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "PRINCIPAL", "HOD", "ASATITHA", "FACULTY", "INSTITUTION"),
  handleGetStudentById
);

router.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "PRINCIPAL", "INSTITUTION"),
  validateUpdateStudent,
  handleUpdateStudent
);

router.patch(
  "/:id/status",
  requireAuth,
  requireRole("ADMIN", "PRINCIPAL"),
  handleUpdateStudentStatus
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "PRINCIPAL"),
  handleDeleteStudent
);

module.exports = router;
