const Article = require("../models/Article");
const DownloadResource = require("../models/DownloadResource");
const Enquiry = require("../models/Enquiry");

// Article
const createArticle = async (data) => Article.create(data);
const getArticles = async (filter = {}) => Article.find(filter).sort({ createdAt: -1 }).lean();
const getArticleBySlug = async (slug) => Article.findOne({ slug }).lean();
const updateArticle = async (id, data) => Article.findByIdAndUpdate(id, data, { new: true });
const deleteArticle = async (id) => Article.findByIdAndDelete(id);

// DownloadResource
const createDownloadResource = async (data) => DownloadResource.create(data);
const getDownloadResources = async (filter = {}) => DownloadResource.find(filter).sort({ publishedAt: -1 }).lean();
const updateDownloadResource = async (id, data) => DownloadResource.findByIdAndUpdate(id, data, { new: true });
const deleteDownloadResource = async (id) => DownloadResource.findByIdAndDelete(id);

// Enquiry
const createEnquiry = async (data) => Enquiry.create(data);
const getEnquiries = async (filter = {}) => Enquiry.find(filter).sort({ createdAt: -1 }).lean();
const updateEnquiryStatus = async (id, status) => Enquiry.findByIdAndUpdate(id, { status }, { new: true });

module.exports = {
  createArticle,
  getArticles,
  getArticleBySlug,
  updateArticle,
  deleteArticle,
  createDownloadResource,
  getDownloadResources,
  updateDownloadResource,
  deleteDownloadResource,
  createEnquiry,
  getEnquiries,
  updateEnquiryStatus,
};
