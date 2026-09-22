const express = require("express");
const {
  handleCreateArticle,
  handleGetArticles,
  handleGetArticleBySlug,
  handleUpdateArticle,
  handleDeleteArticle,
} = require("./cms.controller");
const { validateArticle } = require("./cms.validator");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");

const router = express.Router();

router.get("/articles", handleGetArticles);
router.get("/articles/:slug", handleGetArticleBySlug);
router.post("/articles", requireAuth, requireRole("ADMIN"), validateArticle, handleCreateArticle);
router.put("/articles/:id", requireAuth, requireRole("ADMIN"), validateArticle, handleUpdateArticle);
router.delete("/articles/:id", requireAuth, requireRole("ADMIN"), handleDeleteArticle);

module.exports = router;
