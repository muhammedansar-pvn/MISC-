const express = require("express");
const {
  handleCreateInstitution,
  handleGetInstitutions,
  handleGetInstitutionById,
  handleUpdateInstitution,
} = require("../controllers/institutionController");
const {
  validateCreateInstitution,
  validateUpdateInstitution,
} = require("../validators/institutionValidator");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  validateCreateInstitution,
  handleCreateInstitution
);

router.get(
  "/",
  requireAuth,
  requireRole("ADMIN", "INSTITUTION"),
  handleGetInstitutions
);

router.get(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "INSTITUTION"),
  handleGetInstitutionById
);

router.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validateUpdateInstitution,
  handleUpdateInstitution
);

module.exports = router;
