const express = require("express");
const {
  handleCreateFaculty,
  handleGetFacultyMembers,
  handleGetFacultyById,
  handleUpdateFaculty,
} = require("../controllers/facultyController");
const { validateCreateFaculty, validateUpdateFaculty } = require("../validators/facultyValidator");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

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
