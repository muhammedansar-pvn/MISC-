const cmsService = require("../services/cmsService");

const handleCreateArticle = async (req, res) => {
  try {
    const article = await cmsService.createArticle(req.body);
    return res.status(201).json({ success: true, message: "Article created successfully", data: article });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to create article" });
  }
};

const handleGetArticles = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    else if (!req.user || req.user.role !== "ADMIN") filter.status = "PUBLISHED";

    const articles = await cmsService.getArticles(filter);
    return res.status(200).json({ success: true, data: articles });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve articles" });
  }
};

const handleGetArticleBySlug = async (req, res) => {
  try {
    const article = await cmsService.getArticleBySlug(req.params.slug);
    if (!article) return res.status(404).json({ success: false, message: "Article not found" });
    return res.status(200).json({ success: true, data: article });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve article" });
  }
};

const handleUpdateArticle = async (req, res) => {
  try {
    const article = await cmsService.updateArticle(req.params.id, req.body);
    if (!article) return res.status(404).json({ success: false, message: "Article not found" });
    return res.status(200).json({ success: true, message: "Article updated successfully", data: article });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to update article" });
  }
};

const handleDeleteArticle = async (req, res) => {
  try {
    await cmsService.deleteArticle(req.params.id);
    return res.status(200).json({ success: true, message: "Article deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete article" });
  }
};

module.exports = {
  handleCreateArticle,
  handleGetArticles,
  handleGetArticleBySlug,
  handleUpdateArticle,
  handleDeleteArticle,
};
