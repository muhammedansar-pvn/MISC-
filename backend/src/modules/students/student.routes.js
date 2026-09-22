const express = require("express");
const {
  registerStudent,
  getStudentProfile,
  handleGetStudents,
  handleGetStudentById,
  handleUpdateStudent,
} = require("./student.controller");
const { validateStudent, validateUpdateStudent } = require("./student.validator");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");

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
