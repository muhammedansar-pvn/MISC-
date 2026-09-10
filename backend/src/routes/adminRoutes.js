const express = require("express");

const {
  requireAuth,
  requireRole,
} = require("../middleware/authMiddleware");

const {
  registerStudent,
} = require("../controllers/studentController");
const {
  createUserInvitation,
} = require("../controllers/adminUserController");
const {
  validateStudent,
} = require("../validators/studentValidator");

const router = express.Router();

router.post(
  "/students",
  requireAuth,
  requireRole("ADMIN"),
  validateStudent,
  registerStudent
);

router.post(
  "/users",
  requireAuth,
  requireRole("ADMIN"),
  createUserInvitation
);

module.exports = router;