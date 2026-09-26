const express = require("express");
const {
  handleCreateInstitution,
  handleGetInstitutions,
  handleGetInstitutionById,
  handleUpdateInstitution,
} = require("./institution.controller");
const {
  validateCreateInstitution,
  validateUpdateInstitution,
} = require("./institution.validator");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");

const {
  handleGetInstituteSettings,
  handleUpdateInstituteSettings,
} = require("./institute-settings.controller");
const {
  validateUpdateInstituteSettings,
} = require("./institute-settings.validator");

const router = express.Router();

// --- SINGLE-INSTITUTE SETTINGS ---
router.get("/settings", requireAuth, handleGetInstituteSettings);
router.put("/settings", requireAuth, requireRole("ADMIN"), validateUpdateInstituteSettings, handleUpdateInstituteSettings);

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
