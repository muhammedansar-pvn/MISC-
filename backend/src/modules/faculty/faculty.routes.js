const express = require("express");
const {
  handleCreateFaculty,
  handleGetFacultyMembers,
  handleGetFacultyById,
  handleUpdateFaculty,
} = require("./faculty.controller");
const { validateCreateFaculty, validateUpdateFaculty } = require("./faculty.validator");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");

const router = express.Router();

router.post(
  "/",
  requireAuth,
  requireRole("ADMIN", "INSTITUTION"),
  validateCreateFaculty,
  handleCreateFaculty
);

router.get(
  "/",
  requireAuth,
  requireRole("ADMIN", "INSTITUTION"),
  handleGetFacultyMembers
);

router.get(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "INSTITUTION", "FACULTY"),
  handleGetFacultyById
);

router.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "INSTITUTION"),
  validateUpdateFaculty,
  handleUpdateFaculty
);

module.exports = router;
