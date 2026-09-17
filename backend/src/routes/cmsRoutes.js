const express = require("express");
const {
  handleCreateArticle,
  handleGetArticles,
  handleGetArticleBySlug,
  handleUpdateArticle,
  handleDeleteArticle,
} = require("../controllers/articleController");
const {
  handleCreateDownloadResource,
  handleGetDownloadResources,
  handleUpdateDownloadResource,
  handleDeleteDownloadResource,
} = require("../controllers/downloadResourceController");
const {
  handleCreateEnquiry,
  handleGetEnquiries,
  handleUpdateEnquiryStatus,
} = require("../controllers/enquiryController");
const {
  validateArticle,
  validateDownloadResource,
  validateEnquiry,
} = require("../validators/cmsValidator");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// --- ARTICLES ---
router.get("/articles", handleGetArticles);
router.get("/articles/:slug", handleGetArticleBySlug);
router.post("/articles", requireAuth, requireRole("ADMIN"), validateArticle, handleCreateArticle);
router.put("/articles/:id", requireAuth, requireRole("ADMIN"), validateArticle, handleUpdateArticle);
router.delete("/articles/:id", requireAuth, requireRole("ADMIN"), handleDeleteArticle);

// --- DOWNLOAD RESOURCES ---
router.get("/resources", handleGetDownloadResources);
router.post("/resources", requireAuth, requireRole("ADMIN"), validateDownloadResource, handleCreateDownloadResource);
router.put("/resources/:id", requireAuth, requireRole("ADMIN"), validateDownloadResource, handleUpdateDownloadResource);
router.delete("/resources/:id", requireAuth, requireRole("ADMIN"), handleDeleteDownloadResource);

// --- ENQUIRIES ---
router.post("/enquiries", validateEnquiry, handleCreateEnquiry);
router.get("/enquiries", requireAuth, requireRole("ADMIN"), handleGetEnquiries);
router.put("/enquiries/:id/status", requireAuth, requireRole("ADMIN"), handleUpdateEnquiryStatus);

module.exports = router;
