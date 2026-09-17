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
  getUsers,
  getUserById,
  getDashboardStats,
} = require("../controllers/adminUserController");
const {
  validateStudent,
} = require("../validators/studentValidator");

const router = express.Router();

router.get(
  "/stats",
  requireAuth,
  requireRole("ADMIN"),
  getDashboardStats
);

router.get(
  "/users",
  requireAuth,
  requireRole("ADMIN"),
  getUsers
);

router.get(
  "/users/:id",
  requireAuth,
  requireRole("ADMIN"),
  getUserById
);

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