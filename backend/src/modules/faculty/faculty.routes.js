const express = require("express");
const {
  handleCreateFaculty,
  handleGetFacultyMembers,
  handleGetFacultyById,
  handleUpdateFaculty,
  handleUpdateFacultyStatus,
  handleDeleteFaculty,
  handleGetFacultyDashboard,
  handleGetFacultyMyTimetable,
  handleGetFacultyMyStudents,
  handleGetFacultyStudent360,
  handleCreateFacultyRemark,
  handleGetFacultyRemarks,
} = require("./faculty.controller");
const {
  validateCreateFaculty,
  validateUpdateFaculty,
  validateUpdateFacultyStatus,
} = require("./faculty.validator");
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
  requireRole("ADMIN", "PRINCIPAL", "HOD", "FACULTY", "INSTITUTION"),
  handleGetFacultyMembers
);

router.get(
  "/dashboard-stats",
  requireAuth,
  requireRole("FACULTY"),
  handleGetFacultyDashboard
);

router.get(
  "/my-timetable",
  requireAuth,
  requireRole("FACULTY"),
  handleGetFacultyMyTimetable
);

router.get(
  "/my-students",
  requireAuth,
  requireRole("FACULTY"),
  handleGetFacultyMyStudents
);

router.get(
  "/students/:id/360",
  requireAuth,
  requireRole("FACULTY"),
  handleGetFacultyStudent360
);

router.post(
  "/students/:id/remarks",
  requireAuth,
  requireRole("FACULTY"),
  handleCreateFacultyRemark
);

router.get(
  "/students/:id/remarks",
  requireAuth,
  requireRole("FACULTY"),
  handleGetFacultyRemarks
);

router.get(
  "/profile",
  requireAuth,
  requireRole("ADMIN", "PRINCIPAL", "HOD", "FACULTY", "INSTITUTION"),
  handleGetFacultyById
);

router.get(
  "/me",
  requireAuth,
  requireRole("ADMIN", "PRINCIPAL", "HOD", "FACULTY", "INSTITUTION"),
  handleGetFacultyById
);

const {
  handleGetFacultyMyAssignments,
  handleGetFacultyMyClasses,
} = require("../academics/faculty-assignment.controller");

router.get(
  "/my-assignments",
  requireAuth,
  requireRole("FACULTY"),
  handleGetFacultyMyAssignments
);

router.get(
  "/my-classes",
  requireAuth,
  requireRole("FACULTY"),
  handleGetFacultyMyClasses
);

router.get(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "PRINCIPAL", "HOD", "FACULTY", "INSTITUTION"),
  handleGetFacultyById
);

router.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "INSTITUTION"),
  validateUpdateFaculty,
  handleUpdateFaculty
);

router.patch(
  "/:id/status",
  requireAuth,
  requireRole("ADMIN"),
  validateUpdateFacultyStatus,
  handleUpdateFacultyStatus
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  handleDeleteFaculty
);

module.exports = router;
