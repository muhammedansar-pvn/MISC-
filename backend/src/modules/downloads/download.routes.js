const express = require("express");
const {
  handleCreateDownloadResource,
  handleGetDownloadResources,
  handleUpdateDownloadResource,
  handleDeleteDownloadResource,
} = require("./download.controller");
const { validateDownloadResource } = require("./download.validator");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");

const router = express.Router();

router.get("/resources", handleGetDownloadResources);
router.post("/resources", requireAuth, requireRole("ADMIN"), validateDownloadResource, handleCreateDownloadResource);
router.put("/resources/:id", requireAuth, requireRole("ADMIN"), validateDownloadResource, handleUpdateDownloadResource);
router.delete("/resources/:id", requireAuth, requireRole("ADMIN"), handleDeleteDownloadResource);

module.exports = router;
