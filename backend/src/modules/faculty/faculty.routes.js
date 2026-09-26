const express = require("express");
const {
  handleCreateFaculty,
  handleGetFacultyMembers,
  handleGetFacultyById,
  handleUpdateFaculty,
  handleDeleteFaculty,
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
  requireRole("ADMIN", "PRINCIPAL", "HOD", "ASATITHA", "FACULTY", "INSTITUTION"),
  handleGetFacultyMembers
);

router.get(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "PRINCIPAL", "HOD", "ASATITHA", "FACULTY", "INSTITUTION"),
  handleGetFacultyById
);

router.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "INSTITUTION"),
  validateUpdateFaculty,
  handleUpdateFaculty
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  handleDeleteFaculty
);

module.exports = router;
