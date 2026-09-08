const express = require("express");

const {
  getStudentProfile,
} = require("../controllers/studentController");

const {
  requireAuth,
  requireRole,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/profile",
  requireAuth,
  requireRole("STUDENT"),
  getStudentProfile
);

module.exports = router;