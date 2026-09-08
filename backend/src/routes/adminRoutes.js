const express = require("express");

const {
  requireAuth,
  requireRole,
} = require("../middleware/authMiddleware");

const {
  registerStudent,
} = require("../controllers/studentController");
const {
  validateStudent,
} = require("../validators/studentValidator");

const router = express.Router();

router.post(
  "/students",
  requireAuth,
  requireRole("ADMIN"),
  registerStudent
);

module.exports = router;