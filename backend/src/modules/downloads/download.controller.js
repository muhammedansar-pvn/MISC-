const downloadService = require("./download.service");

const handleCreateDownloadResource = async (req, res) => {
  try {
    const resource = await downloadService.createDownloadResource(req.body);
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
    const resources = await downloadService.getDownloadResources(filter);
    return res.status(200).json({ success: true, data: resources });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve resources" });
  }
};

const handleUpdateDownloadResource = async (req, res) => {
  try {
    const resource = await downloadService.updateDownloadResource(req.params.id, req.body);
    if (!resource) return res.status(404).json({ success: false, message: "Resource not found" });
    return res.status(200).json({ success: true, message: "Resource updated successfully", data: resource });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to update resource" });
  }
};

const handleDeleteDownloadResource = async (req, res) => {
  try {
    const resource = await downloadService.deleteDownloadResource(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: "Resource not found" });
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
