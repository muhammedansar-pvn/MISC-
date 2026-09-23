const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const {
  createUserInvitation,
  verifyAdminUserOtp,
  resendAdminUserOtp,
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
  getDashboardStats,
} = require("./admin.controller");
const {
  validateUserInvitation,
  validateUpdateUser,
  validateUpdateUserStatus,
} = require("./admin.validator");

const router = express.Router();

router.get("/stats", requireAuth, requireRole("ADMIN"), getDashboardStats);
router.get("/users", requireAuth, requireRole("ADMIN"), getUsers);
router.get("/users/:id", requireAuth, requireRole("ADMIN"), getUserById);
router.post("/users", requireAuth, requireRole("ADMIN"), validateUserInvitation, createUserInvitation);
router.post("/users/verify-otp", requireAuth, requireRole("ADMIN"), verifyAdminUserOtp);
router.post("/users/resend-otp", requireAuth, requireRole("ADMIN"), resendAdminUserOtp);
router.patch("/users/:id", requireAuth, requireRole("ADMIN"), validateUpdateUser, updateUser);
router.patch("/users/:id/status", requireAuth, requireRole("ADMIN"), validateUpdateUserStatus, updateUserStatus);
router.delete("/users/:id", requireAuth, requireRole("ADMIN"), deleteUser);

const { handleRegisterStudentWithAccount } = require("../students/student.controller");
const { validateRegisterStudent, validateStudent } = require("../students/student.validator");

// Canonical Atomic Student Registration: POST /api/admin/students/register
router.post(
  "/students/register",
  requireAuth,
  requireRole("ADMIN", "INSTITUTION"),
  validateRegisterStudent,
  handleRegisterStudentWithAccount
);

// Legacy separate student registration route preservation
router.post("/students", requireAuth, requireRole("ADMIN"), (req, res, next) => {
  const { registerStudent } = require("../students/student.controller");
  return validateStudent(req, res, () => registerStudent(req, res, next));
});

module.exports = router;
