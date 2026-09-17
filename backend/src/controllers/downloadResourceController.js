const cmsService = require("../services/cmsService");

const handleCreateDownloadResource = async (req, res) => {
  try {
    const resource = await cmsService.createDownloadResource(req.body);
    return res.status(201).json({ success: true, message: "Download resource created successfully", data: resource });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to create resource" });
  }
};

const handleGetDownloadResources = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    else if (!req.user || req.user.role !== "ADMIN") filter.status = "PUBLISHED";

    const resources = await cmsService.getDownloadResources(filter);
    return res.status(200).json({ success: true, data: resources });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve resources" });
  }
};

const handleUpdateDownloadResource = async (req, res) => {
  try {
    const resource = await cmsService.updateDownloadResource(req.params.id, req.body);
    if (!resource) return res.status(404).json({ success: false, message: "Resource not found" });
    return res.status(200).json({ success: true, message: "Resource updated successfully", data: resource });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to update resource" });
  }
};

const handleDeleteDownloadResource = async (req, res) => {
  try {
    await cmsService.deleteDownloadResource(req.params.id);
    return res.status(200).json({ success: true, message: "Resource deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete resource" });
  }
};

module.exports = {
  handleCreateDownloadResource,
  handleGetDownloadResources,
  handleUpdateDownloadResource,
  handleDeleteDownloadResource,
};
