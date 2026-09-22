const Article = require("./article.model");

const createArticle = async (data) => Article.create(data);
const getArticles = async (filter = {}) => Article.find(filter).sort({ createdAt: -1 }).lean();
const getArticleBySlug = async (slug) => Article.findOne({ slug }).lean();
const updateArticle = async (id, data) => Article.findByIdAndUpdate(id, data, { new: true });
const deleteArticle = async (id) => Article.findByIdAndDelete(id);

module.exports = {
  createArticle,
  getArticles,
  getArticleBySlug,
  updateArticle,
  deleteArticle,
};
