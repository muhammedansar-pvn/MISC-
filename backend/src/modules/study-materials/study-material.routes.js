const express = require("express");
const {
  handleCreateStudyMaterial,
  handleGetStudyMaterials,
  handleGetStudyMaterialById,
  handleDeleteStudyMaterial,
} = require("./study-material.controller");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const { uploadSingle } = require("../../middleware/upload.middleware");

const router = express.Router();

// List study materials (filterable by classId, subjectId, facultyId, chapter)
router.get(
  "/",
  requireAuth,
  requireRole("ADMIN", "FACULTY", "STUDENT", "PARENT"),
  handleGetStudyMaterials
);

// Create study material with file upload (FACULTY, ADMIN)
router.post(
  "/",
  requireAuth,
  requireRole("FACULTY", "ADMIN"),
  uploadSingle("file"),
  handleCreateStudyMaterial
);

// Get single study material by ID
router.get(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "FACULTY", "STUDENT", "PARENT"),
  handleGetStudyMaterialById
);

// Delete study material (FACULTY owner, ADMIN)
router.delete(
  "/:id",
  requireAuth,
  requireRole("FACULTY", "ADMIN"),
  handleDeleteStudyMaterial
);

module.exports = router;
