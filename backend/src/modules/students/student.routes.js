const express = require("express");
const {
  registerStudent,
  getStudentProfile,
  handleGetStudents,
  handleGetStudentById,
  handleUpdateStudent,
  handleUpdateStudentStatus,
  handleUpdateMyProfile,
  handleUploadMyPhoto,
  handleDeleteMyPhoto,
  handleDeleteStudent,
  handleGetMyTeachers,
  handleLinkParent,
  handleGetLinkedParent,
  handleResendParentVerificationOtp,
} = require("./student.controller");
const { validateStudent, validateUpdateStudent, validateUpdateMyProfile } = require("./student.validator");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const { uploadProfilePhoto } = require("../../middleware/upload.middleware");

const {
  handleGetMyTimetable,
} = require("../academics/timetable.controller");

const router = express.Router();

router.post(
  "/",
  requireAuth,
  requireRole("ADMIN", "INSTITUTION"),
  validateStudent,
  registerStudent
);

router.get(
  "/profile",
  requireAuth,
  requireRole("STUDENT"),
  getStudentProfile
);

router.get(
  "/parent",
  requireAuth,
  requireRole("STUDENT"),
  handleGetLinkedParent
);

router.post(
  "/parent",
  requireAuth,
  requireRole("STUDENT"),
  handleLinkParent
);

router.post(
  "/parent/initiate-verification",
  requireAuth,
  requireRole("STUDENT"),
  handleLinkParent
);

router.post(
  "/parent/resend-otp",
  requireAuth,
  requireRole("STUDENT"),
  handleResendParentVerificationOtp
);

router.get(
  "/timetable",
  requireAuth,
  requireRole("STUDENT"),
  handleGetMyTimetable
);

router.get(
  "/teachers",
  requireAuth,
  requireRole("STUDENT"),
  handleGetMyTeachers
);

router.put(
  "/profile",
  requireAuth,
  requireRole("STUDENT"),
  validateUpdateMyProfile,
  handleUpdateMyProfile
);

router.post(
  "/profile/photo",
  requireAuth,
  requireRole("STUDENT"),
  uploadProfilePhoto("photo"),
  handleUploadMyPhoto
);

router.delete(
  "/profile/photo",
  requireAuth,
  requireRole("STUDENT"),
  handleDeleteMyPhoto
);

router.get(
  "/",
  requireAuth,
  requireRole("ADMIN", "PRINCIPAL", "HOD", "FACULTY", "INSTITUTION"),
  handleGetStudents
);

router.get(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "PRINCIPAL", "HOD", "FACULTY", "INSTITUTION"),
  handleGetStudentById
);

router.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "INSTITUTION"),
  validateUpdateStudent,
  handleUpdateStudent
);

router.patch(
  "/:id/status",
  requireAuth,
  requireRole("ADMIN"),
  handleUpdateStudentStatus
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  handleDeleteStudent
);

module.exports = router;
