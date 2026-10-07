const express = require("express");
const {
  handleGetAdminAnalytics,
  handleGetFacultyAnalytics,
  handleGetStudentAnalytics,
  handleGetParentAnalytics,
  handleGetExportReport,
} = require("./analytics.controller");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");

const router = express.Router();

// Admin Analytics Dashboard
router.get(
  "/admin",
  requireAuth,
  requireRole("ADMIN"),
  handleGetAdminAnalytics
);

// Faculty Analytics Dashboard (scoped to faculty assignments)
router.get(
  "/faculty",
  requireAuth,
  requireRole("FACULTY", "ADMIN"),
  handleGetFacultyAnalytics
);

// Student Personal Analytics & Academic Performance
router.get(
  "/student",
  requireAuth,
  requireRole("STUDENT", "ADMIN"),
  handleGetStudentAnalytics
);

// Parent Child Analytics & Alerts
router.get(
  "/parent",
  requireAuth,
  requireRole("PARENT", "ADMIN"),
  handleGetParentAnalytics
);

// Filterable Exportable Reports (CSV / Print tabular data)
router.get(
  "/export",
  requireAuth,
  handleGetExportReport
);

module.exports = router;
